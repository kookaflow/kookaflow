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
  computeBalanceScore,
  sendOneSignalPush,
} from "@/lib/reminders/push.server";

export const Route = createFileRoute(
  "/api/public/hooks/send-push-weekly-reminder",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabase = getAdminClient();
        const { data: prefs, error } = await supabase
          .from("user_preferences")
          .select(
            "user_id, weekly_reminder_time, weekly_reminder_day, weekly_reminder_channel, weekly_reminder_enabled",
          )
          .eq("weekly_reminder_enabled", true);
        if (error) {
          return new Response(`prefs error: ${error.message}`, { status: 500 });
        }

        const results: Array<{ user_id: string; status: string }> = [];

        for (const p of prefs ?? []) {
          const ch = p.weekly_reminder_channel;
          if (!ch || (ch !== "push" && ch !== "both")) {
            results.push({ user_id: p.user_id, status: "channel_skip" });
            continue;
          }
          if (!p.weekly_reminder_time || !p.weekly_reminder_day) {
            results.push({ user_id: p.user_id, status: "no_schedule" });
            continue;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("timezone, full_name, push_weekly_reminder, push_notifications_enabled")
            .eq("id", p.user_id)
            .maybeSingle();
          if (!profile?.push_notifications_enabled || !profile?.push_weekly_reminder) {
            results.push({ user_id: p.user_id, status: "push_pref_off" });
            continue;
          }
          const tz = profile?.timezone || "UTC";
          const zoned = getZonedNow(tz);
          if (zoned.weekday !== p.weekly_reminder_day) {
            results.push({ user_id: p.user_id, status: "wrong_day" });
            continue;
          }
          if (!isTimeInWindow(p.weekly_reminder_time, zoned, 5)) {
            results.push({ user_id: p.user_id, status: "out_of_window" });
            continue;
          }

          const sentFor = dateForTz(zoned);
          const { error: insErr } = await supabase
            .from("reminder_sends")
            .insert({
              user_id: p.user_id,
              kind: "push_weekly",
              sent_for_date: sentFor,
            });
          if (insErr) {
            results.push({ user_id: p.user_id, status: "already_sent" });
            continue;
          }

          const weekStart = startOfDayUtc(tz, zoned);
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60_000);
          const { data: events } = await supabase
            .from("events")
            .select(
              "id,title,category,start_time,end_time,is_all_day,shift_type,location",
            )
            .eq("user_id", p.user_id)
            .gte("start_time", weekStart.toISOString())
            .lt("start_time", weekEnd.toISOString())
            .order("start_time", { ascending: true });

          const evs = (events ?? []) as EventRow[];
          const shifts = evs.filter((e) => e.category === "work").length;
          const score = computeBalanceScore(evs);
          const firstName = (profile?.full_name ?? "").trim().split(/\s+/)[0] || "there";
          const content = `📊 This week: ${shifts} shifts scheduled. Balance score: ${score}/100. Have a great week, ${firstName}! 🦅`;

          try {
            await sendOneSignalPush({
              externalUserIds: [p.user_id],
              heading: "Your Kookaflow Week Ahead 🦅",
              content,
              url: `${appUrl()}/dashboard`,
            });
            results.push({ user_id: p.user_id, status: "sent" });
          } catch (e: any) {
            await supabase
              .from("reminder_sends")
              .delete()
              .eq("user_id", p.user_id)
              .eq("kind", "push_weekly")
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