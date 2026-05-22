# Quick-Add Panel: stamping is broken by the click-outside catcher

## What I found (no changes made)

### 1. The panel IS wired into the calendar page
- `src/routes/_authenticated.calendar.tsx` wraps the page in `<StampProvider>` and renders both `<QuickAddFab />` and `<QuickAddPanel />` at the bottom.
- `MonthView`'s `onSelect={handleDaySelect}` correctly branches: if a stamp is selected, it calls `applyStamp(d)` instead of just changing the focused date.
- `StampProvider.applyStamp` does call `createEvent` / `updateEvent` / `deleteEvent` on Supabase via `useEvents()`. The save path itself is intact.

### 2. State sharing is correct
- Shared via React context: `StampProvider` exposes `selected`, `setSelected`, `panelOpen`, `setPanelOpen`, and `applyStamp`.
- `QuickAddPanel` writes `selected` when a tile is tapped (`onPick={setSelected}`).
- `CalendarPageInner` reads `selected` and calls `applyStamp(d)` from the same context. So the two components ARE connected.

### 3. The actual bug — invisible overlay swallows every calendar tap
In `src/components/calendar/QuickAddPanel.tsx`, when the panel is open it renders a transparent click-catcher:

```tsx
<button
  onClick={() => { setPanelOpen(false); setSelected(null); }}
  className="fixed inset-x-0 top-0 bottom-[34vh] z-30 cursor-default bg-transparent"
/>
```

This `<button>` is `position: fixed`, covers the entire viewport above the panel, and sits at `z-30`. The calendar grid has no explicit z-index, so it renders below it. Result:

- User taps a shift tile → `selected` is set correctly.
- User taps a date on the calendar → the click hits the invisible catcher first, which **closes the panel and clears `selected`**. `MonthView`'s day button never receives the click, so `applyStamp` never runs and nothing is saved.

That's why "nothing happens" — the event is silently consumed before it can reach the day cell. No console errors are produced (logs are clean) because the handler succeeds at what it's coded to do; it just isn't what the user expects.

### 4. Secondary observations (not the primary bug, but worth noting)
- The same catcher would also block `TimeGrid` taps in week/day view.
- Once the catcher is removed/fixed, the existing `handleDaySelect` → `applyStamp` flow should work end-to-end. The `applyStamp` logic itself handles shifts, leave, icons, splits, and travel correctly.
- `MonthView` day buttons have `hover:-translate-y-0.5` — fine, but worth verifying tap target still works on mobile after the fix.

## Fix plan (for approval, no code yet)

1. Remove the full-viewport click-catcher in `QuickAddPanel.tsx`. Replace its "tap outside to close" behavior with one of:
   - A small `Esc` key handler + an explicit close button (already present), OR
   - A catcher that only covers the area **above** the calendar header (i.e. don't overlay the calendar grid), OR
   - Simplest: just drop the catcher entirely — the panel already has an `X` button and the FAB toggles it.
   
   Recommended: drop the catcher. Stamping mode is meant to stay active across many taps, so auto-close-on-outside-tap actively fights the UX.

2. Add a subtle visual cue on the calendar when a stamp is active (e.g. cursor change or border tint on day cells) so the user knows tapping a date will stamp.

3. Verify in both `MonthView` and `TimeGrid` that day taps reach `handleDaySelect` while the panel is open.

4. Smoke-test: open panel → pick "Morning" → tap three dates → confirm three events appear and persist after reload.

## Files that would change

- `src/components/calendar/QuickAddPanel.tsx` (remove catcher)
- Optionally `src/components/calendar-page/MonthView.tsx` (active-stamp visual hint)

No DB, no schema, no auth changes.
