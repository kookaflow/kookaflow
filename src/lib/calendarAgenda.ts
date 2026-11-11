/**
 * Pure helpers for the agenda-style calendar (week list, day status, month badges).
 * Rule: a shift belongs to its START day for lists, badges and totals; it is
 * never split or counted twice. Overnight portions only appear on the next
 * day as "continuing"/recovery context.
 */
import { addDays, isSameDay, startOfDay } from "date-fns";

export interface AgendaItem {
  id: string;
  title: string;
  category: string;
  start: Date;
  end: Date;
  shiftType?: string;
  source?: "shiftsync" | "google";
  isPayday?: boolean;
  iconColor?: string;
  notes?: string;
}

const HOUR = 3_600_000;

export function isShift(e: AgendaItem): boolean {
  if (e.source === "google") return false;
  return !!e.shiftType || e.category === "work";
}

/** A shift that counts toward worked hours (timed, not payday/leave all-day). */
export function isWorkedShift(e: AgendaItem): boolean {
  if (!isShift(e) || e.isPayday) return false;
  if (e.shiftType === "sick_leave" || e.shiftType === "annual_leave" || e.shiftType === "oncall") return false;
  return isTimed(e);
}

export function isTimed(e: AgendaItem): boolean {
  const ms = e.end.getTime() - e.start.getTime();
  // all-day items are stored as 00:00–23:59 on the same day
  const allDayLike =
    e.start.getHours() === 0 && e.start.getMinutes() === 0 && ms >= 23.9 * HOUR && ms <= 24 * HOUR;
  return ms > 0 && !allDayLike;
}

export function isOvernight(e: AgendaItem): boolean {
  return isTimed(e) && !isSameDay(e.start, new Date(e.end.getTime() - 1));
}

export function durationHours(e: AgendaItem): number {
  return Math.max(0, (e.end.getTime() - e.start.getTime()) / HOUR);
}

export function shiftInitials(name: string): string {
  const words = name.trim().split(/[\s\-_/]+/).filter(Boolean);
  const src = words.length ? words : [name];
  if (src.length >= 2) return (src[0][0] + src[1][0]).toUpperCase();
  return src[0].slice(0, 2).toUpperCase().padEnd(2, src[0][0]?.toUpperCase() ?? "");
}

