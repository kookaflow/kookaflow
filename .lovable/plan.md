# Calendar UX Overhaul — Quick-Add Panel, Shift Templates, Visible Badges

Three coordinated changes to make ShiftSync's calendar feel like a pro shift-worker tool: a persistent quick-stamp panel, a dedicated shift-management screen with custom templates, and always-visible shift/icon markers on the month grid.

## 1. Quick-Add Bottom Panel

A persistent floating action button on `/calendar` opens a bottom sheet that lets the user pick a shift / leave type / icon once, then tap multiple days to stamp it. The full Add Event modal stays for detailed personal events.

**Behaviour**
- FAB bottom-right of calendar — `+` with a `Zap` overlay. Toggles the panel.
- Panel: bottom sheet covering ~33% viewport height, **non-modal** (calendar stays interactive above). Closes via X, FAB toggle, tap outside, or Escape. Built on a fixed-position card, not Radix Dialog (which would block calendar clicks).
- Three tabs: **Shifts**, **Leave / Off**, **Icons**.
- Tiles: 3-column grid of coloured rounded tiles (h-16), short label (≤8 chars), Lucide icon. Selected tile gets `ring-2 ring-primary`.
- Hint strip at top: "Select a shift, then tap days to apply".
- "Manage shifts" link bottom-left → `/shifts`. "Detailed event" button bottom-right → opens existing `EventDialog`.

**Stamp / apply logic**
- New `StampProvider` holds `selectedStamp: { kind: 'shift'|'icon', presetId | iconName } | null`.
- When `selectedStamp` is set, a day click calls `applyStamp(day)` instead of selecting:
  - `kind: 'shift'`: find existing shift event on that day.
    - Same shift → delete (toggle off).
    - Different shift → update event in place (replace times + type).
    - None → create event using the preset's defaults (allDay / start / end / category / isPayday / iconName).
  - `kind: 'icon'`: stamp a marker by creating an all-day `personal` event with `iconName` set. Re-tap same icon → remove.
- Long-press on a day (≥500 ms) opens the existing `EventDialog`, even if a stamp is selected.
- React Query optimistic updates so stamping feels instant.

**Tab content**
- Shifts: morning, afternoon, night, oncall, split, side_hustle, sick_leave, annual_leave, travel, payday, all user custom templates, plus "No Shift" (clears the day's shift) and "Rest Day" (all-day `rest`).
- Leave / Off: annual_leave, sick_leave, public_holiday, half_day (09:00–13:00 work), no_shift, rest_day.
- Icons: DollarSign, Car, Dumbbell, Heart, Users, Home, Star, Coffee, Music, Book, Plane, Baby, Dog (Baby/Dog added to IconPicker).

## 2. Shift Management Screen `/shifts`

New authenticated route `src/routes/_authenticated.shifts.tsx`.

**Layout**
- Header: title "Shifts", search input, `+ New` button.
- Sections WORKING / LEAVE / NON-WORKING / CUSTOM. Built-in shifts are read-only; tapping opens an editor that lets the user override default times (saved as a `shift_templates` row with `base_type` set).
- Each row: coloured tile chip, name, default start–end, duration ("8h 0m").
- Swipe-left on custom rows → Delete. Desktop: trailing menu (Edit / Delete).

**Add / edit custom shift (drawer)**
- Fields: name (≤12 chars), 16-colour grid, default start, default end (overnight allowed), auto-calculated duration display, optional icon picker.
- Save upserts into `shift_templates` and refreshes the quick-add Shifts tab.

## 3. Always-Visible Shift Badge + Icon Markers on Calendar

Update `src/components/calendar-page/MonthView.tsx` day cell rendering:
- Shift chip label is always visible (drop `hidden sm:inline`), sits as a full-width pill below the date number.
- Below the pill: row of up to 3 12px icon markers (events with `iconName` only). Overflow → `+N`.
- Other non-shift events keep the category-coloured dots at the bottom, capped at 5.
- Add long-press handler (`onPointerDown` + timer) to open the full `EventDialog`.

## Database

New migration:

```sql
create table public.shift_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null check (char_length(name) <= 12),
  colour text not null,
  icon_name text,
  default_start time,
  default_end time,
  category text not null check (category in ('working','leave','non_working')),
  base_type text,            -- null = fully custom; set when overriding a built-in
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.shift_templates enable row level security;
-- standard own-row select/insert/update/delete policies; set_updated_at trigger
```

Also extend `events.shift_type` CHECK to include `'side_hustle'` (carried from the earlier investigation) so stamping Side Hustle persists. No other `events` schema changes.

## Component / file architecture

New:
- `src/providers/StampProvider.tsx`
- `src/providers/ShiftTemplatesProvider.tsx`
- `src/lib/shift-templates.functions.ts` — list / create / update / delete server fns
- `src/components/calendar/QuickAddFab.tsx`
- `src/components/calendar/QuickAddPanel.tsx`
- `src/components/calendar/QuickAddTabs/{ShiftsTab,LeaveTab,IconsTab}.tsx`
- `src/components/calendar/StampTile.tsx`
- `src/components/shifts/{ShiftListSection,ShiftEditorSheet,ColourGrid}.tsx`
- `src/routes/_authenticated.shifts.tsx`

Edited:
- `src/routes/_authenticated.calendar.tsx` — mount `StampProvider`, `QuickAddFab`, `QuickAddPanel`; gate day clicks on stamp state.
- `src/components/calendar-page/MonthView.tsx` — new badge + icon markers + long-press.
- `src/components/calendar-page/constants.ts` — add `rest_day`, `public_holiday`, `half_day`, `no_shift` styles.
- `src/components/events/IconPicker.tsx` — add `Baby`, `Dog`.
- `src/routes/_authenticated.tsx` — provider wiring.

## Implementation order

1. Migration: `shift_templates` + add `side_hustle` to `events.shift_type` CHECK.
2. Server fns + `ShiftTemplatesProvider`.
3. `/shifts` route, sections, editor sheet, colour grid.
4. `StampProvider` + `applyStamp` mutations (headless).
5. `QuickAddFab` + `QuickAddPanel` + three tabs.
6. Wire stamp into `MonthView` day clicks; add long-press to open full modal.
7. Redesign month cell: always-visible shift pill + icon markers.
8. Manual QA: stamp single & many days, toggle off, replace, icon stamping, custom template CRUD, long-press → full modal.

## Open questions

- Settings entry point for `/shifts`: prompt says "Do not edit /settings UI" but also "accessible from Settings". Plan defaults to exposing only from the quick-add panel (no settings edits). Confirm if a single settings nav row is acceptable.
- Icon stamps stored as real `events` (all-day, `personal`, with `iconName`) so they show on the calendar and persist — vs. a separate lightweight `day_markers` table. Plan goes with the simpler reuse.
- "Public Holiday" tile stamps a personal all-day event titled "Public Holiday" (does not write to the read-only `public_holidays` table).
