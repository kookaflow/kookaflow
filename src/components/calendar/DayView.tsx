import { useCalendar } from "@/providers/CalendarProvider";
import { useEvents } from "@/providers/EventsProvider";
import { getEventsForDay } from "@/lib/selectors";
import { TimeGutter } from "./TimeGutter";
import { WeekDayColumn } from "./WeekDayColumn";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const HOUR_HEIGHT = 64;

interface Props {
  onCreate: (d: Date) => void;
  onEditEvent: (id: string) => void;
}

export function DayView({ onCreate, onEditEvent }: Props) {
  const { selectedDate, setSelectedDate } = useCalendar();
  const { events } = useEvents();
  const dayEvents = getEventsForDay(events, selectedDate);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-lg font-semibold">{format(selectedDate, "EEEE, MMMM d")}</h2>
        <p className="text-xs text-muted-foreground">{dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex">
          <TimeGutter hourHeight={HOUR_HEIGHT} />
          <WeekDayColumn
            day={selectedDate}
            events={dayEvents}
            hourHeight={HOUR_HEIGHT}
            selected
            onSelect={setSelectedDate}
            onCreate={onCreate}
            onEditEvent={onEditEvent}
            showHeader={false}
          />
        </div>
      </ScrollArea>
    </div>
  );
}