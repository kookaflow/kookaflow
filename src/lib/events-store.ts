import { useSyncExternalStore } from "react";
import { buildMockEvents } from "@/components/calendar-page/mock";
import type { MockEvent } from "@/components/calendar-page/constants";

let events: MockEvent[] = buildMockEvents(new Date());
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function emit() {
  listeners.forEach((l) => l());
}

export function useEventsStore(): MockEvent[] {
  return useSyncExternalStore(
    subscribe,
    () => events,
    () => events,
  );
}

export function setEvents(updater: MockEvent[] | ((prev: MockEvent[]) => MockEvent[])) {
  events = typeof updater === "function" ? (updater as (p: MockEvent[]) => MockEvent[])(events) : updater;
  emit();
}

export function getEvents() {
  return events;
}