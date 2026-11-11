# Month view: events as text chips

## What changes
- **Event "light chip"**: one line under the shift chips — a small coloured dot (event colour, or the Google calendar's colour), then start time and title, e.g. "09:00 Dentist". Pale tinted background with a thin outline in that colour, never solid, so shifts stay dominant. All-day events show the title only.
- **Fitting**: same rule as shift labels — measure the real width, show the longest whole-word version that fits, cut mid-word with "…" only if the first word alone doesn't fit. The time is always kept; only the title is shortened.
- **Order in a day**: shifts first (by start time), then events (by start time). Overnight shifts still only on their start day.
- **Limit per day (shifts and events together)**: up to 3 items on phones, up to 4 on wider screens, then a "+N more" line. Tapping the day opens the day panel with everything (unchanged).
- **Dot row removed** entirely.
- Shift chips look the same. Note: today shifts are capped at 2 on their own; with the shared limit a day with 3 shifts on a phone will show all 3 (and no events) before "+N more".

## Screenshots
After building, I'll sign the preview in, add sample events if needed, and capture the month view at 390px and at desktop width, and share both.

## Technical details
- New `EventChip` in `src/components/calendar-page/` reusing the measure-and-fit helper from `ShiftChip` (extract the shared fitting function if needed, so both use one implementation).
- `MonthView.tsx`: build one sorted list (shifts, then events), slice to `MAX_ITEMS` (3 below the `sm` breakpoint, 4 above, via a small media-query hook), render "+N more".
- Tint via `color-mix` of the item colour with the card background; text uses the foreground token.
- Add a unit test for ordering and the per-day limit / "+N more" count.
