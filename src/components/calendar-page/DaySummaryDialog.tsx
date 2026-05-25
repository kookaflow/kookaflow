import { useMemo } from "react";
import { format, isSameDay, differenceInMinutes, startOfDay, endOfDay } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { CATEGORY_LIST, getCategoryConfig, getShiftConfig } from "@/lib/shiftConfig";
import { ICON_MAP } from "@/components/events/IconPicker";
import type { MockEvent } from "./constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  events: MockEvent[];
  onEventClick?: (e: MockEvent) => void;
  onAddEvent?: (d: Date) => void;
}

export function DaySummaryDialog({ open, onOpenChange, date, events, onEventClick, onAddEvent }: Props) {
  const dayEvents = useMemo(
    () => events.filter((e) => isSameDay(e.start, date)).sort((a, b) => +a.start - +b.start),
    [events, date],
  );

  const chart = useMemo(() => {
    const s = startOfDay(date), en = endOfDay(date);
    const totals: Record<string, number> = {};
    for (const e of dayEvents) {
      const a = e.start > s ? e.start : s;
      const b = e.end < en ? e.end : en;
      const m = differenceInMinutes(b, a);
      if (m <= 0) continue;
      totals[e.category] = (totals[e.category] || 0) + m / 60;
    }
    return CATEGORY_LIST.map((c) => ({
      id: c.id, name: c.label, value: +(totals[c.id] || 0).toFixed(1), color: c.colour,
    })).filter((d) => d.value > 0);
  }, [dayEvents, date]);

  const total = chart.reduce((a, b) => a + b.value, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-5 pb-3">
          <DialogTitle className="text-xl">{format(date, "EEEE, MMM d")}</DialogTitle>
          <DialogDescription>
            {dayEvents.length === 0 ? "No events" : `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""} · ${total.toFixed(1)}h scheduled`}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-5">
          <div className="flex flex-col gap-4 pb-4">
            {chart.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                  {chart.map((d) => (
                    <div key={d.id} title={`${d.name}: ${d.value}h`}
                      style={{ width: `${(d.value / total) * 100}%`, backgroundColor: d.color }} />
                  ))}
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
                  {chart.map((d) => (
                    <li key={d.id} className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                      <span className="ml-auto font-medium">{d.value}h</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dayEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                <Sparkles className="mx-auto mb-2 size-5" />
                Nothing scheduled. A clear day.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayEvents.map((e) => {
                  const cat = getCategoryConfig(e.category);
                  const shiftStyle = getShiftConfig(e.shiftType);
                  const CustomIcon = e.iconName ? ICON_MAP[e.iconName] : null;
                  const bg = shiftStyle?.colour ?? e.iconColor ?? cat.colour;
                  const Icon = shiftStyle?.Icon ?? CustomIcon ?? cat.Icon;
                  return (
                    <li key={e.id}>
                      <button type="button"
                        onClick={() => { onOpenChange(false); onEventClick?.(e); }}
                        className="group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-sm">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: bg }}>
                          <Icon className="size-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{e.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(e.start, "h:mm a")} – {format(e.end, "h:mm a")}
                          </p>
                          {e.location && (
                            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">📍 {e.location}</p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </ScrollArea>
        <div className="border-t border-border p-3">
          <Button className="w-full gap-1.5" onClick={() => { onOpenChange(false); onAddEvent?.(date); }}>
            <Plus className="size-4" /> Add event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
