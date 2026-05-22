import { createClient } from "@supabase/supabase-js";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const CATEGORY_LABELS: Record<string, string> = {
  work: "Work",
  rest: "Rest",
  wellness: "Wellness",
  exercise: "Exercise",
  social: "Social",
  family: "Family",
  personal: "Personal",
  travel: "Travel",
};

const WELLNESS_TIPS = [
  "Aim for 7–9 hours of sleep — Matthew Walker's research shows it's the single best predictor of next-day wellbeing.",
  "Take a 10-minute walk between activities. Movement breaks improve mood and focus.",
  "Stay hydrated through your shift — even mild dehydration affects reaction time.",
  "Connect with one person today, even briefly. Social connection is a top driver of life satisfaction (PERMA).",
  "Try 4-7-8 breathing for one minute before bed: inhale 4s, hold 7s, exhale 8s.",
  "Step outside for 5 minutes of daylight — it helps reset your circadian rhythm.",
  "Pause before your shift to set one small intention. Meaning matters as much as rest.",
];

export function pickWellnessTip(seed: number) {
  return WELLNESS_TIPS[seed % WELLNESS_TIPS.length];
}

export function getAdminClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function sendResendEmail(args: {
  to: string;
  subject: string;
  html: string;
}) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: "Kookaflow <onboarding@resend.dev>",
      to: [args.to],
      subject: args.subject,
      html: args.html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed [${res.status}]: ${body}`);
  }
  return res.json();
}

type EventRow = {
  id: string;
  title: string;
  category: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  shift_type: string | null;
  location: string | null;
};

function fmtTime(iso: string, tz: string) {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

function fmtDate(d: Date, tz: string) {
  return d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: tz,
  });
}

function shell(title: string, inner: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4F5FB;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1E2A6E;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#1E2A6E 0%,#F59E0B 100%);color:#fff;padding:24px;border-radius:16px 16px 0 0;">
      <div style="font-size:14px;opacity:.85;letter-spacing:.08em;text-transform:uppercase;">Kookaflow</div>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;">${title}</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px;">
      ${inner}
      <p style="margin:32px 0 0;font-size:12px;color:#8a8fb0;">You're receiving this because email reminders are enabled in Kookaflow. Manage in Settings → Reminders.</p>
    </div>
  </div></body></html>`;
}

