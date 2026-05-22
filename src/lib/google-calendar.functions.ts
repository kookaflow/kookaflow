import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  syncUserCalendar,
  pushEventToGoogle as pushEventToGoogleServer,
  deleteEventFromGoogle as deleteEventFromGoogleServer,
} from "./google-calendar.server";

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
    try {
      await deleteEventFromGoogleServer(userId, data.googleEventId);
      return { ok: true };
    } catch {
      return { ok: false };
    }
  });