import { getEventColour, getEventIconComponent } from "@/lib/shiftConfig";
import type { CalendarEvent } from "@/types/event";
import { format, differenceInMinutes, startOfDay } from "date-fns";

interface Props {
  event: CalendarEvent;
  day: Date;
  hourHeight: number;
  onClick?: () => void;
}

export function EventBlock({ event, day, hourHeight, onClick }: Props) {
  const bg = getEventColour(event);
  const Icon = getEventIconComponent(event);
  const dayStart = startOfDay(day);
  const es = new Date(event.start);
  const ee = new Date(event.end);
  const startMin = Math.max(0, differenceInMinutes(es, dayStart));
  const endMin = Math.min(24 * 60, differenceInMinutes(ee, dayStart));
  const top = (startMin / 60) * hourHeight;
  const height = Math.max(20, ((endMin - startMin) / 60) * hourHeight);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      style={{ top, height, backgroundColor: bg, color: "#fff" }}
      className="absolute left-1 right-1 flex flex-col items-start gap-0.5 overflow-hidden rounded-md px-2 py-1 text-left text-xs shadow-sm transition hover:scale-[1.01]"
    >
      <span className="flex items-center gap-1 font-semibold">
        <Icon className="size-3" />
        <span className="truncate">{event.title}</span>
      </span>
      <span className="text-[10px] opacity-80">
        {format(es, "HH:mm")} – {format(ee, "HH:mm")}
      </span>
    </button>
  );
}