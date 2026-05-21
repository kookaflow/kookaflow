import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  startOfDay,
  endOfDay,
  format,
  isSameDay,
  differenceInDays,
} from "date-fns";
import {
  CATEGORIES,
  type CategoryId,
  type MockEvent,
} from "@/components/calendar-page/constants";

export interface Range {
  start: Date;
  end: Date;
}

export function currentWeekRange(now = new Date()): Range {
  return {
    start: startOfWeek(now, { weekStartsOn: 1 }),
    end: endOfWeek(now, { weekStartsOn: 1 }),
  };
}

export function previousWeekRange(now = new Date()): Range {
  const prev = addDays(now, -7);
  return currentWeekRange(prev);
}

export function currentMonthRange(now = new Date()): Range {
  return { start: startOfMonth(now), end: endOfMonth(now) };
}

export function eventHoursInRange(e: MockEvent, start: Date, end: Date): number {
  const s = e.start > start ? e.start : start;
  const en = e.end < end ? e.end : end;
  const mins = (+en - +s) / 60000;
  return mins > 0 ? mins / 60 : 0;
}

export interface DaySlice {
  day: Date;
  hours: number;
  category: CategoryId;
}

export function splitEventByDay(e: MockEvent, start: Date, end: Date): DaySlice[] {
  const out: DaySlice[] = [];
  const s = e.start > start ? e.start : start;
  const en = e.end < end ? e.end : end;
  if (en <= s) return out;
  let cursor = startOfDay(s);
  while (cursor <= en) {
    const dayStart = cursor < s ? s : cursor;
    const dayEnd = endOfDay(cursor);
    const sliceEnd = dayEnd < en ? dayEnd : en;
    const hours = Math.max(0, (+sliceEnd - +dayStart) / 3600000);
    if (hours > 0) out.push({ day: startOfDay(cursor), hours, category: e.category });
    cursor = addDays(cursor, 1);
    if (differenceInDays(cursor, startOfDay(start)) > 60) break;
  }
  return out;
}

export type WeekDayBucket = { day: string; date: Date; total: number } & Record<CategoryId, number>;

function emptyTotals(): Record<CategoryId, number> {
  return {
    work: 0, rest: 0, wellness: 0, exercise: 0, social: 0, family: 0, personal: 0,
  };
}

export function weeklyByDay(events: MockEvent[], range: Range): WeekDayBucket[] {
  const days: WeekDayBucket[] = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(range.start, i);
    days.push({ day: format(d, "EEE"), date: d, total: 0, ...emptyTotals() });
  }
  for (const e of events) {
    for (const s of splitEventByDay(e, range.start, range.end)) {
      const idx = days.findIndex((b) => isSameDay(b.date, s.day));
      if (idx === -1) continue;
      days[idx][s.category] += s.hours;
      days[idx].total += s.hours;
    }
  }
  return days;
}

export interface CategoryTotal {
  category: CategoryId;
  label: string;
  color: string;
  hours: number;
  pct: number;
}

export function monthlyTotals(events: MockEvent[], range: Range): {
  totals: CategoryTotal[];
  totalHours: number;
} {
  const t = emptyTotals();
  for (const e of events) t[e.category] += eventHoursInRange(e, range.start, range.end);
  const totalHours = Object.values(t).reduce((a, b) => a + b, 0);
  const totals = CATEGORIES.map((c) => ({
    category: c.id,
    label: c.label,
    color: c.color,
    hours: +t[c.id].toFixed(1),
    pct: totalHours > 0 ? (t[c.id] / totalHours) * 100 : 0,
  }));
  return { totals, totalHours };
}

export interface CategoryCardData {
  category: CategoryId;
  hours: number;
  pctOfWaking: number;
  prevHours: number;
  deltaPct: number;
  trend: "up" | "down" | "flat";
  sparkline: number[]; // 7 day hours
}

export function wakingHoursPerWeek(events: MockEvent[], thisWeek: Range): number {
  let restHours = 0;
  for (const e of events) if (e.category === "rest") restHours += eventHoursInRange(e, thisWeek.start, thisWeek.end);
  if (restHours <= 0) return 7 * 16;
  const avg = Math.min(10, Math.max(6, restHours / 7));
  return 7 * (24 - avg);
}

function hoursInRangeForCategory(events: MockEvent[], cat: CategoryId, range: Range) {
  let sum = 0;
  for (const e of events) if (e.category === cat) sum += eventHoursInRange(e, range.start, range.end);
  return sum;
}

export function categoryCard(
  cat: CategoryId,
  events: MockEvent[],
  thisWeek: Range,
  lastWeek: Range,
  waking: number,
): CategoryCardData {
  const hours = hoursInRangeForCategory(events, cat, thisWeek);
  const prevHours = hoursInRangeForCategory(events, cat, lastWeek);
  const denom = Math.max(prevHours, 1);
  const deltaPct = ((hours - prevHours) / denom) * 100;
  const trend: "up" | "down" | "flat" =
    Math.abs(deltaPct) < 5 ? "flat" : deltaPct > 0 ? "up" : "down";
  const buckets = weeklyByDay(events, thisWeek);
  const sparkline = buckets.map((b) => +b[cat].toFixed(2));
  return {
    category: cat,
    hours: +hours.toFixed(1),
    pctOfWaking: waking > 0 ? Math.min(100, (hours / waking) * 100) : 0,
    prevHours: +prevHours.toFixed(1),
    deltaPct: Math.round(deltaPct),
    trend,
    sparkline,
  };
}

export const DASHBOARD_CARD_CATEGORIES: CategoryId[] = [
  "work", "rest", "wellness", "exercise", "social", "family",
];

export interface BalanceScore {
  score: number | null;
  band: "Skewed" | "Tilting" | "Balanced" | "In flow" | "Insufficient";
  copy: string;
}

const ESSENTIALS: CategoryId[] = ["exercise", "social", "family", "wellness"];

export function balanceScore(events: MockEvent[], range: Range): BalanceScore {
  const totals: Record<string, number> = {};
  let sum = 0;
  for (const c of CATEGORIES) {
    if (c.id === "rest") continue;
    const h = hoursInRangeForCategory(events, c.id, range);
    if (h > 0) {
      totals[c.id] = h;
      sum += h;
    }
  }
  if (sum < 5) {
    return { score: null, band: "Insufficient", copy: "Not enough data yet. Add a few more events to see your balance." };
  }
  const keys = Object.keys(totals);
  let H = 0;
  for (const k of keys) {
    const p = totals[k] / sum;
    H -= p * Math.log(p);
  }
  const Hmax = Math.log(Math.max(keys.length, 2));
  let score = Math.round((H / Hmax) * 100);
  // Essential breadth bonus
  let bonus = 0;
  for (const e of ESSENTIALS) if ((totals[e] ?? 0) > 0) bonus += 1.25;
  score = Math.min(100, Math.max(0, Math.round(score + bonus)));
  let band: BalanceScore["band"];
  let copy: string;
  if (score < 40) {
    band = "Skewed";
    copy = "Your week is tilted toward one area. Try adding a Rest or Social block.";
  } else if (score < 70) {
    band = "Tilting";
    copy = "You're getting some variety, but a couple of categories are doing most of the work.";
  } else if (score < 90) {
    band = "Balanced";
    copy = "Nicely spread across life areas. Keep protecting the smaller ones.";
  } else {
    band = "In flow";
    copy = "Beautifully balanced week. This is the sweet spot.";
  }
  return { score, band, copy };
}