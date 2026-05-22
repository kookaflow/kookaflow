import { format } from "date-fns";
import { getCategoryConfig } from "@/lib/shiftConfig";
import type { CalendarEvent } from "@/types/event";

interface Props {
  events: CalendarEvent[];
  onSelect: (id: string) => void;
}

export function TodayEventsList({ events, onSelect }: Props) {
  if (events.length === 0) {
    return <p className="text-xs text-muted-foreground">Nothing planned. Add an event to get started.</p>;
  }
  return (
    <ul className="flex flex-col gap-1.5">
      {events.map((e) => {
        const c = getCategoryConfig(e.category);
        const Icon = c.Icon;
        return (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => onSelect(e.id)}
              className="flex w-full items-center gap-2 rounded-md border border-border/60 bg-card p-2 text-left transition hover:border-primary/60 hover:bg-accent/30"
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-white"
                style={{ backgroundColor: c.colour }}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{e.title}</span>
                <span className="block text-[10px] text-muted-foreground">
                  {e.allDay ? "All day" : `${format(new Date(e.start), "HH:mm")} – ${format(new Date(e.end), "HH:mm")}`}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}