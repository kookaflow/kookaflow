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
  pickTip,
  sendOneSignalPush,
} from "@/lib/reminders/push.server";

function fmtTime(iso: string, tz: string): string {
  try {
    return new Date(iso).toLocaleTimeString("en-AU", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: tz,
    });
  } catch {
    return new Date(iso).toISOString().slice(11, 16);
  }
}

function shiftLabel(t: string | null | undefined): string {
  switch (t) {
    case "morning":
    case "afternoon":
    case "evening":
    case "night":
      return t;
    case "split":
      return "split";
    case "side_hustle":
      return "side hustle";
    case "oncall":
      return "on-call";
    default:
      return "work";
  }
}

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
            .select("timezone, push_daily_reminder, push_notifications_enabled")
            .eq("id", p.user_id)
            .maybeSingle();
          if (!profile?.push_notifications_enabled || !profile?.push_daily_reminder) {
            results.push({ user_id: p.user_id, status: "push_pref_off" });
            continue;
          }
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
          const shift = evs.find((e) => e.category === "work");
          const score = computeBalanceScore(evs);
          let content: string;
          if (shift) {
            const startStr = shift.is_all_day
              ? "all day"
              : `at ${fmtTime(shift.start_time, tz)}`;
            content = `📅 Today: ${shiftLabel(shift.shift_type)} ${startStr}. You have ${evs.length} events today. Balance score: ${score}/100 🦅`;
          } else if (evs.length > 0) {
            const tip = pickTip(
              zoned.year * 366 + zoned.month * 31 + zoned.day,
            );
            void tip;
            content = `🌿 No shifts today — enjoy your time off! You have ${evs.length} personal events. Balance score: ${score}/100`;
          } else {
            content = `☀️ A free day! Perfect time for rest, family or something you love.`;
          }

          try {
            await sendOneSignalPush({
              externalUserIds: [p.user_id],
              heading: "Your Kookaflow Day Ahead 🦅",
              content,
              url: `${appUrl()}/calendar`,
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