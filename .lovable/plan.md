# Make "today" stand out in the calendar

## What you'll see
- **Month view:** today's cell gets a soft purple tint and a 2px purple border, same rounded corners as other days. The date number sits in a filled purple circle with white text.
- **Past days this month** fade to about 60% (number and chips). Days from the previous/next month keep their current look. Today and future days stay full strength.
- **Week view:** today's row uses the same tint, 2px border and filled purple date circle.
- **Day view:** when the day shown is today, the date header shows the purple circle with the day number plus "Today".
- Light and dark mode both checked for readable contrast (white on purple at least 4.5:1).
- Screenshots at 390px of month, week and day views, in light and dark mode.

## Note on colour
The app's current "primary" colour is near-black slate, not purple, which is why today currently shows black. I'll add a dedicated brand-purple "today" colour so nothing else in the app changes colour.

## Technical details
- `src/styles.css`: new tokens `--today` (purple, e.g. oklch(0.55 0.2 295) light / oklch(0.68 0.18 295) dark), `--today-foreground` (white), `--today-soft` (tint); exposed as `--color-today*` in `@theme`.
- `MonthView.tsx`: today cell `border-2 border-today bg-today-soft`; date circle `bg-today text-today-foreground`; past in-month days (`isBefore(day, startOfToday())` and `isSameMonth`) get `opacity-60`. Selected state ring kept on top.
- `WeekAgenda.tsx`: replace `border-primary/40 bg-primary/10` with the today tokens; date number in a filled circle.
- `DayStatusView.tsx`: header shows today circle + "Today" label when `isToday(day)`.
- Verify with Playwright (signed in) at 390px light and dark; no sample data created.
