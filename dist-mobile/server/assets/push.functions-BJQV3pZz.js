import { c as createServerRpc } from "./createServerRpc-ywx44k3B.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
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
const getOneSignalConfig_createServerFn_handler = createServerRpc({
  id: "adde96f63af5b06d261cf7992215c5410b20b0207cd86904d1b79613332c2274",
  name: "getOneSignalConfig",
  filename: "src/lib/push.functions.ts"
}, (opts) => getOneSignalConfig.__executeServer(opts));
const getOneSignalConfig = createServerFn({
  method: "GET"
}).handler(getOneSignalConfig_createServerFn_handler, async () => {
  return {
    appId: process.env.ONESIGNAL_APP_ID ?? null
  };
});
const updatePushSubscription_createServerFn_handler = createServerRpc({
  id: "564774cc5d10c59626aadb13d6e0edd6150c16b24551ba3f73d342d74e0d8024",
  name: "updatePushSubscription",
  filename: "src/lib/push.functions.ts"
}, (opts) => updatePushSubscription.__executeServer(opts));
const updatePushSubscription = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  playerId: z.string().min(1).max(200).nullable(),
  enabled: z.boolean()
}).parse(input)).handler(updatePushSubscription_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("profiles").update({
    onesignal_player_id: data.playerId,
    push_notifications_enabled: data.enabled
  }).eq("id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getPushStatus_createServerFn_handler = createServerRpc({
  id: "c20f88eac8d5893b56159e9fd24a88aa0527a6da3bb0296b5ee39aa431158954",
  name: "getPushStatus",
  filename: "src/lib/push.functions.ts"
}, (opts) => getPushStatus.__executeServer(opts));
const getPushStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getPushStatus_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("profiles").select("onesignal_player_id, push_notifications_enabled, push_daily_reminder, push_weekly_reminder, push_shift_alerts").eq("id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});
const updatePushPrefs_createServerFn_handler = createServerRpc({
  id: "867f5ab2f08a9ea12753a77405335a09484a1dd7f1e72d5df96c5e5e65d9bde5",
  name: "updatePushPrefs",
  filename: "src/lib/push.functions.ts"
}, (opts) => updatePushPrefs.__executeServer(opts));
const updatePushPrefs = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  push_daily_reminder: z.boolean().optional(),
  push_weekly_reminder: z.boolean().optional(),
  push_shift_alerts: z.boolean().optional()
}).parse(input)).handler(updatePushPrefs_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("profiles").update(data).eq("id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  getOneSignalConfig_createServerFn_handler,
  getPushStatus_createServerFn_handler,
  updatePushPrefs_createServerFn_handler,
  updatePushSubscription_createServerFn_handler
};
