import { useMemo } from "react";
import { useCalendar } from "@/providers/CalendarProvider";
import { useEvents } from "@/providers/EventsProvider";
import { dayRange } from "@/lib/date";
import { getEventsForDay, getCategoryBreakdown } from "@/lib/selectors";
import { DateHero } from "./DateHero";
import { ShiftCard } from "./ShiftCard";
import { TodayEventsList } from "./TodayEventsList";
import { CategoryBreakdownMini } from "./CategoryBreakdownMini";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Props {
  onEditEvent: (id: string) => void;
}

export function TodayPanel({ onEditEvent }: Props) {
  const { selectedDate } = useCalendar();
  const { events } = useEvents();
  const dayEvents = useMemo(() => getEventsForDay(events, selectedDate), [events, selectedDate]);
  const breakdown = useMemo(() => {
    const { start, end } = dayRange(selectedDate);
    return getCategoryBreakdown(events, start, end);
  }, [events, selectedDate]);

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border bg-card/30 lg:block">
      <ScrollArea className="h-[calc(100vh-65px)]">
        <div className="flex flex-col gap-4 p-4">
          <DateHero date={selectedDate} />
          <Separator />
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Shift</h3>
            <ShiftCard events={dayEvents} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Events</h3>
            <TodayEventsList events={dayEvents} onSelect={onEditEvent} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Balance today</h3>
            <CategoryBreakdownMini breakdown={breakdown} />
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}