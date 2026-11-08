# Fix the native launch check hang (target: calendar in ~1s)

## What the code does today
- The launch check (`checkNativeSession`) calls `getSession()`, logs "webview session: present", then **awaits** a Preferences save before returning. The last Logcat line before the timeout is "webview session: present", so the hang is after `getSession()` — in the awaited save (Preferences bridge call) — or in auth work queued behind the auth lock. Diagnosis is not yet confirmed; the step timing logs below will confirm it.
- No auth call is awaited directly inside any `onAuthStateChange` callback, but several callbacks synchronously start auth work (`useSubscription` load, `PreferencesProvider` pull, `RevenueCatProvider`, persistence `save`), which runs while supabase-js holds its lock during initialisation/refresh.
- `startNativeAuthPersistence` (root) and the route `beforeLoad` both call `resolveNativeSession()` at launch; they share one in-flight promise, but `_authenticated` then calls `getSession()` again.

## Changes
1. **Launch check never waits on Preferences when a session exists**: return `true` immediately after `getSession()`; write the durable copy fire-and-forget (`setTimeout(…, 0)`).
2. **Bounded steps**: wrap `getSession()`, Preferences `get`, and `setSession()` each in their own short timeout (getSession 3s, Preferences 2s, setSession 5s) so one stuck step fails fast to `/login` instead of the 8s overall timeout. Keep the overall guard.
3. **Defer all auth-triggered work out of `onAuthStateChange`**: in every listener (nativeAuthPersistence, useSubscription, PreferencesProvider, RevenueCatProvider, OneSignalProvider, `_authenticated`, root AuthListener) wrap the body in `setTimeout(…, 0)` so nothing touches auth or the native bridge while the auth lock is held.
4. **No simultaneous auth calls at launch**: `startNativeAuthPersistence` awaits the shared launch check before subscribing/starting auto-refresh (already does), and `startAutoRefresh` is deferred until after the check settles. `_authenticated` reuses the check result rather than racing a second `getSession()` during init. Cache a settled result for ~2s so `/`, `/login` and `_authenticated` don't re-run it back to back.
5. **Step timing logs** (`[native-auth]`, ms since check start): start, getSession begin/end, preferences get begin/end, setSession begin/end, save scheduled/done, result + route chosen, total duration.

## Technical details
- Files: `src/lib/nativeAuthPersistence.ts` (main), `src/routes/_authenticated.tsx`, `src/routes/__root.tsx`, `src/hooks/useSubscription.ts`, `src/providers/PreferencesProvider.tsx`, `src/providers/RevenueCatProvider.tsx`, `src/providers/OneSignalProvider.tsx`.
- Update `nativeAuthPersistence.test.ts`: session-present resolves without waiting for a never-resolving Preferences.set; stuck getSession resolves false within its step timeout.
- Web behavior unchanged (all native code is gated by `isNativeAuthPlatform()`; deferring listener bodies by one tick is harmless on web).
- Requires `npm run build:mobile` + `npx cap sync android`/`ios`; Logcat timings will show exactly where any remaining delay sits.
