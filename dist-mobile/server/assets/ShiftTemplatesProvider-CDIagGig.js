import { jsx } from "react/jsx-runtime";
import { useContext, createContext } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { b as createSsrRpc, u as useServerFn } from "./router-CfW6Ca5m.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
import { e as createServerFn } from "./server-CYeycCdn.js";
const CategorySchema = z.enum(["working", "leave", "non_working"]);
const TemplateInputSchema = z.object({
  name: z.string().min(1).max(12),
  colour: z.string().min(1).max(20),
  icon_name: z.string().max(40).nullable().optional(),
  default_start: z.string().nullable().optional(),
  default_end: z.string().nullable().optional(),
  category: CategorySchema,
  base_type: z.string().max(40).nullable().optional(),
  sort_order: z.number().int().optional()
});
const listShiftTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("44aaff6057149a09bd239229677952f547186adaaf351b0f2d051a1e113e9f9d"));
const createShiftTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => TemplateInputSchema.parse(input)).handler(createSsrRpc("4fca03e7e29aca2880c985032e2a86ae13a62a8d017549aeb4a282509bd2fe89"));
const updateShiftTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => TemplateInputSchema.extend({
  id: z.string().uuid()
}).partial({
  name: true,
  colour: true,
  category: true
}).parse(input)).handler(createSsrRpc("0e59f6ab8b3faa6c34050f05cbef679c5125e8ebb5d431408f25cbbb8f0191f0"));
const deleteShiftTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(createSsrRpc("6b6dbf3b746695907f62e587af5acb939c0eb189db0b63eb4bc5945a9df88a09"));
const QK = ["shift_templates"];
const C = createContext(null);
function toInput(t) {
  return {
    name: t.name,
    colour: t.colour,
    icon_name: t.iconName ?? null,
    default_start: t.defaultStart ?? null,
    default_end: t.defaultEnd ?? null,
    category: t.category,
    base_type: t.baseType ?? null,
    sort_order: t.sortOrder ?? 0
  };
}
function ShiftTemplatesProvider({ children }) {
  const qc = useQueryClient();
  const list = useServerFn(listShiftTemplates);
  const create = useServerFn(createShiftTemplate);
  const update = useServerFn(updateShiftTemplate);
  const remove = useServerFn(deleteShiftTemplate);
  const { data, isLoading } = useQuery({
    queryKey: QK,
    queryFn: () => list(),
    initialData: []
  });
  const value = {
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
    }
  };
  return /* @__PURE__ */ jsx(C.Provider, { value, children });
}
function useShiftTemplates() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useShiftTemplates must be used in ShiftTemplatesProvider");
  return ctx;
}
export {
  ShiftTemplatesProvider as S,
  useShiftTemplates as u
};
