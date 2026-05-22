import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listShiftTemplates,
  createShiftTemplate,
  updateShiftTemplate,
  deleteShiftTemplate,
  type ShiftTemplateDTO,
} from "@/lib/shift-templates.functions";

const QK = ["shift_templates"] as const;

interface Ctx {
  templates: ShiftTemplateDTO[];
  isLoading: boolean;
  create: (
    input: Omit<ShiftTemplateDTO, "id" | "sortOrder"> & { sortOrder?: number },
  ) => Promise<ShiftTemplateDTO>;
  update: (id: string, patch: Partial<Omit<ShiftTemplateDTO, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const C = createContext<Ctx | null>(null);

function toInput(t: Partial<ShiftTemplateDTO>) {
  return {
    name: t.name!,
    show_as: t.showAs ?? null,
    colour: t.colour!,
    icon_name: t.iconName ?? null,
    default_start: t.defaultStart ?? null,
    default_end: t.defaultEnd ?? null,
    category: t.category!,
    life_category: t.lifeCategory ?? "work",
    is_all_day: t.isAllDay ?? false,
    is_split_shift: t.isSplitShift ?? false,
    is_24_hour: t.is24Hour ?? false,
    unpaid_break_minutes: t.unpaidBreakMinutes ?? 0,
    paid_break_minutes: t.paidBreakMinutes ?? 0,
    split_start_2: t.splitStart2 ?? null,
    split_end_2: t.splitEnd2 ?? null,
    is_active: t.isActive ?? true,
    base_type: t.baseType ?? null,
    sort_order: t.sortOrder ?? 0,
  };
}

export function ShiftTemplatesProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const list = useServerFn(listShiftTemplates);
  const create = useServerFn(createShiftTemplate);
  const update = useServerFn(updateShiftTemplate);
  const remove = useServerFn(deleteShiftTemplate);

  const { data, isLoading } = useQuery({
    queryKey: QK,
    queryFn: () => list(),
    initialData: [] as ShiftTemplateDTO[],
  });

  const value: Ctx = {
    templates: data ?? [],
    isLoading,
    create: async (input) => {
      const r = await create({ data: toInput(input) });
      qc.invalidateQueries({ queryKey: QK });
      return r;
    },
    update: async (id, patch) => {
      await update({ data: { id, ...toInput({ ...patch }) } });
      qc.invalidateQueries({ queryKey: QK });
    },
    remove: async (id) => {
      await remove({ data: { id } });
      qc.invalidateQueries({ queryKey: QK });
    },
  };

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useShiftTemplates() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useShiftTemplates must be used in ShiftTemplatesProvider");
  return ctx;
}