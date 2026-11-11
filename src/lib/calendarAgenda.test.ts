import { describe, it, expect } from "vitest";
import {
  itemsForDay, carriedOverShift, dayStatus, workedSegments, periodTotals,
  overlapsExisting, templateRange, shiftInitials, suggestedRest, type AgendaItem,
} from "./calendarAgenda";

const d = (s: string) => new Date(s);
const shift = (id: string, s: string, e: string, title = "Night Shift"): AgendaItem => ({
  id, title, category: "work", start: d(s), end: d(e), source: "shiftsync",
});

describe("calendar agenda rules", () => {
  const night = shift("n", "2026-11-10T19:00", "2026-11-11T07:00");
  const early = shift("e", "2026-11-12T06:00", "2026-11-12T14:00", "Early");
  const late = shift("l", "2026-11-12T16:00", "2026-11-12T20:00", "Late");
  const all = [night, early, late];

  it("overnight shift belongs only to its start day", () => {
    expect(itemsForDay(all, d("2026-11-10T12:00")).map((e) => e.id)).toEqual(["n"]);
    expect(itemsForDay(all, d("2026-11-11T12:00"))).toEqual([]);
  });

  it("day after a night shift is a recovery day ending at 07:00", () => {
    expect(carriedOverShift(all, d("2026-11-11T12:00"))?.end.getHours()).toBe(7);
    expect(dayStatus(all, d("2026-11-11T12:00"))).toBe("recovering");
    expect(dayStatus(all, d("2026-11-10T12:00"))).toBe("working_night");
  });

  it("Sunday night shift carries into Monday of the next week", () => {
    const sun = shift("s", "2026-11-15T22:00", "2026-11-16T06:00");
    expect(dayStatus([sun], d("2026-11-16T09:00"))).toBe("recovering");
  });

  it("two shifts on one day are both listed in start order", () => {
    expect(itemsForDay(all, d("2026-11-12T00:00")).map((e) => e.id)).toEqual(["e", "l"]);
  });

  it("24h bar includes the morning part of yesterday's night shift", () => {
    const segs = workedSegments(all, d("2026-11-11T00:00"));
    expect(segs).toHaveLength(1);
    expect(segs[0]).toMatchObject({ from: 0, to: 420, fromYesterday: true });
  });

  it("totals count overnight hours once, on the start day's period", () => {
    expect(periodTotals(all, d("2026-11-10"), d("2026-11-10"), 40)).toEqual({ hours: 12, earnings: 480 });
    expect(periodTotals(all, d("2026-11-11"), d("2026-11-11"), 40).hours).toBe(0);
    expect(periodTotals(all, d("2026-11-09"), d("2026-11-15"), null)).toEqual({ hours: 24, earnings: null });
  });

  it("templates overlapping an existing item are flagged", () => {
    const r = templateRange(d("2026-11-12T00:00"), "13:00", "17:00");
    expect(overlapsExisting(all, r.start, r.end)).toBe(true);
    const r2 = templateRange(d("2026-11-12T00:00"), "21:00", "23:00");
    expect(overlapsExisting(all, r2.start, r2.end)).toBe(false);
    const r3 = templateRange(d("2026-11-12T00:00"), "22:00", "06:00");
    expect(r3.end.getDate()).toBe(13);
  });

  it("recovery rest starts 1h after the night shift ends", () => {
    const r = suggestedRest(all, d("2026-11-11T00:00"));
    expect(r?.start.getHours()).toBe(8);
    expect(r?.end.getHours()).toBe(16);
  });

  it("badge initials", () => {
    expect(shiftInitials("Night Shift")).toBe("NS");
    expect(shiftInitials("Early Morning")).toBe("EM");
    expect(shiftInitials("Early")).toBe("EA");
  });
});

import { labelCandidates, fitLabel } from "./calendarAgenda";
describe("chip labels", () => {
  const fits8 = (t: string) => t.length <= 8;
  it("uses the full name when it fits", () => {
    expect(fitLabel(labelCandidates("Pilates"), fits8)).toBe("Pilates");
  });
  it("keeps whole words before cutting", () => {
    expect(fitLabel(labelCandidates("Lakes Grammar Event"), fits8)).toBe("Lakes");
    expect(fitLabel(labelCandidates("Anglican ND"), fits8)).toBe("Anglican");
  });
  it("shortens a shared first word to 4 letters", () => {
    const names = ["Baptistcare Night", "Baptistcare AM"];
    expect(fitLabel(labelCandidates(names[0], names), (t) => t.length <= 10)).toBe("Bapt Night");
    expect(fitLabel(labelCandidates(names[1], names), fits8)).toBe("Bapt AM");
  });
  it("cuts mid-word only when the first word doesn't fit", () => {
    expect(fitLabel(labelCandidates("Gymnastics"), fits8)).toBe("Gymnast…");
  });
  it("does not shorten when no sibling shares the first word", () => {
    expect(labelCandidates("Gym", ["Gymnastics"])).toEqual(["Gym"]);
  });
});

import { monthCellItems } from "./calendarAgenda";
describe("month cell items", () => {
  const ev = (id: string, s: string): AgendaItem => ({ id, title: id, category: "personal", start: d(s), end: d(s), source: "shiftsync" });
  it("shifts first by start, then events, capped with +N more", () => {
    const items = [ev("e1", "2026-11-12T08:00"), shift("s2", "2026-11-12T14:00", "2026-11-12T18:00"), shift("s1", "2026-11-12T06:00", "2026-11-12T10:00"), ev("e2", "2026-11-12T09:00")];
    const r = monthCellItems(items, d("2026-11-12T12:00"), 3);
    expect(r.visible.map((x) => x.id)).toEqual(["s1", "s2", "e1"]);
    expect(r.more).toBe(1);
  });
  it("no overflow when within the limit", () => {
    expect(monthCellItems([ev("e1", "2026-11-12T08:00")], d("2026-11-12T12:00"), 4).more).toBe(0);
  });
});
