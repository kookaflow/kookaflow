import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addDays,
  addMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from "date-fns";
import {
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MonthView } from "@/components/calendar-page/MonthView";
import { TimeGrid } from "@/components/calendar-page/TimeGrid";
import { TodayPanel } from "@/components/calendar-page/TodayPanel";
import { buildMockEvents } from "@/components/calendar-page/mock";

type ViewMode = "month" | "week" | "day";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const [view, setView] = useState<ViewMode>("month");
  const [date, setDate] = useState<Date>(new Date());
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const root = document.documentElement;
    const prev = root.classList.contains("dark");
    root.classList.toggle("dark", theme === "dark");
    return () => {
      root.classList.toggle("dark", prev);
    };
  }, [theme]);

  const events = useMemo(() => buildMockEvents(new Date()), []);

  const goPrev = () => {
    if (view === "month") setDate((d) => addMonths(d, -1));
    else if (view === "week") setDate((d) => addDays(d, -7));
    else setDate((d) => addDays(d, -1));
  };
  const goNext = () => {
    if (view === "month") setDate((d) => addMonths(d, 1));
    else if (view === "week") setDate((d) => addDays(d, 7));
    else setDate((d) => addDays(d, 1));
  };

  const weekDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      }),
    [date],
  );

  const heading =
    view === "month"
      ? format(date, "MMMM yyyy")
      : view === "week"
        ? `${format(weekDays[0], "MMM d")} – ${format(weekDays[6], "MMM d, yyyy")}`
        : format(date, "EEEE, MMM d, yyyy");

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Top nav */}
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-sm">
            <CalendarHeart className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">ShiftSync</span>
        </div>

        <div className="mx-auto flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {(["month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all duration-200",
                view === v
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => setDate(new Date())}>
            Today
          </Button>
          <div className="flex items-center rounded-md border border-border">
            <button
              type="button"
              onClick={goPrev}
              className="px-1.5 py-1.5 transition-colors hover:bg-accent"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="border-l border-border px-1.5 py-1.5 transition-colors hover:bg-accent"
              aria-label="Next"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="size-4" />
                <span className="hidden sm:inline">{heading}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Sub header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
        <h1 className="text-base font-semibold">{heading}</h1>
        <span className="text-xs text-muted-foreground">
          {events.length} events this period
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-hidden">
          {view === "month" && (
            <MonthView
              cursor={date}
              selected={date}
              events={events}
              onSelect={setDate}
            />
          )}
          {view === "week" && (
            <TimeGrid
              days={weekDays}
              events={events}
              selected={date}
              onSelectDay={setDate}
            />
          )}
          {view === "day" && (
            <TimeGrid
              days={[date]}
              events={events}
              selected={date}
              onSelectDay={setDate}
            />
          )}
        </main>
        <TodayPanel date={date} events={events} />
      </div>
    </div>
  );
}