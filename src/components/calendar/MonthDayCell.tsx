import { cn } from "@/lib/utils";
import { format, isSameMonth, isSameDay, isToday } from "date-fns";
import { EventChip } from "./EventChip";
import type { CalendarEvent } from "@/types/event";

interface Props {
  day: Date;
  monthCursor: Date;
  selected: boolean;
  events: CalendarEvent[];
  onSelect: (d: Date) => void;
  onCreate: (d: Date) => void;
  onEditEvent: (id: string) => void;
}

export function MonthDayCell({ day, monthCursor, selected, events, onSelect, onCreate, onEditEvent }: Props) {
  const inMonth = isSameMonth(day, monthCursor);
  const today = isToday(day);
  const shown = events.slice(0, 3);
  const more = events.length - shown.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      onDoubleClick={() => onCreate(day)}
      className={cn(
        "group flex min-h-[96px] flex-col gap-1 rounded-md border border-border/50 p-1.5 text-left transition hover:border-primary/60 hover:bg-accent/30",
        !inMonth && "opacity-40",
        selected && "border-primary bg-accent/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-medium",
            today && "bg-primary text-primary-foreground",
          )}
        >
          {format(day, "d")}
        </span>
        {events.length > 0 && (
          <span className="text-[10px] text-muted-foreground">{events.length}</span>
        )}
      </div>
      <div className="flex flex-col gap-0.5">
        {shown.map((e) => (
          <EventChip
            key={e.id}
            event={e}
            onClick={() => onEditEvent(e.id)}
            showTime={false}
          />
        ))}
        {more > 0 && (
          <span className="text-[10px] text-muted-foreground">+{more} more</span>
        )}
      </div>
    </button>
  );
}