# Switch /calendar to the new EventDialog

Replace the legacy `src/components/calendar-page/EventDialog.tsx` mounted on `/calendar` with the modern `src/components/events/EventDialog.tsx` (which already has Split Shift, Sick Leave, Annual Leave, the SplitShiftFields UI, the icon picker, and the Quick Add presets), and wire it through to the real Supabase events store via `src/lib/events.functions.ts`.

The dialog swap is the easy half. The harder half: the legacy calendar page (`_authenticated.calendar.tsx`, `MonthView`, `TimeGrid`, `TodayPanel`, `WeekSummaryDialog`) is built around a different event shape (`MockEvent`, with `start: Date`) than the new dialog (`CalendarEvent`, with `start: string` ISO). We bridge them with a small adapter rather than rewriting the calendar views.

---

## 1. Files modified / deleted

Modified:
- `src/routes/_authenticated.calendar.tsx` — swap dialog import; switch event source from `useEventsStore` to `useEvents()` (from `EventsProvider`); adapt `CalendarEvent → MockEvent` for the existing views; replace `handleSave`/`handleDelete`/`openEdit` plumbing.
- `src/providers/EventsProvider.tsx` — replace the localStorage store with calls to `listEvents` / `createEvent` / `updateEvent` / `deleteEvent` server functions in `src/lib/events.functions.ts`. Keep the same `useEvents()` API so the rest of the app keeps working.
- `src/routes/__root.tsx` or `_authenticated.tsx` — verify `EventsProvider` is mounted inside the auth-gated subtree (so the protected server fns see a session).
- `src/components/events/EventForm.tsx` — small additions only: render a Recurrence block (toggle + daily/weekly/fortnightly/custom + weekday picker). No restructuring.
- `src/components/events/ShiftFieldsGroup.tsx` — add an "Other / Custom" chip + free-text input.
- `src/types/event.ts` — extend `CalendarEvent` with recurrence fields mirroring the DB (`recurrencePattern`, `recurrenceDays`, `recurrenceEndDate`).

Deleted (only after the swap is verified working):
- `src/components/calendar-page/EventDialog.tsx`
- `src/lib/events-store.ts`
- `src/components/calendar-page/mock.ts`

Untouched:
- `MonthView.tsx`, `TimeGrid.tsx`, `TodayPanel.tsx`, `WeekSummaryDialog.tsx` keep consuming `MockEvent[]`. The route adapts before passing in.
- `src/components/calendar-page/constants.ts` is kept for `SHIFT_STYLES`, `CATEGORIES`, `ICON_OPTIONS` still used by the views. We widen its `ShiftType` union to match `src/types/event.ts` and add styles for `split`, `sick_leave`, `annual_leave`, `custom`.
- Global nav, theme system, all visual styling.

---

## 2. Legacy-vs-new feature diff (must preserve all of these)

| Feature | Legacy dialog | New EventDialog today | Gap to close |
| --- | --- | --- | --- |
| Recurrence: none / daily / weekly / fortnightly / custom + weekday picker | Yes | NOT rendered in `EventForm` (DB columns and server fn already support it) | Add a Recurrence UI block to `EventForm` |
| Date popover (calendar picker) for the event date | Yes | Uses two `datetime-local` inputs | Acceptable — same data, different UX. Keep as-is unless user objects. |
| Single `Location / Role` field | Yes | Split into `Role` + `Location` (matches DB schema) | Improvement, no loss |
| "Other / Custom" shift type with free text | Legacy did NOT have it either | Not present | User listed this as required — add a `custom` chip + free-text input |
| All 8 categories | Yes | Yes via `CATEGORIES` | Parity |
| Icon picker | 30-icon flat grid, single color | 30-icon grid with color/gradient cycle | New is richer |
| Quick Add preset chips | Not present | Present | New is richer |
| Split Shift fields | Not present | Present | New is richer |
| Payday toggle | Not present | Present | New is richer |
| All-day toggle | Not present | Present | New is richer |
| Notes | Yes | Yes | Parity |
| Delete button | Yes | Yes | Parity |

Net: the only true gap from legacy → new is **Recurrence**. "Other / Custom shift" was never in either dialog and is genuinely new — added here since the user requested it.

---

## 3. Supabase wiring status

Partial.

- `src/lib/events.functions.ts` already implements `listEvents`, `createEvent`, `updateEvent`, `deleteEvent` against the real `events` table with full split-shift columns, `icon_color`, recurrence, payday, and earnings calculation.
- `src/components/events/EventDialog.tsx` calls `useEvents()` from `src/providers/EventsProvider.tsx`, but that provider is currently a **localStorage** store — it does NOT talk to Supabase. Mounting the new dialog as-is would save to localStorage, not the DB.
- **Work required:** rewrite `EventsProvider` to call the server fns via TanStack Query (`useQuery(listEvents)` plus `useMutation` for create/update/delete, each invalidating `["events"]`). Keep the same external API (`events`, `createEvent`, `updateEvent`, `deleteEvent`, `getEvent`) so nothing else changes.

---

## 4. Post-switch functionality checklist

