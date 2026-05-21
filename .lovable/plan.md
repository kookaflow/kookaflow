# ShiftSync — Phase 5B Database Schema (Refreshed)

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