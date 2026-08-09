# Calendar empty on iOS while dashboard "works" — investigation report

## Headline: the dashboard is not proof that data access works

`src/routes/_authenticated.dashboard.tsx:42` reads:

```ts
const events = useEventsStore();
```

`src/lib/events-store.ts:5` initialises that store from **mock data**:

```ts
let events: MockEvent[] = buildMockEvents(new Date());
```

`buildMockEvents(today)` (`src/components/calendar-page/mock.ts:8`) generates a fixed set of events anchored to *today* — "Morning shift — Ward 4B", "Yoga flow", "Dinner with Mia", etc. A repo-wide search shows `setEvents` is never called anywhere, so the store is never populated from the server. The dashboard therefore renders plausible-looking hours for the current week on **any** device, signed in or not, with or without a working server call.

So the dashboard summary does not demonstrate that server functions, bearer-token attachment, or RLS are working in the mobile build. The calendar is the only surface on that screen pair actually reading `EventsProvider` / `listEvents` — and it is showing empty. The most likely reading of the evidence is the opposite of the premise: **`listEvents` is failing or returning `[]` in the mobile build, and the dashboard masks it with mock data.**

## The three theories in the request are ruled out by the code

### Date range — there isn't one
`src/lib/events.functions.ts:202-212`:

```ts
export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("events").select(ROW_COLS).order("start_time", { ascending: true });
```

No input validator, no params, no `.gte`/`.lte` filter. The client (`EventsProvider`, `queryFn: () => listEvents()`) sends no arguments. There is no date window to compute wrongly, and no month/year value that could be `undefined` in the SPA build.

### Timezone — cannot cause an empty result
Because no window is sent, a UTC-vs-AEST offset cannot push rows out of range. Timezone only affects which *cell* an event lands in (`toMockEvent` does `new Date(e.start)`, which is correct local parsing of a timestamptz), never whether rows are returned. A timezone bug would show shifts on the wrong day, not "Your calendar is empty".

### Response shape — not the cause of the empty state either
`src/routes/_authenticated.calendar.tsx:359-368` gates on the array length itself:

```ts
events.length === 0 && eventsLoading ? "Loading your calendar…"
  : events.length === 0 ? <EmptyState title="Your calendar is empty" .../>
```

`events` = `rawEvents.map(toMockEvent)` + Google events. A shape mismatch inside `toMockEvent` would throw or render odd badges; it cannot reduce the array length. Seeing the empty state means `rawEvents.length === 0`, i.e. `listEvents` returned an empty array **or the query errored** — `useQuery` on error leaves `data` undefined, `EventsProvider` falls back to `[]`, `isLoading` goes false, and the calendar renders the empty state with no error shown anywhere. That silent-failure path is the prime suspect and is currently unobservable on device.

## Most probable cause

`listEvents` errors (401 from `requireSupabaseAuth`, or a blocked cross-origin request) in the Capacitor build and the failure is swallowed:

- `src/start.ts` rewrites relative `/_serverFn/...` to `https://kookaflow.com` only when `VITE_IS_MOBILE_BUILD === true`, and only for string / relative-`Request` inputs.
- The bearer token comes from `attachSupabaseAuth`, which reads `supabase.auth.getSession()` from WebView `localStorage`. If the Capacitor WebView has no persisted session (different origin from the browser login, or storage cleared on app relaunch), `requireSupabaseAuth` returns 401 and every event read comes back empty — while the mock-backed dashboard keeps looking healthy.
- CORS in `src/start.ts` allow-lists `capacitor://localhost`, `https://localhost`, `ionic://localhost`. If the simulator's WebView origin is anything else (or the request is sent with no `Origin`), responses lack `access-control-allow-origin` and the fetch rejects.

This is stated as the leading hypothesis, not a confirmed root cause — the current code makes the failure invisible, so it must be observed before fixing.

## Proposed next step: make the failure visible (one small, reversible change)

In `src/providers/EventsProvider.tsx`, surface what `useQuery` already knows instead of silently coercing to `[]`:

- Destructure `error` and `status` from the events `useQuery`.
- Log once per state change: `console.info('[events] status', status, 'count', data?.length, 'error', error?.message)`.
- Expose `error` on the context so the calendar can render "Couldn't load your events — <message>" instead of the empty state when the query failed.

Then, on the device with Safari Web Inspector open, read that log plus the Network tab entry for `/_serverFn/...listEvents`:

| Observation | Cause | Fix |
| --- | --- | --- |
| No request at all, or request to `capacitor://localhost/_serverFn/...` | mobile rewrite inactive — `VITE_IS_MOBILE_BUILD` not `true` in the bundle | fix the build env var / `build:mobile` script |
| Request to `kookaflow.com`, status 401 | no Supabase session in the WebView, so no bearer attached | persist/restore the session in the Capacitor WebView (native storage, or re-login inside the app) |
| Request blocked / CORS error in console | WebView origin not in `ALLOWED_MOBILE_ORIGINS` | add the actual origin reported by the console |
| Status 200 with `[]` | genuinely no rows for that user under RLS | confirm the signed-in user id matches the account that owns the shifts |

## Separate, real bug worth fixing regardless

The dashboard is wired to mock data. It should read `useEvents()` (the same `EventsProvider` source as the calendar) so its balance score, weekly chart, and category cards reflect real events. Right now it silently shows fabricated hours to every user on web and mobile alike. That's a behaviour change, so it is called out here rather than folded into the calendar fix.

## Notes

- No code changes were made in this investigation.