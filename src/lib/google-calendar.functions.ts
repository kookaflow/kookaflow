import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  syncUserCalendar,
  pushEventToGoogle as pushEventToGoogleServer,
  deleteEventFromGoogle as deleteEventFromGoogleServer,
  GOOGLE_SCOPES,
  signState,
} from "./google-calendar.server";

/**
 * Server-side subscription gate. Throws if the user does not have pro-level access.
 * Mirrors the client-side `hasProAccess` derivation in useSubscription.
 */
async function requireProAccess(userId: string): Promise<void> {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier, subscription_status, trial_ends_at")
    .eq("id", userId)
    .maybeSingle();
  const tier = profile?.subscription_tier ?? "trial";
  const status = profile?.subscription_status ?? null;
  const trialEndsAt = profile?.trial_ends_at ? new Date(profile.trial_ends_at).getTime() : 0;
  const now = Date.now();
  const trialActive = tier === "trial" && trialEndsAt > now;
  const proActive =
    (tier === "pro" && (status === "active" || status === "trialling")) ||
    tier === "lifetime";
  if (!trialActive && !proActive) {
    throw new Error("Subscription required: this feature requires Pro or an active trial");
  }
}

export interface GoogleConnectionStatus {
  connected: boolean;
  googleEmail: string | null;
  twoWaySyncEnabled: boolean;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
}

export const getGoogleConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GoogleConnectionStatus> => {
    const { userId } = context;
    const { data } = await supabaseAdmin
      .from("google_calendar_connections")
      .select("google_email, two_way_sync_enabled, last_synced_at, last_sync_error")
      .eq("user_id", userId)
      .maybeSingle();
    if (!data) {
      return {
        connected: false,
        googleEmail: null,
        twoWaySyncEnabled: false,
        lastSyncedAt: null,
        lastSyncError: null,
      };
    }
    return {
      connected: true,
      googleEmail: data.google_email,
      twoWaySyncEnabled: data.two_way_sync_enabled,
      lastSyncedAt: data.last_synced_at,
      lastSyncError: data.last_sync_error,
    };
  });

export const disconnectGoogleCalendar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    await supabaseAdmin
      .from("google_events_cache")
      .delete()
      .eq("user_id", userId);
    await supabaseAdmin
      .from("google_calendar_connections")
      .delete()
      .eq("user_id", userId);
    return { ok: true };
  });

export const setTwoWaySync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ enabled: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    await requireProAccess(userId);
    await supabaseAdmin
      .from("google_calendar_connections")
      .update({ two_way_sync_enabled: data.enabled })
      .eq("user_id", userId);
    return { ok: true };
  });

export const triggerGoogleSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    await requireProAccess(userId);
    try {
      const result = await syncUserCalendar(userId);
      return { ok: true, ...result };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await supabaseAdmin
        .from("google_calendar_connections")
        .update({ last_sync_error: msg })
        .eq("user_id", userId);
      return { ok: false, error: msg, imported: 0, removed: 0, fullSync: false };
    }
  });

export interface GoogleEventLite {
  id: string;
  googleEventId: string;
  summary: string | null;
  location: string | null;
  htmlLink: string | null;
  start: string;
  end: string;
  isAllDay: boolean;
}

export const listGoogleEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }): Promise<GoogleEventLite[]> => {
    const { userId } = context;
    const from =
      data.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const to =
      data.to ?? new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
    const { data: rows } = await supabaseAdmin
      .from("google_events_cache")
      .select(
        "id, google_event_id, summary, location, html_link, start_time, end_time, is_all_day",
      )
      .eq("user_id", userId)
      .gte("start_time", from)
      .lte("start_time", to)
      .order("start_time", { ascending: true });
    return (rows ?? []).map((r) => ({
      id: r.id,
      googleEventId: r.google_event_id,
      summary: r.summary,
      location: r.location,
      htmlLink: r.html_link,
      start: r.start_time,
      end: r.end_time,
      isAllDay: r.is_all_day,
    }));
  });

export const pushShiftToGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ eventId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { userId } = context;
    await requireProAccess(userId);
    try {
      await pushEventToGoogleServer(userId, data.eventId);
      return { ok: true };
    } catch (e) {
      console.warn("pushShiftToGoogle failed", e);
      return { ok: false };
    }
  });

export const deleteShiftFromGoogle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ googleEventId: z.string() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { userId } = context;
    await requireProAccess(userId);
    try {
      await deleteEventFromGoogleServer(userId, data.googleEventId);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });

/**
 * Build a Google OAuth authorize URL for the signed-in user.
 * Returns the URL so the client can navigate to it via window.location.href.
 * This replaces the prior pattern of passing the user's access_token in the URL
 * to /auth/google/start, which leaked tokens into logs/history/Referer.
 */
export const getGoogleAuthUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    await requireProAccess(userId);
    const clientId =
      process.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_OAUTH_CLIENT_ID;
    if (!clientId) {
      throw new Error("Google OAuth not configured");
    }
    // Build redirect_uri from the request host so it matches deployment env.
    const { getRequest } = await import("@tanstack/react-start/server");
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
    return { url: authorize.toString() };
  });