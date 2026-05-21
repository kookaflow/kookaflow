# ShiftSync — Phase 5B Supabase Integration Plan

End-to-end plan to take ShiftSync from local-mock data to a fully Supabase-backed app: schema reconciliation, auth, RLS, mock-data replacement, earnings, public holidays, and edge cases. No code yet — review and approve first.

The previous 5A schema migration has already been applied (categories, profiles, user_preferences, events, public_holidays, validate_event trigger). This plan **reconciles** the names you've now specified with what's already in the DB and lays out everything else.

---

## Section 0 — Schema reconciliation (delta migration)

Your Section 1 spec uses a slightly different column layout than what 5A actually created. Reconciling instead of dropping/recreating, so existing data and the working UI stay intact.

### profiles (already exists — needs new columns + a separate prefs split)

Currently `profiles` holds {id, display_name, role, shift_pattern, timezone, onboarded_at}; preferences live in `user_preferences` (theme, theme_mode, accent_colour, default_view, hourly_rate, currency, country, reminders jsonb, sounds jsonb, email, phone). You asked for a flatter `profiles` shape with reminder + sound fields as columns.

Decision: **keep the split** (profiles = identity; user_preferences = settings) but add the explicit reminder/sound columns you listed onto `user_preferences`, and rename `display_name`→`full_name` plus `role`→`job_role` on `profiles`. Reasoning: the split is already wired through `preferences.functions.ts`, the `handle_new_user` trigger, and `PreferencesProvider`; flattening it would force a rewrite of working code for no functional gain. The UI never has to know it's two tables.

Delta migration on `profiles`:
- rename `display_name` → `full_name`
- rename `role` → `job_role`
- (shift_pattern, timezone, onboarded_at, id, created_at, updated_at already correct)

Delta migration on `user_preferences` (add the explicit reminder/sound columns; keep jsonb blobs for forward-compat):
- `daily_reminder_enabled boolean default false`
- `daily_reminder_time time`
- `daily_reminder_channel text` CHECK in ('email','sms','both')
- `weekly_reminder_enabled boolean default false`
- `weekly_reminder_day text` CHECK in ('mon'..'sun')
- `weekly_reminder_time time`
- `weekly_reminder_channel text` CHECK in ('email','sms','both')
- `sound_enabled boolean default true`
- `notification_sound text default 'soft_chime'`
- `reminder_minutes_before int default 10`
- `default_view` default flipped from `'week'` → `'month'` to match spec

### events (already exists — rename + add)

Current cols: id, user_id, title, category, starts_at, ends_at, all_day, location, notes, shift_type, shift_role, split_shift_*, is_payday, icon_name, icon_gradient, travel_duration_minutes, hourly_rate, recurrence(jsonb), created_at, updated_at.

Delta:
- rename `starts_at` → `start_time`, `ends_at` → `end_time`, `all_day` → `is_all_day` (to match spec exactly)
- add `calculated_earnings numeric(10,2)`
- add `is_recurring boolean not null default false`
- add `recurrence_pattern text` CHECK in ('daily','weekly','fortnightly','custom')
- add `recurrence_days text[]`
- add `recurrence_end_date date`
- add `google_event_id text` (nullable, indexed for future sync dedup)
- drop the now-unused `recurrence jsonb` column (no real data yet)
- update `validate_event` trigger to reference the renamed columns
- update FK + indexes accordingly

Codebase impact: every `.from('events')` query, `events.functions.ts`, the EventsProvider mapping, EventForm submission, selectors, and metrics need to read/write the new column names. Tracked as Step 2 in implementation order.

### categories (already exists with text PK + seeds)

Spec asks for uuid PK + `is_system` flag. Current has `id text PK` ('work','rest',…) which is already used as the FK target on `events.category` and as the discriminator in `CategoryId` types throughout the UI.

Decision: **keep text PK**, add `is_system boolean not null default true`, treat `id` AS the stable name. Switching to uuid would break every TS literal type and every event row's `category` value. The 8 seeded rows are unchanged from 5A.

### nudge_dismissals (new)

```
id uuid PK default gen_random_uuid()
user_id uuid not null references auth.users(id) on delete cascade
nudge_type text not null
dismissed_at timestamptz not null default now()
reshow_after timestamptz
unique (user_id, nudge_type)   -- one active dismissal per nudge per user
```

### public_holidays (already exists — needs spec's shape)

Current: {id, country, region, date, name, created_at}. Spec wants {country_code, year, date, name, fetched_at}.

Delta:
- rename `country` → `country_code`
- add `year int` (generated from `date`, indexed)
- add `fetched_at timestamptz default now()`
- keep `region` (nullable) — useful future-proofing for state-level holidays
- unique (country_code, year, date, name)

---

## Section 1 — RLS policies (audit + add)

Already in place from 5A: profiles (select/insert/update own), user_preferences (select/insert/update own), events (full CRUD own), categories (public select). All correct.

New for this phase:
- `nudge_dismissals`: SELECT/INSERT/DELETE where `user_id = auth.uid()`. No UPDATE (nudges are insert-or-delete, not mutate).
- `public_holidays`: SELECT to `authenticated` (currently allows `anon, authenticated` — tighten to `authenticated` per spec). No write policies; the edge function uses the service-role key and bypasses RLS.

Cascade-on-account-delete is handled by the existing `on delete cascade` references to `auth.users(id)` across `profiles`, `user_preferences`, `events`, and the new `nudge_dismissals`.

---

## Section 2 — Authentication

Stack: Supabase email/password auth + Google OAuth (Lovable's default for "generic login"). Per Lovable Cloud guidance, Google sign-in goes through the Lovable broker AND `supabase--configure_social_auth` must be called in the same turn the Google button is added.

**Question:** Spec only mentions email+password. Should I include Google sign-in (Lovable default) or strictly email+password only? Will assume **email+password only** for this plan since the spec is explicit; easy to add Google later.

Auth settings (`configure_auth`):
- `disable_signup: false`
- `external_anonymous_users_enabled: false`
- `auto_confirm_email: false` (real verification email; spec doesn't ask to skip)
- `password_hibp_enabled: true` (leaked-password check; safe default)

Routes (TanStack file-based, public unless under `_authenticated`):
- `src/routes/login.tsx` — email, password, "Sign in", link to `/signup`, "Forgot password?" → `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.
- `src/routes/signup.tsx` — email, password, confirm, full_name. On success: insert into `profiles.full_name` (via `handle_new_user` trigger seed + an `updateProfile` call) and redirect to `/onboarding`.
- `src/routes/reset-password.tsx` — REQUIRED public page. Reads `type=recovery` from URL hash, calls `supabase.auth.updateUser({ password })`, then redirects to `/login`.
- `src/routes/_authenticated.tsx` — pathless layout with `beforeLoad` that calls `supabase.auth.getUser()`; if no session, `throw redirect({ to: '/login', search: { redirect: location.href } })`.
- Move `calendar.tsx`, `dashboard.tsx`, `settings.tsx`, `onboarding.tsx` under `_authenticated/` (e.g. `_authenticated.calendar.tsx`).
- `/login` beforeLoad: if session exists, redirect to `/calendar`.
- Root `__root.tsx` already invalidates queries on `onAuthStateChange` — verify still wired.

Onboarding (`src/routes/_authenticated.onboarding.tsx`, 5-step wizard, progress dots, Next/Back):
1. Full name (pre-filled from signup)
2. Job role — text input + chip suggestions (Nurse, Paramedic, Doctor, Factory Worker, Security Officer, Retail Worker, Hospitality Staff, Transport Worker, Teacher, Other)
3. Shift pattern — 4 selectable cards: Rotating / Fixed Morning / Fixed Afternoon / Fixed Night
4. Default hourly rate — decimal input + currency select (AUD/USD/GBP/EUR/NZD) + Skip
5. Theme — 4 preview cards (Midnight/Lavender/Forest/Slate)

On completion: server fn writes `profiles.{full_name, job_role, shift_pattern, onboarded_at=now()}` and `user_preferences.{hourly_rate, currency, theme}`. Redirect to `/calendar`. A `beforeLoad` on `/_authenticated/calendar` (and friends) checks `profiles.onboarded_at IS NULL` → redirect to `/onboarding`.

Session-expiry: in `__root.tsx` `onAuthStateChange`, on `SIGNED_OUT` event show a sonner toast "Your session timed out — please sign in again" then router.invalidate.

---

## Section 3 — Replace mock data with live Supabase

Currently events live in `localStorage` via `EventsProvider` + `events-store.ts`. Migration target: TanStack Query + server functions, with realtime subscription layered on.

New / modified server fns in `src/lib/events.functions.ts`:
- `listEvents({ rangeStart, rangeEnd })` — returns events for current user in range; ordered by start_time
- `createEvent(draft)` — inserts; for recurring, expands instances up to `recurrence_end_date` or +12 months
- `updateEvent(id, patch)` — updates a single instance; future: "this and following" (out of scope v1)
- `deleteEvent(id)`
- `listNudgeDismissals()` / `dismissNudge(nudgeType, reshowAfter?)`

EventsProvider rewrite:
- Replace localStorage store with `useQuery(['events', rangeStart, rangeEnd], listEvents)`
- Mutations via `useMutation` + `queryClient.invalidateQueries(['events'])`
- Realtime: in a `useEffect`, subscribe to `supabase.channel('events').on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: 'user_id=eq.<uid>' }, () => qc.invalidateQueries(['events']))`
- Enable realtime on table via migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.events;` + `ALTER TABLE public.events REPLICA IDENTITY FULL;`

Recurrence expansion (on create):
- daily / weekly / fortnightly / custom (uses `recurrence_days text[]`)
- All expanded rows share `is_recurring=true`, `recurrence_pattern`, `recurrence_end_date`, and a shared `recurrence_group_id` (new column — adding now to avoid breaking later. Calling out as schema addition.)
- Hard cap: 366 instances per create to prevent runaway inserts

Settings auto-save:
- Replace any "Save" buttons in `ThemeSettings`, `RemindersSettings`, `SoundNotifications` with on-change `updatePreferences` mutations
- Toast "Saved ✓" via sonner, debounced 600ms per field
- Preferences are loaded by `PreferencesProvider` (already does this — point at real server fn instead of in-memory defaults)

Dashboard:
- `metrics.ts` already consumes whatever events are in the provider, so it gets real data automatically
- Wellness nudges: `WellnessNudgePanel` checks `listNudgeDismissals()` before showing; "Dismiss" → `dismissNudge(type, reshow_after = now + 7d)`

---

## Section 4 — Earnings

Settings:
- New `EarningsSettings.tsx` card on `/settings`: default hourly rate (decimal), currency select. Auto-saves to `user_preferences.{hourly_rate, currency}`.

EventForm (Work category only):
- Show "Hourly rate" field pre-filled from `user_preferences.hourly_rate`
- Live calculation: `(duration_hours) × rate = earnings`, where duration_hours subtracts `split_shift_break_duration/60` if split
- Renders below time fields: `8.0 hrs × $42.50 = $340.00`
- On submit, persist both `events.hourly_rate` and `events.calculated_earnings` (computed server-side in the create/update server fn — never trust client math for money)

