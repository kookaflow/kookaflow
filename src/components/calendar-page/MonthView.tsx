import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addDays,
} from "date-fns";
import { CATEGORY_MAP, SHIFT_STYLES, type MockEvent } from "./constants";
import { cn } from "@/lib/utils";

interface Props {
  cursor: Date;
  selected: Date;
  events: MockEvent[];
  onSelect: (d: Date) => void;
  onCreate?: (d: Date) => void;
  onEventClick?: (e: MockEvent) => void;
}

export function MonthView({
  cursor,
  selected,
  events,
  onSelect,
  onCreate,
  onEventClick,
}: Props) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const headers = Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), "EEE"),
  );

  return (
    <div className="flex h-full flex-col gap-2 p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="grid grid-cols-7 gap-1 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {headers.map((d) => (
          <div key={d} className="px-1.5 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 grid-rows-6 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          const shift = dayEvents.find((e) => e.shiftType);
          const shiftStyle = shift ? SHIFT_STYLES[shift.shiftType!] : null;
          const isSel = isSameDay(day, selected);
          const today = isToday(day);
          const dots = dayEvents.slice(0, 5);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              onDoubleClick={() => onCreate?.(day)}
              className={cn(
                "group relative flex min-h-[80px] flex-col gap-2 rounded-xl border border-border/60 bg-card/40 p-2 text-left transition-all duration-200",
                "hover:border-primary/60 hover:bg-card/80 hover:shadow-sm hover:-translate-y-0.5",
                !inMonth && "opacity-40",
                isSel && "border-primary ring-2 ring-primary/30 bg-card",
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                    today
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
                {shiftStyle && (
                  <span
                    className="flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
                    style={{ backgroundColor: shiftStyle.color }}
                    title={`${shiftStyle.label} shift`}
                  >
                    <shiftStyle.icon className="size-3.5" />
                    <span className="hidden sm:inline">{shiftStyle.label}</span>
                  </span>
                )}
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-1">
                {dots.map((e) => (
                  <span
                    key={e.id}
                    role={onEventClick ? "button" : undefined}
                    onClick={(ev) => {
                      if (!onEventClick) return;
                      ev.stopPropagation();
                      onEventClick(e);
                    }}
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_MAP[e.category].color }}
                    title={e.title}
                  />
                ))}
                {dayEvents.length > 5 && (
                  <span className="text-[10px] text-muted-foreground">
                    +{dayEvents.length - 5}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}