import { Fragment } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, format, addDays,
} from "date-fns";
import { type MockEvent } from "./constants";
import { itemsForDay, periodTotals } from "@/lib/calendarAgenda";
import { cn } from "@/lib/utils";
import { DayPanel } from "./DayPanel";
import { EventDot, PeriodFooter, ShiftBadge, isShift, type Earnings } from "./agendaShared";

interface Props {
  cursor: Date;
  selected: Date;
  events: MockEvent[];
  openDay: Date | null;
  earnings: Earnings;
  onSelect: (d: Date) => void;
  onEventClick: (e: MockEvent) => void;
  onAddShift: (d: Date) => void;
  onAddEvent: (d: Date) => void;
  onClosePanel: () => void;
}

const MAX_BADGES = 3;
const MAX_DOTS = 3;

export function MonthView({ cursor, selected, events, openDay, earnings, onSelect, onEventClick, onAddShift, onAddEvent, onClosePanel }: Props) {
  const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const headers = Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "EEE"));
  const totals = periodTotals(events, startOfMonth(cursor), endOfMonth(cursor), earnings.rate);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col animate-in fade-in duration-200">
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overflow-x-hidden p-1 sm:p-2">
        <div className="grid shrink-0 grid-cols-7 gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {headers.map((d) => <div key={d} className="px-1 py-0.5">{d}</div>)}
        </div>
        {weeks.map((week) => {
          const panelDay = openDay && week.find((d) => isSameDay(d, openDay));
          return (
            <Fragment key={week[0].toISOString()}>
              <div className="grid min-h-[64px] flex-1 grid-cols-7 gap-0.5">
                {week.map((day) => {
                  const items = itemsForDay(events, day);
                  const shifts = items.filter(isShift);
                  const others = items.filter((e) => !isShift(e));
                  const isSel = isSameDay(day, selected) && !!openDay;
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => onSelect(day)}
                      aria-label={`${format(day, "EEEE d MMMM")}, ${shifts.length} shifts, ${others.length} events`}
                      className={cn(
                        "flex min-h-0 min-w-0 flex-col gap-0.5 overflow-hidden rounded-md border border-border/60 bg-card/40 p-1 text-left transition-colors hover:border-primary/60 hover:bg-card/80",
                        !isSameMonth(day, cursor) && "opacity-40",
                        isSel && "border-primary ring-2 ring-primary/30 bg-card",
                      )}
                    >
                      <span className={cn("flex size-5 items-center justify-center rounded-full text-[11px] font-semibold", isToday(day) && "bg-primary text-primary-foreground")}>
                        {format(day, "d")}
                      </span>
                      <span className="flex min-w-0 flex-wrap gap-0.5">
                        {shifts.slice(0, MAX_BADGES).map((s) => <ShiftBadge key={s.id} event={s} size="sm" />)}
                        {shifts.length > MAX_BADGES && <span className="text-[9px] font-medium text-muted-foreground">+{shifts.length - MAX_BADGES}</span>}
                      </span>
                      {others.length > 0 && (
                        <span className="mt-auto flex items-center gap-0.5">
                          {others.slice(0, MAX_DOTS).map((e) => <EventDot key={e.id} event={e} className="size-1.5" />)}
                          {others.length > MAX_DOTS && <span className="text-[8px] text-muted-foreground">+{others.length - MAX_DOTS}</span>}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {panelDay && (
                <DayPanel day={panelDay} events={events} onEventClick={onEventClick} onAddShift={onAddShift} onAddEvent={onAddEvent} onClose={onClosePanel} />
              )}
            </Fragment>
          );
        })}
      </div>
      <PeriodFooter label={format(cursor, "MMMM")} hours={totals.hours} earnings={totals.earnings} currency={earnings.currency} />
    </div>
  );
}
