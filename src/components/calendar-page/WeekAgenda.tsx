import { format, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { carriedOverShift, itemsForDay, periodTotals } from "@/lib/calendarAgenda";
import type { MockEvent } from "./constants";
import { DayPanel } from "./DayPanel";
import { EventDot, PeriodFooter, ShiftBadge, durationLabel, isShift, itemName, overnightSuffix, timeLabel, type Earnings } from "./agendaShared";

interface Props {
  days: Date[];
  events: MockEvent[];
  openDay: Date | null;
  earnings: Earnings;
  onDayTap: (d: Date) => void;
  onEventClick: (e: MockEvent) => void;
  onAddShift: (d: Date) => void;
  onAddEvent: (d: Date) => void;
  onClosePanel: () => void;
}

export function WeekAgenda({ days, events, openDay, earnings, onDayTap, onEventClick, onAddShift, onAddEvent, onClosePanel }: Props) {
  const totals = periodTotals(events, days[0], days[days.length - 1], earnings.rate);
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 sm:px-4">
        <ul className="flex flex-col gap-1">
          {days.map((day) => {
            const items = itemsForDay(events, day);
            const carried = carriedOverShift(events, day);
            const today = isToday(day);
            const open = !!openDay && isSameDay(openDay, day);
            return (
              <li key={day.toISOString()} className="min-w-0">
                <button
                  type="button"
                  onClick={() => onDayTap(day)}
                  aria-expanded={open}
                  className={cn(
                    "flex w-full min-w-0 gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:bg-muted/60",
                    today && "border-2 border-today bg-today-soft",
                    open && "border-primary",
                  )}
                >
                  <div className="w-10 shrink-0 text-center">
                    <div className={cn("text-[10px] font-semibold uppercase", today ? "text-today" : "text-muted-foreground")}>{format(day, "EEE")}</div>
                    <div className={cn("mx-auto flex size-8 items-center justify-center rounded-full text-lg font-bold leading-tight", today && "bg-today text-today-foreground")}>{format(day, "d")}</div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                    {carried && (
                      <span className="truncate text-xs text-muted-foreground">Off from {format(carried.end, "HH:mm")} · recovery day</span>
                    )}
                    {items.length === 0 && !carried && <span className="text-xs text-muted-foreground">Free</span>}
                    {items.map((e) => (
                      <span key={e.id} className="flex min-w-0 items-center gap-2 text-sm">
                        <span className="w-11 shrink-0 tabular-nums text-xs text-muted-foreground">{timeLabel(e)}</span>
                        {isShift(e) ? <ShiftBadge event={e} /> : <EventDot event={e} className="mx-2.5" />}
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium">{itemName(e)}</span>
                          {overnightSuffix(e) && <span className="ml-1 text-xs text-muted-foreground">{overnightSuffix(e)}</span>}
                        </span>
                        {durationLabel(e) && <span className="shrink-0 text-xs text-muted-foreground">{durationLabel(e)}</span>}
                      </span>
                    ))}
                  </div>
                </button>
                {open && (
                  <div className="px-1 pb-1 pt-1">
                    <DayPanel day={day} events={events} onEventClick={onEventClick} onAddShift={onAddShift} onAddEvent={onAddEvent} onClose={onClosePanel} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <PeriodFooter label="This week" hours={totals.hours} earnings={totals.earnings} currency={earnings.currency} />
    </div>
  );
}
