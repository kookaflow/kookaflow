import { useMemo } from "react";
import { useCalendar } from "@/providers/CalendarProvider";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useEvents } from "@/providers/EventsProvider";
import { weekDays } from "@/lib/date";
import { getEventsForDay } from "@/lib/selectors";
import { TimeGutter } from "./TimeGutter";
import { WeekDayColumn } from "./WeekDayColumn";
import { isSameDay } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const HOUR_HEIGHT = 48;

interface Props {
  onCreate: (d: Date) => void;
  onEditEvent: (id: string) => void;
}

export function WeekView({ onCreate, onEditEvent }: Props) {
  const { selectedDate, setSelectedDate } = useCalendar();
  const { prefs } = usePreferences();
  const { events } = useEvents();

  const days = useMemo(
    () => weekDays(selectedDate, prefs.weekStartsOn),
    [selectedDate, prefs.weekStartsOn],
  );

  return (
    <ScrollArea className="h-full">
      <div className="flex min-h-full">
        <div className="sticky top-0 flex flex-col">
          <div className="h-[57px] border-b border-r border-border" />
          <TimeGutter hourHeight={HOUR_HEIGHT} />
        </div>
        <div className="flex flex-1">
          {days.map((day) => (
            <WeekDayColumn
              key={day.toISOString()}
              day={day}
              events={getEventsForDay(events, day)}
              hourHeight={HOUR_HEIGHT}
              selected={isSameDay(day, selectedDate)}
              onSelect={setSelectedDate}
              onCreate={onCreate}
              onEditEvent={onEditEvent}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}