/** Items that start on `day`, sorted by start time. */
export function itemsForDay<T extends AgendaItem>(items: T[], day: Date): T[] {
  return items
    .filter((e) => isSameDay(e.start, day))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Overnight shift from the previous day that ends on `day`, if any (latest ending). */
export function carriedOverShift<T extends AgendaItem>(items: T[], day: Date): T | null {
  const prev = addDays(startOfDay(day), -1);
  const found = items
    .filter((e) => isWorkedShift(e) && isSameDay(e.start, prev) && isOvernight(e) && isSameDay(e.end, day))
    .sort((a, b) => b.end.getTime() - a.end.getTime());
  return found[0] ?? null;
}

export type DayStatus = "working_night" | "working" | "recovering" | "day_off";

export function dayStatus(items: AgendaItem[], day: Date): DayStatus {
  const today = itemsForDay(items, day).filter(isShift);
  if (today.some((e) => isWorkedShift(e) && isOvernight(e))) return "working_night";
  if (today.some(isWorkedShift)) return "working";
  if (carriedOverShift(items, day)) return "recovering";
  return "day_off";
}

export interface Segment {
  id: string;
  /** minutes from local midnight, 0..1440 */
  from: number;
  to: number;
  colourOf: AgendaItem;
  fromYesterday: boolean;
}

/** Worked time on the 24h bar for `day`, including shifts that started the day before. */
export function workedSegments(items: AgendaItem[], day: Date): Segment[] {
  const d0 = startOfDay(day).getTime();
  const d1 = addDays(startOfDay(day), 1).getTime();
  return items
    .filter(isWorkedShift)
    .filter((e) => e.start.getTime() < d1 && e.end.getTime() > d0)
    .map((e) => ({
      id: e.id,
      from: Math.round((Math.max(e.start.getTime(), d0) - d0) / 60_000),
      to: Math.round((Math.min(e.end.getTime(), d1) - d0) / 60_000),
      colourOf: e,
      fromYesterday: e.start.getTime() < d0,
    }))
    .sort((a, b) => a.from - b.from);
}

export interface RestWindow {
  start: Date;
  end: Date;
  kind: "recovery" | "pre_shift_nap";
}

function clashes(items: AgendaItem[], s: Date, e: Date, ignoreId?: string): boolean {
  return items.some(
    (i) => i.id !== ignoreId && isTimed(i) && i.start < e && i.end > s,
  );
}

/** Suggested rest: 8h starting 1h after the last shift that ends today; else a nap before tonight's shift. */
export function suggestedRest(items: AgendaItem[], day: Date): RestWindow | null {
  const d0 = startOfDay(day);
  const d1 = addDays(d0, 1);
  const ending = items
    .filter(isWorkedShift)
    .filter((e) => e.end > d0 && e.end <= d1)
    .sort((a, b) => b.end.getTime() - a.end.getTime());
  const last = ending[0];
  if (last) {
    const s = new Date(last.end.getTime() + HOUR);
    const e = new Date(s.getTime() + 8 * HOUR);
    if (s < d1 && !clashes(items, s, e, last.id)) return { start: s, end: e, kind: "recovery" };
  }
  const tonight = itemsForDay(items, day).find((e) => isWorkedShift(e) && e.start.getHours() >= 17);
  if (tonight) {
    const e = new Date(tonight.start.getTime() - 2 * HOUR);
    const s = new Date(e.getTime() - 1.5 * HOUR);
    if (s >= d0 && !clashes(items, s, e)) return { start: s, end: e, kind: "pre_shift_nap" };
  }
  return null;
}

/** Template range on `day` from HH:mm strings (end before start => next day). */
export function templateRange(day: Date, startHHmm: string, endHHmm: string): { start: Date; end: Date } {
  const [sh, sm] = startHHmm.split(":").map(Number);
  const [eh, em] = endHHmm.split(":").map(Number);
  const start = new Date(day);
  start.setHours(sh || 0, sm || 0, 0, 0);
  const end = new Date(day);
  end.setHours(eh || 0, em || 0, 0, 0);
  if (end <= start) end.setDate(end.getDate() + 1);
  return { start, end };
}

/** Does [start,end) overlap any timed item that starts on that day or carries into it? */
export function overlapsExisting(items: AgendaItem[], start: Date, end: Date): boolean {
  return items.some((i) => isTimed(i) && i.start < end && i.end > start);
}

export interface Totals {
  hours: number;
  earnings: number | null;
}

/** Totals over shifts STARTING within [from, to] (inclusive by day). */
export function periodTotals(items: AgendaItem[], from: Date, to: Date, rate: number | null): Totals {
  const a = startOfDay(from).getTime();
  const b = addDays(startOfDay(to), 1).getTime();
  const hours = items
    .filter(isWorkedShift)
    .filter((e) => e.start.getTime() >= a && e.start.getTime() < b)
    .reduce((s, e) => s + durationHours(e), 0);
  const rounded = Math.round(hours * 100) / 100;
  return { hours: rounded, earnings: rate != null ? Math.round(rounded * rate * 100) / 100 : null };
}

export function nextShift<T extends AgendaItem>(items: T[], after: Date): T | null {
  return (
    items
      .filter((e) => isShift(e) && e.start >= after)
      .sort((a, b) => a.start.getTime() - b.start.getTime())[0] ?? null
  );
}

export function formatHours(h: number): string {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  if (mins === 0) return `${whole}h`;
  if (whole === 0) return `${mins}m`;
  return `${whole}h ${mins}m`;
}

// ---------- Month-view chip labels ----------

const splitWords = (s: string) => s.trim().split(/\s+/).filter(Boolean);

/**
 * Whole-word label versions, longest first. When another template shares the
 * same first word, that word is shortened to 4 letters so the distinguishing
 * words survive ("Baptistcare Night" → "Bapt Night").
 */
export function labelCandidates(name: string, siblingNames: string[] = []): string[] {
  const words = splitWords(name);
  if (!words.length) return [name];
  const first = words[0].toLowerCase();
  const shared =
    words.length > 1 &&
    words[0].length > 4 &&
    siblingNames.some((n) => n.trim().toLowerCase() !== name.trim().toLowerCase() && splitWords(n)[0]?.toLowerCase() === first);
  if (shared) words[0] = words[0].slice(0, 4);
  const out: string[] = [];
  for (let k = words.length; k >= 1; k--) out.push(words.slice(0, k).join(" "));
  return out;
}

/** Longest candidate that fits; only cuts mid-word (with "…") when the first word alone doesn't fit. */
export function fitLabel(candidates: string[], fits: (text: string) => boolean): string {
  for (const c of candidates) if (fits(c)) return c;
  const word = candidates[candidates.length - 1] ?? "";
  for (let n = word.length - 1; n >= 1; n--) {
    const t = `${word.slice(0, n)}…`;
    if (fits(t)) return t;
  }
  return word.slice(0, 1);
}
