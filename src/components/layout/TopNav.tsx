import { Link } from "@tanstack/react-router";
import { CalendarHeart, LayoutDashboard, PanelRightOpen } from "lucide-react";
import { ViewToggle } from "./ViewToggle";
import { DatePicker } from "./DatePicker";
import { ThemeToggle } from "./ThemeToggle";
import { NewEventButton } from "./NewEventButton";
import { useCalendar } from "@/providers/CalendarProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


interface Props {
  onNewEvent: () => void;
}

export function TopNav({ onNewEvent }: Props) {
  const { view, setWeeklyPanelOpen } = useCalendar();
  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarHeart className="size-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">ShiftSync</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle />
        <DatePicker />
      </div>
      <div className="flex items-center gap-1">
        {view === "week" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeeklyPanelOpen(true)}
            className="gap-1.5"
          >
            <PanelRightOpen className="size-4" />
            Weekly summary
          </Button>
        )}
        <ThemeToggle />
        <NewEventButton onClick={onNewEvent} />
      </div>
    </header>
  );
}