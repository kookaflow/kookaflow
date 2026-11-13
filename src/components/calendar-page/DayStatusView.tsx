import { addDays, format, isToday, startOfDay } from "date-fns";
import { BedDouble, Briefcase, Moon, Plus, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { carriedOverShift, dayStatus, itemsForDay, nextShift, suggestedRest, workedSegments } from "@/lib/calendarAgenda";
import type { MockEvent } from "./constants";
import { EventDot, ShiftBadge, durationLabel, isShift, itemColour, itemName, overnightSuffix, payFor, timeLabel, type Earnings } from "./agendaShared";

interface Props {
  day: Date;
  events: MockEvent[];
  earnings: Earnings;
  onEventClick: (e: MockEvent) => void;
  onAddShift: (d: Date) => void;
  onAddEvent: (d: Date) => void;
  onAddRest: (start: Date) => void;
}

const STATUS = {
  working_night: { label: "Working night", Icon: Moon },
  working: { label: "Working", Icon: Briefcase },
  recovering: { label: "Recovering after a night shift", Icon: Sunrise },
  day_off: { label: "Day off", Icon: BedDouble },
} as const;

const pct = (m: number) => `${(m / 1440) * 100}%`;

export function DayStatusView({ day, events, earnings, onEventClick, onAddShift, onAddEvent, onAddRest }: Props) {
  const status = dayStatus(events, day);
  const S = STATUS[status];
  const segs = workedSegments(events, day);
  const rest = suggestedRest(events, day);
  const items = itemsForDay(events, day);
  const carried = carriedOverShift(events, day);
  const coming = nextShift(events, addDays(startOfDay(day), 1));
  const d0 = startOfDay(day).getTime();
  const restFrom = rest ? Math.max(0, (rest.start.getTime() - d0) / 60_000) : 0;
  const restTo = rest ? Math.min(1440, (rest.end.getTime() - d0) / 60_000) : 0;

  return (
    <div className="h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden px-3 py-3 sm:px-5">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary"><S.Icon className="size-4" /></span>
          <div className="min-w-0">
            <p className="text-base font-semibold">{S.label}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isToday(day) && <span className="flex size-5 items-center justify-center rounded-full bg-today text-[11px] font-semibold text-today-foreground">{format(day, "d")}</span>}
              {isToday(day) && <span className="font-semibold text-today">Today ·</span>}
              {format(day, "EEEE d MMMM")}
            </p>
          </div>
        </div>

        <div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label="24-hour overview">
            {rest && (
              <div className="absolute inset-y-0 bg-primary/25"
                style={{ left: pct(restFrom), width: pct(restTo - restFrom) }} />
            )}
            {segs.map((s) => (
              <div key={s.id} className="absolute inset-y-0" style={{ left: pct(s.from), width: pct(s.to - s.from), backgroundColor: itemColour(s.colourOf as MockEvent), opacity: s.fromYesterday ? 0.55 : 1 }} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted-foreground">
            <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {segs.some((s) => s.fromYesterday) && <span>Faded: from yesterday</span>}
            {rest && (
              <span>
                Suggested {rest.kind === "recovery" ? "rest" : "nap"}: {format(rest.start, "HH:mm")}–{format(rest.end, "HH:mm")}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onAddShift(day)}><Plus className="size-3.5" /> Add shift</Button>
          <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => onAddEvent(day)}><Plus className="size-3.5" /> Add event</Button>
        </div>

        <ul className="flex flex-col gap-1.5">
          {carried && (
            <li className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
              Continuing: {itemName(carried)} until {format(carried.end, "HH:mm")}
            </li>
          )}
          {items.length === 0 && !carried && <li className="text-sm text-muted-foreground">Nothing planned today.</li>}
          {items.map((e) => {
            const pay = payFor(e, earnings);
            return (
              <li key={e.id}>
                <button type="button" onClick={() => onEventClick(e)} className="flex w-full min-w-0 items-start gap-3 rounded-lg border border-border bg-card px-3 py-2 text-left hover:bg-muted/60">
                  {isShift(e) ? <ShiftBadge event={e} /> : <EventDot event={e} className="mx-2.5 mt-2" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{itemName(e)}{e.source === "google" && <span className="text-muted-foreground"> · Google</span>}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeLabel(e)}{e.end && timeLabel(e) !== "All day" && !overnightSuffix(e) ? `–${format(e.end, "HH:mm")}` : ""}
                      {overnightSuffix(e) && ` ${overnightSuffix(e)}`}
                      {durationLabel(e) && ` · ${durationLabel(e)}`}
                      {pay && ` · est. ${pay}`}
                    </p>
                    {e.notes && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{e.notes}</p>}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        {status === "recovering" && (
          <Button variant="secondary" className="gap-1.5" onClick={() => onAddRest(rest?.start ?? new Date(carried!.end.getTime() + 3_600_000))}>
            <BedDouble className="size-4" /> Add rest time
          </Button>
        )}

        {coming && (
          <p className="text-sm text-muted-foreground">
            Coming up: <span className="font-medium text-foreground">{itemName(coming)}</span> · {format(coming.start, "EEE HH:mm")}
          </p>
        )}
      </div>
    </div>
  );
}
