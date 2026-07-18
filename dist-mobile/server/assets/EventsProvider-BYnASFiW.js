import { jsx } from "react/jsx-runtime";
import { useMemo, createContext, useContext } from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { b as createSsrRpc, u as useServerFn } from "./router-BND-OwId.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DFGJyMRd.js";
import { e as createServerFn } from "./server-DjzWdpJV.js";
const CategorySchema = z.enum(["work", "rest", "wellness", "exercise", "social", "family", "personal", "travel"]);
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
  recurrenceEndDate: z.string().nullable().optional()
});
const listEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c6c3050e76f6a3dfc8d5d2ac54e072621bfa1f2f6d5d769b0049bda3381525f9"));
const createEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventInputSchema.parse(input)).handler(createSsrRpc("850b627097bf0b9a66dd6b0113af2e6a737684efd40c87be36b923a4dc39a342"));
const updateEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventInputSchema.extend({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("19453eab75c2318d22fa9e1e0871ac94f0f96fabce5818bfcb66697aec37190e"));
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
    recurrenceEndDate: draft.recurrenceEndDate ?? null
  };
}
function EventsProvider({ children }) {
  const queryClient = useQueryClient();
  const list = useServerFn(listEvents);
  const create = useServerFn(createEvent);
  const update = useServerFn(updateEvent);
  const remove = useServerFn(deleteEvent);
  const scheduleAlert = useServerFn(scheduleShiftAlert);
  const cancelAlert = useServerFn(cancelShiftAlert);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: QK,
    queryFn: () => list()
  });
  const events = useMemo(() => (data ?? []).map(dtoToCalendarEvent), [data]);
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
      const dto = await update({ data: { id: args.id, ...draftToInput(merged) } });
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
      cancelAlert({ data: { eventId: id } }).catch(() => void 0);
      return remove({ data: { id } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK })
  });
  const value = {
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
    getEvent: (id) => events.find((e) => e.id === id)
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
