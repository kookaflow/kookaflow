# ShiftSync — Phase 1 Plan: Core Calendar UI

Scope: front-end only. No backend, no auth, no integrations yet. State lives in React (Context + localStorage) so the UI is fully usable before Supabase is connected in Phase 2.

---

## 1. Screen layout

```text
+---------------------------------------------------------------+
| TopNav: Logo | Month/Week/Day toggle | DatePicker | Theme | + |
+----------------+----------------------------------------------+
|                |                                              |
|  Sidebar       |   Calendar surface                           |
|  (Today panel) |   (Month grid / Week grid / Day timeline)    |
|                |                                              |
|  - Date hero   |   Click day  -> opens DayDetail              |
|  - Shift card  |   Click slot -> opens EventDialog (create)   |
|  - Events list |   Click event-> opens EventDialog (edit)     |
|  - Category    |                                              |
|    breakdown   |                                              |
|                |                                              |
+----------------+----------------------------------------------+
```

A WeeklySummaryPanel slides in from the right when the user is in Week view and clicks "Weekly summary" in the TopNav.

---

## 2. Life categories (shared constant)

Seven categories, each with id, label, color token, and Lucide icon:

- work       Briefcase
- rest       Moon
- wellness   Heart
- exercise   Dumbbell
- social     Users
- family     Home
- personal   Sparkles

Colors are defined as CSS variables in `styles.css` (`--cat-work`, `--cat-rest`, etc.) so categories are themable in both dark and light mode.

---

## 3. Data model

### Event
```text
Event {
  id: string                  // uuid
  title: string
  category: CategoryId        // see list above
  start: ISO datetime
  end: ISO datetime
  allDay: boolean
  icon: string                // Lucide icon name, optional override
  colorTag: string            // optional override of category color
  notes: string
  shift?: ShiftMeta           // present only when category === "work"
  createdAt: ISO datetime
  updatedAt: ISO datetime
}
```

### ShiftMeta
```text
ShiftMeta {
  shiftType: "morning" | "afternoon" | "night" | "rotating"
  role: string                // e.g. "RN", "Driver"
  location: string            // e.g. "Ward 4B"
}
```

### UserPreferences (Phase 1, local only)
```text
UserPreferences {
  theme: "dark" | "light"
  defaultView: "month" | "week" | "day"
  weekStartsOn: 0 | 1         // Sun or Mon
}
```

### Derived: CategoryBreakdown
Computed from events for a given range:
```text
CategoryBreakdown {
  range: { start, end }
  totals: Record<CategoryId, hours>
  totalHours: number
}
```

---

## 4. State management

- `EventsProvider` — CRUD over events, persists to localStorage under `shiftsync.events.v1`.
- `PreferencesProvider` — theme, default view, week start; persists under `shiftsync.prefs.v1`.
- `CalendarProvider` — current view mode, currently selected date, selected event id.

Selectors (pure helpers, no provider):
- `getEventsForDay(events, date)`
- `getEventsForWeek(events, date, weekStartsOn)`
- `getEventsForMonth(events, date)`
- `getCategoryBreakdown(events, range)`

Date math via `date-fns`.

---

## 5. Component tree

```text
RootLayout (src/routes/__root.tsx)
  ThemeProvider
  PreferencesProvider
  EventsProvider
  CalendarProvider
    TopNav
      BrandMark
      ViewToggle            (Month / Week / Day)
      DatePicker            (popover calendar + prev/next/today)
      WeeklySummaryButton   (visible in Week view)
      ThemeToggle
      NewEventButton
    <Outlet />              (route content)

routes/index.tsx -> CalendarPage
  CalendarPage
    Sidebar (TodayPanel)
      DateHero
      ShiftCard             (next/current shift)
      TodayEventsList
        EventListItem * n
      CategoryBreakdownMini (today)
    CalendarSurface         (switches on view)
      MonthView
        MonthGrid
          MonthDayCell * 35-42
            DayNumber
            EventChip * up to 3
            MoreEventsPill
      WeekView
        WeekHeader (day columns)
        WeekTimeline
          TimeGutter
          WeekDayColumn * 7
            EventBlock * n
      DayView
        DayHeader
        DayTimeline
          TimeGutter
          EventBlock * n

Overlays (portaled, mounted once in CalendarPage)
  EventDialog              (create + edit, shared)
    EventForm
      TitleField
      CategorySelect
      DateTimeRangeField
      AllDayToggle
      IconPicker
      ColorTagPicker
      NotesField
      ShiftFieldsGroup     (rendered when category === "work")
        ShiftTypeSelect
        RoleField
        LocationField
  DayDetailSheet           (full list for a clicked day)
  WeeklySummaryPanel       (drawer)
    WeeklyCategoryChart    (stacked bars, 7 days)
    WeeklyTotalsList
    WeeklyInsights         (placeholder for Phase 3 nudges)

Primitives (src/components/ui/*)
  Existing shadcn components: button, dialog, sheet, popover,
  select, input, textarea, switch, tabs, calendar, scroll-area,
  tooltip, sidebar.
```

