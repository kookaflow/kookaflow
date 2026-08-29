import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  reconcile,
  resolveUserId,
  timingSafeEqualStrings,
  type ProfileSubscription,
  type RevenueCatWebhookBody,
} from "@/lib/revenuecat.server";

export const Route = createFileRoute("/api/public/revenuecat/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
        // Fail closed: an unconfigured secret must never let events through.
        if (!secret) {
          console.error("[revenuecat] REVENUECAT_WEBHOOK_SECRET is not configured");
          return new Response("Webhook secret not configured", { status: 500 });
        }

        const auth = request.headers.get("authorization");
        if (!auth || !timingSafeEqualStrings(auth, secret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let body: RevenueCatWebhookBody;
        try {
          body = (await request.json()) as RevenueCatWebhookBody;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const event = body.event;
        if (!event) return new Response("ok", { status: 200 });

        const userId = resolveUserId(event);
        if (!userId) {
          console.warn("[revenuecat] event without a usable app_user_id", event.type);
          return new Response("ok", { status: 200 });
        }

        try {
          const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select(
              "subscription_tier, subscription_status, subscription_end_date, stripe_subscription_id",
            )
            .eq("id", userId)
            .maybeSingle();

          if (error) throw error;
          if (!profile) {
            console.warn("[revenuecat] no profile for app_user_id", userId);
            return new Response("ok", { status: 200 });
          }

          const update = reconcile(event, profile as ProfileSubscription);
          if (!update) return new Response("ok", { status: 200 });

          const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update(update)
            .eq("id", userId);
          if (updateError) throw updateError;

          console.log("[revenuecat] applied", event.type, Object.keys(update).join(","));
          return new Response("ok", { status: 200 });
        } catch (err) {
          console.error("[revenuecat] handler error", event.type, err);
          return new Response("Handler error", { status: 500 });
        }
      },
    },
  },
});
