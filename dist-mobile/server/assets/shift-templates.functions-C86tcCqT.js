import { c as createServerRpc } from "./createServerRpc-ywx44k3B.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
import { e as createServerFn } from "./server-CYeycCdn.js";
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
const COLS = "id,name,colour,icon_name,default_start,default_end,category,base_type,sort_order";
function rowToDTO(r) {
  return {
    id: r.id,
    name: r.name,
    colour: r.colour,
    iconName: r.icon_name,
    defaultStart: r.default_start,
    defaultEnd: r.default_end,
    category: r.category,
    baseType: r.base_type,
    sortOrder: r.sort_order
  };
}
const listShiftTemplates_createServerFn_handler = createServerRpc({
  id: "44aaff6057149a09bd239229677952f547186adaaf351b0f2d051a1e113e9f9d",
  name: "listShiftTemplates",
  filename: "src/lib/shift-templates.functions.ts"
}, (opts) => listShiftTemplates.__executeServer(opts));
const listShiftTemplates = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listShiftTemplates_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data,
    error
  } = await supabase.from("shift_templates").select(COLS).order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToDTO);
});
const createShiftTemplate_createServerFn_handler = createServerRpc({
  id: "4fca03e7e29aca2880c985032e2a86ae13a62a8d017549aeb4a282509bd2fe89",
  name: "createShiftTemplate",
  filename: "src/lib/shift-templates.functions.ts"
}, (opts) => createShiftTemplate.__executeServer(opts));
const createShiftTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => TemplateInputSchema.parse(input)).handler(createShiftTemplate_createServerFn_handler, async ({
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
  } = await supabase.from("shift_templates").insert({
    ...data,
    user_id: userId
  }).select(COLS).single();
  if (error || !row) throw new Error(error?.message ?? "Failed");
  return rowToDTO(row);
});
const updateShiftTemplate_createServerFn_handler = createServerRpc({
  id: "0e59f6ab8b3faa6c34050f05cbef679c5125e8ebb5d431408f25cbbb8f0191f0",
  name: "updateShiftTemplate",
  filename: "src/lib/shift-templates.functions.ts"
}, (opts) => updateShiftTemplate.__executeServer(opts));
const updateShiftTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => TemplateInputSchema.extend({
  id: z.string().uuid()
}).partial({
  name: true,
  colour: true,
  category: true
}).parse(input)).handler(updateShiftTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    id,
    ...patch
  } = data;
  const {
    data: row,
    error
  } = await supabase.from("shift_templates").update(patch).eq("id", id).select(COLS).single();
  if (error || !row) throw new Error(error?.message ?? "Failed");
  return rowToDTO(row);
});
const deleteShiftTemplate_createServerFn_handler = createServerRpc({
  id: "6b6dbf3b746695907f62e587af5acb939c0eb189db0b63eb4bc5945a9df88a09",
  name: "deleteShiftTemplate",
  filename: "src/lib/shift-templates.functions.ts"
}, (opts) => deleteShiftTemplate.__executeServer(opts));
const deleteShiftTemplate = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  id: z.string().uuid()
}).parse(input)).handler(deleteShiftTemplate_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    error
  } = await supabase.from("shift_templates").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  createShiftTemplate_createServerFn_handler,
  deleteShiftTemplate_createServerFn_handler,
  listShiftTemplates_createServerFn_handler,
  updateShiftTemplate_createServerFn_handler
};
