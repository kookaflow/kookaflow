import { c as createServerRpc } from "./createServerRpc-CnQPTA-J.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DFGJyMRd.js";
import { e as createServerFn } from "./server-DjzWdpJV.js";
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
const APP_URL = "https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app";
function shiftTypeLabel(t) {
  switch (t) {
    case "morning":
      return "morning";
    case "afternoon":
      return "afternoon";
    case "evening":
      return "evening";
    case "night":
      return "night";
    case "split":
      return "split";
    case "side_hustle":
      return "side hustle";
    case "oncall":
      return "on-call";
    default:
      return "next";
  }
}
const scheduleShiftAlert_createServerFn_handler = createServerRpc({
  id: "c0484687fce5ff685c353df416c6724bb73eecef2e836566a81730f78da52a60",
  name: "scheduleShiftAlert",
  filename: "src/lib/shift-alerts.functions.ts"
}, (opts) => scheduleShiftAlert.__executeServer(opts));
const scheduleShiftAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventId: z.string().uuid()
}).parse(input)).handler(scheduleShiftAlert_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: event,
    error: evErr
  } = await supabase.from("events").select("id,user_id,category,start_time,shift_type").eq("id", data.eventId).maybeSingle();
  if (evErr) throw new Error(evErr.message);
  if (!event || event.user_id !== userId) return {
    skipped: true,
    reason: "not_found"
  };
  if (event.category !== "work") return {
    skipped: true,
    reason: "not_work"
  };
  const {
    data: profile
  } = await supabase.from("profiles").select("push_shift_alerts, push_notifications_enabled").eq("id", userId).maybeSingle();
  if (!profile?.push_notifications_enabled || !profile?.push_shift_alerts) {
    await supabase.from("scheduled_push_alerts").delete().eq("event_id", data.eventId);
    return {
      skipped: true,
      reason: "push_disabled"
    };
  }
  const {
    data: prefs
  } = await supabase.from("user_preferences").select("reminder_minutes_before").eq("user_id", userId).maybeSingle();
  const minutesBefore = prefs?.reminder_minutes_before ?? 10;
  const fireAt = new Date(new Date(event.start_time).getTime() - minutesBefore * 6e4);
  if (fireAt.getTime() <= Date.now()) {
    await supabase.from("scheduled_push_alerts").delete().eq("event_id", data.eventId);
    return {
      skipped: true,
      reason: "past"
    };
  }
  const label = shiftTypeLabel(event.shift_type);
  const startHHmm = new Date(event.start_time).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const title = "⏰ Shift Starting Soon 🦅";
  const message = `Your ${label} shift starts at ${startHHmm}. ${minutesBefore} minutes to go — get ready!`;
  const {
    error: upErr
  } = await supabase.from("scheduled_push_alerts").upsert({
    user_id: userId,
    event_id: event.id,
    fire_at: fireAt.toISOString(),
    title,
    message,
    url: `${APP_URL}/calendar`,
    sent_at: null
  }, {
    onConflict: "event_id"
  });
  if (upErr) throw new Error(upErr.message);
  return {
    scheduled: true,
    fire_at: fireAt.toISOString()
  };
});
const cancelShiftAlert_createServerFn_handler = createServerRpc({
  id: "a4a646b6f91873d1a06e19e447c94935e5375bd939177e60615e1e9baa1159dc",
  name: "cancelShiftAlert",
  filename: "src/lib/shift-alerts.functions.ts"
}, (opts) => cancelShiftAlert.__executeServer(opts));
const cancelShiftAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventId: z.string().uuid()
}).parse(input)).handler(cancelShiftAlert_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("scheduled_push_alerts").delete().eq("event_id", data.eventId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  cancelShiftAlert_createServerFn_handler,
  scheduleShiftAlert_createServerFn_handler
};
