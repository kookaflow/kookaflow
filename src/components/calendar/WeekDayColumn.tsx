import { cn } from "@/lib/utils";
import { isSameDay, isToday, format, startOfDay, setHours } from "date-fns";
import { EventBlock } from "./EventBlock";
import type { CalendarEvent } from "@/types/event";

interface Props {
  day: Date;
  events: CalendarEvent[];
  hourHeight: number;
  selected: boolean;
  onSelect: (d: Date) => void;
  onCreate: (d: Date) => void;
  onEditEvent: (id: string) => void;
  showHeader?: boolean;
}

export function WeekDayColumn({ day, events, hourHeight, selected, onSelect, onCreate, onEditEvent, showHeader = true }: Props) {
  const today = isToday(day);

  const handleSlotClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.max(0, Math.min(23, Math.floor(y / hourHeight)));
    onCreate(setHours(startOfDay(day), hour));
  };

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col border-r border-border", selected && "bg-accent/20")}>
      {showHeader && (
        <button
          type="button"
          onClick={() => onSelect(day)}
          className={cn(
            "flex flex-col items-center gap-0.5 border-b border-border py-2 text-xs transition hover:bg-accent/40",
            today && "text-primary",
          )}
        >
          <span className="uppercase text-muted-foreground">{format(day, "EEE")}</span>
          <span className={cn("flex size-7 items-center justify-center rounded-full font-semibold", today && "bg-primary text-primary-foreground")}>
            {format(day, "d")}
          </span>
        </button>
      )}
      <div
        className="relative flex-1"
        style={{ height: hourHeight * 24 }}
        onClick={handleSlotClick}
      >
        {Array.from({ length: 24 }).map((_, h) => (
          <div key={h} style={{ height: hourHeight }} className="border-b border-border/40" />
        ))}
        {events.map((e) => (
          <EventBlock
            key={e.id}
            event={e}
            day={day}
            hourHeight={hourHeight}
            onClick={() => onEditEvent(e.id)}
          />
        ))}
      </div>
    </div>
  );
}