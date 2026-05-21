import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCalendar } from "@/providers/CalendarProvider";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useEvents } from "@/providers/EventsProvider";
import { weekDays, weekRange } from "@/lib/date";
import { getCategoryBreakdown } from "@/lib/selectors";
import { WeeklyCategoryChart } from "./WeeklyCategoryChart";
import { WeeklyTotalsList } from "./WeeklyTotalsList";
import { Lightbulb } from "lucide-react";
import { format } from "date-fns";

export function WeeklySummaryPanel() {
  const { selectedDate, weeklyPanelOpen, setWeeklyPanelOpen } = useCalendar();
  const { prefs } = usePreferences();
  const { events } = useEvents();

  const days = useMemo(() => weekDays(selectedDate, prefs.weekStartsOn), [selectedDate, prefs.weekStartsOn]);
  const { start, end } = weekRange(selectedDate, prefs.weekStartsOn);
  const breakdown = useMemo(() => getCategoryBreakdown(events, start, end), [events, start, end]);

  return (
    <Sheet open={weeklyPanelOpen} onOpenChange={setWeeklyPanelOpen}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Weekly summary</SheetTitle>
          <p className="text-xs text-muted-foreground">
            {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
          </p>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-6">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Daily breakdown
            </h3>
            <WeeklyCategoryChart days={days} events={events} />
          </section>
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hours this week
            </h3>
            <WeeklyTotalsList breakdown={breakdown} />
          </section>
          <section className="rounded-lg border border-dashed border-border bg-muted/30 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Lightbulb className="size-3.5" />
              Insights
            </div>
            <p className="text-xs text-muted-foreground">
              Wellness nudges and research-backed insights arrive in Phase 3.
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}