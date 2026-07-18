import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-user";

export default defineTool({
  name: "list_events",
  title: "List calendar events",
  description:
    "List the signed-in user's Kookaflow calendar events (shifts and personal events) between two ISO datetimes.",
  inputSchema: {
    from: z
      .string()
      .describe("Start of range, ISO 8601 datetime (e.g. 2026-07-18T00:00:00Z)."),
    to: z
      .string()
      .describe("End of range, ISO 8601 datetime."),
    category: z
      .enum(["work", "rest", "wellness", "exercise", "social", "family", "personal", "travel"])
      .optional()
      .describe("Optional category filter."),
    limit: z.number().int().min(1).max(200).optional().describe("Max rows (default 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ from, to, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("events")
      .select(
        "id,title,category,start_time,end_time,is_all_day,shift_type,shift_role,location,notes",
      )
      .gte("start_time", from)
      .lte("start_time", to)
      .order("start_time", { ascending: true })
      .limit(limit ?? 100);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { events: data ?? [] },
    };
  },
});