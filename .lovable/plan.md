# ShiftSync — Supabase Integration Plan

Front-end is stable. This plan introduces Lovable Cloud (Supabase) for persistence and auth, replacing the in-memory mock event store and `localStorage`-backed settings.

## 1. Database Schema

All tables live in `public` schema, owned by `auth.users` via `user_id uuid references auth.users(id) on delete cascade`.

### `profiles`
One row per user, auto-created on signup via trigger.

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | references `auth.users(id)` on delete cascade |
| `display_name` | `text` | from onboarding |
| `role` | `text` | nurse, paramedic, factory, retail, hospitality, security, transit, other |
| `shift_pattern` | `text` | `fixed_day`, `fixed_night`, `rotating_2_2`, `rotating_4_on_4_off`, `weekly_rotation`, `on_call`, `irregular` |
| `timezone` | `text` | default `'UTC'` |
| `onboarded_at` | `timestamptz` | null until onboarding completes |
| `created_at` / `updated_at` | `timestamptz` | default `now()` |

### `categories` (reference table, public read)
Seeded with the 7 categories (`work`, `rest`, `wellness`, `exercise`, `social`, `family`, `personal`).

| column | type | notes |
|---|---|---|
| `id` | `text` PK | matches `CategoryId` |
| `label` | `text` |  |
| `color` | `text` | hex |
| `icon` | `text` | lucide name |
| `sort_order` | `int` |  |

### `events`
Single table for both shifts and personal activities (`category = 'work'` + `shift_type` flags it as a shift).

| column | type | notes |
|---|---|---|
| `id` | `uuid` PK | default `gen_random_uuid()` |
| `user_id` | `uuid` NOT NULL | FK `auth.users(id)` on delete cascade |
| `title` | `text` NOT NULL |  |
| `category` | `text` NOT NULL | FK `categories(id)` |
| `starts_at` | `timestamptz` NOT NULL |  |
| `ends_at` | `timestamptz` NOT NULL | check `ends_at > starts_at` |
| `all_day` | `boolean` | default `false` |
| `shift_type` | `text` | nullable; `morning` / `afternoon` / `night` / `oncall` |
| `location` | `text` | nullable |
| `notes` | `text` | nullable |
| `icon_name` | `text` | nullable; lucide name |
| `recurrence` | `jsonb` | matches `Recurrence` discriminated union |
| `created_at` / `updated_at` | `timestamptz` |  |

Indexes: `(user_id, starts_at)`, `(user_id, category)`.

### `user_preferences`
One row per user (PK = `user_id`). Holds everything currently in `localStorage`.

| column | type | notes |
|---|---|---|
| `user_id` | `uuid` PK | FK `auth.users(id)` on delete cascade |
| `theme` | `text` | `dark` / `light` |
| `default_view` | `text` | `month` / `week` / `day` |
| `week_starts_on` | `int2` | 0 or 1 |
| `reminders` | `jsonb` | `{ daily: {...}, weekly: {...} }` mirrors `RemindersSettings` state |
| `sounds` | `jsonb` | mirrors `shiftsync.sound-prefs.v1` shape from `SoundNotifications` |
| `email` | `text` | reminder email |
| `phone` | `text` | reminder phone |
| `updated_at` | `timestamptz` |  |

Keeping reminder/sound config as `jsonb` avoids schema churn while front-end keeps evolving. We can normalize later if we add server-side reminder dispatch.

## 2. Row Level Security

RLS enabled on every table. Policies use `auth.uid()` directly — no recursive lookups, no security-definer functions needed at this stage.

- **`profiles`** — `SELECT/UPDATE` where `id = auth.uid()`; `INSERT` where `id = auth.uid()` (trigger handles insert, this is a backstop).
- **`events`** — full `SELECT/INSERT/UPDATE/DELETE` where `user_id = auth.uid()`.
- **`user_preferences`** — full CRUD where `user_id = auth.uid()`.
- **`categories`** — `SELECT` to `authenticated` (or `anon` if we want it publicly readable). No writes from clients.

### Auto-provision profile + preferences on signup

```text
trigger on auth.users AFTER INSERT
  → insert into public.profiles (id) values (new.id)
  → insert into public.user_preferences (user_id) values (new.id)
```

Both inserts use `SECURITY DEFINER` function with locked `search_path`.

## 3. Auth Flow

### Sign up / log in
- Email + password via Supabase Auth (browser client).
- Sign-up form sets `emailRedirectTo: window.location.origin` so the magic confirmation link returns to the app.
- For dev, recommend disabling "Confirm email" in Auth settings so the flow is one-step. Note this in the UI.

### Routes
- `/login` — public. Tabs for Sign in / Sign up. Redirects to `/calendar` (or `/onboarding` if `profiles.onboarded_at IS NULL`) on success.
- `/onboarding` — gated (must be signed in, must not be onboarded yet). Three steps in one form:
  1. **Name** — text input.
  2. **Role** — pill buttons (nurse, paramedic, factory worker, retail, hospitality, security, transit, other).
  3. **Typical shift pattern** — pill buttons matching `shift_pattern` enum.
  Submitting writes to `profiles` and sets `onboarded_at = now()`.
