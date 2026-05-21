import { CATEGORIES } from "@/lib/categories";
import { format } from "date-fns";
import { dayRange } from "@/lib/date";
import { getCategoryBreakdown } from "@/lib/selectors";
import type { CalendarEvent } from "@/types/event";

interface Props {
  days: Date[];
  events: CalendarEvent[];
}

export function WeeklyCategoryChart({ days, events }: Props) {
  const dayData = days.map((d) => {
    const { start, end } = dayRange(d);
    return { date: d, breakdown: getCategoryBreakdown(events, start, end) };
  });
  const max = Math.max(8, ...dayData.map((d) => d.breakdown.totalHours));

  return (
    <div className="flex h-40 items-end gap-2">
      {dayData.map(({ date, breakdown }) => (
        <div key={date.toISOString()} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-32 w-full flex-col-reverse overflow-hidden rounded-md bg-muted/40">
            {CATEGORIES.map((c) => {
              const h = breakdown.totals[c.id];
              if (h <= 0) return null;
              return <div key={c.id} className={c.bgClass} style={{ height: `${(h / max) * 100}%` }} />;
            })}
          </div>
          <span className="text-[10px] text-muted-foreground">{format(date, "EEE")}</span>
        </div>
      ))}
    </div>
  );
}