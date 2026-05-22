import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { isSameDay } from "date-fns";
import { toast } from "sonner";
import { useEvents } from "@/providers/EventsProvider";
import type { StampDef } from "@/lib/stamps";
import type { EventDraft } from "@/types/event";

interface Ctx {
  selected: StampDef | null;
  setSelected: (s: StampDef | null) => void;
  applyStamp: (day: Date) => Promise<void>;
  panelOpen: boolean;
  setPanelOpen: (b: boolean) => void;
}

const StampContext = createContext<Ctx | null>(null);

function setTimeOnDay(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(day);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

function startOfDayDate(day: Date): Date {
  const d = new Date(day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDayDate(day: Date): Date {
  const d = new Date(day);
  d.setHours(23, 59, 0, 0);
  return d;
}

function buildDraftFromStamp(stamp: StampDef, day: Date): EventDraft {
  if (stamp.allDay || !stamp.startTime || !stamp.endTime) {
    const allDayDraft: EventDraft = {
      title: stamp.label,
      category: stamp.category ?? "personal",
      start: startOfDayDate(day).toISOString(),
      end: endOfDayDate(day).toISOString(),
      allDay: true,
      iconName: stamp.iconName,
      iconColor: stamp.colour,
      isPayday: !!stamp.isPayday,
      shift: stamp.shiftType
        ? {
            shiftType: stamp.shiftType,
            role: "",
            location: "",
          }
        : undefined,
    };
    if (allDayDraft.category === "travel" || stamp.shiftType === "travel") {
      (allDayDraft as EventDraft & { travelDurationMinutes?: number }).travelDurationMinutes = 60;
    }
    return allDayDraft;
  }
  const start = setTimeOnDay(day, stamp.startTime);
  let end = setTimeOnDay(day, stamp.endTime);
  if (stamp.overnight || end <= start) end.setDate(end.getDate() + 1);
  const draft: EventDraft = {
    title: stamp.label,
    category: stamp.category ?? "work",
    start: start.toISOString(),
    end: end.toISOString(),
    allDay: false,
    iconName: stamp.iconName,
    iconColor: stamp.colour,
    isPayday: !!stamp.isPayday,
    shift: stamp.shiftType
      ? { shiftType: stamp.shiftType, role: "", location: "" }
      : undefined,
  };
  if (stamp.shiftType === "split" && draft.shift) {
    draft.shift.split = {
      firstStart: "06:00",
      firstEnd: "10:00",
      breakMinutes: 240,
      secondStart: "14:00",
      secondEnd: "20:00",
    };
  }
  if (stamp.category === "travel") {
    // satisfies validate_event trigger
    (draft as EventDraft & { travelDurationMinutes?: number }).travelDurationMinutes = 60;
  }
  return draft;
}

export function StampProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<StampDef | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const { events, createEvent, deleteEvent } = useEvents();

  const applyStamp = useCallback(
    async (day: Date) => {
      if (!selected) return;
      try {
        const dayEvents = events.filter((e) => isSameDay(new Date(e.start), day));
        if (selected.kind === "clear") {
          const shiftEvent = dayEvents.find((e) => e.shift || e.category === "work" || e.category === "rest");
          if (shiftEvent) {
            await deleteEvent(shiftEvent.id);
            toast("Cleared");
          }
          return;
        }
        if (selected.kind === "icon") {
          const existing = dayEvents.find(
            (e) => e.iconName === selected.iconName && e.allDay && e.category === "personal",
          );
          if (existing) {
            await deleteEvent(existing.id);
            return;
          }
          await createEvent({
            title: selected.label,
            category: "personal",
            start: startOfDayDate(day).toISOString(),
            end: endOfDayDate(day).toISOString(),
            allDay: true,
            iconName: selected.iconName,
            iconColor: selected.colour,
          });
          return;
        }
        // shift / rest / leave / travel / payday
        // Toggle off ONLY when stamping the exact same type on the same day.
        // Otherwise always create a new event — never overwrite a different existing one.
        const draft = buildDraftFromStamp(selected, day);
        const existingSame = dayEvents.find(
          (e) =>
            e.category === draft.category &&
            (e.shift?.shiftType ?? null) === (draft.shift?.shiftType ?? null) &&
            (e.isPayday ?? false) === (draft.isPayday ?? false),
        );
        if (existingSame) {
          await deleteEvent(existingSame.id);
          return;
        }
        await createEvent(draft);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to apply";
        toast(msg);
      }
    },
    [selected, events, createEvent, deleteEvent],
  );

  const value = useMemo(
    () => ({ selected, setSelected, applyStamp, panelOpen, setPanelOpen }),
    [selected, applyStamp, panelOpen],
  );

  return <StampContext.Provider value={value}>{children}</StampContext.Provider>;
}

export function useStamp() {
  const ctx = useContext(StampContext);
  if (!ctx) throw new Error("useStamp must be used in StampProvider");
  return ctx;
}