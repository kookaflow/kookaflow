import { max as maxDate, min as minDate } from "date-fns";
import type { CalendarEvent, CategoryId } from "@/types/event";
import { dayRange, weekRange, monthRange } from "./date";

function overlaps(event: CalendarEvent, start: Date, end: Date) {
  const es = new Date(event.start);
  const ee = new Date(event.end);
  return es <= end && ee >= start;
}

export function getEventsForDay(events: CalendarEvent[], date: Date) {
  const { start, end } = dayRange(date);
  return events
    .filter((e) => overlaps(e, start, end))
    .sort((a, b) => +new Date(a.start) - +new Date(b.start));
}

export function getEventsForWeek(events: CalendarEvent[], date: Date, weekStartsOn: 0 | 1 = 1) {
  const { start, end } = weekRange(date, weekStartsOn);
  return events.filter((e) => overlaps(e, start, end));
}

export function getEventsForMonth(events: CalendarEvent[], date: Date) {
  const { start, end } = monthRange(date);
  return events.filter((e) => overlaps(e, start, end));
}

export interface CategoryBreakdown {
  totals: Record<CategoryId, number>;
  totalHours: number;
}

export function getCategoryBreakdown(events: CalendarEvent[], start: Date, end: Date): CategoryBreakdown {
  const totals: Record<CategoryId, number> = {
    work: 0, rest: 0, wellness: 0, exercise: 0, social: 0, family: 0, personal: 0, travel: 0,
  };
  for (const e of events) {
    const es = maxDate([new Date(e.start), start]);
    const ee = minDate([new Date(e.end), end]);
    if (ee <= es) continue;
    totals[e.category] += (+ee - +es) / 36e5;
  }
  const totalHours = Object.values(totals).reduce((a, b) => a + b, 0);
  return { totals, totalHours };
}