import { cn } from "@/lib/utils";
import { getCategory } from "@/lib/categories";
import { getEventIcon } from "@/lib/event-icon";
import type { CalendarEvent } from "@/types/event";
import { format } from "date-fns";

interface Props {
  event: CalendarEvent;
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  className?: string;
}

export function EventChip({ event, onClick, showTime = true, className }: Props) {
  const c = getCategory(event.category);
  const { Icon } = getEventIcon(event);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] font-medium transition-opacity hover:opacity-90",
        c.bgClass,
        c.fgClass,
        className,
      )}
      title={event.title}
    >
      <Icon className="size-3 shrink-0 opacity-90" strokeWidth={2.5} />
      {showTime && !event.allDay && (
        <span className="shrink-0 opacity-80">{format(new Date(event.start), "HH:mm")}</span>
      )}
      <span className="truncate">{event.title}</span>
    </button>
  );
}