import { createServerFn } from "@tanstack/react-start";
import { getRequestHost } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPlanConfig, getStripe, type PlanKey } from "./stripe.server";

const PlanSchema = z.object({
  plan: z.enum(["basic", "pro_monthly", "pro_yearly", "lifetime"]),
});

function getOrigin(): string {
  // Prefer the explicit request host; fall back to env if needed.
  try {
    const host = getRequestHost();
    if (host) return `https://${host}`;
  } catch { /* not in a request context */ }
  return process.env.PUBLIC_BASE_URL ?? "https://localhost";
}

/**
 * Create a Stripe Checkout session for the authenticated user.
 * Reuses or creates a Stripe customer linked to the profile.
 */
export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PlanSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const plan = getPlanConfig(data.plan as PlanKey);
    const stripe = getStripe();

    // Look up existing stripe customer for this user.
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? null;
    if (!customerId) {
      const email = (claims as { email?: string })?.email;
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", userId);
    }

    const origin = getOrigin();
    const session = await stripe.checkout.sessions.create({
      mode: plan.mode,
      customer: customerId,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      allow_promotion_codes: true,
      client_reference_id: userId,
      metadata: { supabase_user_id: userId, plan: data.plan },
      ...(plan.mode === "subscription"
        ? { subscription_data: { metadata: { supabase_user_id: userId, plan: data.plan } } }
        : { payment_intent_data: { metadata: { supabase_user_id: userId, plan: data.plan } } }),
    });

    return { url: session.url, sessionId: session.id };
  });

/**
 * Create a Stripe Billing Portal session so the user can manage their subscription.
 */
export const createCustomerPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const stripe = getStripe();

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      throw new Error("No Stripe customer on file for this user");
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${getOrigin()}/settings`,
    });

    return { url: session.url };
  });