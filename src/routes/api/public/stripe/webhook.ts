import { createFileRoute } from "@tanstack/react-router";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getStripe, planForPriceId } from "@/lib/stripe.server";

export const Route = createFileRoute("/api/public/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) return new Response("Webhook secret not configured", { status: 500 });

        const signature = request.headers.get("stripe-signature");
        if (!signature) return new Response("Missing signature", { status: 400 });

        const body = await request.text();
        const stripe = getStripe();

        let event: Stripe.Event;
        try {
          // Workers runtime requires the async variant (uses Web Crypto).
          event = await stripe.webhooks.constructEventAsync(body, signature, secret);
        } catch (err) {
          console.error("Stripe webhook signature verification failed:", err);
          return new Response("Invalid signature", { status: 400 });
        }

        try {
          await handleEvent(event);
        } catch (err) {
          console.error("Stripe webhook handler error:", event.type, err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.metadata?.supabase_user_id) || session.client_reference_id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
      if (!userId) return;

      if (session.mode === "payment") {
        // One-time purchase: basic or lifetime. Resolve via line items.
        const stripe = getStripe();
        const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
        const priceId = items.data[0]?.price?.id;
        const plan = priceId ? planForPriceId(priceId) : null;
        if (!plan) return;

        await supabaseAdmin
          .from("profiles")
          .update({
            subscription_tier: plan.tier,
            subscription_status: "active",
            subscription_end_date: null,
            stripe_customer_id: customerId,
          })
          .eq("id", userId);
      }
      // For mode === 'subscription', the subscription.created event below handles it.
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id ?? (await lookupUserByCustomer(typeof sub.customer === "string" ? sub.customer : sub.customer.id));
      if (!userId) return;

      const priceId = sub.items.data[0]?.price?.id;
      const plan = priceId ? planForPriceId(priceId) : null;
      const tier = plan?.tier ?? "pro";

      const status = mapSubscriptionStatus(sub.status);
      const periodEnd = subscriptionPeriodEnd(sub);

      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_tier: status === "expired" ? "expired" : tier,
          subscription_status: status,
          subscription_end_date: periodEnd,
          stripe_subscription_id: sub.id,
          stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        })
        .eq("id", userId);
      return;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.supabase_user_id ?? (await lookupUserByCustomer(typeof sub.customer === "string" ? sub.customer : sub.customer.id));
      if (!userId) return;
      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_tier: "expired",
          subscription_status: "canceled",
          subscription_end_date: subscriptionPeriodEnd(sub),
        })
        .eq("id", userId);
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
      if (!customerId) return;
      const userId = await lookupUserByCustomer(customerId);
      if (!userId) return;
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "past_due" })
        .eq("id", userId);
      return;
    }

    default:
      // Ignore unhandled events but acknowledge.
      return;
  }
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status): "active" | "trialling" | "past_due" | "canceled" | "expired" {
  switch (status) {
    case "active":
      return "active";
    case "trialing":
      return "trialling";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "expired";
    default:
      return "expired";
  }
}

function subscriptionPeriodEnd(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0] as (Stripe.SubscriptionItem & { current_period_end?: number }) | undefined;
  const ts = item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end;
  return ts ? new Date(ts * 1000).toISOString() : null;
}

async function lookupUserByCustomer(customerId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}