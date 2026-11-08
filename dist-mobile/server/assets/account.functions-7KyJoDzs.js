import { c as createServerRpc } from "./createServerRpc-B-gixfrf.js";
import { e as createServerFn } from "./server-ByrTSFfk.js";
import { r as requireSupabaseAuth } from "./auth-middleware-diYpcNXl.js";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "seroval";
import "@tanstack/history";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@supabase/supabase-js";
const deleteAccount_createServerFn_handler = createServerRpc({
  id: "605045233debcf4fbca7c93f06a21eab51d31e90e5fab3208ca6233b08e8f1d1",
  name: "deleteAccount",
  filename: "src/lib/account.functions.ts"
}, (opts) => deleteAccount.__executeServer(opts));
const deleteAccount = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(deleteAccount_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    data: prof
  } = await supabaseAdmin.from("profiles").select("stripe_customer_id, stripe_subscription_id, onesignal_player_id").eq("id", userId).maybeSingle();
  if (prof?.stripe_customer_id || prof?.stripe_subscription_id) {
    try {
      const {
        getStripe
      } = await import("./stripe.server-BP8E5IMg.js");
      const stripe = getStripe();
      const ids = /* @__PURE__ */ new Set();
      if (prof.stripe_customer_id) {
        const list = await stripe.subscriptions.list({
          customer: prof.stripe_customer_id,
          status: "all",
          limit: 20
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
          console.error("[deleteAccount] stored Stripe subscription lookup failed:", e.message);
        }
      }
      for (const id of ids) {
        try {
          await stripe.subscriptions.cancel(id);
        } catch (e) {
          console.error(`[deleteAccount] Stripe cancel ${id} failed:`, e.message);
        }
      }
    } catch (e) {
      console.error("[deleteAccount] Stripe cancellation failed:", e.message);
    }
  }
  try {
    const {
      deleteOneSignalUser
    } = await import("./push.server-DLAoPm14.js");
    await deleteOneSignalUser(userId, prof?.onesignal_player_id ?? null);
  } catch (e) {
    console.error("[deleteAccount] OneSignal deletion failed:", e.message);
  }
  try {
    const {
      revokeGoogleAccess
    } = await import("./google-calendar.server-BJYB10a6.js").then((n) => n.j);
    await revokeGoogleAccess(userId);
  } catch (e) {
    console.error("[deleteAccount] Google revoke failed:", e.message);
  }
  const userScopedTables = ["events", "google_events_cache", "google_calendar_connections", "nudge_dismissals", "shift_templates", "user_category_visibility", "scheduled_push_alerts", "reminder_sends", "user_preferences", "categories"];
  for (const table of userScopedTables) {
    const {
      error
    } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
    if (error) {
      console.error(`[deleteAccount] failed to clear ${table}:`, error.message);
    }
  }
  const {
    error: profileError
  } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
  if (profileError) {
    console.error(`[deleteAccount] failed to clear profiles:`, profileError.message);
  }
  const {
    error: authError
  } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authError) {
    throw new Error(`Failed to delete account: ${authError.message}`);
  }
  return {
    ok: true
  };
});
export {
  deleteAccount_createServerFn_handler
};
