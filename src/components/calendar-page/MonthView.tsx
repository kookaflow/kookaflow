import { useRef } from "react";
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
import { type MockEvent } from "./constants";
import { ICON_MAP } from "@/components/events/IconPicker";
import { getCategoryConfig, getShiftConfig, ensureReadableBadgeColour } from "@/lib/shiftConfig";
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
    <div className="flex h-full min-h-0 flex-col gap-1 overflow-hidden p-1 sm:p-2 animate-in fade-in duration-200">
      <div className="grid shrink-0 grid-cols-7 gap-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground" style={{ height: 24 }}>
        {headers.map((d) => (
          <div key={d} className="px-1 py-0.5">
            {d}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-0.5 overflow-hidden">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          // All shift-like events (system shifts + custom work-category
          // templates with an iconColor) become stacked badges.
          const shifts = dayEvents.filter(
            (e) =>
              e.shiftType ||
              (e.category === "work" && !!e.iconColor && e.source !== "google"),
          );
          const shiftIds = new Set(shifts.map((s) => s.id));
          const isSel = isSameDay(day, selected);
          const today = isToday(day);
          const googleEvents = dayEvents.filter((e) => e.source === "google");
          const otherEvents = dayEvents.filter(
            (e) => e.source !== "google" && !shiftIds.has(e.id),
          );
          const MAX_SHIFTS = 2;
          const shiftsToShow = shifts.slice(0, MAX_SHIFTS);
          const extraShifts = shifts.length - shiftsToShow.length;
          const MAX_OTHERS = 3;
          const othersToShow = otherEvents.slice(0, MAX_OTHERS);
          const extraOthers = otherEvents.length - othersToShow.length;

          return (
            <DayCell
              key={day.toISOString()}
              day={day}
              inMonth={inMonth}
              isSel={isSel}
              onSelect={onSelect}
              onCreate={onCreate}
            >
              <div className="flex items-start justify-between gap-1">
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold",
                    today
                      ? "bg-[#F59E0B] text-white"
                      : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              {shiftsToShow.map((shift) => {
                const shiftStyle = shift.shiftType ? getShiftConfig(shift.shiftType) : null;
                const CustomIcon =
                  !shiftStyle && shift.iconName ? ICON_MAP[shift.iconName] : null;
                const label = shiftStyle ? shiftStyle.label : shift.title;
                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick?.(shift);
                    }}
                    aria-label={`Edit ${shift.title}`}
                    className="flex w-full items-center justify-center gap-0.5 truncate rounded-sm px-1 py-0.5 text-[10px] sm:text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm min-h-[16px]"
                    style={{ backgroundColor: shiftStyle?.colour ?? shift.iconColor }}
                    title={`${label}${shiftStyle ? " shift" : ""}`}
                  >
                    {shiftStyle ? (
                      <shiftStyle.Icon className="size-3 sm:size-2.5" />
                    ) : CustomIcon ? (
                      <CustomIcon className="size-3 sm:size-2.5" />
                    ) : null}
                    <span className="truncate">{label.slice(0, 10)}</span>
                  </button>
                );
              })}
              {extraShifts > 0 && (
                <span className="text-[9px] font-medium text-muted-foreground">
                  +{extraShifts} more
                </span>
              )}
              {othersToShow.map((e) => {
                const cat = getCategoryConfig(e.category);
                const CustomIcon = e.iconName ? ICON_MAP[e.iconName] : null;
                const Icon = CustomIcon ?? cat.Icon;
                const bg = ensureReadableBadgeColour(e.iconColor, cat.colour);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick?.(e);
                    }}
                    aria-label={`Edit ${e.title}`}
                    className="flex w-full items-center gap-0.5 truncate rounded-sm px-1 py-0.5 text-[10px] sm:text-[9px] font-medium text-white shadow-sm min-h-[16px]"
                    style={{ backgroundColor: bg }}
                    title={e.title}
                  >
                    {Icon && <Icon className="size-3 sm:size-2.5 shrink-0" />}
                    <span className="truncate">{e.title}</span>
                  </button>
                );
              })}
              {extraOthers > 0 && (
                <span className="text-[9px] font-medium text-muted-foreground">
                  +{extraOthers} more
                </span>
              )}
              {googleEvents.slice(0, 2).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onEventClick?.(e);
                  }}
                  className="flex w-full items-center gap-1 truncate rounded-sm px-1 py-px text-[9px] font-medium text-white hover:brightness-110"
                  style={{ backgroundColor: "#94A3B8" }}
                  title={`${e.title} (Google Calendar)`}
                >
                  <svg viewBox="0 0 24 24" className="size-2.5 shrink-0" fill="currentColor" aria-hidden="true">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V8h14v13z" />
                  </svg>
                  <span className="truncate">{e.title}</span>
                </button>
              ))}
              {googleEvents.length > 2 && (
                <span className="text-[9px] text-muted-foreground/70">
                  +{googleEvents.length - 2} Google
                </span>
              )}
            </DayCell>
          );
        })}
      </div>
    </div>
  );
}

function DayCell({
  day,
  inMonth,
  isSel,
  onSelect,
  onCreate,
  children,
}: {
  day: Date;
  inMonth: boolean;
  isSel: boolean;
  onSelect: (d: Date) => void;
  onCreate?: (d: Date) => void;
  children: React.ReactNode;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <button
      type="button"
      onPointerDown={() => {
        heldRef.current = false;
        clearTimer();
        timerRef.current = setTimeout(() => {
          heldRef.current = true;
          onCreate?.(day);
        }, 500);
      }}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
      onClick={() => {
        if (heldRef.current) {
          heldRef.current = false;
          return;
        }
        onSelect(day);
      }}
      onDoubleClick={() => onCreate?.(day)}
      className={cn(
        "group relative flex min-h-0 flex-col gap-0.5 overflow-hidden rounded-md border border-border/60 bg-card/40 p-0.5 text-left transition-all duration-200",
        "hover:border-primary/60 hover:bg-card/80 hover:shadow-sm",
        !inMonth && "opacity-40",
        isSel && "border-primary ring-2 ring-primary/30 bg-card",
      )}
    >
      {children}
    </button>
  );
}