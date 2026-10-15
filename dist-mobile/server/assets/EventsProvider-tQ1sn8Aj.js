import { jsx } from "react/jsx-runtime";
import { useState, useCallback, useRef, useEffect, useMemo, createContext, useContext } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { b as createSsrRpc, u as useServerFn } from "./router-ZWedUCvR.js";
import { endOfDay, addDays, startOfDay, format } from "date-fns";
import { e as createServerFn } from "./server-CSqOYEWJ.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-D8rwVAN5.js";
import { s as supabase } from "./client-BPwvxkbN.js";
const CategorySchema = z.enum(["work", "business", "rest", "wellness", "exercise", "social", "family", "personal", "travel"]);
const ShiftTypeSchema = z.enum(["morning", "afternoon", "night", "oncall", "split", "side_hustle", "sick_leave", "annual_leave", "travel", "payday"]).nullable().optional();
const RecurrencePatternSchema = z.enum(["daily", "weekly", "fortnightly", "custom"]).nullable().optional();
const EventInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  category: CategorySchema,
  start: z.string(),
  end: z.string(),
  isAllDay: z.boolean().optional(),
  isPayday: z.boolean().optional(),
  shiftType: ShiftTypeSchema,
  shiftRole: z.string().max(120).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  notes: z.string().max(2e3).nullable().optional(),
  iconName: z.string().max(40).nullable().optional(),
  iconColor: z.string().max(20).nullable().optional(),
  splitFirstStart: z.string().nullable().optional(),
  splitFirstEnd: z.string().nullable().optional(),
  splitBreakMinutes: z.number().int().min(0).max(360).nullable().optional(),
  splitSecondStart: z.string().nullable().optional(),
  splitSecondEnd: z.string().nullable().optional(),
  travelDurationMinutes: z.number().int().min(0).max(2880).nullable().optional(),
  hourlyRate: z.number().nonnegative().nullable().optional(),
  recurrencePattern: RecurrencePatternSchema,
  recurrenceDays: z.array(z.string().max(3)).nullable().optional(),
  recurrenceEndDate: z.string().nullable().optional(),
  recurrenceExcludedDates: z.array(z.string().max(10)).nullable().optional()
});
const createEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventInputSchema.parse(input)).handler(createSsrRpc("850b627097bf0b9a66dd6b0113af2e6a737684efd40c87be36b923a4dc39a342"));
const updateEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventInputSchema.extend({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("19453eab75c2318d22fa9e1e0871ac94f0f96fabce5818bfcb66697aec37190e"));
const updateRecurrenceScope = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid(),
  mode: z.enum(["exclude_date", "end_before"]),
  date: z.string().min(8).max(10)
}).parse(input)).handler(createSsrRpc("71867065b469b357c86262e939a768ca13988c56d7d6958aef514f75df13c5da"));
const deleteEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("283032f1601f931ed9ccc7df9ec903a2b23ecdea2a8d5ff032cf36f717d315da"));
const scheduleShiftAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventId: z.string().uuid()
}).parse(input)).handler(createSsrRpc("c0484687fce5ff685c353df416c6724bb73eecef2e836566a81730f78da52a60"));
const cancelShiftAlert = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventId: z.string().uuid()
}).parse(input)).handler(createSsrRpc("a4a646b6f91873d1a06e19e447c94935e5375bd939177e60615e1e9baa1159dc"));
const QK = ["events"];
const EventsContext = createContext(null);
const EVENT_COLUMNS = "id,title,category,start_time,end_time,is_all_day,is_payday,shift_type,shift_role,location,notes,icon_name,icon_color,split_shift_first_start,split_shift_first_end,split_shift_break_duration,split_shift_second_start,split_shift_second_end,travel_duration_minutes,hourly_rate,calculated_earnings,is_recurring,recurrence_pattern,recurrence_days,recurrence_end_date,recurrence_excluded_dates,recurrence_group_id";
function rowsToDtos(data) {
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    start: row.start_time,
    end: row.end_time,
    isAllDay: row.is_all_day,
    isPayday: row.is_payday,
    shiftType: row.shift_type,
    shiftRole: row.shift_role,
    location: row.location,
    notes: row.notes,
    iconName: row.icon_name,
    iconColor: row.icon_color,
    splitFirstStart: row.split_shift_first_start,
    splitFirstEnd: row.split_shift_first_end,
    splitBreakMinutes: row.split_shift_break_duration,
    splitSecondStart: row.split_shift_second_start,
    splitSecondEnd: row.split_shift_second_end,
    travelDurationMinutes: row.travel_duration_minutes,
    hourlyRate: row.hourly_rate,
    calculatedEarnings: row.calculated_earnings,
    isRecurring: row.is_recurring,
    recurrencePattern: row.recurrence_pattern,
    recurrenceDays: row.recurrence_days,
    recurrenceEndDate: row.recurrence_end_date,
    recurrenceExcludedDates: row.recurrence_excluded_dates,
    recurrenceGroupId: row.recurrence_group_id
  }));
}
function queryEvents() {
  return supabase.from("events").select(EVENT_COLUMNS);
}
async function listEventsForCurrentUser(from, to) {
  const todayFrom = startOfDay(addDays(/* @__PURE__ */ new Date(), -7)).toISOString();
  const todayTo = endOfDay(addDays(/* @__PURE__ */ new Date(), 31)).toISOString();
  const recurringFloor = addDays(new Date(from < todayFrom ? from : todayFrom), -840).toISOString();
  const recurringCeiling = to > todayTo ? to : todayTo;
  const [overlapping, current, recurring] = await Promise.all([
    queryEvents().lt("start_time", to).gt("end_time", from).order("start_time", { ascending: true }),
    queryEvents().lt("start_time", todayTo).gt("end_time", todayFrom).order("start_time", { ascending: true }),
    queryEvents().eq("is_recurring", true).gte("start_time", recurringFloor).lte("start_time", recurringCeiling).order("start_time", { ascending: true })
  ]);
  if (overlapping.error) throw new Error(overlapping.error.message);
  if (current.error) throw new Error(current.error.message);
  if (recurring.error) throw new Error(recurring.error.message);
  const byId = /* @__PURE__ */ new Map();
  for (const dto of [
    ...rowsToDtos(overlapping.data),
    ...rowsToDtos(current.data),
    ...rowsToDtos(recurring.data)
  ]) {
    byId.set(dto.id, dto);
  }
  return [...byId.values()].sort((a, b) => a.start.localeCompare(b.start));
}
async function listAllEventsForCurrentUser() {
  const { data, error } = await queryEvents().order("start_time", { ascending: true });
  if (error) throw new Error(error.message);
  return rowsToDtos(data);
}
function dtoToCalendarEvent(d) {
  const hasShift = d.category === "work" && (d.shiftType || d.shiftRole || d.location || d.splitFirstStart);
  return {
    id: d.id,
    title: d.title,
    category: d.category,
    start: d.start,
    end: d.end,
    allDay: d.isAllDay,
    iconName: d.iconName ?? void 0,
    iconColor: d.iconColor ?? void 0,
    notes: d.notes ?? void 0,
    isPayday: d.isPayday,
    shift: hasShift ? {
      // shift_type is null for custom templates — fall back to "custom"
      // (NOT "morning") so the UI keeps the template's icon/colour.
      shiftType: d.shiftType ?? "custom",
      role: d.shiftRole ?? "",
      location: d.location ?? "",
      customLabel: d.shiftType ? void 0 : d.shiftRole ?? void 0,
      split: d.splitFirstStart && d.splitFirstEnd && d.splitSecondStart && d.splitSecondEnd ? {
        firstStart: d.splitFirstStart.slice(0, 5),
        firstEnd: d.splitFirstEnd.slice(0, 5),
        breakMinutes: d.splitBreakMinutes ?? 60,
        secondStart: d.splitSecondStart.slice(0, 5),
        secondEnd: d.splitSecondEnd.slice(0, 5)
      } : void 0
    } : void 0,
    recurrencePattern: d.recurrencePattern ?? null,
    recurrenceDays: d.recurrenceDays ?? null,
    recurrenceEndDate: d.recurrenceEndDate ?? null,
    recurrenceExcludedDates: d.recurrenceExcludedDates ?? null,
    createdAt: d.start,
    updatedAt: d.start
  };
}
function draftToInput(draft) {
  const isWork = draft.category === "work";
  const shift = isWork ? draft.shift : void 0;
  const shiftTypeForDb = shift?.shiftType === "custom" ? null : shift?.shiftType ?? null;
  const roleForDb = shift?.shiftType === "custom" ? shift.customLabel || shift.role || null : shift?.role || null;
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
    recurrenceExcludedDates: draft.recurrenceExcludedDates ?? null
  };
}
const MAX_RECURRING_OCCURRENCES = 60;
function baseEventId(id) {
  const i = id.indexOf("::rec-");
  return i === -1 ? id : id.slice(0, i);
}
const WEEKDAY_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6
};
function expandRecurring(base) {
  const pattern = base.recurrencePattern;
  if (!pattern) return [base];
  const startDate = new Date(base.start);
  const endDate = new Date(base.end);
  const durationMs = endDate.getTime() - startDate.getTime();
  const endLimit = base.recurrenceEndDate ? /* @__PURE__ */ new Date(`${base.recurrenceEndDate}T23:59:59`) : addDays(startDate, 365);
  const out = [];
  const excluded = new Set(base.recurrenceExcludedDates ?? []);
  const pushAt = (d, idx) => {
    const s = new Date(d);
    if (excluded.has(format(s, "yyyy-MM-dd"))) return;
    const e = new Date(s.getTime() + durationMs);
    out.push(
      idx === 0 ? { ...base, start: s.toISOString(), end: e.toISOString() } : {
        ...base,
        id: `${base.id}::rec-${idx}`,
        start: s.toISOString(),
        end: e.toISOString()
      }
    );
  };
  if (pattern === "daily") {
    for (let i = 0; i < MAX_RECURRING_OCCURRENCES; i++) {
      const d = addDays(startDate, i);
      if (d > endLimit) break;
      pushAt(d, i);
    }
  } else if (pattern === "weekly") {
    for (let i = 0; i < MAX_RECURRING_OCCURRENCES; i++) {
      const d = addDays(startDate, i * 7);
      if (d > endLimit) break;
      pushAt(d, i);
    }
  } else if (pattern === "fortnightly") {
    for (let i = 0; i < MAX_RECURRING_OCCURRENCES; i++) {
      const d = addDays(startDate, i * 14);
      if (d > endLimit) break;
      pushAt(d, i);
    }
  } else if (pattern === "custom") {
    const days = new Set(
      (base.recurrenceDays ?? []).map((k) => WEEKDAY_INDEX[k]).filter((n) => n != null)
    );
    if (days.size === 0) return [base];
    let count = 0;
    let idx = 0;
    for (let offset = 0; count < MAX_RECURRING_OCCURRENCES; offset++) {
      const d = addDays(startDate, offset);
      if (d > endLimit) break;
      if (!days.has(d.getDay())) continue;
      pushAt(d, idx);
      idx++;
      count++;
    }
  }
  return out;
}
function EventsProvider({ children }) {
  const queryClient = useQueryClient();
  const create = useServerFn(createEvent);
  const update = useServerFn(updateEvent);
  const remove = useServerFn(deleteEvent);
  const updateRecurrenceScope$1 = useServerFn(updateRecurrenceScope);
  const scheduleAlert = useServerFn(scheduleShiftAlert);
  const cancelAlert = useServerFn(cancelShiftAlert);
  const [range, setRange] = useState(() => ({
    from: startOfDay(addDays(/* @__PURE__ */ new Date(), -31)).toISOString(),
    to: endOfDay(addDays(/* @__PURE__ */ new Date(), 180)).toISOString()
  }));
  const setVisibleRange = useCallback((from, to) => {
    const next = {
      from: startOfDay(from).toISOString(),
      to: endOfDay(to).toISOString()
    };
    setRange(
      (current) => current.from === next.from && current.to === next.to ? current : next
    );
  }, []);
  const { data, isLoading, error, status } = useQuery({
    queryKey: [...QK, range.from, range.to],
    // Reads can safely use the authenticated browser client: RLS still limits
    // results to the signed-in user, and this avoids cross-origin serverFn
    // transport differences in Capacitor WebViews.
    queryFn: () => listEventsForCurrentUser(range.from, range.to),
    // Keep the previous month's rows on screen while the next range loads so
    // moving between months never blanks the calendar.
    placeholderData: (previous) => previous
  });
  const seenEventsRef = useRef(false);
  if ((data?.length ?? 0) > 0) seenEventsRef.current = true;
  const hasAnyEvents = seenEventsRef.current;
  useEffect(() => {
    console.info(
      "[events] status",
      status,
      "count",
      data?.length,
      "error",
      error instanceof Error ? error.message : error
    );
  }, [status, data, error]);
  const events = useMemo(
    () => {
      const todayFrom = startOfDay(addDays(/* @__PURE__ */ new Date(), -7)).toISOString();
      const todayTo = endOfDay(addDays(/* @__PURE__ */ new Date(), 31)).toISOString();
      return (data ?? []).map(dtoToCalendarEvent).flatMap(expandRecurring).filter(
        (event) => event.start < range.to && event.end > range.from || event.start < todayTo && event.end > todayFrom
      );
    },
    [data, range]
  );
  const createMut = useMutation({
    mutationFn: async (draft) => {
      const dto = await create({ data: draftToInput(draft) });
      if (dto.category === "work") {
        scheduleAlert({ data: { eventId: dto.id } }).catch(
          (e) => console.warn("scheduleShiftAlert failed", e)
        );
      }
      return dto;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK })
  });
  const updateMut = useMutation({
    mutationFn: async (args) => {
      const existing = events.find((e) => e.id === args.id);
      if (!existing) throw new Error("Event not found");
      const merged = { ...existing, ...args.patch };
      const realId = baseEventId(args.id);
      const dto = await update({ data: { id: realId, ...draftToInput(merged) } });
      if (dto.category === "work") {
        scheduleAlert({ data: { eventId: dto.id } }).catch(
          (e) => console.warn("scheduleShiftAlert failed", e)
        );
      } else {
        cancelAlert({ data: { eventId: dto.id } }).catch(() => void 0);
      }
      return dto;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK })
  });
  const deleteMut = useMutation({
    mutationFn: async (id) => {
      const realId = baseEventId(id);
      cancelAlert({ data: { eventId: realId } }).catch(() => void 0);
      return remove({ data: { id: realId } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK })
  });
  const value = {
    events,
    isLoading,
    hasAnyEvents,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
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
    deleteRecurringEvent: async (id, mode) => {
      const occurrence = events.find((e) => e.id === id);
      if (!occurrence) throw new Error("Event not found");
      const realId = baseEventId(id);
      if (mode === "all") {
        await deleteMut.mutateAsync(id);
        return;
      }
      const isFirstOccurrence = !id.includes("::rec-");
      if (mode === "future" && isFirstOccurrence) {
        await deleteMut.mutateAsync(id);
        return;
      }
      const occDate = format(new Date(occurrence.start), "yyyy-MM-dd");
      if (mode === "single") {
        await updateRecurrenceScope$1({
          data: { id: realId, mode: "exclude_date", date: occDate }
        });
      } else {
        const endDate = format(
          addDays(new Date(occurrence.start), -1),
          "yyyy-MM-dd"
        );
        await updateRecurrenceScope$1({
          data: { id: realId, mode: "end_before", date: endDate }
        });
      }
      queryClient.invalidateQueries({ queryKey: QK });
    },
    getEvent: (id) => events.find((e) => e.id === id),
    setVisibleRange,
    loadAllEvents: async () => (await listAllEventsForCurrentUser()).map(dtoToCalendarEvent).flatMap(expandRecurring)
  };
  return /* @__PURE__ */ jsx(EventsContext.Provider, { value, children });
}
function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
export {
  EventsProvider as E,
  useEvents as u
};
