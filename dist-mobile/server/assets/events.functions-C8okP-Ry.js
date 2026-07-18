import { c as createServerRpc } from "./createServerRpc-CnQPTA-J.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DFGJyMRd.js";
import { e as createServerFn } from "./server-DjzWdpJV.js";
import "@supabase/supabase-js";
import "./createMiddleware-BvN2ghIY.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
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
const ROW_COLS = "id,title,category,start_time,end_time,is_all_day,is_payday,shift_type,shift_role,location,notes,icon_name,icon_color,split_shift_first_start,split_shift_first_end,split_shift_break_duration,split_shift_second_start,split_shift_second_end,travel_duration_minutes,hourly_rate,calculated_earnings,is_recurring,recurrence_pattern,recurrence_days,recurrence_end_date,recurrence_group_id";
function rowToDTO(r) {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    start: r.start_time,
    end: r.end_time,
    isAllDay: r.is_all_day,
    isPayday: r.is_payday,
    shiftType: r.shift_type,
    shiftRole: r.shift_role,
    location: r.location,
    notes: r.notes,
    iconName: r.icon_name,
    iconColor: r.icon_color,
    splitFirstStart: r.split_shift_first_start,
    splitFirstEnd: r.split_shift_first_end,
    splitBreakMinutes: r.split_shift_break_duration,
    splitSecondStart: r.split_shift_second_start,
    splitSecondEnd: r.split_shift_second_end,
    travelDurationMinutes: r.travel_duration_minutes,
    hourlyRate: r.hourly_rate,
    calculatedEarnings: r.calculated_earnings,
    isRecurring: r.is_recurring,
    recurrencePattern: r.recurrence_pattern,
    recurrenceDays: r.recurrence_days,
    recurrenceEndDate: r.recurrence_end_date,
    recurrenceGroupId: r.recurrence_group_id
  };
}
function computeEarnings(category, startISO, endISO, splitBreakMin, rate) {
  if (category !== "work" || rate == null) return null;
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  const hours = Math.max(0, ms / 36e5 - (splitBreakMin ?? 0) / 60);
  return Math.round(hours * rate * 100) / 100;
}
function inputToInsert(data, userId) {
  return {
    user_id: userId,
    title: data.title,
    category: data.category,
    start_time: data.start,
    end_time: data.end,
    is_all_day: data.isAllDay ?? false,
    is_payday: data.isPayday ?? false,
    shift_type: data.shiftType ?? null,
    shift_role: data.shiftRole ?? null,
    location: data.location ?? null,
    notes: data.notes ?? null,
    icon_name: data.iconName ?? null,
    icon_color: data.iconColor ?? null,
    split_shift_first_start: data.splitFirstStart ?? null,
    split_shift_first_end: data.splitFirstEnd ?? null,
    split_shift_break_duration: data.splitBreakMinutes ?? null,
    split_shift_second_start: data.splitSecondStart ?? null,
    split_shift_second_end: data.splitSecondEnd ?? null,
    travel_duration_minutes: data.travelDurationMinutes ?? null,
    hourly_rate: data.hourlyRate ?? null,
    calculated_earnings: computeEarnings(data.category, data.start, data.end, data.splitBreakMinutes, data.hourlyRate),
    is_recurring: !!data.recurrencePattern,
    recurrence_pattern: data.recurrencePattern ?? null,
    recurrence_days: data.recurrenceDays ?? null,
    recurrence_end_date: data.recurrenceEndDate ?? null
  };
}
const listEvents_createServerFn_handler = createServerRpc({
  id: "c6c3050e76f6a3dfc8d5d2ac54e072621bfa1f2f6d5d769b0049bda3381525f9",
  name: "listEvents",
  filename: "src/lib/events.functions.ts"
}, (opts) => listEvents.__executeServer(opts));
const listEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listEvents_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("events").select(ROW_COLS).order("start_time", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToDTO);
});
const createEvent_createServerFn_handler = createServerRpc({
  id: "850b627097bf0b9a66dd6b0113af2e6a737684efd40c87be36b923a4dc39a342",
  name: "createEvent",
  filename: "src/lib/events.functions.ts"
}, (opts) => createEvent.__executeServer(opts));
const createEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventInputSchema.parse(input)).handler(createEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: row,
    error
  } = await supabase.from("events").insert(inputToInsert(data, userId)).select(ROW_COLS).single();
  if (error || !row) throw new Error(error?.message ?? "Failed to create event");
  return rowToDTO(row);
});
const updateEvent_createServerFn_handler = createServerRpc({
  id: "19453eab75c2318d22fa9e1e0871ac94f0f96fabce5818bfcb66697aec37190e",
  name: "updateEvent",
  filename: "src/lib/events.functions.ts"
}, (opts) => updateEvent.__executeServer(opts));
const updateEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => EventInputSchema.extend({
  id: z.string().uuid()
}).parse(input)).handler(updateEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    id: _id,
    ...rest
  } = data;
  const insert = inputToInsert(rest, userId);
  const {
    user_id: _u,
    ...patch
  } = insert;
  const {
    data: row,
    error
  } = await supabase.from("events").update(patch).eq("id", data.id).select(ROW_COLS).single();
  if (error || !row) throw new Error(error?.message ?? "Failed to update event");
  return rowToDTO(row);
});
const deleteEvent_createServerFn_handler = createServerRpc({
  id: "283032f1601f931ed9ccc7df9ec903a2b23ecdea2a8d5ff032cf36f717d315da",
  name: "deleteEvent",
  filename: "src/lib/events.functions.ts"
}, (opts) => deleteEvent.__executeServer(opts));
const deleteEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("events").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  createEvent_createServerFn_handler,
  deleteEvent_createServerFn_handler,
  listEvents_createServerFn_handler,
  updateEvent_createServerFn_handler
};
