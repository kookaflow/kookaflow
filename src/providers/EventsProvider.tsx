import { createContext, useContext, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listEvents,
  createEvent as createEventFn,
  updateEvent as updateEventFn,
  deleteEvent as deleteEventFn,
  type EventDTO,
} from "@/lib/events.functions";
import {
  scheduleShiftAlert,
  cancelShiftAlert,
} from "@/lib/shift-alerts.functions";
import type {
  CalendarEvent,
  EventDraft,
  ShiftType,
  RecurrencePattern,
} from "@/types/event";

const QK = ["events"] as const;

interface Ctx {
  events: CalendarEvent[];
  isLoading: boolean;
  createEvent: (draft: EventDraft) => Promise<CalendarEvent>;
  updateEvent: (id: string, patch: Partial<EventDraft>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEvent: (id: string) => CalendarEvent | undefined;
}

const EventsContext = createContext<Ctx | null>(null);

function dtoToCalendarEvent(d: EventDTO): CalendarEvent {
  const hasShift =
    d.category === "work" &&
    (d.shiftType || d.shiftRole || d.location || d.splitFirstStart);
  return {
    id: d.id,
    title: d.title,
    category: d.category,
    start: d.start,
    end: d.end,
    allDay: d.isAllDay,
    iconName: d.iconName ?? undefined,
    iconColor: d.iconColor ?? undefined,
    notes: d.notes ?? undefined,
    isPayday: d.isPayday,
    shift: hasShift
      ? {
          // shift_type is null for custom templates — fall back to "custom"
          // (NOT "morning") so the UI keeps the template's icon/colour.
          shiftType: (d.shiftType ?? "custom") as ShiftType,
          role: d.shiftRole ?? "",
          location: d.location ?? "",
          customLabel: d.shiftType ? undefined : d.shiftRole ?? undefined,
          split:
            d.splitFirstStart &&
            d.splitFirstEnd &&
            d.splitSecondStart &&
            d.splitSecondEnd
              ? {
                  firstStart: d.splitFirstStart.slice(0, 5),
                  firstEnd: d.splitFirstEnd.slice(0, 5),
                  breakMinutes: d.splitBreakMinutes ?? 60,
                  secondStart: d.splitSecondStart.slice(0, 5),
                  secondEnd: d.splitSecondEnd.slice(0, 5),
                }
              : undefined,
        }
      : undefined,
    recurrencePattern: (d.recurrencePattern as RecurrencePattern | null) ?? null,
    recurrenceDays: d.recurrenceDays ?? null,
    recurrenceEndDate: d.recurrenceEndDate ?? null,
    createdAt: d.start,
    updatedAt: d.start,
  };
}

function draftToInput(draft: EventDraft) {
  const isWork = draft.category === "work";
  const shift = isWork ? draft.shift : undefined;
  // "custom" is not in the DB enum — persist as null shift_type, label goes in shift_role.
  const shiftTypeForDb =
    shift?.shiftType === "custom" ? null : (shift?.shiftType ?? null);
  const roleForDb =
    shift?.shiftType === "custom"
      ? shift.customLabel || shift.role || null
      : shift?.role || null;
  return {
    title: draft.title,
    category: draft.category,
    start: draft.start,
    end: draft.end,
    isAllDay: !!draft.allDay,
    isPayday: !!draft.isPayday,
    shiftType: shiftTypeForDb,
    shiftRole: roleForDb,
    location: shift?.location || null,
    notes: draft.notes ?? null,
    iconName: draft.iconName ?? null,
    iconColor: draft.iconColor ?? draft.iconGradient ?? null,
    travelDurationMinutes: draft.travelDurationMinutes ?? null,
    splitFirstStart: shift?.split?.firstStart ?? null,
    splitFirstEnd: shift?.split?.firstEnd ?? null,
    splitBreakMinutes: shift?.split?.breakMinutes ?? null,
    splitSecondStart: shift?.split?.secondStart ?? null,
    splitSecondEnd: shift?.split?.secondEnd ?? null,
    recurrencePattern: draft.recurrencePattern ?? null,
    recurrenceDays: draft.recurrenceDays ?? null,
    recurrenceEndDate: draft.recurrenceEndDate ?? null,
  };
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const list = useServerFn(listEvents);
  const create = useServerFn(createEventFn);
  const update = useServerFn(updateEventFn);
  const remove = useServerFn(deleteEventFn);
  const scheduleAlert = useServerFn(scheduleShiftAlert);
  const cancelAlert = useServerFn(cancelShiftAlert);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: QK,
    queryFn: () => list(),
  });

  const events = useMemo(() => (data ?? []).map(dtoToCalendarEvent), [data]);

  const createMut = useMutation({
    mutationFn: async (draft: EventDraft) => {
      const dto = await create({ data: draftToInput(draft) });
      if (dto.category === "work") {
        scheduleAlert({ data: { eventId: dto.id } }).catch((e) =>
          console.warn("scheduleShiftAlert failed", e),
        );
      }
      return dto;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK }),
  });

  const updateMut = useMutation({
    mutationFn: async (args: { id: string; patch: Partial<EventDraft> }) => {
      const existing = events.find((e) => e.id === args.id);
      if (!existing) throw new Error("Event not found");
      const merged: EventDraft = { ...existing, ...args.patch };
      const dto = await update({ data: { id: args.id, ...draftToInput(merged) } });
      if (dto.category === "work") {
        scheduleAlert({ data: { eventId: dto.id } }).catch((e) =>
          console.warn("scheduleShiftAlert failed", e),
        );
      } else {
        cancelAlert({ data: { eventId: dto.id } }).catch(() => undefined);
      }
      return dto;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      cancelAlert({ data: { eventId: id } }).catch(() => undefined);
      return remove({ data: { id } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK }),
  });

  const value: Ctx = {
    events,
    isLoading: isLoading || isFetching,
    createEvent: async (draft) => {
      const dto = await createMut.mutateAsync(draft);
      return dtoToCalendarEvent(dto);
    },
    updateEvent: async (id, patch) => {
      await updateMut.mutateAsync({ id, patch });
    },
    deleteEvent: async (id) => {
      await deleteMut.mutateAsync(id);
    },
    getEvent: (id) => events.find((e) => e.id === id),
  };

  return (
    <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}