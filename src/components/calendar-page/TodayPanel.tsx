import { useMemo } from "react";
import {
  format,
  isSameDay,
  differenceInMinutes,
  startOfDay,
  endOfDay,
} from "date-fns";
import { type MockEvent } from "./constants";
import type { ShiftType } from "@/types/event";
import { CATEGORY_LIST, getCategoryConfig, getShiftConfig } from "@/lib/shiftConfig";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Lightbulb } from "lucide-react";

interface Props {
  date: Date;
  events: MockEvent[];
  onEventClick?: (e: MockEvent) => void;
}

function greetingFor(d: Date) {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function nudgeFor(opts: {
  shift: ShiftType | null;
  totalHours: number;
  workHours: number;
  restHours: number;
  isEmpty: boolean;
}): string {
  const { shift, totalHours, workHours, restHours, isEmpty } = opts;
  if (shift === "night")
    return "Night shifts can disrupt your circadian rhythm — try to keep a consistent sleep window on your days off 🌙";
  if (shift === "morning")
    return "Early start ahead — a calm wind-down tonight protects tomorrow's energy ☀️";
  if (shift === "afternoon")
    return "Afternoon shift — fit in some light movement or sunlight before you clock in 🚶";
  if (shift === "oncall")
    return "On-call today — small recovery moments matter. Hydrate and breathe between calls 📞";
  if (isEmpty)
    return "A clear day. Rest is productive — protect it ❤️";
  if (workHours >= 9)
    return "A long work day. Block 10 minutes for yourself — it adds up 🌿";
  if (restHours < 7 && totalHours > 0)
    return "Aim for 7–9 hours of sleep tonight — Walker's research shows it sharpens mood and focus 😴";
  return "Small balanced choices compound. You've got this 🌟";
}

export function TodayPanel({ date, events, onEventClick }: Props) {
  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => isSameDay(e.start, date))
        .sort((a, b) => +a.start - +b.start),
    [events, date],
  );

  const chartData = useMemo(() => {
    const start = startOfDay(date);
    const end = endOfDay(date);
    const totals: Record<string, number> = {};
    for (const e of dayEvents) {
      const s = e.start > start ? e.start : start;
      const en = e.end < end ? e.end : end;
      const mins = differenceInMinutes(en, s);
      if (mins <= 0) continue;
      totals[e.category] = (totals[e.category] || 0) + mins / 60;
    }
    return CATEGORY_LIST.map((c) => ({
      id: c.id,
      name: c.label,
      value: +(totals[c.id] || 0).toFixed(1),
      color: c.colour,
    })).filter((d) => d.value > 0);
  }, [dayEvents, date]);

  const totalHours = chartData.reduce((a, b) => a + b.value, 0);
  const workHours = chartData.find((d) => d.id === "work")?.value ?? 0;
  const restHours = chartData.find((d) => d.id === "rest")?.value ?? 0;

  const shiftEvent = dayEvents.find((e) => e.shiftType);
  const shiftStyle = getShiftConfig(shiftEvent?.shiftType);
  const shiftMins = shiftEvent
    ? differenceInMinutes(shiftEvent.end, shiftEvent.start)
    : 0;

  const nudge = nudgeFor({
    shift: shiftEvent?.shiftType ?? null,
    totalHours,
    workHours,
    restHours,
    isEmpty: dayEvents.length === 0,
  });

  return (
    <aside className="hidden h-full w-80 shrink-0 border-l border-border bg-card/30 lg:block">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-5 p-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {greetingFor(new Date())}, there!
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight">
              {format(date, "EEEE")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(date, "MMMM d, yyyy")}
            </p>
          </div>

          {shiftStyle && shiftEvent && (
            <div
              className="flex items-center gap-3 rounded-2xl p-4 text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${shiftStyle.colour}, ${shiftStyle.colour}cc)`,
              }}
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/20">
                <shiftStyle.Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider opacity-80">
                  {shiftStyle.label} shift
                </p>
                <p className="truncate text-sm font-semibold">
                  {format(shiftEvent.start, "h:mm a")} –{" "}
                  {format(shiftEvent.end, "h:mm a")}
                </p>
              </div>
              <span className="text-sm font-bold tabular-nums">
                {(shiftMins / 60).toFixed(1)}h
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Today's hours</h3>
              <span className="text-xs text-muted-foreground">
                {totalHours.toFixed(1)}h
              </span>
            </div>
            {chartData.length > 0 ? (
              <>
                <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                  {chartData.map((d) => (
                    <div
                      key={d.id}
                      title={`${d.name}: ${d.value}h`}
                      className="h-full transition-all"
                      style={{
                        width: `${(d.value / totalHours) * 100}%`,
                        backgroundColor: d.color,
                      }}
                    />
                  ))}
                </div>
                <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                  {chartData.map((d) => (
                    <li key={d.id} className="flex items-center gap-1.5">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="ml-auto font-medium">{d.value}h</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Nothing scheduled yet.
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Events
            </h3>
            {dayEvents.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                <Sparkles className="mx-auto mb-1 size-4" />
                Free day. Time to rest.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayEvents.map((e) => {
                  const cat = getCategoryConfig(e.category);
                  const Icon = cat.Icon;
                  const evShift = getShiftConfig(e.shiftType);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onEventClick?.(e)}
                        className="group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                      >
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: cat.colour }}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-1.5 shrink-0 rounded-full"
                              style={{ backgroundColor: cat.colour }}
                            />
                          <p className="truncate text-sm font-medium">
                            {e.title}
                          </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(e.start, "h:mm a")} – {format(e.end, "h:mm a")}
                          </p>
                          {evShift && (
                            <span
                              className="mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                              style={{ backgroundColor: evShift.colour }}
                            >
                              <evShift.Icon className="size-2.5" />
                              {evShift.label}
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-foreground/80">{nudge}</p>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}