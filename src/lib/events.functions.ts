import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CategorySchema = z.enum([
  "work",
  "rest",
  "wellness",
  "exercise",
  "social",
  "family",
  "personal",
  "travel",
]);

const ShiftTypeSchema = z
  .enum([
    "morning",
    "afternoon",
    "night",
    "oncall",
    "split",
    "sick_leave",
    "annual_leave",
    "travel",
    "payday",
  ])
  .nullable()
  .optional();

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
  notes: z.string().max(2000).nullable().optional(),
  iconName: z.string().max(40).nullable().optional(),
  iconGradient: z.string().max(20).nullable().optional(),
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
});

export type EventDTO = {
  id: string;
  title: string;
  category: z.infer<typeof CategorySchema>;
  start: string;
  end: string;
  isAllDay: boolean;
  isPayday: boolean;
  shiftType: z.infer<typeof ShiftTypeSchema>;
  shiftRole: string | null;
  location: string | null;
  notes: string | null;
  iconName: string | null;
  iconGradient: string | null;
  splitFirstStart: string | null;
  splitFirstEnd: string | null;
  splitBreakMinutes: number | null;
  splitSecondStart: string | null;
  splitSecondEnd: string | null;
  travelDurationMinutes: number | null;
  hourlyRate: number | null;
  calculatedEarnings: number | null;
  isRecurring: boolean;
  recurrencePattern: string | null;
  recurrenceDays: string[] | null;
  recurrenceEndDate: string | null;
  recurrenceGroupId: string | null;
};

const ROW_COLS =
  "id,title,category,start_time,end_time,is_all_day,is_payday,shift_type,shift_role,location,notes,icon_name,icon_gradient,split_shift_first_start,split_shift_first_end,split_shift_break_duration,split_shift_second_start,split_shift_second_end,travel_duration_minutes,hourly_rate,calculated_earnings,is_recurring,recurrence_pattern,recurrence_days,recurrence_end_date,recurrence_group_id";

type EventRow = {
  id: string;
  title: string;
  category: string;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  is_payday: boolean;
  shift_type: string | null;
  shift_role: string | null;
  location: string | null;
  notes: string | null;
  icon_name: string | null;
  icon_gradient: string | null;
  split_shift_first_start: string | null;
  split_shift_first_end: string | null;
  split_shift_break_duration: number | null;
  split_shift_second_start: string | null;
  split_shift_second_end: string | null;
  travel_duration_minutes: number | null;
  hourly_rate: number | null;
  calculated_earnings: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_days: string[] | null;
  recurrence_end_date: string | null;
  recurrence_group_id: string | null;
};

function rowToDTO(r: EventRow): EventDTO {
  return {
    id: r.id,
    title: r.title,
    category: r.category as EventDTO["category"],
    start: r.start_time,
    end: r.end_time,
    isAllDay: r.is_all_day,
    isPayday: r.is_payday,
    shiftType: r.shift_type as EventDTO["shiftType"],
    shiftRole: r.shift_role,
    location: r.location,
    notes: r.notes,
    iconName: r.icon_name,
    iconGradient: r.icon_gradient,
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
    recurrenceGroupId: r.recurrence_group_id,
  };
}

function computeEarnings(
  category: string,
  startISO: string,
  endISO: string,
  splitBreakMin: number | null | undefined,
  rate: number | null | undefined,
): number | null {
  if (category !== "work" || rate == null) return null;
  const ms = new Date(endISO).getTime() - new Date(startISO).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  const hours = Math.max(0, ms / 3_600_000 - (splitBreakMin ?? 0) / 60);
  return Math.round(hours * rate * 100) / 100;
}

function inputToInsert(data: z.infer<typeof EventInputSchema>, userId: string) {
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
    icon_gradient: data.iconGradient ?? null,
    split_shift_first_start: data.splitFirstStart ?? null,
    split_shift_first_end: data.splitFirstEnd ?? null,
    split_shift_break_duration: data.splitBreakMinutes ?? null,
    split_shift_second_start: data.splitSecondStart ?? null,
    split_shift_second_end: data.splitSecondEnd ?? null,
    travel_duration_minutes: data.travelDurationMinutes ?? null,
    hourly_rate: data.hourlyRate ?? null,
    calculated_earnings: computeEarnings(
      data.category,
      data.start,
      data.end,
      data.splitBreakMinutes,
      data.hourlyRate,
    ),
    is_recurring: !!data.recurrencePattern,
    recurrence_pattern: data.recurrencePattern ?? null,
    recurrence_days: data.recurrenceDays ?? null,
    recurrence_end_date: data.recurrenceEndDate ?? null,
  };
}

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("events")
      .select(ROW_COLS)
      .order("start_time", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as EventRow[]).map(rowToDTO);
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EventInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("events")
      .insert(inputToInsert(data, userId))
      .select(ROW_COLS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to create event");
    return rowToDTO(row as unknown as EventRow);
  });

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    EventInputSchema.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { id: _id, ...rest } = data;
    void _id;
    const insert = inputToInsert(rest, userId);
    const { user_id: _u, ...patch } = insert;
    void _u;
    const { data: row, error } = await supabase
      .from("events")
      .update(patch)
      .eq("id", data.id)
      .select(ROW_COLS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to update event");
    return rowToDTO(row as unknown as EventRow);
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });