import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CategorySchema = z.enum(["work", "rest", "wellness", "exercise", "social", "family", "personal"]);
const ShiftTypeSchema = z.enum(["morning", "afternoon", "night", "oncall"]).nullable().optional();
const RecurrenceSchema = z
  .union([
    z.object({ kind: z.literal("none") }),
    z.object({ kind: z.literal("daily") }),
    z.object({ kind: z.literal("weekly") }),
    z.object({ kind: z.literal("fortnightly") }),
    z.object({ kind: z.literal("custom"), days: z.array(z.number().int().min(0).max(6)) }),
  ])
  .default({ kind: "none" });

const EventInputSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  category: CategorySchema,
  start: z.string(), // ISO
  end: z.string(), // ISO
  shiftType: ShiftTypeSchema,
  location: z.string().max(200).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  iconName: z.string().max(40).nullable().optional(),
  recurrence: RecurrenceSchema.optional(),
});

export type EventDTO = {
  id: string;
  title: string;
  category: z.infer<typeof CategorySchema>;
  start: string;
  end: string;
  shiftType: z.infer<typeof ShiftTypeSchema>;
  location: string | null;
  notes: string | null;
  iconName: string | null;
  recurrence: z.infer<typeof RecurrenceSchema>;
};

function rowToDTO(r: {
  id: string;
  title: string;
  category: string;
  starts_at: string;
  ends_at: string;
  shift_type: string | null;
  location: string | null;
  notes: string | null;
  icon_name: string | null;
  recurrence: unknown;
}): EventDTO {
  return {
    id: r.id,
    title: r.title,
    category: r.category as EventDTO["category"],
    start: r.starts_at,
    end: r.ends_at,
    shiftType: (r.shift_type ?? null) as EventDTO["shiftType"],
    location: r.location,
    notes: r.notes,
    iconName: r.icon_name,
    recurrence: (r.recurrence ?? { kind: "none" }) as EventDTO["recurrence"],
  };
}

export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("events")
      .select("id,title,category,starts_at,ends_at,shift_type,location,notes,icon_name,recurrence")
      .order("starts_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(rowToDTO);
  });

export const createEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => EventInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("events")
      .insert({
        user_id: userId,
        title: data.title,
        category: data.category,
        starts_at: data.start,
        ends_at: data.end,
        shift_type: data.shiftType ?? null,
        location: data.location ?? null,
        notes: data.notes ?? null,
        icon_name: data.iconName ?? null,
        recurrence: data.recurrence ?? { kind: "none" },
      })
      .select("id,title,category,starts_at,ends_at,shift_type,location,notes,icon_name,recurrence")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to create event");
    return rowToDTO(row);
  });

export const updateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    EventInputSchema.extend({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("events")
      .update({
        title: data.title,
        category: data.category,
        starts_at: data.start,
        ends_at: data.end,
        shift_type: data.shiftType ?? null,
        location: data.location ?? null,
        notes: data.notes ?? null,
        icon_name: data.iconName ?? null,
        recurrence: data.recurrence ?? { kind: "none" },
      })
      .eq("id", data.id)
      .select("id,title,category,starts_at,ends_at,shift_type,location,notes,icon_name,recurrence")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed to update event");
    return rowToDTO(row);
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