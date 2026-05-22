import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isSameDay,
  subDays,
} from "date-fns";
import type { MockEvent } from "@/components/calendar-page/constants";
import type { CategoryId } from "@/types/event";

export type NudgeId =
  | "busy_stretch"
  | "sleep_reminder"
  | "exercise_reminder"
  | "social_connection"
  | "family_time";

export interface CalendarNudge {
  id: NudgeId;
  message: string;
  buttonLabel: string;
  category: CategoryId;
  colour: string;
}

const PRIORITY: NudgeId[] = [
  "busy_stretch",
  "sleep_reminder",
  "exercise_reminder",
  "social_connection",
  "family_time",
];

const DISMISS_PREFIX = "kookaflow_nudge_";
const DISMISS_SUFFIX = "_dismissed";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function dismissKey(id: NudgeId): string {
  return `${DISMISS_PREFIX}${id}${DISMISS_SUFFIX}`;
}

function isDismissed(id: NudgeId): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(dismissKey(id));
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < SEVEN_DAYS_MS;
}

export function dismissNudge(id: NudgeId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(dismissKey(id), String(Date.now()));
}

function eventsInWeek(events: MockEvent[], anchor: Date): MockEvent[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  return events.filter((e) => isWithinInterval(e.start, { start, end }));
}

function hasConsecutiveWorkStretch(events: MockEvent[], anchor: Date): boolean {
  const week = eventsInWeek(events, anchor);
  const days = new Set<string>();
  const restDays = new Set<string>();
  for (const e of week) {
    const key = e.start.toDateString();
    if (e.category === "work") days.add(key);
    if (e.category === "rest" || e.category === "wellness") restDays.add(key);
  }
  const sorted = Array.from(days)
    .map((s) => new Date(s))
    .sort((a, b) => a.getTime() - b.getTime());
  let run = 0;
  let prev: Date | null = null;
  for (const d of sorted) {
    if (restDays.has(d.toDateString())) {
      run = 0;
      prev = d;
      continue;
    }
    if (prev && isSameDay(new Date(prev.getTime() + 86400000), d)) {
      run += 1;
    } else {
      run = 1;
    }
    if (run >= 3) return true;
    prev = d;
  }
  return false;
}

function hasCategoryThisWeek(
  events: MockEvent[],
  anchor: Date,
  cats: CategoryId[],
): boolean {
  return eventsInWeek(events, anchor).some((e) => cats.includes(e.category));
}

function hasCategoryLast7Days(
  events: MockEvent[],
  anchor: Date,
  cats: CategoryId[],
): boolean {
  const start = subDays(anchor, 7);
  return events.some(
    (e) =>
      cats.includes(e.category) &&
      isWithinInterval(e.start, { start, end: anchor }),
  );
}

export function useCalendarNudges(
  events: MockEvent[],
  anchor: Date = new Date(),
): CalendarNudge | null {
  return useMemo(() => {
    const today = new Date();
    const dow = today.getDay(); // 0 Sun..6 Sat
    const triggered = new Set<NudgeId>();

    if (hasConsecutiveWorkStretch(events, anchor)) triggered.add("busy_stretch");
    if (!hasCategoryThisWeek(events, anchor, ["rest"]))
      triggered.add("sleep_reminder");
    if (
      !hasCategoryThisWeek(events, anchor, ["exercise"]) &&
      (dow === 0 || dow >= 3)
    )
      triggered.add("exercise_reminder");
    if (!hasCategoryThisWeek(events, anchor, ["social", "family"]))
      triggered.add("social_connection");
    if (!hasCategoryLast7Days(events, anchor, ["family"]))
      triggered.add("family_time");

    for (const id of PRIORITY) {
      if (!triggered.has(id)) continue;
      if (isDismissed(id)) continue;
      return NUDGE_DEFS[id];
    }
    return null;
  }, [events, anchor]);
}

const NUDGE_DEFS: Record<NudgeId, CalendarNudge> = {
  busy_stretch: {
    id: "busy_stretch",
    message:
      "You've got a busy stretch coming up. Want to block some recovery time? 💜",
    buttonLabel: "Add Rest Time",
    category: "rest",
    colour: "#8B5CF6",
  },
  sleep_reminder: {
    id: "sleep_reminder",
    message:
      "Matthew Walker's research shows sleep is your superpower. Protect your rest this week 🌙",
    buttonLabel: "Add Rest",
    category: "rest",
    colour: "#8B5CF6",
  },
  exercise_reminder: {
    id: "exercise_reminder",
    message:
      "The WHO recommends 150 min of movement a week. Want to add some? 🏃",
    buttonLabel: "Add Exercise",
    category: "exercise",
    colour: "#F59E0B",
  },
  social_connection: {
    id: "social_connection",
    message:
      "Research shows social connection is one of the strongest predictors of wellbeing. Any time for people this week? 👥",
    buttonLabel: "Add Social Time",
    category: "social",
    colour: "#10B981",
  },
  family_time: {
    id: "family_time",
    message:
      "Family connection recharges us in ways nothing else can. Any family time this week? 🏡",
    buttonLabel: "Add Family Time",
    category: "family",
    colour: "#EF4444",
  },
};