import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PreferencesProvider } from "@/providers/PreferencesProvider";
import { EventsProvider } from "@/providers/EventsProvider";
import { CalendarProvider } from "@/providers/CalendarProvider";
import { TopNav } from "@/components/layout/TopNav";
import { TodayPanel } from "@/components/today/TodayPanel";
import { CalendarSurface } from "@/components/calendar/CalendarSurface";
import { EventDialog } from "@/components/events/EventDialog";
import { WeeklySummaryPanel } from "@/components/weekly/WeeklySummaryPanel";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <PreferencesProvider>
      <EventsProvider>
        <CalendarProvider>
          <CalendarPage />
        </CalendarProvider>
      </EventsProvider>
    </PreferencesProvider>
  );
}

function CalendarPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [defaultStart, setDefaultStart] = useState<Date | undefined>(undefined);

  const openCreate = (d?: Date) => {
    setEditingId(null);
    setDefaultStart(d ?? new Date());
    setDialogOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setDefaultStart(undefined);
    setDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopNav onNewEvent={() => openCreate()} />
      <div className="flex flex-1 overflow-hidden">
        <TodayPanel onEditEvent={openEdit} />
        <main className="flex-1 overflow-hidden">
          <CalendarSurface onCreate={openCreate} onEditEvent={openEdit} />
        </main>
      </div>
      <EventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={editingId}
        defaultStart={defaultStart}
      />
      <WeeklySummaryPanel />
    </div>
  );
}
