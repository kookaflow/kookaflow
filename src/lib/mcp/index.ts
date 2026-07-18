import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listEventsTool from "./tools/list-events";
import createEventTool from "./tools/create-event";

// The OAuth issuer MUST be the direct Supabase host, not the .lovable.cloud
// proxy that SUPABASE_URL resolves to on publish. Build it from the project ref,
// which Vite inlines at build time via import.meta.env.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "kookaflow-mcp",
  title: "Kookaflow",
  version: "0.1.0",
  instructions:
    "Tools for the signed-in Kookaflow user. Use `list_events` to read shifts and personal events for a date range, and `create_event` to add new events to their calendar.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listEventsTool, createEventTool],
});