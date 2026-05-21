import { useMemo } from "react";
import { useCalendar } from "@/providers/CalendarProvider";
import { usePreferences } from "@/providers/PreferencesProvider";
import { useEvents } from "@/providers/EventsProvider";
import { monthGridDays } from "@/lib/date";
import { getEventsForDay } from "@/lib/selectors";
import { MonthDayCell } from "./MonthDayCell";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

interface Props {
  onCreate: (d: Date) => void;
  onEditEvent: (id: string) => void;
}

export function MonthView({ onCreate, onEditEvent }: Props) {
  const { selectedDate, setSelectedDate } = useCalendar();
  const { prefs } = usePreferences();
  const { events } = useEvents();

  const days = useMemo(
    () => monthGridDays(selectedDate, prefs.weekStartsOn),
    [selectedDate, prefs.weekStartsOn],
  );

  const weekHeader = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: prefs.weekStartsOn });
    return Array.from({ length: 7 }, (_, i) => format(addDays(start, i), "EEE"));
  }, [prefs.weekStartsOn]);

  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="grid grid-cols-7 gap-1 px-1 text-xs font-medium text-muted-foreground">
        {weekHeader.map((d) => (
          <div key={d} className="px-1">{d}</div>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-7 gap-1">
        {days.map((day) => (
          <MonthDayCell
            key={day.toISOString()}
            day={day}
            monthCursor={selectedDate}
            selected={isSameDay(day, selectedDate)}
            events={getEventsForDay(events, day)}
            onSelect={setSelectedDate}
            onCreate={onCreate}
            onEditEvent={onEditEvent}
          />
        ))}
      </div>
    </div>
  );
}