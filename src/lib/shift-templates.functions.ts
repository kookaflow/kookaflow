import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CategorySchema = z.enum(["working", "leave", "non_working"]);

const TemplateInputSchema = z.object({
  name: z.string().min(1).max(12),
  colour: z.string().min(1).max(20),
  icon_name: z.string().max(40).nullable().optional(),
  default_start: z.string().nullable().optional(),
  default_end: z.string().nullable().optional(),
  category: CategorySchema,
  base_type: z.string().max(40).nullable().optional(),
  sort_order: z.number().int().optional(),
});

export type ShiftTemplateDTO = {
  id: string;
  name: string;
  colour: string;
  iconName: string | null;
  defaultStart: string | null;
  defaultEnd: string | null;
  category: "working" | "leave" | "non_working";
  baseType: string | null;
  sortOrder: number;
};

const COLS =
  "id,name,colour,icon_name,default_start,default_end,category,base_type,sort_order";

type Row = {
  id: string;
  name: string;
  colour: string;
  icon_name: string | null;
  default_start: string | null;
  default_end: string | null;
  category: ShiftTemplateDTO["category"];
  base_type: string | null;
  sort_order: number;
};

function rowToDTO(r: Row): ShiftTemplateDTO {
  return {
    id: r.id,
    name: r.name,
    colour: r.colour,
    iconName: r.icon_name,
    defaultStart: r.default_start,
    defaultEnd: r.default_end,
    category: r.category,
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