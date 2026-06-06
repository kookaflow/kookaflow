import { format, isSameDay, isToday, startOfDay, differenceInMinutes } from "date-fns";
import { useEffect, useRef } from "react";
import { type MockEvent } from "./constants";
import { getCategoryConfig, getShiftConfig } from "@/lib/shiftConfig";
import { ICON_MAP } from "@/components/events/IconPicker";
import { cn } from "@/lib/utils";

const HOUR_HEIGHT = 56;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  days: Date[];
  events: MockEvent[];
  onEventClick?: (e: MockEvent) => void;
  selected: Date;
  onSelectDay?: (d: Date) => void;
  onCreate?: (d: Date) => void;
}

export function TimeGrid({
  days,
  events,
  onEventClick,
  selected,
  onSelectDay,
  onCreate,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 6 * HOUR_HEIGHT;
    }
  }, []);

  const now = new Date();
  const nowOffset = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;

  return (
    <div className="flex h-full flex-col animate-in fade-in duration-200">
      {/* header */}
      <div
        className="grid border-b border-border bg-background/80 backdrop-blur"
        style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}
      >
        <div />
        {days.map((d) => {
          const today = isToday(d);
          const sel = isSameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelectDay?.(d)}
              className={cn(
                "flex flex-col items-center gap-0.5 border-l border-border py-2 text-xs transition-colors hover:bg-accent/50",
                sel && "bg-accent/30",
              )}
            >
              <span className="uppercase tracking-wider text-muted-foreground">
                {format(d, "EEE")}
              </span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                  today && "bg-primary text-primary-foreground",
                )}
              >
                {format(d, "d")}
              </span>
            </button>
          );
        })}
      </div>

      {/* body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `56px repeat(${days.length}, 1fr)`,
            height: HOUR_HEIGHT * 24,
          }}
        >
          {/* gutter */}
          <div className="relative border-r border-border">
            {HOURS.map((h) => (
              <div
                key={h}
                className="relative text-[10px] text-muted-foreground"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-1.5 right-1.5">
                  {h === 0 ? "" : format(new Date(0, 0, 0, h), "h a")}
                </span>
              </div>
            ))}
          </div>

          {/* day columns */}
          {days.map((day) => {
            const dayStart = startOfDay(day);
            const dayEvents = events.filter((e) =>
              isSameDay(e.start, day) ||
              (e.start < dayStart && e.end > dayStart),
            );
            return (
              <div
                key={day.toISOString()}
                className="relative border-l border-border"
              >
                {HOURS.map((h) => (
                  <div
                    key={h}
                    onClick={() => {
                      if (!onCreate) return;
                      const d = new Date(day);
                      d.setHours(h, 0, 0, 0);
                      onCreate(d);
                    }}
                    className="border-t border-border/40"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}
                {/* now indicator */}
                {isToday(day) && (
                  <div
                    className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
                    style={{ top: nowOffset }}
                  >
                    <span className="size-2 -ml-1 rounded-full bg-destructive" />
                    <span className="h-px flex-1 bg-destructive" />
                  </div>
                )}
                {dayEvents.map((e) => {
                  const startMin = Math.max(
                    0,
                    differenceInMinutes(e.start, dayStart),
                  );
                  const endMin = Math.min(
                    24 * 60,
                    differenceInMinutes(e.end, dayStart),
                  );
                  const top = (startMin / 60) * HOUR_HEIGHT;
                  const height = Math.max(
                    20,
                    ((endMin - startMin) / 60) * HOUR_HEIGHT - 2,
                  );
                  const isGoogle = e.source === "google";
                  const cat = getCategoryConfig(e.category);
                  const sc = getShiftConfig(e.shiftType);
                  // Resolve icon + colour: prefer system shift, then the
                  // event's own iconName/iconColor (custom shifts), then
                  // category — but suppress the work-category briefcase on
                  // shift-shaped events where no specific icon exists.
                  const customIcon = e.iconName ? ICON_MAP[e.iconName] : null;
                  const Icon =
                    sc?.Icon ??
                    customIcon ??
                    (e.category === "work" && (e.shiftType || e.iconColor)
                      ? null
                      : cat.Icon);
                  const bg = isGoogle
                    ? "#94A3B8"
                    : (sc?.colour ?? ensureReadableBadgeColour(e.iconColor, cat.colour));
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => onEventClick?.(e)}
                      className="absolute left-1 right-1 flex flex-col gap-0.5 overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-left text-[11px] text-white shadow-sm transition-all hover:brightness-110 hover:shadow-md"
                      style={{
                        top,
                        height,
                        backgroundColor: bg,
                        borderLeftColor: "rgba(0,0,0,0.25)",
                      }}
                      title={isGoogle ? `${e.title} (Google Calendar)` : e.title}
                    >
                      <span className="flex items-center gap-1 font-semibold leading-tight">
                        {isGoogle ? (
                          <svg viewBox="0 0 24 24" className={cn("shrink-0", days.length === 1 ? "size-[18px]" : "size-4")} fill="currentColor" aria-hidden="true">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 18H5V8h14v13z" />
                          </svg>
                        ) : Icon ? (
                          <Icon className={cn("shrink-0", days.length === 1 ? "size-[18px]" : "size-4")} />
                        ) : null}
                        <span className="truncate">{e.title}</span>
                      </span>
                      {height > 32 && (
                        <span className="text-[10px] opacity-90">
                          {format(e.start, "h:mm a")} – {format(e.end, "h:mm a")}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}