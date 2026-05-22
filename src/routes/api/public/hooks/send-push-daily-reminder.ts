import { createFileRoute } from "@tanstack/react-router";
import {
  dateForTz,
  EventRow,
  getAdminClient,
  getZonedNow,
  isTimeInWindow,
  startOfDayUtc,
} from "@/lib/reminders/email.server";
import {
  appUrl,
  pickTip,
  sendOneSignalPush,
  shortShiftLabel,
} from "@/lib/reminders/push.server";

export const Route = createFileRoute(
  "/api/public/hooks/send-push-daily-reminder",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey");
        const expected =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
        if (!expected || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabase = getAdminClient();
        const { data: prefs, error } = await supabase
          .from("user_preferences")
          .select(
            "user_id, daily_reminder_time, daily_reminder_channel, daily_reminder_enabled",
          )
          .eq("daily_reminder_enabled", true);
        if (error) {
          return new Response(`prefs error: ${error.message}`, { status: 500 });
        }

        const results: Array<{ user_id: string; status: string }> = [];

        for (const p of prefs ?? []) {
          const ch = p.daily_reminder_channel;
          if (!ch || (ch !== "push" && ch !== "both")) {
            results.push({ user_id: p.user_id, status: "channel_skip" });
            continue;
          }
          if (!p.daily_reminder_time) {
            results.push({ user_id: p.user_id, status: "no_time" });
            continue;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("timezone")
            .eq("id", p.user_id)
            .maybeSingle();
          const tz = profile?.timezone || "UTC";
          const zoned = getZonedNow(tz);
          if (!isTimeInWindow(p.daily_reminder_time, zoned, 5)) {
            results.push({ user_id: p.user_id, status: "out_of_window" });
            continue;
          }

          const sentFor = dateForTz(zoned);
          const { error: insErr } = await supabase
            .from("reminder_sends")
            .insert({
              user_id: p.user_id,
              kind: "push_daily",
              sent_for_date: sentFor,
            });
          if (insErr) {
            results.push({ user_id: p.user_id, status: "already_sent" });
            continue;
          }

          const dayStart = startOfDayUtc(tz, zoned);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
          const { data: events } = await supabase
            .from("events")
            .select(
              "id,title,category,start_time,end_time,is_all_day,shift_type,location",
            )
            .eq("user_id", p.user_id)
            .gte("start_time", dayStart.toISOString())
            .lt("start_time", dayEnd.toISOString())
            .order("start_time", { ascending: true });

          const evs = (events ?? []) as EventRow[];
          const tip = pickTip(zoned.year * 366 + zoned.month * 31 + zoned.day);
          const content = `${evs.length} events today. Shift: ${shortShiftLabel(evs)}. Tip: ${tip}.`;

          try {
            await sendOneSignalPush({
              externalUserIds: [p.user_id],
              heading: "ShiftSync — Today",
              content,
              url: appUrl(),
            });
            results.push({ user_id: p.user_id, status: "sent" });
          } catch (e: any) {
            await supabase
              .from("reminder_sends")
              .delete()
              .eq("user_id", p.user_id)
              .eq("kind", "push_daily")
              .eq("sent_for_date", sentFor);
            results.push({
              user_id: p.user_id,
              status: `error:${e.message}`,
            });
          }
        }

        return Response.json({ ok: true, results });
      },
    },
  },
});