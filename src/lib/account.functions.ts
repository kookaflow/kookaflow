import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Permanently deletes the authenticated user's account and all their data.
 */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data: prof } = await (supabaseAdmin.from("profiles") as any)
      .select("stripe_customer_id, stripe_subscription_id, onesignal_player_id")
      .eq("id", userId)
      .maybeSingle();

    // 1) Cancel any active Stripe subscription. Never blocks deletion.
    if (prof?.stripe_customer_id || prof?.stripe_subscription_id) {
      try {
        const { getStripe } = await import("@/lib/stripe.server");
        const stripe = getStripe();
        const ids = new Set<string>();
        if (prof.stripe_customer_id) {
          const list = await stripe.subscriptions.list({
            customer: prof.stripe_customer_id,
            status: "all",
            limit: 20,
          });
          for (const s of list.data) {
            if (["active", "trialing", "past_due", "unpaid", "incomplete"].includes(s.status)) ids.add(s.id);
          }
        }
        if (prof.stripe_subscription_id) {
          try {
            const s = await stripe.subscriptions.retrieve(prof.stripe_subscription_id);
            if (s.status !== "canceled" && s.status !== "incomplete_expired") ids.add(s.id);
          } catch (e) {
            console.error("[deleteAccount] stored Stripe subscription lookup failed:", (e as Error).message);
          }
        }
        for (const id of ids) {
          try {
            await stripe.subscriptions.cancel(id);
          } catch (e) {
            console.error(`[deleteAccount] Stripe cancel ${id} failed:`, (e as Error).message);
          }
        }
      } catch (e) {
        console.error("[deleteAccount] Stripe cancellation failed:", (e as Error).message);
      }
    }

    // 2) Remove the OneSignal user and push subscriptions. Never blocks deletion.
    try {
      const { deleteOneSignalUser } = await import("@/lib/reminders/push.server");
      await deleteOneSignalUser(userId, prof?.onesignal_player_id ?? null);
    } catch (e) {
      console.error("[deleteAccount] OneSignal deletion failed:", (e as Error).message);
    }

    // Delete from every table that holds per-user rows. Order isn't critical
    // because none have FKs to one another, but we batch for clarity.
    const userScopedTables = [
      "events",
      "google_events_cache",
      "google_calendar_connections",
      "nudge_dismissals",
      "shift_templates",
      "user_category_visibility",
      "scheduled_push_alerts",
      "reminder_sends",
      "user_preferences",
      "categories",
    ] as const;

    for (const table of userScopedTables) {
      const { error } = await (supabaseAdmin.from(table) as any)
        .delete()
        .eq("user_id", userId);
      if (error) {
        console.error(`[deleteAccount] failed to clear ${table}:`, error.message);
      }
    }
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) {
      console.error(`[deleteAccount] failed to clear profiles:`, profileError.message);
    }

    // Finally, delete the auth user itself.
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      throw new Error(`Failed to delete account: ${authError.message}`);
    }

    return { ok: true as const };
  });