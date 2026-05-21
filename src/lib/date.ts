import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  format,
} from "date-fns";

export function dayRange(date: Date) {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function weekRange(date: Date, weekStartsOn: 0 | 1 = 1) {
  return {
    start: startOfWeek(date, { weekStartsOn }),
    end: endOfWeek(date, { weekStartsOn }),
  };
}

export function monthRange(date: Date) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function monthGridDays(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn });
  const end = endOfWeek(endOfMonth(date), { weekStartsOn });
  return eachDayOfInterval({ start, end });
}

export function weekDays(date: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const { start, end } = weekRange(date, weekStartsOn);
  return eachDayOfInterval({ start, end });
}

export { isSameDay, format };

export function toInputDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromInputDateTime(value: string): string {
  return new Date(value).toISOString();
}