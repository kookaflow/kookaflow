# Month view: two-line shift chips with short labels

## What changes
1. **Chips replace badges (month view only).** Each shift becomes a full-width chip in the shift colour with two lines: short label, then start time (e.g. `22:30`). Normal case, no icon, 11px text, tight padding.
2. **Labels fitted to the real chip width.** The app measures the text in the chip and picks the longest whole-word version that fits (about 8 characters on a 390px phone). Checked at 360px for smaller Androids.
   - If two or more of your templates share the same first word (e.g. "Baptistcare Night" / "Baptistcare AM"), that word becomes 4 letters first: "Bapt Night", "Bapt AM", then whole-word fitting applies.
   - Only if the first word alone doesn't fit is it cut mid-word with "…" (e.g. "Gymnast…").
3. **Optional "Short label" in the template editor.** Pre-filled with the generated label, never required, max 10 characters. A live preview shows exactly how the chip will look (colour, label, start time, same width as on the calendar). Leaving it unchanged keeps it automatic.
4. **Limits per day:** up to 2 shift chips, then "+N". Personal and Google events show as up to 3 small dots under the chips.
5. **Overnight shifts** appear only on their start day. Week and day views keep full names.

## How your current templates would look
Estimated at about 8 characters (confirmed with screenshots at 390px and 360px during build):

| Template | Chip label |
|---|---|
| Anglican ND | Anglican |
| BaptistCare | Baptist… (one word, too long) |
| Gym | Gym |
| Gymnastics | Gymnast… |
| Lakes Grammar Event | Lakes |
| Pilates | Pilates |
| TAFE | TAFE |

No templates share a first word right now ("Gym" and "Gymnastics" are different words), so the 4-letter rule doesn't apply yet. Other accounts: "Afternoon" → "Afterno…" (or full if it fits), "Day" → "Day".

## Technical details
- Migration: nullable `short_label text` (check length <= 10) on `shift_templates`.
- `src/lib/calendarAgenda.ts`: pure `labelCandidates(name, siblingNames)` (shared-word shortening, whole-word prefixes longest first) and `fitLabel(candidates, fits)` taking a measure function. Unit tests with a fake measurer: whole-word choice, "Baptistcare Night/AM" → "Bapt Night/AM", mid-word "…" only when the first word doesn't fit, override wins.
- `ShiftChip` in `agendaShared.tsx`: canvas `measureText` at the chip font, width from ResizeObserver, memoised.
- `MonthView.tsx`: `MAX_CHIPS = 2` + "+N", dots for non-shifts.
- `ShiftEditorSheet.tsx`: "Short label (optional)" input, maxLength 10, live `ShiftChip` preview; saves null when empty or equal to generated.
- Add task to roadmap.md; verify with screenshots at 390px and 360px.
