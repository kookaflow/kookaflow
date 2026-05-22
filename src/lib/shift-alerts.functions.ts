import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const APP_URL =
  "https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app";

function shiftTypeLabel(t: string | null): string {
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

/**
 * Create (or replace) a scheduled push notification for a shift event.
 * Looks up the user's `reminder_minutes_before` and `push_shift_alerts`
 * preferences, computes fire_at, and upserts into scheduled_push_alerts.
 * Silently no-ops for non-work events or when the fire time is in the past.
 */
export const scheduleShiftAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ eventId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: event, error: evErr } = await supabase
      .from("events")
      .select("id,user_id,category,start_time,shift_type")
      .eq("id", data.eventId)
      .maybeSingle();
    if (evErr) throw new Error(evErr.message);
    if (!event || event.user_id !== userId)
      return { skipped: true, reason: "not_found" };
    if (event.category !== "work")
      return { skipped: true, reason: "not_work" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("push_shift_alerts, push_notifications_enabled")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.push_notifications_enabled || !profile?.push_shift_alerts) {
      // Clean up any stale row so future toggle-on works fresh.
      await supabase
        .from("scheduled_push_alerts")
        .delete()
        .eq("event_id", data.eventId);
      return { skipped: true, reason: "push_disabled" };
    }

    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("reminder_minutes_before")
      .eq("user_id", userId)
      .maybeSingle();
    const minutesBefore = prefs?.reminder_minutes_before ?? 10;

    const fireAt = new Date(
      new Date(event.start_time).getTime() - minutesBefore * 60_000,
    );
    if (fireAt.getTime() <= Date.now()) {
      await supabase
        .from("scheduled_push_alerts")
        .delete()
        .eq("event_id", data.eventId);
      return { skipped: true, reason: "past" };
    }

    const label = shiftTypeLabel(event.shift_type);
    const startHHmm = new Date(event.start_time).toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const title = "⏰ Shift Starting Soon 🦅";
    const message = `Your ${label} shift starts at ${startHHmm}. ${minutesBefore} minutes to go — get ready!`;

    const { error: upErr } = await supabase.from("scheduled_push_alerts").upsert(
      {
        user_id: userId,
        event_id: event.id,
        fire_at: fireAt.toISOString(),
        title,
        message,
        url: `${APP_URL}/calendar`,
        sent_at: null,
      },
      { onConflict: "event_id" },
    );
    if (upErr) throw new Error(upErr.message);
    return { scheduled: true, fire_at: fireAt.toISOString() };
  });

export const cancelShiftAlert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ eventId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("scheduled_push_alerts")
      .delete()
      .eq("event_id", data.eventId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });