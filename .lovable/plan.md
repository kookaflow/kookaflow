# ShiftSync — Phase 2 Plan: Life-Balance Dashboard (/dashboard)

A read-only analytics view that reuses the same event data as the calendar and turns it into insights about how the user actually spends their week.

---

## 1. Route & shell

- New route file: `src/routes/dashboard.tsx`.
- Self-contained, mirrors the calendar shell: same TopNav-style header (logo, link back to `/calendar`, theme toggle), no sidebar.
- Page-local components live under `src/components/dashboard/` so nothing outside `/dashboard` is touched.
- Reads events from the **shared event store** (see §2). No new storage layer.

---

## 2. Shared data source

Today the calendar holds events in component state seeded by `buildMockEvents`. To let the dashboard read the same data without a backend:

- Promote events to a tiny shared store: `src/lib/events-store.ts`
  - Exposes `useEvents()` (subscribe + returns `MockEvent[]`) and `setEvents(updater)`.
  - Implementation: a module-level `useSyncExternalStore` wrapper around an array, seeded once from `buildMockEvents(new Date())`.
  - The calendar swaps its local `useState` for this hook; nothing else changes.
- Dashboard imports `useEvents()` the same way.
- This is the only file added outside `/dashboard`, and it only replaces the calendar's existing local `useState` call.

Phase 3 can swap the store's internals for Lovable Cloud without changing either page.

---

## 3. Calculation logic (pure selectors)

All math lives in `src/components/dashboard/lib/metrics.ts` as pure functions over `MockEvent[]`. No React, fully testable.

### 3.1 Range helpers

- `currentWeekRange(now, weekStartsOn=1)` → `{ start, end }` (Mon..Sun).
- `previousWeekRange(now)` → prior 7 days.
- `currentMonthRange(now)` → calendar month.

### 3.2 Clipping & hour accounting

- `eventHoursInRange(event, start, end)`: clips event to `[start,end]` and returns hours (handles overnight shifts correctly — Rest events crossing midnight count for each day proportionally).
- `splitEventByDay(event, start, end)`: yields `{ day: Date, hours, category }[]` so a Rest event from 22:30 → 06:30 contributes to two days.

### 3.3 Weekly stacked-bar data

```text
weeklyByDay(events, weekRange) →
  [{ day: 'Mon', date, work, rest, wellness, exercise, social, family, personal, total }, … ×7]
```

### 3.4 Monthly donut data

```text
monthlyTotals(events, monthRange) →
  [{ category, hours, pct }] for each of the 7 categories (filter zero in the chart, keep in legend)
totalMonthHours = Σ hours
```

### 3.5 Per-category card data

For each of the 6 dashboard categories (Work, Rest, Wellness, Exercise, Social, Family — Personal shown in donut/bar but not as a card per spec):

```text
categoryCard(category, events, thisWeek, lastWeek, wakingHoursPerWeek) → {
  hours:        Σ hours this week in category,
  pctOfWaking:  hours / wakingHoursPerWeek * 100,
  prevHours:    Σ hours last week in category,
  deltaPct:     (hours - prevHours) / max(prevHours, 1) * 100,
  trend:        'up' | 'down' | 'flat'   // |deltaPct| < 5 → flat
}
```

- `wakingHoursPerWeek` default: `7 × (24 - avgSleepHoursPerDay)` where `avgSleepHoursPerDay = clamp(Rest hours this week / 7, 6, 10)`; falls back to `7 × 16 = 112` when there are no Rest events.

### 3.6 Balance Score (0–100)

Goal: high when time is spread across categories, low when one category dominates. Uses normalized Shannon entropy across the 7 categories for the current week, ignoring sleep so working = sleeping doesn't artificially score high.

```text
weights = hours per category this week, excluding Rest, restricted to non-zero categories
p_i     = weights_i / Σ weights
H       = -Σ p_i * log(p_i)
H_max   = log(N)                  // N = number of non-Rest categories with > 0 hours
score   = round(100 * H / H_max)  // 0 when one category, 100 when perfectly even
```

Refinements:
- If total tracked non-Rest hours < 5 → score is `null`, card shows "Not enough data yet".
- Apply a small bonus (+0 to +5) for each "essential" category present (Exercise, Social, Family, Wellness) capped at 100 — rewards breadth, not just evenness.
- Categorize the number into bands for copy: 0–39 *Skewed*, 40–69 *Tilting*, 70–89 *Balanced*, 90–100 *In flow*.

### 3.7 Wellness nudges

A rule engine in `lib/nudges.ts`:

```text
rule = {
  id, category, severity, when(metrics) → boolean,
  message, source     // short citation, e.g. "Walker, Why We Sleep"
}
```

Rules (initial set, all evidence-cited):
- **Rest < 49h/week (≈7h/night)** → "Adults need 7–9 hours of sleep for cognitive recovery." (Walker; CDC/NIH sleep guidelines)
- **Three or more consecutive night shifts** → "After 3 nights in a row, prioritise a 24h recovery block." (Folkard & Tucker, occupational fatigue research)
- **Exercise < 150 min/week** → "WHO recommends 150 min of moderate activity per week." (WHO Physical Activity Guidelines)
- **Social + Family < 5h/week** → "Strong relationships are the #1 predictor of long-term wellbeing." (Harvard Study of Adult Development; Seligman, PERMA — *R*)
- **Wellness = 0h/week** → "A 10-minute daily mindfulness practice reduces stress markers." (APA; Kabat-Zinn MBSR)
- **Work > 50h/week** → "Sustained >50h weeks raise burnout risk for shift workers." (WHO/ILO 2021 long-working-hours study)
- **Balance score < 40** → "Try blocking one Rest and one Social slot this week." (positive psychology, PERMA *Positive emotion + Relationships*)

Engine:
- Evaluate all rules against current metrics, sort by severity, pick top 3.
- If fewer than 3 fire, fill with "Affirmation" tips (e.g. "Your sleep is on target this week — keep it up.") so the panel always has 2–3 items.
- Rotate visible tip every ~8s with fade; pause on hover. Dot indicators for the 3 tips.

---

## 4. Component breakdown (`src/components/dashboard/`)

```text
DashboardPage              (in src/routes/dashboard.tsx — header + grid layout)
  DashboardHeader          // "This week" label, week range, prev/next week nav, theme toggle, link back to /calendar
  BalanceScoreCard         // big ring + score + band copy
  WellnessNudgePanel       // 2–3 rotating tips, dot indicators, source line
  WeeklyStackedBarChart    // Recharts BarChart, 7 bars, stacked by category, custom tooltip, legend
  MonthlyDonutChart        // Recharts PieChart innerRadius>0, center label = total hours
  CategoryCardGrid         // 2×3 grid (sm: 1 col, md: 2, lg: 3)
    CategoryCard × 6       // icon + label + hours + % of waking + trend chip
      TrendChip            // up/down/flat arrow + delta %
  EmptyState               // shown when no events at all
```

Shared atoms (also dashboard-local):
- `MetricNumber` — large tabular figure with unit.
- `Sparkline` — tiny 7-day inline bar for each category card.
- `SectionCard` — rounded container with subtle border + header.

All colors come from the existing `CATEGORIES` constant in `src/components/calendar-page/constants.ts` so the dashboard and calendar stay visually consistent. No edits to that file.

---

## 5. Layout (desktop → mobile)

```text
+--------------------------------------------------------------+
| Header: ShiftSync · Dashboard · week of … ·  theme  back     |
+--------------------------------------------------------------+
| BalanceScoreCard  | WellnessNudgePanel                       |  ← top row, 1/3 + 2/3
+--------------------------------------------------------------+
| WeeklyStackedBarChart                | MonthlyDonutChart     |  ← middle row, 2/3 + 1/3
+--------------------------------------------------------------+
| Category cards: Work · Rest · Wellness                        |
| Category cards: Exercise · Social · Family                    |  ← 3-col grid
+--------------------------------------------------------------+
```

Breakpoints:
- `lg` (≥1024px): grid above.
- `md`: charts stack full-width, cards 2-col.
- `sm` / mobile: everything single column, charts get fixed heights (220px), cards full-width.

---

## 6. Navigation

- Add a small in-app nav in the dashboard header with `<Link to="/calendar">` and `<Link to="/dashboard">` so users can flip between the two pages.
- Add the same two links in the calendar's TopNav (only this one edit inside `src/routes/calendar.tsx`).

---

## 7. Out of scope for this plan

- Multi-week trends beyond "this week vs last week".
- Goal setting / targets per category.
- Exporting reports.
- Persisting nudge dismissals (Phase 3 with Cloud).
- Real notifications (email/SMS reminders come later with Resend/Twilio).

---

## 8. Acceptance criteria

- `/dashboard` renders without errors using the same events shown on `/calendar`.
- Creating an event on `/calendar` immediately reflects in dashboard charts when navigating over.
- Weekly bar chart shows 7 days, stacked by all 7 categories, with correct hour totals (overnight events split per day).
- Monthly donut sums to current-month hours; center shows total.
- Each of the 6 category cards shows hours, % of waking hours, and a trend vs last week.
- Balance Score renders 0–100 with a band label; shows fallback copy when data is thin.
- Wellness panel surfaces 2–3 tips, at least one tied to the user's actual data (e.g. low Rest hours triggers a sleep tip).
- Dark/light theme toggle works on dashboard, default dark.
- Mobile layout (≤640px) stacks cleanly with no horizontal scroll.
