import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Briefcase, MapPin, X } from "lucide-react";
import { useEvents } from "@/providers/EventsProvider";
import { getEventColour } from "@/lib/shiftConfig";
import type { CalendarEvent } from "@/types/event";

const SOUND_PREFS_KEY = "shiftsync.sound-prefs.v1";
const LAST_OPENED_KEY = "shiftsync.lastOpenedDate";

type SoundPrefs = { eventAlertMinutes?: number; shiftAlertEnabled?: boolean };

function readAlertMinutes(): number {
  if (typeof window === "undefined") return 10;
  try {
    const raw = window.localStorage.getItem(SOUND_PREFS_KEY);
    if (!raw) return 10;
    const p = JSON.parse(raw) as SoundPrefs;
    return typeof p.eventAlertMinutes === "number" ? p.eventAlertMinutes : 10;
  } catch {
    return 10;
  }
}

function isShiftAlertEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(SOUND_PREFS_KEY);
    if (!raw) return true;
    const p = JSON.parse(raw) as SoundPrefs;
    return p.shiftAlertEnabled !== false;
  } catch {
    return true;
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

function shiftTypeLabel(e: CalendarEvent): string {
  const t = e.shift?.shiftType;
  if (!t || t === "custom") return e.shift?.customLabel || e.shift?.role || "work";
  return t.replace(/_/g, " ");
}

interface ShiftToastProps {
  id: string | number;
  event: CalendarEvent;
  minutesAway: number;
  onView: () => void;
}

function ShiftAlertToast({ id, event, minutesAway, onView }: ShiftToastProps) {
  const label = shiftTypeLabel(event);
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl text-white shadow-xl"
      style={{ background: "linear-gradient(135deg, #1E2A6E 0%, #6B35CC 100%)" }}
    >
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Briefcase className="size-5" />
            <span className="text-base font-bold">Shift Starting Soon</span>
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(id)}
            aria-label="Close"
            className="rounded-full p-1 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="text-sm leading-snug text-white/95">
          Your <span className="font-semibold capitalize">{label}</span> shift starts at{" "}
          <span className="font-semibold">{formatTime(event.start)}</span> — {minutesAway}{" "}
          {minutesAway === 1 ? "minute" : "minutes"} to go
        </p>
        {event.shift?.location ? (
          <p className="flex items-center gap-1 text-xs text-white/85">
            <MapPin className="size-3.5" /> {event.shift.location}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => toast.dismiss(id)}
            className="rounded-full border border-white/60 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onView();
              toast.dismiss(id);
            }}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold transition hover:bg-white/90"
            style={{ color: "#1E2A6E" }}
          >
            View shift
          </button>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 h-1 bg-white/70"
        style={{ animation: "shiftsync-toast-progress 10s linear forwards" }}
      />
    </div>
  );
}

interface DailySummaryProps {
  id: string | number;
  count: number;
  firstShift: CalendarEvent | undefined;
  onOpen: () => void;
}

function DailySummaryToast({ id, count, firstShift, onOpen }: DailySummaryProps) {
  const accent = firstShift ? getEventColour(firstShift) : "#6B7280";
  return (
    <button
      type="button"
      onClick={() => {
        onOpen();
        toast.dismiss(id);
      }}
      className="block w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="space-y-1 p-4" style={{ color: "#1E2A6E" }}>
        <p className="text-base font-semibold">Good {greeting()} 👋</p>
        <p className="text-sm text-foreground/80">
          You have {count} {count === 1 ? "event" : "events"} today
        </p>
        {firstShift ? (
          <p className="text-sm text-foreground/80">
            Your <span className="font-medium capitalize">{shiftTypeLabel(firstShift)}</span>{" "}
            shift starts at{" "}
            <span className="font-medium">{formatTime(firstShift.start)}</span>
          </p>
        ) : (
          <p className="text-sm text-foreground/80">No shifts today — enjoy your time off 🌿</p>
        )}
      </div>
    </button>
  );
}

export function ShiftAlertWatcher() {
  const { events, isLoading } = useEvents();
  const navigate = useNavigate();
  const shownIdsRef = useRef<Set<string>>(new Set());
  const summaryShownRef = useRef(false);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Daily summary — first open of the day.
  useEffect(() => {
    if (isLoading || summaryShownRef.current) return;
    const today = todayKey();
    let last: string | null = null;
    try {
      last = window.localStorage.getItem(LAST_OPENED_KEY);
    } catch {/* noop */}
    if (last === today) {
      summaryShownRef.current = true;
      return;
    }
    summaryShownRef.current = true;
    try {
      window.localStorage.setItem(LAST_OPENED_KEY, today);
    } catch {/* noop */}

    const todays = events.filter((e) => isToday(e.start));
    const firstShift = todays
      .filter((e) => e.category === "work")
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())[0];

    toast.custom(
      (t) => (
        <DailySummaryToast
          id={t}
          count={todays.length}
          firstShift={firstShift}
          onOpen={() => navigate({ to: "/calendar" })}
        />
      ),
      {
        duration: 10_000,
        position: "top-center",
        // @ts-expect-error sonner 2.x supports per-toast swipe directions
        swipeDirections: ["top"],
      },
    );
  }, [isLoading, events, navigate]);

  // Shift-start watcher — check now + every minute.
  useEffect(() => {
    if (isLoading) return;

    const check = () => {
      if (!isShiftAlertEnabled()) return;
      const windowMin = readAlertMinutes();
      const now = Date.now();
      const cur = eventsRef.current;
      for (const e of cur) {
        if (e.category !== "work") continue;
        if (!isToday(e.start)) continue;
        if (shownIdsRef.current.has(e.id)) continue;
        const startMs = new Date(e.start).getTime();
        const diffMin = Math.round((startMs - now) / 60_000);
        if (diffMin < 0 || diffMin > windowMin) continue;
        shownIdsRef.current.add(e.id);
        toast.custom(
          (t) => (
            <ShiftAlertToast
              id={t}
              event={e}
              minutesAway={Math.max(0, diffMin)}
              onView={() => navigate({ to: "/calendar" })}
            />
          ),
          {
            duration: 10_000,
            position: "top-center",
            // @ts-expect-error sonner 2.x supports per-toast swipe directions
            swipeDirections: ["top"],
          },
        );
      }
    };

    check();
    const id = window.setInterval(check, 60_000);
    return () => window.clearInterval(id);
  }, [isLoading, navigate]);

  return null;
}
