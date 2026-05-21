# ShiftSync — Targeted Improvements Plan

Scope: 7 changes to event modal, calendar rendering, and dashboard. No touching `/dashboard` earnings logic, Supabase config, or routing.

---

## Change 1 — Split Shift type

Add `"split"` to `ShiftType` union. In the Event modal's `ShiftFieldsGroup` (Work category), when `shiftType === "split"` render three controls:
- First Shift: start / end time
- Break: Select (30m, 45m, 1h, 1.5h, 2h)
- Second Shift: start / end time

Extend `ShiftMeta` with optional `split?: { firstStart, firstEnd, breakMinutes, secondStart, secondEnd }`. Stored inside the existing event `shift` blob — no schema migration.

## Change 2 — Travel category

Add `"travel"` to `CategoryId` in `src/types/event.ts` and `src/components/calendar-page/constants.ts`.
- Color `#64748B`, Lucide `Car` icon
- Added to `CATEGORIES` → flows into selector, badges, calendar coloring
- Dashboard: new `CategoryCard` "Travel Time" (weekly hours); `metrics.ts` includes `travel`
- Balance Score includes `travel` with a neutral weight (similar to `personal`)

## Change 3 — Quick Add preset row

New `src/components/events/QuickAddPresets.tsx` at top of `EventForm`. Horizontal scroll, iOS 17 chip style: `rounded-full`, `bg-[color]/15`, `text-[color]`, icon + label.

Presets in `src/components/events/presets.ts`:
1. Morning (Sun, amber, 06–14, Work)
2. Afternoon (Sunset, orange, 14–22, Work)
3. Night (Moon, indigo, 22–06, Work)
4. On-Call (Radio, teal, all-day, Work)
5. Split Shift (GitBranch, purple, opens split fields, Work)
6. Sick Leave (Thermometer, red, all-day, Work)
7. Annual Leave (Umbrella, sky, all-day, Work)
8. Travel (Car, slate, Travel)
9. Payday (DollarSign, gold, all-day, Work + payday=true)

Tapping calls `applyPreset(p)` that sets title, category, times, allDay, shiftType, icon, isPayday in one go.

## Change 4 — Modern icon picker

New `src/components/events/IconPicker.tsx` replacing the current icon section.
- 5-column grid of rounded-2xl `aspect-square` tiles
- White Lucide icon on a gradient (`bg-gradient-to-br from-X to-Y`)
- 6 gradients (Sunrise, Ocean, Forest, Lavender, Slate, Coral) cycled by tapping the already-selected tile
- Selected: `ring-2 ring-white ring-offset-2 ring-offset-background`
- Icon set (30): Sun, Moon, Sunset, Car, Briefcase, Heart, Dumbbell, Users, Home, Coffee, Music, Book, Plane, Utensils, Bike, Leaf, Star, Bell, Zap, Thermometer, Umbrella, Radio, GitBranch, DollarSign, Baby, Dog, Gamepad, ShoppingBag, Stethoscope, Bus

Model: add `iconName?: string` and `iconGradient?: GradientId` to `CalendarEvent`. Replace existing free-text `icon` field.

## Change 5 — Icons visible on calendar

Always render the event icon:
- Month view (`MonthDayCell` / `MonthView`): 16×16 icon beside the dot + title
- Week view (`WeekDayColumn` / `EventBlock`): icon on left inside the block
- Day view (`DayView`): icon prominently next to title

Helper `src/lib/event-icon.ts`: returns `{ Icon, gradient }` from event — falls back to category icon. Travel auto-gets `Car`.

## Change 6 — Payday toggle + banner

- `isPayday: boolean` on `CalendarEvent` (Work-only UI)
- Switch in `EventForm` under Work fields
- `TodayPanel` / `DateHero`: banner "💰 Payday today!" when any today event has `isPayday`
- Quick Add preset (#9)

## Change 7 — Sync warning banner

No Google Calendar sync exists yet. Add `src/providers/SyncStatusProvider.tsx` (in-memory `isSyncing`) and `src/components/settings/SyncBanner.tsx`. While syncing, AppLayout renders:

> "Syncing your calendar — this may take a few minutes depending on how many events you have ☕"

Auto-dismiss on complete. Trigger stubbed for the future Google Calendar settings button.

---

## Files to create

- `src/components/events/QuickAddPresets.tsx`
- `src/components/events/presets.ts`
- `src/components/events/IconPicker.tsx`
- `src/components/events/SplitShiftFields.tsx`
- `src/lib/event-icon.ts`
- `src/lib/gradients.ts`
- `src/components/settings/SyncBanner.tsx`
- `src/providers/SyncStatusProvider.tsx`

## Files to modify

- `src/types/event.ts` — `travel` category, `split` shift type, `ShiftMeta.split`, `iconName`, `iconGradient`, `isPayday`
- `src/components/calendar-page/constants.ts` — Travel category + Split shift style
- `src/lib/categories.ts` — Travel entry + tailwind classes
- `src/components/events/EventForm.tsx` — Quick Add row, IconPicker, Payday toggle, Split shift wiring
- `src/components/events/ShiftFieldsGroup.tsx` — Split option in shift-type select
- `src/components/calendar/EventBlock.tsx`, `EventChip.tsx`, `MonthDayCell.tsx`, `WeekDayColumn.tsx`, `DayView.tsx`, `MonthView.tsx` — render icon inline
- `src/components/dashboard/lib/metrics.ts` + dashboard page — Travel card + Balance Score
- `src/components/today/TodayPanel.tsx` (or `DateHero.tsx`) — Payday banner
- `src/routes/__root.tsx` — mount `SyncStatusProvider` + render `SyncBanner` in `AppLayout`

## Implementation order

1. Types + category registry (foundation for Changes 1, 2)
2. Gradients + IconPicker (Change 4) — needed by presets
3. Quick Add presets + Split shift fields in EventForm (Changes 3, 1 UI)
4. Payday toggle + daily banner (Change 6)
5. Calendar icon rendering across all 3 views (Change 5)
6. Dashboard Travel card + Balance Score (Change 2 dashboard side)
7. Sync banner + provider stub (Change 7)

## Breaking changes / risks

- `CalendarEvent.icon` (free-text) → replaced by `iconName` + `iconGradient`. Existing localStorage events lose icon string (mock data only). Add a one-line migration in `EventsProvider` to drop the old field.
- Adding `travel` to `CategoryId` widens exhaustive switches — check `lib/selectors.ts`, `metrics.ts`, `nudges.ts`.
- Dashboard already iterates `CATEGORIES` so Travel flows in automatically; verify Balance Score weighting isn't double-counting work-adjacent time.
- No Supabase / routing / `/dashboard` earnings logic touched.
