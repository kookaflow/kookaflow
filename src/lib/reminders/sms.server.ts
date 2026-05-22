const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

export async function sendTwilioSms({
  to,
  body,
  from,
}: {
  to: string;
  body: string;
  from?: string;
}) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  const TWILIO_API_KEY = process.env.TWILIO_API_KEY;
  if (!TWILIO_API_KEY) throw new Error("TWILIO_API_KEY is not configured");

  const fromNumber = from ?? process.env.TWILIO_FROM_NUMBER;
  if (!fromNumber) throw new Error("TWILIO_FROM_NUMBER is not configured");

  const trimmed = body.length > 160 ? body.slice(0, 157) + "..." : body;

  const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": TWILIO_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: trimmed,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Twilio API error [${res.status}]: ${JSON.stringify(data)}`,
    );
  }
  return data;
}

export function isValidE164(phone: string | null | undefined): phone is string {
  if (!phone) return false;
  return /^\+[1-9]\d{6,14}$/.test(phone.trim());
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

const WEEKLY_TIPS = [
  "Plan one rest day",
  "Book social time",
  "Schedule exercise",
  "Prep meals ahead",
];

export function pickTip(arr: string[], seed: number) {
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

export { DAILY_TIPS, WEEKLY_TIPS };

export function appUrl() {
  return (
    process.env.PUBLIC_APP_URL ??
    "https://project--96b5e46f-e4e7-44bf-8bb8-b8c33dc6b93b.lovable.app"
  );
}

export function shortShiftLabel(events: Array<{ shift_type?: string | null; category?: string | null; title?: string | null }>): string {
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
  // Ideal: ~40% work, ~60% life. Score peaks when lifeHours/total ≈ 0.6
  const lifeRatio = lifeHours / total;
  const score = Math.round(100 - Math.abs(lifeRatio - 0.6) * 150);
  return Math.max(0, Math.min(100, score));
}