Shared visual atoms:
- `CategoryDot`, `CategoryBadge`, `EventChip`, `EventBlock` — all read from the categories constant so colors stay consistent everywhere.

---

## 6. Routing

Single route in Phase 1. Future routes are stubbed only as folder intent, not created yet.

```text
src/routes/
  __root.tsx          providers + TopNav + Sidebar shell
  index.tsx           CalendarPage (Month/Week/Day switch via state)
  sitemap[.]xml.ts
```

View mode is in `CalendarProvider` rather than the URL for Phase 1 to keep the calendar surface fast to switch. Phase 2 can promote it to `?view=week&date=...` if deep links are needed.

---

## 7. File structure

```text
src/
  routes/
    __root.tsx
    index.tsx
  components/
    layout/
      TopNav.tsx
      Sidebar.tsx
      ThemeToggle.tsx
      ViewToggle.tsx
      DatePicker.tsx
      NewEventButton.tsx
    calendar/
      CalendarSurface.tsx
      MonthView.tsx
      MonthDayCell.tsx
      WeekView.tsx
      WeekDayColumn.tsx
      DayView.tsx
      TimeGutter.tsx
      EventChip.tsx
      EventBlock.tsx
    today/
      TodayPanel.tsx
      DateHero.tsx
      ShiftCard.tsx
      TodayEventsList.tsx
      CategoryBreakdownMini.tsx
    events/
      EventDialog.tsx
      EventForm.tsx
      ShiftFieldsGroup.tsx
      IconPicker.tsx
      ColorTagPicker.tsx
      DayDetailSheet.tsx
    weekly/
      WeeklySummaryPanel.tsx
      WeeklyCategoryChart.tsx
      WeeklyTotalsList.tsx
    shared/
      CategoryDot.tsx
      CategoryBadge.tsx
    ui/                       (shadcn — existing)
  providers/
    ThemeProvider.tsx
    PreferencesProvider.tsx
    EventsProvider.tsx
    CalendarProvider.tsx
  lib/
    categories.ts             constant + types
    date.ts                   date-fns helpers
    storage.ts                localStorage helpers
    selectors.ts              getEventsForDay/Week/Month, breakdown
    ids.ts                    uuid helper
  types/
    event.ts                  Event, ShiftMeta, CategoryId
    preferences.ts
  styles.css                  category color tokens + theme
```

---

## 8. Design system additions (`styles.css`)

- Dark mode is the default; `.light` class flips tokens.
- New tokens: `--cat-work`, `--cat-rest`, `--cat-wellness`, `--cat-exercise`, `--cat-social`, `--cat-family`, `--cat-personal`, plus matching `--cat-*-foreground`.
- Registered in `@theme inline` so Tailwind classes like `bg-cat-work` and `text-cat-rest-foreground` are available.
- Vibrant but readable in dark mode; pastel-shifted in light mode.

---

## 9. Out of scope for Phase 1

These are explicitly deferred so the calendar ships clean:

- Supabase, auth, real persistence
- Recurring shift patterns and shift templates
- Email reminders (Resend), SMS reminders (Twilio)
- Google Calendar / iCal sync
- Wellness nudges and research-backed insights (UI placeholder only in WeeklySummaryPanel)
- Sound and push notifications
- Multi-user / team views

---

## 10. Acceptance criteria for Phase 1

- User can switch between Month, Week, Day from the TopNav.
- User can click any day or time slot to open EventDialog and create an event with all listed fields, including shift fields when category is Work.
- User can click an existing event to edit or delete it.
- Sidebar always reflects the selected date with shift card, event list, and category breakdown for that day.
- Weekly summary panel shows hours per category for the visible week.
- Theme toggle switches dark/light and persists across reloads.
- All events persist in localStorage and survive refresh.
