import { useMemo } from "react";
import {
  format,
  isSameDay,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type MockEvent } from "./constants";
import { CATEGORY_LIST, getShiftConfig } from "@/lib/shiftConfig";
import { Sparkles, TrendingUp, Moon, Lightbulb } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  weekAnchor: Date;
  events: MockEvent[];
}

export function WeekSummaryDialog({
  open,
  onOpenChange,
  weekAnchor,
  events,
}: Props) {
  const days = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(weekAnchor, { weekStartsOn: 1 }),
        end: endOfWeek(weekAnchor, { weekStartsOn: 1 }),
      }),
    [weekAnchor],
  );

  const weekEvents = useMemo(
    () => events.filter((e) => days.some((d) => isSameDay(d, e.start))),
    [events, days],
  );

  const totalsByCat = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of weekEvents) {
      const mins = differenceInMinutes(e.end, e.start);
      if (mins <= 0) continue;
      totals[e.category] = (totals[e.category] || 0) + mins / 60;
    }
    return CATEGORY_LIST.map((c) => ({
      id: c.id,
      name: c.label,
      value: +(totals[c.id] || 0).toFixed(1),
      color: c.colour,
    }));
  }, [weekEvents]);

  const maxCat = Math.max(1, ...totalsByCat.map((t) => t.value));

  const dayTotals = useMemo(
    () =>
      days.map((d) => {
        const evs = weekEvents.filter((e) => isSameDay(e.start, d));
        const hours = evs.reduce(
          (a, e) => a + differenceInMinutes(e.end, e.start) / 60,
          0,
        );
        const shift = evs.find((e) => e.shiftType);
        return { date: d, hours, shift, events: evs };
      }),
    [days, weekEvents],
  );

  const busiest = dayTotals.reduce(
    (best, d) => (d.hours > best.hours ? d : best),
    dayTotals[0],
  );
  const mostRested = dayTotals.reduce(
    (best, d) => (d.hours < best.hours ? d : best),
    dayTotals[0],
  );

  const workHours = totalsByCat.find((t) => t.id === "work")?.value ?? 0;
  const restHours = totalsByCat.find((t) => t.id === "rest")?.value ?? 0;
  const exerciseHours =
    totalsByCat.find((t) => t.id === "exercise")?.value ?? 0;
  const socialHours = totalsByCat.find((t) => t.id === "social")?.value ?? 0;

  const insight = (() => {
    if (workHours > 45)
      return "You're logging more than 45 hours of work this week — schedule active recovery to protect long-term wellbeing.";
    if (exerciseHours < 2.5)
      return "WHO recommends at least 150 minutes of moderate movement per week. A short walk on a quiet day adds up.";
    if (restHours < 49)
      return "Aim for ~7 hours of sleep nightly. Consistent sleep windows ease the strain of rotating shifts.";
    if (socialHours < 2)
      return "Holt-Lunstad's research links social connection to longevity. Block in time with someone you trust.";
    return "Balanced week. Keep noticing what works — small rhythms beat big resets 🌟";
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 pb-4 pt-6">
          <DialogTitle className="text-xl">Week summary</DialogTitle>
          <DialogDescription>
            {format(days[0], "MMM d")} – {format(days[6], "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-6rem)]">
          <div className="flex flex-col gap-5 px-6 py-5">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shift schedule
              </h3>
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {dayTotals.map((d) => {
                  const shiftStyle = getShiftConfig(d.shift?.shiftType);
                  return (
                    <li
                      key={+d.date}
                      className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {format(d.date, "EEE")}{" "}
                          <span className="text-muted-foreground">
                            {format(d.date, "d")}
                          </span>
                        </p>
                      </div>
                      {shiftStyle ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                          style={{ backgroundColor: shiftStyle.colour }}
                        >
                          <shiftStyle.Icon className="size-3" />
                          {shiftStyle.label}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Off
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hours by category
              </h3>
              <ul className="flex flex-col gap-2">
                {totalsByCat.map((t) => (
                  <li key={t.id} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs text-muted-foreground">
                      {t.name}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(t.value / maxCat) * 100}%`,
                          backgroundColor: t.color,
                        }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums">
                      {t.value}h
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="size-3.5" /> Busiest day
                </div>
                <p className="mt-2 text-lg font-bold">
                  {format(busiest.date, "EEEE")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {busiest.hours.toFixed(1)} planned hours
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Moon className="size-3.5" /> Most rested day
                </div>
                <p className="mt-2 text-lg font-bold">
                  {format(mostRested.date, "EEEE")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mostRested.hours.toFixed(1)} planned hours
                </p>
              </div>
            </section>

            <section className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Wellness insight
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                  {insight}
                </p>
              </div>
            </section>

            {weekEvents.length === 0 && (
              <p className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-6 text-xs text-muted-foreground">
                <Sparkles className="size-4" /> Nothing scheduled this week yet.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}