Dashboard `EarningsCard.tsx` (new):
- This week / this month totals (sum of `calculated_earnings` where category='work')
- Average per shift this month
- Shifts worked this month (count)
- 7-bar daily earnings chart for current week (Recharts BarChart, currency-formatted)
- Currency formatter uses `user_preferences.currency` via Intl.NumberFormat
- If `user_preferences.hourly_rate IS NULL`: render the prompt CTA "Add your hourly rate in Settings to track earnings 💰" linking to `/settings#earnings`

Explicitly out of scope: overtime, tax, penalty rates, multiple job profiles, payslips.

---

## Section 5 — Public holidays

Per the stack rules in this project, **app-internal server logic lives in TanStack `createServerFn`, not Supabase Edge Functions**. Will implement `fetch-public-holidays` as a server function (not an Edge Function), called from the client when needed. `public_holidays` writes use `supabaseAdmin` (service-role) inside the server fn, so RLS doesn't block the cache write.

`src/lib/holidays.functions.ts`:
- `getPublicHolidays({ countryCode, year })`
  1. Read cached rows from `public_holidays` where country_code+year match
  2. If newest `fetched_at` is < 30 days old → return cache
  3. Else `fetch('https://date.nager.at/api/v3/PublicHolidays/{year}/{countryCode}')`
  4. On success: upsert rows (unique by country_code+year+date+name), update `fetched_at`, return
  5. On failure (network / non-200): return whatever cache exists (even if stale); if cache is empty, return `[]` silently. No user-visible error.
- Triggers: called on login (root layout), when `user_preferences.country` changes, and when calendar view crosses into a new year.

Calendar rendering:
- Read holidays via `useQuery(['holidays', country, year], …)` in `CalendarProvider`
- MonthDayCell / WeekDayColumn / DayView render a non-interactive gold banner at top of the day: `🇦🇺 Australia Day`. Flag emoji map keyed on ISO country code.
- Holidays are NOT clickable, NOT editable, and do NOT contribute to category hours or Balance Score (metrics.ts filters them out by virtue of being a separate query, not an events row).

When `country` changes in Settings → `holidays.functions.getPublicHolidays` re-queries → calendar refreshes.

---

## Section 6 — Edge cases & UX polish

- **Account deletion**: cascade is enforced at the DB level via `on delete cascade` to `auth.users`. No app-level work needed beyond surfacing a "Delete account" button in settings that calls a `deleteAccount` server fn (uses `supabaseAdmin.auth.admin.deleteUser(userId)`).
- **Empty states**:
  - Calendar with no events: keep current day grid; show a centred "Tap + to add your first shift" hint on `/calendar`.
  - Dashboard with no events: each `CategoryCard` shows "0 hrs" not NaN; `BalanceScoreCard` shows "Add events to see your balance score"; `MonthlyDonutChart` / `WeeklyStackedBarChart` render a friendly placeholder.
  - Earnings with no work events: "No earnings yet this week" copy.
- **Loading states**: every page that depends on a server fn gets a skeleton (use existing `Skeleton` shadcn component). Specifically:
  - `/calendar` loader pre-fetches the visible-range events via `ensureQueryData`; component uses `useSuspenseQuery` so loader-driven SSR data is instant.
  - `/dashboard` and `/settings` show skeletons via `useQuery({ ... })`'s `isPending` state.
- **Session expiry**: handled in `__root.tsx` (toast + redirect on SIGNED_OUT).
- **Public holiday API down**: silent fallback as described above.

---

## Files to create

- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/routes/reset-password.tsx`
- `src/routes/_authenticated.tsx`
- `src/routes/_authenticated.onboarding.tsx`
- (move) `src/routes/_authenticated.calendar.tsx`, `_authenticated.dashboard.tsx`, `_authenticated.settings.tsx`
- `src/lib/holidays.functions.ts`
- `src/lib/nudges.functions.ts`
- `src/lib/earnings.ts` (pure helpers for duration + currency formatting)
- `src/components/auth/AuthForm.tsx` (shared input layout)
- `src/components/onboarding/OnboardingWizard.tsx` + step subcomponents
- `src/components/settings/EarningsSettings.tsx`
- `src/components/settings/AccountSettings.tsx` (sign out + delete account)
- `src/components/dashboard/EarningsCard.tsx`
- `src/components/calendar/HolidayBanner.tsx`
- `src/lib/country-flags.ts`

## Files to modify

- `src/lib/events.functions.ts` — full CRUD + recurrence expansion + range filter
- `src/providers/EventsProvider.tsx` — swap localStorage for TanStack Query + realtime channel
- `src/providers/PreferencesProvider.tsx` — point at real `getPreferences` + auto-save mutations
- `src/providers/CalendarProvider.tsx` — wire holidays query
- `src/lib/preferences.functions.ts` — add reminder/sound/earnings field handling
- `src/components/events/EventForm.tsx` — earnings live calc + recurrence pattern picker
- `src/components/calendar/{MonthDayCell,WeekDayColumn,DayView}.tsx` — render `HolidayBanner`
- `src/components/settings/{ThemeSettings,RemindersSettings,SoundNotifications}.tsx` — auto-save
- `src/components/dashboard/WellnessNudgePanel.tsx` — read dismissals from server
- `src/routes/__root.tsx` — onAuthStateChange toast + invalidate
- `src/start.ts` — verify `attachSupabaseAuth` is in `functionMiddleware`
- `src/integrations/supabase/types.ts` — auto-regenerates after the delta migration

## Edge functions

None. Per project stack rules, `fetch-public-holidays` is a TanStack server function, not a Supabase Edge Function.

## Implementation order

1. **Delta migration** (renames + new columns + nudge_dismissals + public_holidays reshape + realtime publication). One migration call; types.ts regenerates.
2. **Server fns refactor**: update `events.functions.ts` + `preferences.functions.ts` to new column names; add `holidays.functions.ts` and `nudges.functions.ts`.
3. **Providers swap**: EventsProvider → server-fn + realtime; PreferencesProvider → server-fn + auto-save. UI stays the same; data source changes underneath. Verify `/calendar`, `/dashboard`, `/settings` still render.
4. **Auth routes**: `login`, `signup`, `reset-password`, `_authenticated` layout, route moves. `configure_auth` call. Existing pages now require login.
5. **Onboarding wizard** + post-signup redirect + onboarded_at gate.
6. **Earnings**: settings card → EventForm live calc → dashboard EarningsCard.
7. **Public holidays**: server fn + calendar banners + country-change re-query.
8. **Polish pass**: empty states, skeletons, session-expiry toast, account deletion.

## Risks / open questions

- **Column rename ripple**: `starts_at`→`start_time`, `ends_at`→`end_time`, `all_day`→`is_all_day` touch every events query. I'll do this atomically in step 1 + step 2 together.
- **Recurrence storage**: spec uses `recurrence_pattern + recurrence_days + recurrence_end_date` (denormalised). I'll add an implicit `recurrence_group_id uuid` so editing/deleting a series stays coherent — flagging here because it's not in the spec.
- **profiles vs user_preferences split**: keeping the existing split. If you'd rather see one flat table, this is the moment to say so — undoing it later means moving columns again.
- **`is_system` on categories with text PK**: keeping text PK. Spec's uuid PK would invalidate the entire `CategoryId` union and every event row's `category` field.
- **Google OAuth**: not included (spec is email+password only). Confirm if you want it added.

Replaces the previous Phase 5A schema plan. Captures every field the app now relies on (themes, split shifts, payday, travel, icons, future earnings) so we never need a breaking migration later.

Auth + RLS model is unchanged from 5A: Supabase Auth, every user-scoped row keyed by `user_id = auth.uid()`, `profiles` + `user_preferences` rows auto-created via `handle_new_user()` trigger.

---

## Tables

### 1. `profiles` (1:1 with `auth.users`)

| column | type | notes |
|---|---|---|
| id | uuid PK | references `auth.users(id)` on delete cascade |
| display_name | text | onboarding |
| role | text | e.g. Nurse, Paramedic |
| shift_pattern | text | e.g. 4-on-4-off, rotating |
| timezone | text not null default 'UTC' | IANA tz |
| onboarded_at | timestamptz | null until onboarding completed |
| created_at / updated_at | timestamptz default now() | `updated_at` via trigger |

No emails/phones here — those live on `user_preferences` for reminder routing.

### 2. `user_preferences` (1:1 with user)

| column | type | notes |
|---|---|---|
| user_id | uuid PK | references `auth.users(id)` on delete cascade |
| theme | text not null default 'slate' | CHECK in (`slate`,`midnight`,`lavender`,`forest`) |
| theme_mode | text not null default 'light' | CHECK in (`light`,`dark`) |
| accent_colour | text | optional override hex; null = theme default |
| default_view | text not null default 'week' | CHECK in (`month`,`week`,`day`) |
| week_starts_on | smallint not null default 1 | 0 Sun, 1 Mon |
| hourly_rate | numeric(10,2) | user default rate, nullable |
| currency | text not null default 'AUD' | ISO 4217 |
| country | text not null default 'AU' | ISO 3166-1 alpha-2, drives public holidays |
| reminders | jsonb not null default `{}` | channel + cadence config |
| sounds | jsonb not null default `{}` | per-event-type sound prefs |
| email | text | reminder destination |
| phone | text | SMS destination |
| updated_at | timestamptz default now() | trigger |

### 3. `categories` (reference table, read-only to clients)

| column | type | notes |
|---|---|---|
| id | text PK | `work`, `rest`, `wellness`, `exercise`, `social`, `family`, `personal`, `travel` |
| label | text not null | |
| color | text not null | hex |
| icon | text not null | Lucide icon name |
| sort_order | int not null default 0 | |

Seeded with all 8 categories (Travel added). Public SELECT, no writes.

### 4. `events` (the heavy table)

| column | type | notes |
|---|---|---|
| id | uuid PK default gen_random_uuid() | |
| user_id | uuid not null | references `auth.users(id)` on delete cascade |
| title | text not null | |
| category | text not null | FK → `categories(id)` |
| starts_at | timestamptz not null | |
| ends_at | timestamptz not null | |
| all_day | bool not null default false | |
| location | text | |
| notes | text | |
| **shift_type** | text | CHECK in (`morning`,`afternoon`,`night`,`oncall`,`split`,`sick_leave`,`annual_leave`,`travel`,`payday`); nullable for non-work events |
| shift_role | text | denormalised role override (per-event) |
| **split_shift_first_start** | time | |
| **split_shift_first_end** | time | |
| **split_shift_break_duration** | int | minutes |
| **split_shift_second_start** | time | |
| **split_shift_second_end** | time | |
| **is_payday** | bool not null default false | |
| **icon_name** | text | Lucide icon id |
| **icon_gradient** | text | gradient id (`sunrise`,`ocean`,`forest`,`lavender`,`slate`,`coral`) |
| **travel_duration_minutes** | int | for `travel` category or commute-tagged shifts |
| **hourly_rate** | numeric(10,2) | per-event override; falls back to `user_preferences.hourly_rate` |
| recurrence | jsonb not null default `{"kind":"none"}` | RRULE-shaped blob |
| created_at / updated_at | timestamptz default now() | `updated_at` trigger |

Validation via trigger (NOT CHECK) so we can compare time fields, e.g. ensure split-shift fields are all-or-nothing when `shift_type='split'`. Avoids the immutability issue with CHECK constraints.

Indexes: `(user_id, starts_at)`, `(user_id, category)`, `(user_id, is_payday) where is_payday`.

### 5. `public_holidays` (forward-looking, included now to avoid later breaking change)

| column | type | notes |
|---|---|---|
| id | uuid PK | |
| country | text not null | matches `user_preferences.country` |
| region | text | state/province, nullable |
| date | date not null | |
| name | text not null | |
| unique (country, region, date, name) | | |

Public SELECT, no writes from clients. Seeded later by a server job.

---

## RLS Policies

RLS enabled on every table. Pattern per user-scoped table:

- `profiles`: SELECT/UPDATE/INSERT where `id = auth.uid()`. No DELETE.
- `user_preferences`: SELECT/UPDATE/INSERT where `user_id = auth.uid()`. No DELETE.
- `events`: SELECT/INSERT/UPDATE/DELETE where `user_id = auth.uid()` (INSERT/UPDATE also `WITH CHECK`).
- `categories`: SELECT to `anon, authenticated`. No write policies.
- `public_holidays`: SELECT to `anon, authenticated`. No write policies.

Service-role writes (seeding categories/holidays) bypass RLS as usual.

---

## Triggers & Functions

- `public.set_updated_at()` — already exists, attach to `profiles`, `user_preferences`, `events` BEFORE UPDATE.
- `public.handle_new_user()` — already exists; inserts default `profiles` + `user_preferences` rows on `auth.users` insert.
- `public.validate_event()` — new BEFORE INSERT/UPDATE trigger on `events`:
  - `ends_at >= starts_at`
  - if `shift_type='split'`: all five split fields non-null; first_end < second_start (in same TZ)
  - if `shift_type` in (`sick_leave`,`annual_leave`): `all_day = true`
  - if `is_payday=true`: `category='work'`
  - if `category='travel'`: `travel_duration_minutes` non-null

---

## Field-by-field check against current frontend

Cross-checked against `src/types/event.ts`, `src/types/preferences.ts`, `src/lib/themes.ts`, `src/lib/gradients.ts`, `src/components/events/presets.ts`:

- `CalendarEvent.iconName` → `events.icon_name` ✓
- `CalendarEvent.iconGradient` → `events.icon_gradient` ✓
- `CalendarEvent.isPayday` → `events.is_payday` ✓
- `ShiftMeta.split.*` → 5 `split_shift_*` columns ✓
- `ShiftType` union (incl. `split`) → `shift_type` CHECK list, extended to cover preset-only types (`sick_leave`, `annual_leave`, `travel`, `payday`) so presets can round-trip without coercion ✓
- `CategoryId` (8 values incl. `travel`) → `categories` seed + `events.category` FK ✓
- `UserPreferences.themeName/mode/defaultView/weekStartsOn` → `user_preferences` columns ✓
- New: `accent_colour`, `hourly_rate`, `currency`, `country` on `user_preferences` ✓
- New on events: `travel_duration_minutes`, `hourly_rate` ✓

No frontend field is unrepresented; no schema field is unused by the app or near-term roadmap (earnings, holidays).

---

## Migration order

1. `categories` — create + seed 8 rows (idempotent upsert), enable RLS + public select.
2. `profiles` — table, RLS, trigger.
3. `user_preferences` — table with new columns (`accent_colour`, `hourly_rate`, `currency`, `country`), RLS, trigger.
4. `events` — table with all new columns + CHECK on `shift_type`, FK to `categories`, indexes, RLS, `set_updated_at` + `validate_event` triggers.
5. `public_holidays` — table, RLS, public select.
6. `handle_new_user()` trigger on `auth.users` (already present — verify).

Current DB already has earlier versions of `categories`, `profiles`, `user_preferences`, `events`. Migration will be `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for new columns, plus the new `validate_event` trigger and `public_holidays` table. No destructive drops.

---

## Known non-goals (deferred, but schema-compatible)

- Earnings ledger table — can be derived from `events.hourly_rate` + split durations later; no schema change to events needed.
- External calendar sync metadata — will land as `event_sources` join table; doesn't change `events` shape.
- Notification delivery log — separate table later; doesn't affect current tables.