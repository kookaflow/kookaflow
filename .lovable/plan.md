# Fix: Materialise recurring events in EventsProvider

## Root cause (confirmed)
`expandRecurring` currently lives in `src/routes/_authenticated.calendar.tsx` and only runs there. `EventsProvider.events` returns raw base rows, so `ShiftAlertWatcher` (welcome toast) counts 0 shifts on days when the only shift is a recurring occurrence. The wrong count is then latched via `summaryShownRef` + the `kookaflow.lastOpenedDate` localStorage key.

## Changes

### 1. `src/providers/EventsProvider.tsx`
- Add an `expandRecurring(base: CalendarEvent): CalendarEvent[]` helper (ported from calendar.tsx, adapted to operate on `CalendarEvent` fields — `recurrencePattern`, `recurrenceDays`, `recurrenceEndDate` — instead of the MockEvent `recurrence` object).
- Keep the same rules: `daily`, `weekly`, `fortnightly`, `custom` (weekday keys → indices), cap at `MAX_RECURRING_OCCURRENCES = 60`, end limit = `recurrenceEndDate` or +365d, occurrence IDs = `${base.id}::rec-${idx}` (idx 0 keeps the original id so edits/lookups still work).
- Replace the memo:
  ```ts
  const events = useMemo(() => {
    const mapped = (data ?? []).map(dtoToCalendarEvent);
    return mapped.flatMap(expandRecurring);
  }, [data]);
  ```
- `getEvent`, `updateEvent`, `deleteEvent` continue to work: `updateMut` looks up `existing` by id — occurrence ids won't match, but they never should (edits go through the base event id from the editor). Preserve original id on the first occurrence so existing lookups keep working.

### 2. `src/routes/_authenticated.calendar.tsx`
- Delete the local `expandRecurring` function and the `WEEKDAY_INDEX` / `weekdayKeyToIndex` helpers (only used by expandRecurring).
- Simplify the memo:
  ```ts
  const local = rawEvents.map(toMockEvent);
  ```
- Leave everything else (Google merging, toMockEvent, UI) unchanged.

### 3. `src/components/notifications/ShiftAlertWatcher.tsx`
- No logic changes. It will now see materialised occurrences via `useEvents()`.

### 4. One-time latch reset
The old wrong "0 events today" toast may have already written today's date to `localStorage['kookaflow.lastOpenedDate']`, suppressing the corrected toast for the rest of the day. To force the corrected count to show on next load:
- In `ShiftAlertWatcher.tsx`, add a one-shot migration guard at module scope (using a distinct versioned key, e.g. `kookaflow.summaryLatchResetV1`) that:
  - On first mount, if the reset key is not set, delete `kookaflow.lastOpenedDate` from localStorage and set the reset key to `"1"`.
  - Runs before the summary effect reads `LAST_OPENED_KEY`.
- `summaryShownRef` is per-mount and already resets on reload, so clearing the localStorage key is sufficient — the effect will re-evaluate with the correct materialised events.

## Out of scope
No changes to toast UI/styling, no changes to server functions, no changes to Google event handling, no changes to alert scheduling.
