import type { MockEvent } from "@/components/calendar-page/constants";
import {
  currentWeekRange,
  type Range,
  eventHoursInRange,
  balanceScore,
} from "./metrics";
import { addDays, isSameDay } from "date-fns";

export interface Nudge {
  id: string;
  message: string;
  source: string;
  severity: number; // higher = more urgent
  tone: "warning" | "info" | "affirm";
}

function hoursFor(events: MockEvent[], cat: string, range: Range) {
  let s = 0;
  for (const e of events) if (e.category === cat) s += eventHoursInRange(e, range.start, range.end);
  return s;
}

function consecutiveNightShifts(events: MockEvent[]): number {
  const nights = events
    .filter((e) => e.shiftType === "night")
    .map((e) => e.start)
    .sort((a, b) => +a - +b);
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of nights) {
    if (prev && isSameDay(addDays(prev, 1), d)) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = d;
  }
  return best;
}

export function buildNudges(events: MockEvent[], now = new Date()): Nudge[] {
  const week = currentWeekRange(now);
  const rest = hoursFor(events, "rest", week);
  const exercise = hoursFor(events, "exercise", week);
  const wellness = hoursFor(events, "wellness", week);
  const social = hoursFor(events, "social", week);
  const family = hoursFor(events, "family", week);
  const work = hoursFor(events, "work", week);
  const score = balanceScore(events, week).score ?? 100;
  const nightStreak = consecutiveNightShifts(events);

  const candidates: Nudge[] = [];

  if (rest < 49) candidates.push({
    id: "sleep",
    severity: 9,
    tone: "warning",
    message: `Only ${rest.toFixed(1)}h of rest this week. Adults need 7–9 hours of sleep nightly for cognitive recovery and emotional regulation.`,
    source: "Walker, Why We Sleep · CDC/NIH sleep guidelines",
  });
  if (nightStreak >= 3) candidates.push({
    id: "nightstreak",
    severity: 8,
    tone: "warning",
    message: `You have ${nightStreak} night shifts in a row. After 3 nights, prioritise a 24h recovery block to reset your circadian rhythm.`,
    source: "Folkard & Tucker, occupational fatigue research",
  });
  if (exercise < 2.5) candidates.push({
    id: "exercise",
    severity: 7,
    tone: "info",
    message: `${exercise.toFixed(1)}h of exercise this week. WHO recommends at least 150 minutes of moderate activity weekly.`,
    source: "WHO Physical Activity Guidelines",
  });
  if (social + family < 5) candidates.push({
    id: "relationships",
    severity: 7,
    tone: "info",
    message: `Only ${(social + family).toFixed(1)}h on relationships this week. Strong connections are the #1 predictor of long-term wellbeing.`,
    source: "Harvard Study of Adult Development · Seligman, PERMA",
  });
  if (wellness <= 0) candidates.push({
    id: "wellness",
    severity: 6,
    tone: "info",
    message: "No wellness time scheduled. A 10-minute daily mindfulness practice measurably reduces stress markers.",
    source: "APA · Kabat-Zinn MBSR",
  });
  if (work > 50) candidates.push({
    id: "overwork",
    severity: 9,
    tone: "warning",
    message: `${work.toFixed(0)}h of work this week. Sustained 50+ hour weeks significantly raise burnout risk for shift workers.`,
    source: "WHO/ILO 2021 long-working-hours study",
  });
  if (score < 40) candidates.push({
    id: "balance",
    severity: 6,
    tone: "info",
    message: "Your balance score is low. Try blocking one Rest and one Social slot this week to spread your time.",
    source: "Positive psychology — PERMA model",
  });

  // Affirmations to fill space
  const affirmations: Nudge[] = [];
  if (rest >= 49) affirmations.push({
    id: "sleep-ok", severity: 1, tone: "affirm",
    message: `Sleep is on target at ${rest.toFixed(1)}h this week. Your future self will thank you.`,
    source: "Walker, Why We Sleep",
  });
  if (exercise >= 2.5) affirmations.push({
    id: "exercise-ok", severity: 1, tone: "affirm",
    message: `You're hitting the WHO movement target. Movement is medicine.`,
    source: "WHO Physical Activity Guidelines",
  });
  if (social + family >= 5) affirmations.push({
    id: "rel-ok", severity: 1, tone: "affirm",
    message: "Solid time on relationships this week — protect this.",
    source: "Harvard Study of Adult Development",
  });
  if (wellness > 0) affirmations.push({
    id: "wellness-ok", severity: 1, tone: "affirm",
    message: "You're making space for wellness. Small daily practices compound.",
    source: "Kabat-Zinn MBSR",
  });

  const picked = candidates.sort((a, b) => b.severity - a.severity).slice(0, 3);
  while (picked.length < 2 && affirmations.length) picked.push(affirmations.shift()!);
  while (picked.length < 3 && affirmations.length) picked.push(affirmations.shift()!);
  if (picked.length === 0) picked.push({
    id: "default",
    severity: 0,
    tone: "affirm",
    message: "Add some events on the calendar to start seeing personalised wellbeing insights here.",
    source: "ShiftSync",
  });
  return picked;
}