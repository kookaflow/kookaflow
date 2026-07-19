## Findings

### 1. Why the mobile Calendar shows "empty" while the Dashboard shows totals

The Dashboard is **not** proof that the mobile app is fetching real data.

- `src/routes/_authenticated.dashboard.tsx` reads from `useEventsStore()` (`src/lib/events-store.ts`).
- That store is a module-level array seeded with `buildMockEvents(new Date())` — synthetic demo shifts (roughly the 40h Work / 58h totals the user is seeing). Nothing in the code path writes real events into it.
- The Calendar (`src/routes/_authenticated.calendar.tsx`) reads from `useEvents()` → `EventsProvider` → `listEvents` server function via `useServerFn` + React Query.

So on mobile:
- Dashboard "works" because it's always showing mock data (same on web too — the web Dashboard is also mock; on web the Calendar happens to work so it looks consistent).
- Calendar is empty because the real `listEvents` server-fn call from the Capacitor bundle is not returning events.

### 2. Does the Calendar's query differ from the Dashboard's?

Yes — completely different data sources. The Dashboard never calls a server function, so it cannot validate that Capacitor → kookaflow.com RPC is working. The Calendar's query is the first real network call to `/_serverFn/*` in that view.

The Capacitor server-fn pipeline (`src/start.ts`) rewrites `/_serverFn/...` to `https://kookaflow.com/_serverFn/...` when `VITE_IS_MOBILE_BUILD=true`. Likely failure modes, in order of probability:

- **a. `VITE_IS_MOBILE_BUILD` isn't set during `build:mobile`.** If unset, `mobileServerFnFetch` is never wired in and the app tries to hit `capacitor://localhost/_serverFn/...`, which resolves to nothing. Query silently returns `undefined`/`[]` and `events.length === 0` shows the empty state. Need to confirm the build script sets this env.
- **b. Auth bearer not attached on mobile.** `attachSupabaseAuth` reads the Supabase session from the client's `localStorage`. In Capacitor WebView the user is logged in under `capacitor://localhost` — the token IS on that origin's storage, so the middleware should still find it. But the cross-origin fetch to kookaflow.com then sends `Authorization: Bearer ...` from a different origin — the server-fn hits `requireSupabaseAuth`, which should validate it and return the events. If the session isn't yet hydrated when the query first fires we'd see `Unauthorized`, and React Query would surface an error — not silently empty.
- **c. CORS response drops the body.** The CORS middleware in `src/start.ts` only sets `access-control-allow-origin` on the final `Response`. Preflight is handled. This should be fine for a GET, but worth verifying the response actually reaches the client (network tab / console error) — a CORS block would produce a console error, not zero events.
- **d. React Query default `queryKey: ["events"]` with `initialData` removed** — Provider looks fine; `useQuery` will return `data: undefined` until first fetch resolves, `events` becomes `[]`, and the empty-state renders before load completes. On web this flashes for a moment; on mobile if the fetch never resolves, it stays empty. Combined with (a) that's the visible symptom.

The dominant hypothesis is **(a)**: `build:mobile` is not injecting `VITE_IS_MOBILE_BUILD=true`, so Capacitor never rewrites `/_serverFn/*` to kookaflow.com and every server-fn quietly no-ops. This also explains why there's no visible error — the fetch fails at the WebView layer and React Query is left with empty data.

### 3. Does the calendar library fail silently in the SPA build?

No SSR-only assumption on the render path — `MonthView`/`TimeGrid` are pure client components, and the empty-state branch is chosen before any calendar library runs (`events.length === 0` early-returns). Date parsing uses `date-fns` and `new Date(iso)`, which behaves the same in the Capacitor WebView. The rendering layer is not the bug.

### 4. FAB overlaps the "More" tab

`QuickAddFab` is `fixed; bottom: max(20px, env(safe-area-inset-bottom)); right: max(16px, ...)`. The mobile bottom nav (`AppNav`) is `fixed inset-x-0 bottom-0` with its own safe-area padding and ~56px content height. So the FAB sits directly on top of the right-most tab ("More"), blocking taps.

## Proposed fix

### A. Calendar-empty bug

1. Update `package.json` `build:mobile` script to set `VITE_IS_MOBILE_BUILD=true` (and optionally `VITE_MOBILE_SERVER_ORIGIN=https://kookaflow.com` explicitly) so the flag reaches the client bundle. Verify by grepping the built `dist-mobile/client/assets/*.js` for `kookaflow.com` and for the mobile fetch rewrite.
2. Add a lightweight fetch-error surface in `EventsProvider` so a failed `listEvents` renders a "Couldn't load events — retry" state instead of the misleading empty-state. This prevents future silent failures from looking like "no data".
3. Add a one-line dev log inside `mobileServerFnFetch` (only when `import.meta.env.DEV`) so any future Capacitor-vs-web routing mistake is visible in Safari Web Inspector.
4. After rebuilding the mobile bundle, re-test in the iOS app; if events still don't load, inspect the Network panel for the `_serverFn` request — that will distinguish auth (401), CORS (blocked), or wrong-origin failures.

Not changing: the Dashboard's `useEventsStore` mock source is a separate cleanup and is out of scope for this bug (though it should eventually be migrated to `useEvents()`).

### B. FAB overlap on Calendar tab

Raise the FAB above the mobile bottom nav. In `src/components/calendar/QuickAddFab.tsx`, change the `bottom` style to clear the ~56px tab bar plus the safe-area inset on mobile, and keep the current offset on `md+`:

```
bottom: calc(64px + env(safe-area-inset-bottom) + 16px)  // mobile
md:bottom: max(20px, env(safe-area-inset-bottom))         // desktop
```

Simplest implementation: keep the fixed positioning but use Tailwind responsive classes (`bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] md:bottom-5`) and drop the inline `bottom` style so it doesn't override at md.
