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
import { ICON_MAP } from "@/components/events/IconPicker";
import { cn } from "@/lib/utils";
import { useStamp } from "@/providers/StampProvider";

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
  const { selected: stamp } = useStamp();
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const headers = Array.from({ length: 7 }, (_, i) =>
    format(addDays(start, i), "EEE"),
  );

  return (
    <div className="flex h-full flex-col gap-1 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-7 gap-1 px-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {headers.map((d) => (
          <div key={d} className="px-1 py-0.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          const shift = dayEvents.find((e) => e.shiftType);
          const shiftStyle = shift ? SHIFT_STYLES[shift.shiftType!] : null;
          const isSel = isSameDay(day, selected);
          const today = isToday(day);
          const iconEvents = dayEvents
            .filter((e) => e.iconName && (!shift || e.id !== shift.id))
            .slice(0, 3);
          const dots = dayEvents.slice(0, 5);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelect(day)}
              onDoubleClick={() => onCreate?.(day)}
              className={cn(
                "group relative flex min-h-[44px] flex-col gap-1 rounded-lg border border-border/60 bg-card/40 p-1 text-left transition-all duration-200 overflow-hidden",
                "hover:border-primary/60 hover:bg-card/80 hover:shadow-sm hover:-translate-y-0.5",
                !inMonth && "opacity-40",
                isSel && "border-primary ring-2 ring-primary/30 bg-card",
                stamp && "cursor-copy border-dashed border-primary/50 hover:border-primary",
              )}
            >
              <div className="flex items-start justify-between gap-1 leading-none">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold sm:size-6 sm:text-xs",
                    today
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              {shiftStyle && (
                <span
                  className="flex h-4 w-full items-center justify-center gap-0.5 truncate rounded px-1 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm sm:text-[10px]"
                  style={{ backgroundColor: shiftStyle.color }}
                  title={`${shiftStyle.label} shift`}
                >
                  <shiftStyle.icon className="size-2.5" />
                  <span className="truncate">{shiftStyle.label}</span>
                </span>
              )}
              {iconEvents.length > 0 && (
                <div className="flex flex-wrap items-center gap-0.5">
                  {iconEvents.map((e) => {
                    const Icon = ICON_MAP[e.iconName as string];
                    if (!Icon) return null;
                    return (
                      <span
                        key={e.id}
                        className="text-foreground/80"
                        title={e.title}
                      >
                        <Icon className="size-2.5" />
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-0.5">
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