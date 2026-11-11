# Month view: two-line shift chips with short labels

## What changes
1. **Chips replace badges (month view only).** Each shift becomes a full-width chip in the shift colour with two lines: short label, then start time (e.g. `22:30`). Normal case, no icon, ~11px text, tight padding. Budget: 9 characters at 390px wide.
2. **Automatic short label, no setup needed:**
   - Fits in 9 characters: use the full name.
   - Two or more of your templates share the same first word (e.g. "Baptistcare Night" / "Baptistcare AM"): shorten that word to 4 letters, keep the rest: "Bapt Night", "Bapt AM". If it still doesn't fit, cut it off with "…".
   - Otherwise: cut off with "…" (e.g. "Gymnasti…").
3. **Optional "Short label" in the template editor.** Shows the generated label as placeholder/pre-fill; leaving it empty or unchanged keeps it automatic (it updates if you rename the template). Max 12 characters, never required.
4. **Limits per day:** up to 2 shift chips, then "+N". Personal and Google events show as up to 3 small dots under the chips (then "+N").
5. **Overnight shifts** appear only on their start day (already how it works). Week and day views keep full names.

## How your current templates would look
Account with 7 templates:
| Template | Chip label |
|---|---|
| Anglican ND | Anglican… |
| BaptistCare | Baptist… → see note |
| Gym | Gym |
| Gymnastics | Gymnasti… |
| Lakes Grammar Event | Lakes Gr… |
| Pilates | Pilates |
| TAFE | TAFE |

Note: "BaptistCare" is 11 characters, so it becomes "Baptist…"; no templates share a first word right now ("Gym" and "Gymnastics" are different words), so the 4-letter rule doesn't kick in yet. You can set e.g. "Anglican" or "Baptist" yourself with the new field.

Other accounts: "Afternoon" → "Afternoon" (9, fits), "Day" → "Day".

## Technical details
- Migration: add nullable `short_label text` (check length <= 12) to `shift_templates`.
- `src/lib/calendarAgenda.ts`: add pure `shortLabels(templates, max=9): Map<id,label>` and `shortLabelFor(name, siblings)`; unit tests for fit, shared-first-word ("Baptistcare Night/AM" → "Bapt Night/AM"), truncation, override wins.
- Shift events resolve their template (by template id/name already on the event) to get colour + label; fallback to generated from event title.
- `MonthView.tsx`: new `ShiftChip` (in `agendaShared.tsx`), `MAX_CHIPS = 2`, dots for non-shifts; full-width `truncate` as a visual safety net.
- `ShiftEditorSheet.tsx`: "Short label (optional)" input with generated placeholder; saves null when empty or equal to generated.
- Week/day views, AddShiftSheet unchanged.