function eventRow(e: EventRow, tz: string) {
  const label = CATEGORY_LABELS[e.category] ?? e.category;
  const time = e.is_all_day
    ? "All day"
    : `${fmtTime(e.start_time, tz)} – ${fmtTime(e.end_time, tz)}`;
  const loc = e.location ? ` · ${e.location}` : "";
  return `<tr><td style="padding:10px 0;border-bottom:1px solid #eef0f8;">
    <div style="font-weight:600;">${escapeHtml(e.title)}</div>
    <div style="font-size:13px;color:#5b6088;">${time} · ${label}${escapeHtml(loc)}</div>
  </td></tr>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function computeBalance(events: EventRow[]) {
  const totals: Record<string, number> = {};
  let total = 0;
  for (const e of events) {
    const mins =
      (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) /
      60000;
    totals[e.category] = (totals[e.category] ?? 0) + mins;
    total += mins;
  }
  const work = totals["work"] ?? 0;
  const rest = (totals["rest"] ?? 0) + (totals["wellness"] ?? 0);
  const life =
    (totals["social"] ?? 0) +
    (totals["family"] ?? 0) +
    (totals["personal"] ?? 0) +
    (totals["exercise"] ?? 0);
  if (total === 0) return { score: 0, totals };
  const workRatio = work / total;
  const lifeRatio = (rest + life) / total;
  const score = Math.round(Math.min(100, lifeRatio * 80 + (1 - workRatio) * 20));
  return { score, totals };
}

export function buildDailyEmail(args: {
  name: string | null;
  date: Date;
  tz: string;
  events: EventRow[];
  tipSeed: number;
}) {
  const { date, tz, events, tipSeed, name } = args;
  const dateLabel = fmtDate(date, tz);
  const subject = `Your Kookaflow Day Ahead ☀️ — ${dateLabel}`;
  const greeting = name ? `Good morning, ${escapeHtml(name)}!` : "Good morning!";
  const tip = pickWellnessTip(tipSeed);
  const { score } = computeBalance(events);
  const work = events.find((e) => e.category === "work");
  const shiftLine = work
    ? `<p style="margin:0 0 16px;">Your next shift: <strong>${escapeHtml(work.title)}</strong> at ${fmtTime(work.start_time, tz)}.</p>`
    : `<p style="margin:0 0 16px;">No shifts today — enjoy your time off 🌿</p>`;

  const list = events.length
    ? `<table style="width:100%;border-collapse:collapse;margin:0 0 16px;">${events
        .map((e) => eventRow(e, tz))
        .join("")}</table>`
    : `<p style="color:#5b6088;margin:0 0 16px;">Nothing scheduled. A clear day is a gift — use it well.</p>`;

  const inner = `
    <p style="margin:0 0 8px;font-size:16px;">${greeting}</p>
    <p style="margin:0 0 20px;color:#5b6088;">Here's what's on for ${dateLabel}.</p>
    ${shiftLine}
    ${list}
    <div style="background:#F4F5FB;border-radius:12px;padding:16px;margin:8px 0 16px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;">Life balance score</div>
      <div style="font-size:28px;font-weight:700;color:#F59E0B;">${score}/100</div>
    </div>
    <div style="border-left:4px solid #F59E0B;background:#FFF8EC;padding:12px 16px;border-radius:8px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Wellness tip</div>
      <div style="font-size:14px;">${escapeHtml(tip)}</div>
    </div>
  `;
  return { subject, html: shell("Your day ahead", inner) };
}

export function buildWeeklyEmail(args: {
  name: string | null;
  weekStart: Date;
  tz: string;
  events: EventRow[];
  tipSeed: number;
}) {
  const { weekStart, tz, events, tipSeed, name } = args;
  const dateLabel = fmtDate(weekStart, tz);
  const subject = `Your Kookaflow Week Ahead 📅 — Week of ${dateLabel}`;
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi there,";
  const { score, totals } = computeBalance(events);
  const workMins = totals["work"] ?? 0;
  const workHrs = (workMins / 60).toFixed(1);

  const breakdown = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([cat, mins]) =>
        `<tr><td style="padding:6px 0;color:#1E2A6E;">${CATEGORY_LABELS[cat] ?? cat}</td><td style="padding:6px 0;text-align:right;font-weight:600;">${(mins / 60).toFixed(1)}h</td></tr>`,
    )
    .join("");

  const tip = pickWellnessTip(tipSeed);

  const nudge =
    workMins / 60 > 40
      ? "You've got a heavy work week ahead. Block at least one full rest window — even 90 minutes of unscheduled time protects recovery."
      : (totals["exercise"] ?? 0) < 90
        ? "Try to add two 30-minute movement blocks this week. Even brisk walking counts."
        : (totals["social"] ?? 0) < 60
          ? "Plan one social moment this week — coffee, a call, a meal. Connection is a top wellbeing predictor."
          : tip;

  const inner = `
    <p style="margin:0 0 8px;font-size:16px;">${greeting}</p>
    <p style="margin:0 0 20px;color:#5b6088;">Here's your overview for the week of ${dateLabel}.</p>
    <p style="margin:0 0 16px;">You have <strong>${events.filter((e) => e.category === "work").length}</strong> shifts scheduled — about <strong>${workHrs}h</strong> of work.</p>
    <div style="background:#F4F5FB;border-radius:12px;padding:16px;margin:0 0 16px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Hours by category</div>
      <table style="width:100%;border-collapse:collapse;">${breakdown || `<tr><td style="color:#5b6088;">No events scheduled yet.</td></tr>`}</table>
    </div>
    <div style="background:#F4F5FB;border-radius:12px;padding:16px;margin:0 0 16px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;">Life balance score</div>
      <div style="font-size:28px;font-weight:700;color:#F59E0B;">${score}/100</div>
    </div>
    <div style="border-left:4px solid #F59E0B;background:#FFF8EC;padding:12px 16px;border-radius:8px;">
      <div style="font-size:12px;color:#5b6088;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Wellness nudge</div>
      <div style="font-size:14px;">${escapeHtml(nudge)}</div>
    </div>
  `;
  return { subject, html: shell("Your week ahead", inner) };
}

const DAY_MAP: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function dayMatches(day: string | null, dateInTz: Date) {
  if (!day) return false;
  return DAY_MAP[day] === dateInTz.getDay();
}

export function getZonedNow(tz: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    weekday: get("weekday").toLowerCase().slice(0, 3),
  };
}

export function isTimeInWindow(
  reminderTime: string,
  zoned: { hour: number; minute: number },
  windowMinutes = 5,
) {
  const [hh, mm] = reminderTime.split(":").map(Number);
  const reminderMin = hh * 60 + mm;
  const nowMin = zoned.hour * 60 + zoned.minute;
  const diff = nowMin - reminderMin;
  return diff >= 0 && diff < windowMinutes;
}

export function dateForTz(zoned: {
  year: number;
  month: number;
  day: number;
}) {
  return `${zoned.year}-${String(zoned.month).padStart(2, "0")}-${String(zoned.day).padStart(2, "0")}`;
}

export function startOfDayUtc(tz: string, zoned: ReturnType<typeof getZonedNow>) {
  // Approximate: start at 00:00 in tz on the given day, treat as ISO local then convert.
  const iso = `${zoned.year}-${String(zoned.month).padStart(2, "0")}-${String(zoned.day).padStart(2, "0")}T00:00:00`;
  // Use a trick: format Date in tz and read offset.
  // Simpler: construct as if UTC, then subtract a generated offset.
  const local = new Date(`${iso}Z`);
  const offsetFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });
  const parts = offsetFmt.formatToParts(local);
  const tzName =
    parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const match = tzName.match(/GMT([+-]\d+)(?::(\d+))?/);
  const hOff = match ? Number(match[1]) : 0;
  const mOff = match && match[2] ? Number(match[2]) * Math.sign(hOff || 1) : 0;
  const totalMin = hOff * 60 + mOff;
  return new Date(local.getTime() - totalMin * 60_000);
}

export type { EventRow };