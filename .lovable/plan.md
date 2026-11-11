# Calendar redesign: agenda week, status day, badge month, day panel

Applies to website and phone apps. No data changes: existing shifts, events, colours, templates, quick-add and Google Calendar events all keep working. Shift times, pay rate and earnings use the values already saved on each shift.

## Shared rules (all views)

- **Badge**: 2-letter initials from the shift name ("Night Shift" -> NS, "Early" -> EA) on the shift's saved colour (falls back to the matching template colour, then the Work colour). Text colour picks light or dark for contrast.
- **Overnight shift** (end on a later date than start): belongs to its **start day** for lists, badges and totals. Hours are never split or counted twice.
- **Multiple shifts per day**: always sorted by start time, all shown (no "+ more" truncation for shifts in week/day; month caps visible badges, see below). Split shifts show as one item with both time ranges.
- **Earnings**: sum of each shift's saved earnings; if none, hours x saved hourly rate; if no rate, the earnings figure is hidden (hours still shown).
- **Personal and Google events** are listed with times but never counted in work hours or pay.

## 1. Week view (agenda list)

```text
MON 10   07:00 [EA] Early shift ......... 8h
TUE 11   19:00 [NS] Night shift  -> 07:00 next day  12h
WED 12   Off from 07:00 · recovery day
         18:30 •  Dinner with Sam (event)
THU 13   Free
...
Week: 38h · est. $1,520
```
- One row per day Mon-Sun; today highlighted.
- Each item: start time, badge, full name, duration. Overnight shows "-> HH:MM next day" on start day only.
- The day after an overnight shift shows "Off from HH:MM · recovery day" instead of "Free" (still lists any items it has). A night shift that started the previous Sunday also marks this Monday.
- Two shifts on one day: two lines, in order.
- Footer: week hours + estimated earnings (shifts starting in this week).

## 2. Day view

- **Status line**, chosen in order: Working night (a shift that starts today and ends tomorrow) -> Working (any shift today) -> Recovering after a night shift (a shift ended this morning that started yesterday) -> Day off.
- **24-hour bar**: thin bar with tick marks at 0/6/12/18/24. Worked time filled in each shift's colour, including the morning portion of a shift that started yesterday (shown faded, labelled "from yesterday") and tonight's portion up to midnight. Multiple shifts = multiple segments; overlaps stack.
- **Suggested rest window** shaded on the bar: after the last shift ending today (or the overnight one ending this morning), 8 hours starting 1 hour after it ends; before an evening/night shift, a pre-shift nap window ending 2 hours before start. Shown only when it doesn't clash with another item.
- **List**: each of today's shifts and events with times, duration, estimated pay (shifts) and notes. A shift from yesterday that ends today appears as a small "Continuing: Night shift until 07:00" line, without pay (it's counted on its start day).
- **"Add rest time"** button appears after a night shift (on the recovery day); it opens the event form pre-filled as Rest/Sleep for the suggested window.
- **"Coming up"**: next shift after today, e.g. "Coming up: Night shift · Thu 19:00".

## 3. Month view

- Keep the grid. Each day shows coloured initial badges per shift (up to 3, then "+N"), and small dots for personal/Google events (up to 3 dots).
- Overnight shifts show a badge only on the start day.
- Footer: month hours + estimated earnings (shifts starting in the month).

## 4. Adding and editing from a day

- Tapping a day (month or week) opens a panel directly under that day/row (on month view, below the week row containing it) listing the day's shifts and events; tapping one opens its existing edit form. Buttons: **+ Add shift**, **+ Add event**. Tapping the same day again closes it.
- **+ Add shift** opens a sheet (bottom sheet on phone, dialog on desktop):
  - The user's shift templates, each with badge, name and times. One tap creates that shift on that day (overnight templates end the next day automatically) and closes the sheet.
  - Templates whose times overlap an existing item on that day show an "Overlaps" tag (still tappable).
  - "Custom times for this day" opens the existing event form as a Work shift on that date.
  - "+ New shift template" goes to the shift templates screen.
- **+ Add event** opens the existing event form for that day.
- Remove tap-on-empty-space-to-add and double-click-to-add. The quick-add button and stamp mode stay as they are.

## 5. Busy-stretch nudge

One compact line ("6 shifts in a row - plan a rest day soon") with a small X. Dismissal remembered for that stretch, so it doesn't reappear until a different busy stretch.

## Technical details

- New pure helpers in `src/lib/calendarAgenda.ts`: `shiftInitials`, `isOvernight`, `itemsForDay` (start-day ownership), `recoveryInfo(day)`, `dayStatus`, `workedSegments(day)` (clips previous-day shifts), `suggestedRest`, `overlaps`, `periodTotals(range)`, `nextShift`. Unit tests in `calendarAgenda.test.ts` covering overnight ownership, recovery day, Sunday->Monday carry-over, two shifts in one day, overlap detection and totals.
- New components in `src/components/calendar-page/`: `WeekAgenda.tsx`, `DayStatusView.tsx`, `DayBar.tsx`, `DayPanel.tsx`, `AddShiftSheet.tsx`, `ShiftBadge.tsx`, `PeriodFooter.tsx`.
- `MonthView.tsx` updated for badges/dots/footer and inline panel; `TimeGrid` no longer used by week/day (kept file until confirmed unused, then removed).
- `_authenticated.calendar.tsx`: swap views, drop slot-click create handlers, wire panel/sheet to existing `EventDialog`, `useEvents().createEvent` and shift templates query. Week/day visible range widened by one day before so previous-night shifts load.
- `WellnessNudgeBanner.tsx` restyled to a single line with dismiss key stored locally.
- All colours via existing category tokens / saved shift colours; layout bounded for iOS width rules already in place.
- Phone apps need a new mobile build to show it; website updates on Publish.
