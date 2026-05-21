import { useMemo } from "react";
import { format, isSameDay, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORIES, CATEGORY_MAP, SHIFT_STYLES, type MockEvent } from "./constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";

interface Props {
  date: Date;
  events: MockEvent[];
  onEventClick?: (e: MockEvent) => void;
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
    for (const e of events) {
      const s = e.start > start ? e.start : start;
      const en = e.end < end ? e.end : end;
      const mins = differenceInMinutes(en, s);
      if (mins <= 0) continue;
      totals[e.category] = (totals[e.category] || 0) + mins / 60;
    }
    return CATEGORIES.map((c) => ({
      name: c.label,
      value: +(totals[c.id] || 0).toFixed(1),
      color: c.color,
    })).filter((d) => d.value > 0);
  }, [events, date]);

  const totalHours = chartData.reduce((a, b) => a + b.value, 0);

  return (
    <aside className="hidden h-full w-80 shrink-0 border-l border-border bg-card/30 lg:block">
      <ScrollArea className="h-full">
        <div className="flex flex-col gap-5 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Today at a glance
            </p>
            <h2 className="mt-1 text-xl font-bold">{format(date, "EEEE")}</h2>
            <p className="text-sm text-muted-foreground">
              {format(date, "MMMM d, yyyy")}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Hours by category</h3>
              <span className="text-xs text-muted-foreground">
                {totalHours.toFixed(1)}h
              </span>
            </div>
            {chartData.length > 0 ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={70}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [`${v}h`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Nothing scheduled yet.
              </p>
            )}
            <ul className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
              {chartData.map((d) => (
                <li key={d.name} className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: d.color }}
                  />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}h</span>
                </li>
              ))}
            </ul>
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
                  const cat = CATEGORY_MAP[e.category];
                  const Icon = cat.icon;
                  const shiftStyle = e.shiftType ? SHIFT_STYLES[e.shiftType] : null;
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onEventClick?.(e)}
                        className="group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm"
                      >
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: cat.color }}
                        >
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {e.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(e.start, "h:mm a")} – {format(e.end, "h:mm a")}
                          </p>
                          {shiftStyle && (
                            <span
                              className="mt-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white"
                              style={{ backgroundColor: shiftStyle.color }}
                            >
                              <shiftStyle.icon className="size-2.5" />
                              {shiftStyle.label}
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
        </div>
      </ScrollArea>
    </aside>
  );
}