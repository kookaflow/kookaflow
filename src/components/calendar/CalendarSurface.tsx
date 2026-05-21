import { useCalendar } from "@/providers/CalendarProvider";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";

interface Props {
  onCreate: (d: Date) => void;
  onEditEvent: (id: string) => void;
}

export function CalendarSurface(props: Props) {
  const { view } = useCalendar();
  if (view === "month") return <MonthView {...props} />;
  if (view === "week") return <WeekView {...props} />;
  return <DayView {...props} />;
}