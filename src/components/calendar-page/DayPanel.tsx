import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { itemsForDay, carriedOverShift } from "@/lib/calendarAgenda";
import type { MockEvent } from "./constants";
import { EventDot, ShiftBadge, durationLabel, isShift, itemName, overnightSuffix, timeLabel } from "./agendaShared";

interface Props {
  day: Date;
  events: MockEvent[];
  onEventClick: (e: MockEvent) => void;
  onAddShift: (d: Date) => void;
  onAddEvent: (d: Date) => void;
  onClose: () => void;
}

/** Inline panel shown under a tapped day: its items + add buttons. */
export function DayPanel({ day, events, onEventClick, onAddShift, onAddEvent, onClose }: Props) {
  const items = itemsForDay(events, day);
  const carried = carriedOverShift(events, day);
  return (
    <div className="min-w-0 rounded-lg border border-primary/40 bg-card p-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-150">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold">{format(day, "EEEE d MMMM")}</span>
        <button type="button" onClick={onClose} aria-label="Close day" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <X className="size-3.5" />
        </button>
      </div>
      {carried && (
        <p className="mb-1 truncate px-1 text-[11px] text-muted-foreground">
          Continuing: {itemName(carried)} until {format(carried.end, "HH:mm")}
        </p>
      )}
      {items.length === 0 ? (
        <p className="px-1 py-1 text-xs text-muted-foreground">Nothing planned yet.</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => onEventClick(e)}
                className="flex w-full min-w-0 items-center gap-2 rounded-md px-1 py-1.5 text-left text-xs hover:bg-muted"
              >
                <span className="w-10 shrink-0 tabular-nums text-muted-foreground">{timeLabel(e)}</span>
                {isShift(e) ? <ShiftBadge event={e} /> : <EventDot event={e} className="mx-2.5" />}
                <span className="min-w-0 flex-1 truncate font-medium">
                  {itemName(e)}
                  {e.source === "google" && <span className="text-muted-foreground"> · Google</span>}
                  {overnightSuffix(e) && <span className="ml-1 font-normal text-muted-foreground">{overnightSuffix(e)}</span>}
                </span>
                {durationLabel(e) && <span className="shrink-0 text-muted-foreground">{durationLabel(e)}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1.5 flex gap-2">
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1 text-xs" onClick={() => onAddShift(day)}>
          <Plus className="size-3.5" /> Add shift
        </Button>
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1 text-xs" onClick={() => onAddEvent(day)}>
          <Plus className="size-3.5" /> Add event
        </Button>
      </div>
    </div>
  );
}
