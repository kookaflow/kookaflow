# Phase 5.5 — Custom Categories + Icon Colour Picker

Two pre-Phase-6 additions. Auth, routing, and global nav are untouched.

---

## Change 1 — Custom Categories

### 1. Database (migration)

`categories` table:
- Add `user_id uuid null references auth.users(id) on delete cascade`
- Add `is_active boolean not null default true`
- Index on `(user_id)`
- Replace RLS:
  - `select`: `user_id is null OR user_id = auth.uid()`
  - `insert`: `user_id = auth.uid() AND is_system = false`
  - `update`: `user_id = auth.uid() AND is_system = false`
  - `delete`: `user_id = auth.uid() AND is_system = false`
- Existing 8 rows stay `is_system = true`, `user_id = null`.

New table `user_category_visibility` (so hiding a *system* category is per-user, not global):
- `user_id uuid`, `category_id text`, `hidden boolean default true`, PK `(user_id, category_id)`
- RLS: own rows only.

`events.category` stays `text` with no FK — when a custom category is deleted, events survive and render as "Uncategorised" via lookup miss.

### 2. Server functions (new `src/lib/categories.functions.ts`)

- `listCategories()` — merged system + own custom, filtered by visibility (for pickers).
- `listAllCategories()` — includes hidden, for settings.
- `createCategory`, `updateCategory`, `deleteCategory` — own custom only.
- `setCategoryVisibility({ categoryId, hidden })` — writes `user_category_visibility`.

### 3. Frontend types + lib refactor

- `src/types/event.ts`: widen `CategoryId` from union to `string` (custom IDs are uuids). Add `Category` interface (`id`, `label`, `color`, `iconName`, `isSystem`).
- `src/lib/categories.ts`: convert hardcoded export into a `useCategories()` React Query hook + `resolveCategory(list, id)` helper that returns an "Uncategorised" placeholder (`#94A3B8`, `HelpCircle`) on miss.
- Refactor every `getCategory(id)` call site to use the hook or a passed-down resolved category. Affected files:
  - `EventForm.tsx`, `CategoryBadge.tsx`, `CategoryDot.tsx`, `event-icon.ts`
  - calendar: `MonthView`, `WeekView`, `DayView`, `EventChip`, `EventBlock`, `MonthDayCell`
  - dashboard: `CategoryCard`, `MonthlyDonutChart`, `WeeklyStackedBarChart`, `metrics.ts`, `nudges.ts`
  - today: `CategoryBreakdownMini`, `TodayEventsList`
  - weekly: `WeeklyCategoryChart`, `WeeklyTotalsList`
- System categories keep their `bg-cat-*` tokens for theming; custom categories use inline `style={{ backgroundColor: cat.color }}`.

### 4. Add Event modal — category selector

- After the system chips, add an "Add category" chip (dashed border, plus icon, muted background).
- Opens `CreateCategoryDialog` as a sub-dialog. On create → cache invalidates, new id auto-selected, sub-dialog closes.

### 5. `CreateCategoryDialog` (new component)

- Live preview chip at the top.
- Name input, 20-char max, character counter.
- Icon grid: reuse `ICONS` from `IconPicker.tsx` (30 icons, 5 cols).
- Colour grid: 4×4 of the 16 specified hex values, 40px circles, white check on selected.
- "Create Category" primary button, "Cancel" link.
- Edit mode = same component, pre-filled, title swaps to "Edit category".

### 6. Settings — "My Categories" section

- New `src/components/settings/CategoriesSettings.tsx`, mounted in `_authenticated.settings.tsx`.
- Default list (system, read-only): icon, name, "Default" badge, visibility toggle only.
- My categories list (custom): icon, name, edit + delete, visibility toggle.
- Delete confirmation: "Events using this category will keep their data but show as Uncategorised. Are you sure?"
- Visibility writes to `user_category_visibility`.

### 7. Dashboard — dynamic cards

- `metrics.ts` iterates the user's active category list instead of the hardcoded array.
- `CategoryCard` accepts a resolved `Category` (color + icon) instead of a `CategoryId`.
- Zero-hour custom categories render collapsed by default with a "Show empty categories" toggle.
- Balance Score input widens to include custom hours (formula unchanged).

---

## Change 2 — Icon Colour Picker

### 1. Database (same migration)

- `ALTER TABLE events DROP COLUMN icon_gradient;`
- `ALTER TABLE events ADD COLUMN icon_color text;`
- No data migration (no real events). Verify `count(*) where icon_gradient is not null = 0` before dropping; if non-zero, keep the old column and ignore it.

### 2. Types

- `src/types/event.ts`: remove `GradientId`/`iconGradient`, add `iconColor?: string`.
- Delete `src/lib/gradients.ts` after `rg` confirms no remaining imports.

### 3. `IconPicker.tsx` redesign

- 5-col grid, 48px rounded square tiles.
- Unselected: `bg-slate-100` (`#F1F5F9`), dark icon.
- Selected: background = chosen `iconColor`, white icon, white ring offset.
- Always-visible "Icon colour" section below:
  - 4×4 grid of the 16 hex circles, 40px, white check on selected.
  - 17th "Custom" rainbow circle → opens hidden `<input type="color">`.
- Default `iconColor` resolution on mount:
  - Existing event with `iconColor` → use it.
  - Else → selected category's color (system token or custom row).
  - Recompute when category changes *only if* user hasn't manually overridden.

### 4. Form + events function

- `EventForm.tsx`: swap `iconGradient` state → `iconColor`; pass through to draft.
- `EventDraft` / `CalendarEvent`: `iconColor?: string`.
- `events.functions.ts`: read/write `icon_color`.

### 5. Calendar rendering

- `event-icon.ts`: `getEventIcon` returns `{ Icon, color }` instead of `{ Icon, gradient }`.
- Tiles: 20px rounded square on calendar, 32px in detail view, `backgroundColor: color`, white icon.
- Audit consumers: `EventChip`, `EventBlock`, `MonthDayCell`, `TodayEventsList`, `ShiftCard`, any preview in `EventDialog`.

---

## Implementation order

1. Migration: categories columns + RLS + `user_category_visibility` + `events.icon_color`.
2. Regenerate types; update `events.functions.ts` for renamed column.
3. Icon colour picker (self-contained — ship + smoke-test first).
4. Categories server functions + `useCategories` hook + refactor `getCategory` callers.
5. `CreateCategoryDialog` + "Add category" chip in `EventForm`.
6. Settings "My Categories" section + visibility toggles.
7. Dashboard dynamic cards + Balance Score input widening.

After each step: smoke-test calendar render, event create/edit, dashboard load.

---

## Risks & callouts

- **`CategoryId` widening** (union → string) is the largest blast radius. Every `Record<CategoryId, ...>` (e.g. `defaultGradientForCategory` in `event-icon.ts`) needs a graceful fallback via `resolveCategory`.
- **System category hiding** must be per-user — that's why `user_category_visibility` is a separate table rather than mutating `categories.is_active`.
- **No FK from `events.category`** is intentional so deleting a category preserves event history; UI shows "Uncategorised" on miss.
- **Dropping `icon_gradient`**: verify zero rows first; otherwise keep the column dormant.
- **Contrast**: the 16 preset colours include `#1C1C1E`. White icons/checks must remain legible across all 16 in both light and dark themes.
- **Out of scope**: editing system category colors, sharing custom categories between users, reordering categories.