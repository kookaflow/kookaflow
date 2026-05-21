import { createContext, useContext, useState } from "react";
import type { ViewMode } from "@/types/preferences";

interface Ctx {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  weeklyPanelOpen: boolean;
  setWeeklyPanelOpen: (b: boolean) => void;
}

const CalendarContext = createContext<Ctx | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weeklyPanelOpen, setWeeklyPanelOpen] = useState(false);

  return (
    <CalendarContext.Provider
      value={{ view, setView, selectedDate, setSelectedDate, weeklyPanelOpen, setWeeklyPanelOpen }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be used within CalendarProvider");
  return ctx;
}