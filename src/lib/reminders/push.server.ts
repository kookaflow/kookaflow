const ONESIGNAL_API = "https://api.onesignal.com/notifications";

function getOneSignalCreds() {
  const appId = process.env.ONESIGNAL_APP_ID;
  if (!appId) throw new Error("ONESIGNAL_APP_ID is not configured");
  const key =
    process.env.ONESIGNAL_API_KEY ?? process.env.ONESIGNAL_REST_API_KEY;
  if (!key)
    throw new Error("ONESIGNAL_API_KEY is not configured");
  return { appId, key };
}

export async function sendOneSignalPush({
  externalUserIds,
  heading,
  content,
  url,
}: {
  externalUserIds: string[];
  heading: string;
  content: string;
  url?: string;
}) {
  const { appId, key } = getOneSignalCreds();

  const res = await fetch(ONESIGNAL_API, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      app_id: appId,
      include_aliases: { external_id: externalUserIds },
      target_channel: "push",
      headings: { en: heading },
      contents: { en: content },
      ...(url ? { url } : {}),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `OneSignal API error [${res.status}]: ${JSON.stringify(data)}`,
    );
  }
  return data;
}

/**
 * Send a push notification to a single user by looking up their stored
 * OneSignal player ID. Silently skips if the user has no player ID or
 * has push disabled.
 */
export async function sendPushToUser({
  supabaseAdmin,
  userId,
  title,
  message,
  url,
  scheduledFor,
}: {
  supabaseAdmin: any;
  userId: string;
  title: string;
  message: string;
  url?: string;
  scheduledFor?: string;
}): Promise<{ skipped: true; reason: string } | { skipped: false; data: unknown }> {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("onesignal_player_id, push_notifications_enabled")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile?.onesignal_player_id)
    return { skipped: true, reason: "no_player_id" };
  if (!profile.push_notifications_enabled)
    return { skipped: true, reason: "push_disabled" };

  const { appId, key } = getOneSignalCreds();
  const res = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      Authorization: `Basic ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      app_id: appId,
      include_player_ids: [profile.onesignal_player_id],
      headings: { en: title },
      contents: { en: message },
      ...(url ? { url } : {}),
      ...(scheduledFor ? { send_after: scheduledFor } : {}),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `OneSignal API error [${res.status}]: ${JSON.stringify(data)}`,
    );
  }
  return { skipped: false, data };
}

const DAILY_TIPS = [
  "Hydrate early",
  "5-min stretch helps",
  "Step outside for sunlight",
  "Protect your sleep window",
  "Breathe deep 4-7-8",
  "Text someone you love",
  "Small meal beats big crash",
  "Walk between tasks",
];

export function pickTip(seed: number) {
  return DAILY_TIPS[((seed % DAILY_TIPS.length) + DAILY_TIPS.length) % DAILY_TIPS.length];
}

export function appUrl() {
  return (
    process.env.PUBLIC_APP_URL ??
    "https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app"
  );
}

export function shortShiftLabel(
  events: Array<{ shift_type?: string | null; category?: string | null; title?: string | null }>,
): string {
  const shift = events.find((e) => e.category === "work");
  if (!shift) return "No shift";
  if (shift.shift_type) {
    const map: Record<string, string> = {
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
      day: "Day",
      split: "Split",
      sick_leave: "Sick leave",
      annual_leave: "Leave",
    };
    return map[shift.shift_type] ?? shift.shift_type;
  }
  return shift.title?.slice(0, 20) ?? "Shift";
}

export function computeBalanceScore(
  events: Array<{ category?: string | null; is_all_day?: boolean | null; start_time: string; end_time: string }>,
): number {
  if (events.length === 0) return 50;
  let workHours = 0;
  let lifeHours = 0;
  for (const e of events) {
    const hrs = e.is_all_day
      ? 8
      : Math.max(
          0,
          (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) /
            3_600_000,
        );
    if (e.category === "work") workHours += hrs;
    else lifeHours += hrs;
  }
  const total = workHours + lifeHours;
  if (total === 0) return 50;
  const lifeRatio = lifeHours / total;
  const score = Math.round(100 - Math.abs(lifeRatio - 0.6) * 150);
  return Math.max(0, Math.min(100, score));
}