# Custom Shift Templates — Implementation Plan

Goal: let users create, save and reuse their own shift types (à la MyShift Planner) that flow into the quick-add panel, the Add Event modal's shift selector, earnings, and the dashboard category totals.

## Current State

- `shift_templates` table already exists but is minimal: `name, colour, icon_name, default_start, default_end, category (working|leave|non_working), base_type, sort_order`.
- `/shifts` route exists (`src/routes/_authenticated.shifts.tsx`) with grouped sections and `ShiftEditorSheet` modal.
- `ShiftTemplatesProvider` already wires CRUD via server fns in `src/lib/shift-templates.functions.ts`.
- Quick-add panel (`src/components/calendar/QuickAddPanel.tsx`) currently shows only built-in stamps from `src/lib/stamps.ts`.
- Add Event modal (`src/components/events/EventForm.tsx` + `ShiftFieldsGroup`) has hard-coded shift type chips.

## A. Database — extend `shift_templates`

New migration adds the missing columns:

- `show_as text` (≤6 chars, calendar badge label)
- `is_all_day boolean default false`
- `is_split_shift boolean default false`
- `is_24_hour boolean default false`
- `total_hours numeric(5,2)` (server-computed on insert/update via trigger)
- `unpaid_break_minutes int default 0`
- `paid_break_minutes int default 0`
- `split_start_2 time`, `split_end_2 time`
- `is_active boolean default true`
- Length check on `name` (≤20) and `show_as` (≤6)

Add a trigger `compute_shift_template_hours()` that recalculates `total_hours` from the time fields, split times, `is_24_hour`, and `unpaid_break_minutes` so the value is always authoritative.

RLS is already correct (`user_id = auth.uid()` on all four verbs). No changes needed.

The existing `category` column currently uses `working|leave|non_working`. We keep that as the *grouping* on the /shifts screen and add a new `life_category text` column constrained to the 8 app categories (`work|rest|wellness|exercise|social|family|personal|travel`) so dashboard totals can attribute hours correctly. Default `work`.

## B. Server / Provider layer

- Extend `ShiftTemplateDTO`, Zod schema, and `rowToDTO` in `src/lib/shift-templates.functions.ts` with the new fields.
- Update `ShiftTemplatesProvider`'s `toInput` mapping accordingly.
- Add a helper `templateToStamp(template)` in `src/lib/stamps.ts` that adapts a `ShiftTemplateDTO` into the `StampDef` shape the quick-add panel and stamper already consume.

## C. /shifts screen polish

Already grouped; refine to match spec:

- Add a top "MY CUSTOM SHIFTS" group above WORKING / LEAVE / NON-WORKING.
- Each row shows: coloured icon tile, bold name, subtitle `SHOWAS · HH:mm–HH:mm · Xh Ym`, chevron.
- Tap row → opens editor; swipe-left on custom rows → confirm-delete (mobile gesture via `framer-motion` drag or a long-press menu — we'll use a trailing delete button revealed on swipe, plus the existing trash button as a fallback).
- `+` button in header opens the editor for a new template.
- Entrypoints: existing back-to-calendar link, plus a new "Manage Shift Templates" row in Settings and a gear icon inside the quick-add panel header.

## D. Create / Edit modal — rewrite `ShiftEditorSheet`

Single sheet/dialog with fields in this order, each wired to local state with live validation:

1. Shift name (max 20, counter)
2. Show-as (max 6, counter, helper text, live badge preview)
3. Colour — reuse the 16-swatch picker
4. Icon — reuse `IconPicker` grid (30 Lucide icons)
5. Type — category selector reusing the same icon-based dropdown built for the Add Event modal
6. All-day toggle
7. Start/End time (hidden when all-day or 24h)
8. Is split shift toggle → reveals second start/end
9. Is 24-hour toggle → forces 24h, hides times
10. Unpaid break (minutes)
11. Paid break (minutes)
12. Live summary block: Shift duration / Paid time / Unpaid break, recomputed via a `useShiftMath` hook.

Persistent badge preview pinned near the top so colour/icon/show-as changes are visible while editing lower fields. Submit button: full-width gradient "Save Shift Template"; Cancel link below.

## E. Integration points

1. **Quick-add panel (`QuickAddPanel.tsx`)**
   - Pull `useShiftTemplates()`.
   - On the Shifts tab, render user templates first (via `templateToStamp`), then existing `SHIFT_STAMPS`.
   - Add a small gear icon in the panel header linking to `/shifts`.
   - Tapping a template tile selects it for stamping just like a built-in stamp.

2. **Stamping (`StampProvider`)**
   - When the selected stamp originates from a template, build the event draft from template fields: times, category (`life_category`), icon, colour, split fields, all-day, `paid_break_minutes` → ignored in duration but stored in notes/metadata if needed.

3. **Add Event modal (`EventForm` / `ShiftFieldsGroup`)**
   - Above the built-in shift-type chips, render a "Your shifts" row of custom templates.
   - Selecting one pre-fills: title (name), start/end (today + template times), category, icon, colour, split fields, is-all-day.

4. **Earnings**
   - Add `paidHoursForEvent(event, template?)` helper. For template-backed events: `paid_hours = total_hours − unpaid_break_minutes/60`. Multiply by `user_preferences.hourly_rate`.
   - Persist `unpaid_break_minutes` on the event row when created from a template so earnings remain accurate after the template changes (new nullable column on `events`: `unpaid_break_minutes int`).

5. **Dashboard**
   - Category metrics already key off `event.category`. Ensuring stamping writes the template's `life_category` is enough; no metric code changes.

## F. Implementation order

1. Migration: extend `shift_templates` (+ `events.unpaid_break_minutes`) and add hours trigger.
2. Update DTO / server fns / provider.
3. Rebuild `ShiftEditorSheet` with new fields + live preview + summary.
4. Polish `/shifts` screen (MY CUSTOM group, swipe-delete, gear entrypoints).
5. Wire templates into `QuickAddPanel` + `StampProvider` (stamping path).
6. Wire templates into `EventForm` shift selector (manual create path).
7. Update earnings helper + dashboard verification.
8. Add Settings "Manage Shift Templates" link.

## Technical notes

- All new code stays inside RLS-protected server fns; no admin client.
- `total_hours` is derived server-side via trigger so the client can't desync it.
- `templateToStamp` keeps the existing stamping pipeline untouched — only the source list grows.
- Icon/colour pickers and category selector are reused, not duplicated.