- Clicking an empty day opens the new EventDialog with that date prefilled (route's `openCreate(d)` passes a Date; new dialog accepts `defaultStart`).
- Clicking an existing event opens the dialog in edit mode (route resolves the `CalendarEvent` from the provider by id).
- Delete calls `deleteEvent(id)` server fn, refetches the list, event disappears across all views.
- All 8 categories selectable.
- Shift type chips: morning, afternoon, night, oncall, split, sick_leave, annual_leave, custom (with free text). Split expands the SplitShiftFields block.
- Recurring toggle plus daily / weekly / fortnightly / custom and per-day picker (new UI added to `EventForm`).
- Icon picker with color selection — already present.
- Quick Add preset chips — already present.
- Save persists to Supabase via `createEvent` / `updateEvent`. Page refresh keeps the data.

---

## 5. Implementation order

Each step lands and is verified before moving on.

1. **Rewrite `EventsProvider`** to call the four server fns via TanStack Query. Keep the `useEvents()` shape identical. `/calendar` still uses the legacy dialog at this point — events still come from the mock store there — so this change is invisible on the calendar page. Verify any non-calendar consumer (Today panel on dashboard, etc.) still renders.
2. **Widen the legacy `ShiftType` union** in `src/components/calendar-page/constants.ts` to include `split`, `sick_leave`, `annual_leave`, `custom`, and add matching `SHIFT_STYLES` entries. Required so the views can render new events without runtime errors after the swap.
3. **Add Recurrence block + Custom shift type** to `src/components/events/EventForm.tsx` and `ShiftFieldsGroup.tsx`. Verify the new dialog still opens and creates an event.
4. **Swap the import and plumbing** in `src/routes/_authenticated.calendar.tsx`:
   - Replace the legacy `EventDialog` import with `@/components/events/EventDialog`.
   - Replace `useEventsStore` / `setStoreEvents` with `useEvents()` from the Supabase-backed provider.
   - Add `toMockEvent(ev: CalendarEvent): MockEvent` adapter; feed `events.map(toMockEvent)` into `MonthView` / `TimeGrid` / `TodayPanel` / `WeekSummaryDialog`. Editing/clicking returns a `MockEvent.id`; the route looks up the matching `CalendarEvent` and passes its id to the new dialog as `eventId`.
   - Drop `handleSave` / `handleDelete` from the route — the new dialog handles persistence internally via the provider.
5. **Smoke test in the preview** at `/calendar`:
   - Create on day click, edit on event click, delete, then refresh — data persists.
   - Switch month / week / day views, events render with correct categories and shift styles (including Split / Sick / Annual / Custom).
   - Quick Add presets, icon picker with color, recurring toggle all work.
6. **Delete dead code** only after step 5 is green: `src/components/calendar-page/EventDialog.tsx`, `src/lib/events-store.ts`, `src/components/calendar-page/mock.ts`. Run `rg` on each path first to confirm no remaining importers.

---

## 6. Risks

- **Shape mismatch is real, not cosmetic.** `MockEvent.start: Date` vs `CalendarEvent.start: string`. Every consumer of `MockEvent` calls `format(e.start, ...)` directly. If the adapter forgets `new Date(iso)`, views silently render "Invalid Date". Centralize the adapter in one helper.
- **ID round-trip.** `MockEvent.id` is `evt-1700...`; `CalendarEvent.id` is a UUID. After the swap, ids are UUIDs in both directions — the route must look up via the provider's `getEvent(id)` rather than synthesize.
- **`useEvents()` becomes async.** The localStorage version is synchronous. Other surfaces (Today / weekly summary / dashboard) that expect data on first paint will briefly see `[]`. Mitigate with `useQuery({ initialData: [] })` and accept the loading flicker, or gate views behind a small skeleton.
- **DB `shift_type` is a Zod enum** of `morning | afternoon | night | oncall | split | sick_leave | annual_leave | travel | payday`. There is NO `custom` value. For "Other / Custom" we will (a) store the user's free text in `shift_role` and set `shift_type` to `null`. Alternative (b) extends the enum + a DB migration — not in this swap unless the user wants it. Confirm preference.
- **Recurrence is not materialised.** Both the legacy and the new path store the recurrence pattern but never expand a weekly event into N occurrences. After the swap, recurring events still show only on the original date. Pre-existing limitation, not a regression — flagged for follow-up.
- **`EventsProvider` mount point.** Must live under `_authenticated.tsx` so the protected server fns see a session. If it's at the root today, move it.
- **Deleting `mock.ts`** removes the demo seed; first-time users see an empty calendar. Acceptable real-app behaviour, but worth noting.
- **Non-null assertions in views.** `TodayPanel`, `MonthView`, `WeekSummaryDialog` index `SHIFT_STYLES[shift.shiftType!]`. After widening the union the styles map must cover every new variant exhaustively, or those views crash on `split` / `sick_leave` / `annual_leave` / `custom`.

---

## 7. Technical notes

Adapter sketch (in the route):

```text
toMockEvent(e: CalendarEvent): MockEvent
  id          = e.id                           // UUID
  title       = e.title
  category    = e.category
  start       = new Date(e.start)              // ISO -> Date
  end         = new Date(e.end)
  shiftType   = e.shift?.shiftType
  location    = e.shift?.location
  notes       = e.notes
  iconName    = e.iconName
  recurrence  = mapRecurrence(e.recurrencePattern, e.recurrenceDays)
```

- `EventsProvider` rewrite uses `@tanstack/react-query` (already in the project). Mutations call `queryClient.invalidateQueries({ queryKey: ["events"] })`.
- No `supabase/config.toml` changes. No new env vars. No new tables. No new migration in this phase.