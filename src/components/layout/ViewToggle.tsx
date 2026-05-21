import { useCalendar } from "@/providers/CalendarProvider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ViewMode } from "@/types/preferences";

export function ViewToggle() {
  const { view, setView } = useCalendar();
  return (
    <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
      <TabsList>
        <TabsTrigger value="month">Month</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="day">Day</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}