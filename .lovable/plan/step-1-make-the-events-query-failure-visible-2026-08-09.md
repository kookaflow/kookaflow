# Step 1: make the events query failure visible

Minimal, reversible change to `src/providers/EventsProvider.tsx` only. No dashboard changes, no UI restyling.

## What changes

1. Destructure `error` and `status` from the existing events `useQuery` (alongside `data`, `isLoading`, `isFetching`).
2. Add a small `useEffect` that logs on every state change:
   `console.info("[events] status", status, "count", data?.length, "error", message)`
   — so the failure is readable in Safari Web Inspector on the iOS build.
3. Add `error: Error | null` to the provider's context type and expose it in the context value (normalised to an `Error`).

## What does not change

- `events`, `isLoading`, and all mutations keep their current behaviour.
- The dashboard's mock-data wiring stays as-is (handled separately).
- The calendar's empty-state markup is untouched in this step; once `error` is on the context, a follow-up step can render "Couldn't load your events — <message>" instead of the empty state.

## Why

The calendar currently renders "Your calendar is empty" whether `listEvents` returns `[]` or throws (401 / CORS / no session in the Capacitor WebView), because `useQuery`'s error is discarded and `data ?? []` collapses both cases. Exposing `status` and `error` is enough to tell those apart on device before choosing a fix.

## Rollback

Revert the three edits in the single file; nothing else depends on them.
