# Unification Pass — One Source of Truth for Categories, Shifts, and Colours

Goal: collapse the 4 colour systems and 3 shift/category definitions into a single canonical config, fix the stamp deletion + travel all-day bugs, and align calendar badges with the quick-add palette. No DB changes.

## 1. New canonical config: `src/lib/shiftConfig.ts`

Single export surface for everything visual + behavioural about categories and shifts:

- `CATEGORY_CONFIG`: 8 entries (work, rest, wellness, exercise, social, family, personal, travel) — `{ label, colour (hex), icon (Lucide name) }`.
- `SHIFT_CONFIG`: 10 entries (morning, afternoon, night, oncall, split, side_hustle, sick_leave, annual_leave, travel, payday) — `{ label, shortLabel, colour, icon, category, defaultStart, defaultEnd, isAllDay, travelDurationMinutes? }`.
- Helpers: `getCategoryConfig(id)`, `getShiftConfig(type)`, `getEventColour(event)` (returns shift colour if `event.shift?.shiftType` exists, else category colour), `getEventIconName(event)`.
- Re-exports a typed `IconName` union and a `LUCIDE_ICON_MAP` resolving icon names → Lucide components (centralised so chips, stamps, calendar cells, dashboard all share it).

Exact colour/icon values match the audit spec verbatim (incl. split #8B5CF6, side_hustle #D4A017, payday #10B981, travel #64748B).

## 2. Priority 1 — Stamp deletion bug (`src/providers/StampProvider.tsx`)

Replace the "find any shift/rest/travel event and overwrite" block with the audit's exact predicate:

```text
existingShift = dayEvents.find(e =>
  e.category === draft.category
  && (e.shift?.shiftType ?? null) === (draft.shift?.shiftType ?? null)
  && (e.isPayday ?? false) === (draft.isPayday ?? false)
)
if (existingShift) { deleteEvent(existingShift.id); return }   // toggle off
await createEvent(draft)                                         // never overwrite
```

Effect: stamping Annual Leave on a Morning day adds a second event; multiple shifts on one day are preserved; same-type re-stamp toggles off. The icon-stamp branch keeps its current toggle behaviour.

## 3. Priority 2 — Travel all-day bug (`StampProvider.buildDraftFromStamp`)

In the all-day branch, when `stamp.category === 'travel'` (or `stamp.shiftType === 'travel'`), set `travelDurationMinutes: 60` on the draft. Satisfies the `validate_event` DB trigger for all-day Travel stamps. The timed branch already sets this — keep it.

## 4. Priority 5 — Calendar badges use shift colour

- `src/components/calendar/EventChip.tsx`: replace `getCategory(...).bgClass/fgClass` with inline `style={{ backgroundColor: getEventColour(event), color: '#fff' }}` (foreground always white on these saturated hexes; matches the quick-add tiles).
- `src/components/calendar/EventBlock.tsx`: same swap on the absolute-positioned block.
- `src/lib/event-icon.ts`: keep, but route icon lookup through `LUCIDE_ICON_MAP` from shiftConfig so chip/block icons match the stamp's icon.

Result: Morning chip = amber, Annual Leave chip = sky, etc. — pixel-matching the quick-add panel.

## 5. Priority 3/4 — Consolidation per file

### Rewrites (import from `shiftConfig.ts`, drop local defs)

- `src/lib/stamps.ts` — `SHIFT_STAMPS`, `LEAVE_STAMPS` derived from `SHIFT_CONFIG`. `ICON_STAMPS` stays (icon-only tiles), but its colour/icon entries are re-checked against `LUCIDE_ICON_MAP`. `half_day` icon: `Clock` → `Clock3`. `public_holiday` icon + iconName both set to `Flag`.
- `src/components/events/presets.ts` — **delete**. `PRESETS` array re-derived inside `src/components/events/QuickAddPresets.tsx` from `SHIFT_CONFIG` (it's the only consumer).
- `src/components/calendar-page/constants.ts` — remove `CATEGORIES`, `CATEGORY_MAP`, `SHIFT_STYLES`, `CategoryId`, `ShiftType`, `ICON_OPTIONS`, `ICON_MAP`. Keep only `MockEvent` / `Recurrence` types if still referenced (they are mock-only — verify and delete the file if unused after migration). `IconPicker.tsx` becomes the sole owner of icon-picker options.
- `src/lib/categories.ts` — slim to a thin shim that re-exports `getCategoryConfig` under the old `getCategory` name for one release, or rewrite all callers (preferred, since the codebase is small). Drop all `bg-cat-*` classes.

### Consumers updated to use `getCategoryConfig` / `getShiftConfig` / `getEventColour`

- Dashboard: `CategoryCard.tsx`, `WeeklyStackedBarChart.tsx`, `lib/metrics.ts`, `lib/nudges.ts`, `MonthlyDonutChart.tsx`.
- Calendar page: `MonthView.tsx`, `TimeGrid.tsx`, `TodayPanel.tsx`, `WeekSummaryDialog.tsx`.
- Today: `CategoryBreakdownMini.tsx`, `ShiftCard.tsx`, `TodayEventsList.tsx`, `TodayPanel.tsx`.
- Weekly: `WeeklyCategoryChart.tsx`, `WeeklySummaryPanel.tsx`, `WeeklyTotalsList.tsx`.
- Shared: `CategoryBadge.tsx` (inline-style hex, no Tailwind cat-* classes).
- Events: `EventForm.tsx`, `QuickAddPresets.tsx`, `ShiftFieldsGroup.tsx`, `SplitShiftFields.tsx`.
- Other: `ShiftAlertWatcher.tsx`, `ShiftEditorSheet.tsx`, `selectors.ts`, `events-store.ts`, `routes/_authenticated.calendar.tsx`, `routes/_authenticated.dashboard.tsx`, `routes/_authenticated.shifts.tsx`.

### Files deleted

- `src/components/shared/CategoryDot.tsx` (Priority 4 — unused after audit, verify zero imports then delete).
- `src/components/events/presets.ts`.
- Possibly `src/components/calendar-page/constants.ts` if nothing non-duplicate remains.

## 6. Priority 6 — Icon fixes

- `half_day` stamp: `iconName: 'Clock'` → `'Clock3'` (and tile `Icon: Clock4` → `Clock3` for consistency).
- `public_holiday` stamp: tile `Icon: Flag` + `iconName: 'Flag'` (currently `'Star'`). Add `Flag` to `IconPicker.ICONS` if missing.

## 7. Priority 7 — CSS token cleanup (`src/styles.css`)

- Remove `--cat-work`, `--cat-rest`, `--cat-wellness`, `--cat-exercise`, `--cat-social`, `--cat-family`, `--cat-personal`, `--cat-travel` (light + dark blocks) and their `*-foreground` variants.
- Remove Tailwind utilities/safelist for `bg-cat-*`, `text-cat-*`, `border-cat-*` if declared.
- All consumers now use inline `style={{ backgroundColor: cfg.colour }}` reading from `CATEGORY_CONFIG`.

## 8. Types

- `src/types/event.ts`: `CategoryId` and `ShiftType` become unions derived from `keyof typeof CATEGORY_CONFIG` / `keyof typeof SHIFT_CONFIG`. Add `'travel'` and `'payday'` to `ShiftType` (currently missing). Keep `'custom'` for free-form shifts.

## Implementation order (exact)

1. Create `src/lib/shiftConfig.ts` (CATEGORY_CONFIG, SHIFT_CONFIG, LUCIDE_ICON_MAP, helpers).
2. Patch `StampProvider.tsx` — deletion-bug predicate + Travel all-day fix.
3. Update `EventChip.tsx` to use `getEventColour`.
4. Update `EventBlock.tsx` to use `getEventColour`.
5. Rewrite `src/lib/stamps.ts` to derive from `SHIFT_CONFIG`; fix `half_day` + `public_holiday` icons.
6. Delete `src/components/events/presets.ts`; rebuild `QuickAddPresets.tsx` from `SHIFT_CONFIG`.
7. Update dashboard files: `CategoryCard.tsx`, `WeeklyStackedBarChart.tsx`, `MonthlyDonutChart.tsx`, `lib/metrics.ts`, `lib/nudges.ts`.
8. Update remaining calendar-page consumers: `MonthView.tsx`, `TimeGrid.tsx`, `TodayPanel.tsx`, `WeekSummaryDialog.tsx`.
9. Update Today + Weekly + Shared + Events + Routes consumers (full list in §5).
10. Strip duplicate exports from `src/components/calendar-page/constants.ts` and `src/lib/categories.ts`; delete files if empty.
11. Delete `src/components/shared/CategoryDot.tsx`.
12. Remove `--cat-*` tokens + `bg-cat-*` references from `src/styles.css`.
13. Tighten `src/types/event.ts` unions; run typecheck and fix fallout.

## Files modified

New: `src/lib/shiftConfig.ts`.
Edited: `src/providers/StampProvider.tsx`, `src/lib/stamps.ts`, `src/lib/categories.ts`, `src/lib/event-icon.ts`, `src/lib/selectors.ts`, `src/lib/events-store.ts`, `src/types/event.ts`, `src/styles.css`, `src/components/calendar/EventChip.tsx`, `src/components/calendar/EventBlock.tsx`, `src/components/calendar-page/{MonthView,TimeGrid,TodayPanel,WeekSummaryDialog,constants}.tsx`, `src/components/dashboard/{CategoryCard,WeeklyStackedBarChart,MonthlyDonutChart}.tsx`, `src/components/dashboard/lib/{metrics,nudges}.ts`, `src/components/today/{CategoryBreakdownMini,ShiftCard,TodayEventsList,TodayPanel}.tsx`, `src/components/weekly/{WeeklyCategoryChart,WeeklySummaryPanel,WeeklyTotalsList}.tsx`, `src/components/shared/CategoryBadge.tsx`, `src/components/events/{EventForm,QuickAddPresets,ShiftFieldsGroup,SplitShiftFields,IconPicker}.tsx`, `src/components/notifications/ShiftAlertWatcher.tsx`, `src/components/shifts/ShiftEditorSheet.tsx`, `src/routes/_authenticated.{calendar,dashboard,shifts}.tsx`.
Deleted: `src/components/events/presets.ts`, `src/components/shared/CategoryDot.tsx`, and `src/components/calendar-page/constants.ts` if it ends up empty.

## Out of scope

- DB schema, RLS, server functions, auth, routing, settings page UI.
- Quick-add panel layout, shift templates page layout, calendar long-press behaviour.

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
