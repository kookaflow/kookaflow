import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-user";

export default defineTool({
  name: "create_event",
  title: "Create calendar event",
  description:
    "Create a new event in the signed-in user's Kookaflow calendar (shift or personal event).",
  inputSchema: {
    title: z.string().min(1).max(200).describe("Event title."),
    category: z
      .enum(["work", "rest", "wellness", "exercise", "social", "family", "personal", "travel"])
      .describe("Life category for the event."),
    start: z.string().describe("Start datetime, ISO 8601."),
    end: z.string().describe("End datetime, ISO 8601."),
    isAllDay: z.boolean().optional(),
    notes: z.string().max(2000).optional(),
    location: z.string().max(200).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const userId = ctx.getUserId();
    if (!ctx.isAuthenticated() || !userId) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: userId,
        title: input.title,
        category: input.category,
        start_time: input.start,
        end_time: input.end,
        is_all_day: input.isAllDay ?? false,
        notes: input.notes ?? null,
        location: input.location ?? null,
      })
      .select("id,title,category,start_time,end_time")
      .single();
    if (error || !data) {
      return { content: [{ type: "text", text: error?.message ?? "Insert failed" }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Created event ${data.id}: ${data.title}` }],
      structuredContent: { event: data },
    };
  },
});