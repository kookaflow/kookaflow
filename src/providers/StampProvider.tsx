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
    return {
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
  // Template-based split shift
  if (stamp.template?.isSplitShift && stamp.template.splitStart2 && stamp.template.splitEnd2 && stamp.startTime && stamp.endTime) {
    draft.shift = {
      shiftType: "split",
      role: "",
      location: "",
      split: {
        firstStart: stamp.startTime,
        firstEnd: stamp.endTime,
        breakMinutes: stamp.template.unpaidBreakMinutes,
        secondStart: stamp.template.splitStart2.slice(0, 5),
        secondEnd: stamp.template.splitEnd2.slice(0, 5),
      },
    };
  }
  if (stamp.category === "travel") {
    // satisfies validate_event trigger
    (draft as EventDraft & { travelDurationMinutes?: number }).travelDurationMinutes = 60;
  }
  // Persist unpaid break for earnings when stamping from a template (non-split path).
  if (stamp.template && !stamp.template.isSplitShift && stamp.template.unpaidBreakMinutes) {
    (draft as EventDraft & { unpaidBreakMinutes?: number }).unpaidBreakMinutes =
      stamp.template.unpaidBreakMinutes;
  }
  return draft;
}

export function StampProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<StampDef | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();

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
        // shift or rest
        const existingShift = dayEvents.find(
          (e) =>
            e.shift ||
            e.category === "rest" ||
            e.category === "travel" ||
            (e.allDay && e.category === "work"),
        );
        const draft = buildDraftFromStamp(selected, day);
        const sameType =
          existingShift &&
          ((existingShift.shift?.shiftType ?? null) === (selected.shiftType ?? null)) &&
          existingShift.category === draft.category &&
          (existingShift.isPayday ?? false) === (draft.isPayday ?? false);
        if (existingShift && sameType) {
          await deleteEvent(existingShift.id);
          return;
        }
        if (existingShift) {
          await updateEvent(existingShift.id, draft);
          return;
        }
        await createEvent(draft);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to apply";
        toast(msg);
      }
    },
    [selected, events, createEvent, updateEvent, deleteEvent],
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