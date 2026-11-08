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

/**
 * Build a OneSignal notification body targeting users by external_id (set
 * on every device by OneSignal.login(userId)), so web, iOS and Android all
 * receive it. Native taps open `data.path` inside the app.
 */
export function buildPushBody({
  appId,
  externalUserIds,
  heading,
  content,
  url,
  scheduledFor,
}: {
  appId: string;
  externalUserIds: string[];
  heading: string;
  content: string;
  url?: string;
  scheduledFor?: string;
}) {
  const path = url ? toAppPath(url) : null;
  return {
    app_id: appId,
    include_aliases: { external_id: externalUserIds },
    target_channel: "push",
    headings: { en: heading },
    contents: { en: content },
    ...(url ? { web_url: url } : {}),
    ...(path ? { data: { path } } : {}),
    ...(scheduledFor ? { send_after: scheduledFor } : {}),
  };
}

function toAppPath(url: string): string | null {
  try {
    const u = new URL(url, "https://kookaflow.com");
    if (!/(^|\.)kookaflow\.com$/.test(u.hostname)) return null;
    return u.pathname + u.search;
  } catch {
    return null;
  }
}

async function postNotification(body: Record<string, unknown>) {
  const { key } = getOneSignalCreds();
  const res = await fetch(ONESIGNAL_API, {
    method: "POST",
    headers: {
      Authorization: `Key ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `OneSignal API error [${res.status}]: ${JSON.stringify(data)}`,
    );
  }
  return data as { id?: string; errors?: unknown };
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
  const { appId } = getOneSignalCreds();
  return postNotification(
    buildPushBody({ appId, externalUserIds, heading, content, url }),
  );
}

/**
 * Send a push notification to all of a user's devices (by external_id).
 * Skips if the user has turned push off.
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
    .select("push_notifications_enabled")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile?.push_notifications_enabled)
    return { skipped: true, reason: "push_disabled" };

  const { appId } = getOneSignalCreds();
  const data = await postNotification(
    buildPushBody({
      appId,
      externalUserIds: [userId],
      heading: title,
      content: message,
      url,
      scheduledFor,
    }),
  );
  if (!data.id) {
    console.log("[push] no subscribed devices for user", userId, data.errors);
    return { skipped: true, reason: "no_subscription" };
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
/**
 * Remove a user's OneSignal user record (and its push subscriptions), plus a
 * stray stored subscription id. 404 counts as already gone. Throws on other errors.
 */
export async function deleteOneSignalUser(userId: string, playerId?: string | null) {
  const { appId, key } = getOneSignalCreds();
  const headers = { Authorization: `Key ${key}`, Accept: "application/json" };
  const base = `https://api.onesignal.com/apps/${appId}`;
  const urls = [`${base}/users/by/external_id/${encodeURIComponent(userId)}`];
  if (playerId) urls.push(`${base}/subscriptions/${encodeURIComponent(playerId)}`);
  const failures: string[] = [];
  for (const url of urls) {
    const res = await fetch(url, { method: "DELETE", headers });
    if (!res.ok && res.status !== 404) {
      failures.push(`[${res.status}] ${await res.text().catch(() => "")}`);
    }
  }
  if (failures.length) throw new Error(`OneSignal delete failed: ${failures.join("; ")}`);
}
