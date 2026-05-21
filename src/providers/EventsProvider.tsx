import { createContext, useContext, useEffect, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/storage";
import { uid } from "@/lib/ids";
import type { CalendarEvent, EventDraft } from "@/types/event";

const KEY = "shiftsync.events.v1";

interface Ctx {
  events: CalendarEvent[];
  createEvent: (draft: EventDraft) => CalendarEvent;
  updateEvent: (id: string, patch: Partial<EventDraft>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => CalendarEvent | undefined;
}

const EventsContext = createContext<Ctx | null>(null);

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    setEvents(loadJSON<CalendarEvent[]>(KEY, []));
  }, []);

  useEffect(() => {
    saveJSON(KEY, events);
  }, [events]);

  const createEvent = (draft: EventDraft): CalendarEvent => {
    const now = new Date().toISOString();
    const ev: CalendarEvent = { ...draft, id: uid(), createdAt: now, updatedAt: now };
    setEvents((prev) => [...prev, ev]);
    return ev;
  };

  const updateEvent = (id: string, patch: Partial<EventDraft>) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
      ),
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const getEvent = (id: string) => events.find((e) => e.id === id);

  return (
    <EventsContext.Provider value={{ events, createEvent, updateEvent, deleteEvent, getEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}