- `_authenticated` layout route — `beforeLoad` checks session via `supabase.auth.getUser()`; redirects to `/login` if missing, to `/onboarding` if `onboarded_at IS NULL`.
- `/calendar`, `/dashboard`, `/settings` move under `_authenticated`.
- `/` (landing) stays public; if user is signed in, link goes straight to `/calendar`.

### Session wiring
- `onAuthStateChange` listener wired once in `__root.tsx`. On change → `router.invalidate()` + `queryClient.invalidateQueries()`.
- Sign-out button in TopNav.

## 4. Replacing the Mock Data Store

Today's data flow:

```text
src/components/calendar-page/mock.ts (buildMockEvents)
  → src/lib/events-store.ts (in-memory + useSyncExternalStore)
    → CalendarPage, MonthView, TimeGrid, TodayPanel, WeekSummaryDialog
    → DashboardPage and its child charts/cards
```

Settings today:
- `src/components/settings/RemindersSettings.tsx` — local React state only.
- `src/components/settings/SoundNotifications.tsx` — `localStorage` key `shiftsync.sound-prefs.v1`.

### New flow

1. **TanStack Query + server functions** (no direct browser Supabase queries in components).
   - `src/lib/events.functions.ts` — `listEvents({ rangeStart, rangeEnd })`, `createEvent`, `updateEvent`, `deleteEvent`. All protected by `requireSupabaseAuth`. Queries `events` via the auth-scoped client (RLS applies).
   - `src/lib/preferences.functions.ts` — `getPreferences`, `updatePreferences`, `getProfile`, `updateProfile`, `completeOnboarding`.
   - `src/lib/categories.functions.ts` — `listCategories` (cacheable, low-churn).

2. **Replace `useEventsStore`** with a `useEvents(rangeStart, rangeEnd)` hook backed by `useSuspenseQuery` / `useQuery`. Same `MockEvent`-shaped output (renamed to `CalendarEvent`) so view components don't change.

3. **Mutations** invalidate `['events', userId, ...]` query key. Optimistic updates for create/update/delete to preserve current snappy UX.

4. **Settings persistence**: `RemindersSettings` and `SoundNotifications` swap `useState`/`localStorage` for `useQuery` on `getPreferences` and `useMutation` on `updatePreferences`. Keep the existing UI 1:1.

5. **Delete after migration**: `src/components/calendar-page/mock.ts`, `src/lib/events-store.ts`. `src/lib/categories.ts` (UI metadata) stays — it pairs the DB `categories.id` with Tailwind classes / Lucide icon components that can't live in the DB.

## 5. Validation: Breaking Changes & Risks

- **Mock-event field rename.** `events-store` exposes `MockEvent` with `start`/`end` as `Date` objects. The DB returns ISO strings as `starts_at`/`ends_at`. Map at the server-fn boundary back into the existing `MockEvent` shape (Date objects, `start`/`end`) so calendar components stay untouched. Treat this as a non-breaking adapter; rename to `CalendarEvent` only as a follow-up.
- **Shift-type label drift.** Front-end uses `oncall`; the existing `types/event.ts` (currently unused for shifts) uses `rotating`. We'll standardize on the front-end set: `morning | afternoon | night | oncall`. Enforced via a CHECK constraint instead of a Postgres enum to allow easy expansion.
- **Recurrence is client-only today.** It's stored as `jsonb`; expansion to instances still happens in the calendar view. No server-side expansion in this phase.
- **`localStorage` sound prefs migration.** On first authenticated load, if `user_preferences.sounds` is null and `localStorage` has the v1 key, copy it up once, then clear the local key. Same idea for the reminders form (currently in-memory only — nothing to migrate).
- **Route gating breaks deep links during the cut-over.** Moving `/calendar`, `/dashboard`, `/settings` under `_authenticated` means unauthenticated visits redirect to `/login`. Make sure `/` (landing) and any future marketing routes stay outside the layout.
- **Email confirmation.** With "Confirm email" on, sign-up redirects through email; surfacing a clear "Check your inbox" state in the auth UI prevents a perceived breakage. Default Lovable Cloud setting is on.
- **No edge functions in this phase.** Email/SMS reminder dispatch (Resend/Twilio) is out of scope here; we're persisting the preferences only. Wiring the dispatch is the next milestone.
- **Categories table is reference-only.** UI keeps reading from `src/lib/categories.ts` for icon/colour classes; the DB row is just a referential anchor. No risk of drift as long as IDs match — guarded by a seed migration.

## 6. Suggested Build Order

1. Enable Lovable Cloud.
2. Create schema + RLS + signup trigger + seed `categories`.
3. Add server functions (`events`, `preferences`, `categories`).
4. Build `/login` + `/onboarding` + `_authenticated` layout.
5. Swap `useEventsStore` → `useEvents` hook backed by Query. Verify calendar + dashboard render identically.
6. Swap settings panels to read/write `user_preferences`. Migrate sound prefs from `localStorage`.
7. Delete `mock.ts` + `events-store.ts`.
8. Smoke test: sign up → onboard → create event → see it on calendar + dashboard → set reminders → sign out → sign in → data persists.

Ready to proceed once you approve.