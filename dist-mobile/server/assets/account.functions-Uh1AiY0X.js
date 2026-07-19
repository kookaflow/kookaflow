import { c as createServerRpc } from "./createServerRpc-ywx44k3B.js";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
import { e as createServerFn } from "./server-CYeycCdn.js";
import "@supabase/supabase-js";
import "./createMiddleware-BvN2ghIY.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
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
