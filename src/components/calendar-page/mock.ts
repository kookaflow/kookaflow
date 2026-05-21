import { addDays, setHours, setMinutes, startOfDay } from "date-fns";
import type { MockEvent } from "./constants";

function at(base: Date, h: number, m = 0) {
  return setMinutes(setHours(startOfDay(base), h), m);
}

export function buildMockEvents(today: Date): MockEvent[] {
  const d = (offset: number) => addDays(today, offset);
  return [
    {
      id: "e1",
      title: "Morning shift — Ward 4B",
      category: "work",
      start: at(today, 7),
      end: at(today, 15),
      shiftType: "morning",
      location: "Ward 4B",
    },
    {
      id: "e2",
      title: "Yoga flow",
      category: "exercise",
      start: at(today, 16, 30),
      end: at(today, 17, 30),
    },
    {
      id: "e3",
      title: "Dinner with Mia",
      category: "social",
      start: at(today, 19),
      end: at(today, 21),
    },
    {
      id: "e4",
      title: "Sleep",
      category: "rest",
      start: at(today, 22, 30),
      end: at(d(1), 6, 30),
    },
    {
      id: "e5",
      title: "Meditation",
      category: "wellness",
      start: at(today, 6, 30),
      end: at(today, 7),
    },
    {
      id: "e6",
      title: "Night shift — ER",
      category: "work",
      start: at(d(1), 22),
      end: at(d(2), 6),
      shiftType: "night",
      location: "ER",
    },
    {
      id: "e7",
      title: "Call mom",
      category: "family",
      start: at(d(2), 18),
      end: at(d(2), 18, 30),
    },
    {
      id: "e8",
      title: "Afternoon shift",
      category: "work",
      start: at(d(3), 14),
      end: at(d(3), 22),
      shiftType: "afternoon",
      location: "Triage",
    },
    {
      id: "e9",
      title: "Run in the park",
      category: "exercise",
      start: at(d(4), 8),
      end: at(d(4), 9),
    },
    {
      id: "e10",
      title: "Read a book",
      category: "personal",
      start: at(d(-1), 20),
      end: at(d(-1), 21, 30),
    },
    {
      id: "e11",
      title: "Morning shift",
      category: "work",
      start: at(d(-2), 7),
      end: at(d(-2), 15),
      shiftType: "morning",
      location: "Ward 2A",
    },
    {
      id: "e12",
      title: "Family brunch",
      category: "family",
      start: at(d(5), 11),
      end: at(d(5), 13),
    },
    {
      id: "e13",
      title: "Therapy session",
      category: "wellness",
      start: at(d(6), 10),
      end: at(d(6), 11),
    },
    {
      id: "e14",
      title: "Afternoon shift",
      category: "work",
      start: at(d(7), 14),
      end: at(d(7), 22),
      shiftType: "afternoon",
    },
  ];
}