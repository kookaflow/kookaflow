import { createFileRoute } from "@tanstack/react-router";
import {
  buildDailyEmail,
  dateForTz,
  EventRow,
  getAdminClient,
  getZonedNow,
  isTimeInWindow,
  sendResendEmail,
  startOfDayUtc,
} from "@/lib/reminders/email.server";

export const Route = createFileRoute("/api/public/hooks/send-daily-reminder")({
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
            "user_id, email, daily_reminder_time, daily_reminder_channel, daily_reminder_enabled",
          )
          .eq("daily_reminder_enabled", true);
        if (error) {
          return new Response(`prefs error: ${error.message}`, { status: 500 });
        }

        const results: Array<{ user_id: string; status: string }> = [];

        for (const p of prefs ?? []) {
          if (!p.email) {
            results.push({ user_id: p.user_id, status: "no_email" });
            continue;
          }
          if (
            p.daily_reminder_channel &&
            p.daily_reminder_channel !== "email" &&
            p.daily_reminder_channel !== "both"
          ) {
            results.push({ user_id: p.user_id, status: "channel_skip" });
            continue;
          }
          if (!p.daily_reminder_time) {
            results.push({ user_id: p.user_id, status: "no_time" });
            continue;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("timezone, full_name")
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
              kind: "daily",
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

          const { subject, html } = buildDailyEmail({
            name: profile?.full_name ?? null,
            date: dayStart,
            tz,
            events: (events ?? []) as EventRow[],
            tipSeed:
              zoned.year * 366 + zoned.month * 31 + zoned.day,
          });

          try {
            await sendResendEmail({ to: p.email, subject, html });
            results.push({ user_id: p.user_id, status: "sent" });
          } catch (e: any) {
            await supabase
              .from("reminder_sends")
              .delete()
              .eq("user_id", p.user_id)
              .eq("kind", "daily")
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