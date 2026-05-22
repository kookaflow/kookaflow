import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CategorySchema = z.enum(["working", "leave", "non_working"]);
const LifeCategorySchema = z.enum([
  "work","rest","wellness","exercise","social","family","personal","travel",
]);

const TemplateInputSchema = z.object({
  name: z.string().min(1).max(20),
  show_as: z.string().max(6).nullable().optional(),
  colour: z.string().min(1).max(20),
  icon_name: z.string().max(40).nullable().optional(),
  default_start: z.string().nullable().optional(),
  default_end: z.string().nullable().optional(),
  category: CategorySchema,
  life_category: LifeCategorySchema.optional(),
  is_all_day: z.boolean().optional(),
  is_split_shift: z.boolean().optional(),
  is_24_hour: z.boolean().optional(),
  unpaid_break_minutes: z.number().int().min(0).max(720).optional(),
  paid_break_minutes: z.number().int().min(0).max(720).optional(),
  split_start_2: z.string().nullable().optional(),
  split_end_2: z.string().nullable().optional(),
  is_active: z.boolean().optional(),
  base_type: z.string().max(40).nullable().optional(),
  sort_order: z.number().int().optional(),
});

export type ShiftTemplateDTO = {
  id: string;
  name: string;
  showAs: string | null;
  colour: string;
  iconName: string | null;
  defaultStart: string | null;
  defaultEnd: string | null;
  category: "working" | "leave" | "non_working";
  lifeCategory: "work" | "rest" | "wellness" | "exercise" | "social" | "family" | "personal" | "travel";
  isAllDay: boolean;
  isSplitShift: boolean;
  is24Hour: boolean;
  totalHours: number | null;
  unpaidBreakMinutes: number;
  paidBreakMinutes: number;
  splitStart2: string | null;
  splitEnd2: string | null;
  isActive: boolean;
  baseType: string | null;
  sortOrder: number;
};

const COLS =
  "id,name,show_as,colour,icon_name,default_start,default_end,category,life_category,is_all_day,is_split_shift,is_24_hour,total_hours,unpaid_break_minutes,paid_break_minutes,split_start_2,split_end_2,is_active,base_type,sort_order";

type Row = {
  id: string;
  name: string;
  show_as: string | null;
  colour: string;
  icon_name: string | null;
  default_start: string | null;
  default_end: string | null;
  category: ShiftTemplateDTO["category"];
  life_category: ShiftTemplateDTO["lifeCategory"];
  is_all_day: boolean;
  is_split_shift: boolean;
  is_24_hour: boolean;
  total_hours: number | string | null;
  unpaid_break_minutes: number;
  paid_break_minutes: number;
  split_start_2: string | null;
  split_end_2: string | null;
  is_active: boolean;
  base_type: string | null;
  sort_order: number;
};

function rowToDTO(r: Row): ShiftTemplateDTO {
  return {
    id: r.id,
    name: r.name,
    showAs: r.show_as,
    colour: r.colour,
    iconName: r.icon_name,
    defaultStart: r.default_start,
    defaultEnd: r.default_end,
    category: r.category,
    lifeCategory: r.life_category ?? "work",
    isAllDay: r.is_all_day ?? false,
    isSplitShift: r.is_split_shift ?? false,
    is24Hour: r.is_24_hour ?? false,
    totalHours: r.total_hours == null ? null : Number(r.total_hours),
    unpaidBreakMinutes: r.unpaid_break_minutes ?? 0,
    paidBreakMinutes: r.paid_break_minutes ?? 0,
    splitStart2: r.split_start_2,
    splitEnd2: r.split_end_2,
    isActive: r.is_active ?? true,
    baseType: r.base_type,
    sortOrder: r.sort_order,
  };
}

export const listShiftTemplates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("shift_templates")
      .select(COLS)
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return ((data ?? []) as unknown as Row[]).map(rowToDTO);
  });

export const createShiftTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TemplateInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("shift_templates")
      .insert({ ...data, user_id: userId })
      .select(COLS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed");
    return rowToDTO(row as unknown as Row);
  });

export const updateShiftTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    TemplateInputSchema.extend({ id: z.string().uuid() }).partial({
      name: true,
      colour: true,
      category: true,
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...patch } = data;
    const { data: row, error } = await supabase
      .from("shift_templates")
      .update(patch)
      .eq("id", id)
      .select(COLS)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Failed");
    return rowToDTO(row as unknown as Row);
  });

export const deleteShiftTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("shift_templates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });