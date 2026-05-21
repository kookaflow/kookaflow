import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { addDays, addMonths, addWeeks, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCalendar } from "@/providers/CalendarProvider";
import { cn } from "@/lib/utils";

export function DatePicker() {
  const { selectedDate, setSelectedDate, view } = useCalendar();

  const step = (dir: 1 | -1) => {
    if (view === "month") setSelectedDate(addMonths(selectedDate, dir));
    else if (view === "week") setSelectedDate(addWeeks(selectedDate, dir));
    else setSelectedDate(addDays(selectedDate, dir));
  };

  const label =
    view === "day"
      ? format(selectedDate, "EEE, MMM d, yyyy")
      : format(selectedDate, "MMMM yyyy");

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => step(-1)} aria-label="Previous">
        <ChevronLeft className="size-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[180px] justify-start gap-2">
            <CalendarIcon className="size-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" size="icon" onClick={() => step(1)} aria-label="Next">
        <ChevronRight className="size-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>
        Today
      </Button>
    </div>
  );
}