import { c as createServerRpc } from "./createServerRpc-CnQPTA-J.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DFGJyMRd.js";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
import { s as syncUserCalendar, p as pushEventToGoogle, d as deleteEventFromGoogle, a as signState, G as GOOGLE_SCOPES } from "./google-calendar.server-B_7mIU_e.js";
import { e as createServerFn } from "./server-DjzWdpJV.js";
import "@supabase/supabase-js";
import "./createMiddleware-BvN2ghIY.js";
import "crypto";
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
async function requireProAccess(userId) {
  const {
    data: profile
  } = await supabaseAdmin.from("profiles").select("subscription_tier, subscription_status, trial_ends_at").eq("id", userId).maybeSingle();
  const tier = profile?.subscription_tier ?? "trial";
  const status = profile?.subscription_status ?? null;
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0;
  const now = Date.now();
  const trialActive = tier === "trial" && trialEndsAt > now;
  const proActive = tier === "pro" && (status === "active" || status === "trialling") || tier === "lifetime";
  if (!trialActive && !proActive) {
    throw new Error("Subscription required: this feature requires Pro or an active trial");
  }
}
const getGoogleConnectionStatus_createServerFn_handler = createServerRpc({
  id: "03305b83649e1831dd1875753e29a022ce70ccfa45058b8b329d58c53bd34205",
  name: "getGoogleConnectionStatus",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => getGoogleConnectionStatus.__executeServer(opts));
const getGoogleConnectionStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getGoogleConnectionStatus_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  const {
    data
  } = await supabaseAdmin.from("google_calendar_connections").select("google_email, two_way_sync_enabled, last_synced_at, last_sync_error").eq("user_id", userId).maybeSingle();
  if (!data) {
    return {
      connected: false,
      googleEmail: null,
      twoWaySyncEnabled: false,
      lastSyncedAt: null,
      lastSyncError: null
    };
  }
  return {
    connected: true,
    googleEmail: data.google_email,
    twoWaySyncEnabled: data.two_way_sync_enabled,
    lastSyncedAt: data.last_synced_at,
    lastSyncError: data.last_sync_error
  };
});
const disconnectGoogleCalendar_createServerFn_handler = createServerRpc({
  id: "f47001c7b50d728b7b3afdc065fde20eb6a1496fdb3f7485068f8b1565984b1a",
  name: "disconnectGoogleCalendar",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => disconnectGoogleCalendar.__executeServer(opts));
const disconnectGoogleCalendar = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(disconnectGoogleCalendar_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  await supabaseAdmin.from("google_events_cache").delete().eq("user_id", userId);
  await supabaseAdmin.from("google_calendar_connections").delete().eq("user_id", userId);
  return {
    ok: true
  };
});
const setTwoWaySync_createServerFn_handler = createServerRpc({
  id: "66589359688c511d93d7e14904fcfd9e016d7460f9d6a0cf87662bed87f1726e",
  name: "setTwoWaySync",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => setTwoWaySync.__executeServer(opts));
const setTwoWaySync = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  enabled: z.boolean()
}).parse(input)).handler(setTwoWaySync_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    userId
  } = context;
  await requireProAccess(userId);
  await supabaseAdmin.from("google_calendar_connections").update({
    two_way_sync_enabled: data.enabled
  }).eq("user_id", userId);
  return {
    ok: true
  };
});
const triggerGoogleSync_createServerFn_handler = createServerRpc({
  id: "0e7ccde1a5a5fcb40fbb52b075197f107de282f6f00c538cd58410467c564313",
  name: "triggerGoogleSync",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => triggerGoogleSync.__executeServer(opts));
const triggerGoogleSync = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(triggerGoogleSync_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  await requireProAccess(userId);
  try {
    const result = await syncUserCalendar(userId);
    return {
      ok: true,
      ...result
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabaseAdmin.from("google_calendar_connections").update({
      last_sync_error: msg
    }).eq("user_id", userId);
    return {
      ok: false,
      error: msg,
      imported: 0,
      removed: 0,
      fullSync: false
    };
  }
});
const listGoogleEvents_createServerFn_handler = createServerRpc({
  id: "a50a554d47691af745399865673e1edd0aa80e647e41a5d97bdfd1e24bde50e2",
  name: "listGoogleEvents",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => listGoogleEvents.__executeServer(opts));
const listGoogleEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  from: z.string().optional(),
  to: z.string().optional()
}).parse(input ?? {})).handler(listGoogleEvents_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    userId
  } = context;
  const from = data.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  const to = data.to ?? new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3).toISOString();
  const {
    data: rows
  } = await supabaseAdmin.from("google_events_cache").select("id, google_event_id, summary, location, html_link, start_time, end_time, is_all_day").eq("user_id", userId).gte("start_time", from).lte("start_time", to).order("start_time", {
    ascending: true
  });
  return (rows ?? []).map((r) => ({
    id: r.id,
    googleEventId: r.google_event_id,
    summary: r.summary,
    location: r.location,
    htmlLink: r.html_link,
    start: r.start_time,
    end: r.end_time,
    isAllDay: r.is_all_day
  }));
});
const pushShiftToGoogle_createServerFn_handler = createServerRpc({
  id: "fc2944345a6748985f57af6831ef33a0fcf1e970a9eca1433283d98844653598",
  name: "pushShiftToGoogle",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => pushShiftToGoogle.__executeServer(opts));
const pushShiftToGoogle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventId: z.string().uuid()
}).parse(input)).handler(pushShiftToGoogle_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    userId
  } = context;
  await requireProAccess(userId);
  try {
    await pushEventToGoogle(userId, data.eventId);
    return {
      ok: true
    };
  } catch (e) {
    console.warn("pushShiftToGoogle failed", e);
    return {
      ok: false
    };
  }
});
const deleteShiftFromGoogle_createServerFn_handler = createServerRpc({
  id: "f6acea5009bac50036700a6ce377760abf3af61c45a745efac22b9596b0275ea",
  name: "deleteShiftFromGoogle",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => deleteShiftFromGoogle.__executeServer(opts));
const deleteShiftFromGoogle = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  googleEventId: z.string()
}).parse(input)).handler(deleteShiftFromGoogle_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    userId
  } = context;
  await requireProAccess(userId);
  try {
    await deleteEventFromGoogle(userId, data.googleEventId);
    return {
      ok: true
    };
  } catch {
    return {
      ok: false
    };
  }
});
const getGoogleAuthUrl_createServerFn_handler = createServerRpc({
  id: "a29e741db0385b31d8cce65589be80a5c3b2f55c2c335dd8c718186314a5eef7",
  name: "getGoogleAuthUrl",
  filename: "src/lib/google-calendar.functions.ts"
}, (opts) => getGoogleAuthUrl.__executeServer(opts));
const getGoogleAuthUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(getGoogleAuthUrl_createServerFn_handler, async ({
  context
}) => {
  const {
    userId
  } = context;
  await requireProAccess(userId);
  const clientId = process.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error("Google OAuth not configured");
  }
  const {
    getRequest
  } = await import("./server-DlBuWWdC.js");
  const req = getRequest();
  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/auth/google/callback`;
  const state = signState(userId);
  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", GOOGLE_SCOPES);
  authorize.searchParams.set("access_type", "offline");
  authorize.searchParams.set("prompt", "consent");
  authorize.searchParams.set("include_granted_scopes", "true");
  authorize.searchParams.set("state", state);
  return {
    url: authorize.toString()
  };
});
export {
  deleteShiftFromGoogle_createServerFn_handler,
  disconnectGoogleCalendar_createServerFn_handler,
  getGoogleAuthUrl_createServerFn_handler,
  getGoogleConnectionStatus_createServerFn_handler,
  listGoogleEvents_createServerFn_handler,
  pushShiftToGoogle_createServerFn_handler,
  setTwoWaySync_createServerFn_handler,
  triggerGoogleSync_createServerFn_handler
};
