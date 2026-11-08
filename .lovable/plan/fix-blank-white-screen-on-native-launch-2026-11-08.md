# Fix blank white screen on native launch

## Cause (confirmed)
In `src/lib/nativeAuthPersistence.ts`, `prefs()` is an async function that returns the `Preferences` plugin object itself. Returning it from an async function makes JavaScript call `.then()` on the plugin proxy, which throws `"Preferences.then()" is not implemented`. This happens right after "webview session: present", inside `save()` — and the launch check then never finishes cleanly, leaving the screen blank.

## Audit of every Capacitor plugin load
- `nativeAuthPersistence.ts` `prefs()` — **broken** (returns plugin). Fix.
- `nativeAuthPersistence.ts` App listener — destructures from module: safe.
- `nativeFileShare.ts` Filesystem/Share — destructures from modules: safe, but switch to module-style calls for consistency.
- `nativeDeepLinks.ts` App/Browser, `externalLinks.ts` Browser, `ConnectedCalendars.tsx` Browser, `AboutSection.tsx` Share, `revenuecat.ts` Browser — destructure from module: safe.
- `revenuecat.ts` purchases loader — returns the module: safe. `registerPlugin` result is used directly, not returned/awaited: safe.

## Changes
1. `nativeAuthPersistence.ts`: `prefs()` returns the module (`const mod = await import(...); return mod;`); callers use `mod.Preferences.get/set/remove`.
2. `nativeFileShare.ts`: load modules as `fsMod`/`shareMod` and call `fsMod.Filesystem.writeFile`, `shareMod.Share.share`.
3. Fail-safe launch: `resolveNativeSession()` wraps the check so any throw or rejection logs `[native-auth] launch check failed` and resolves `false` (→ /login). Add a timeout (~8s) so a hung plugin also falls through to /login. `restoreFromPreferences` and `startNativeAuthPersistence` get try/catch so they never reject.
4. Add a test: if Preferences throws, `resolveNativeSession` resolves false.

## Native steps
`npm run build:mobile`, `npx cap sync android` (and ios), run again. Look for `[native-auth] saved (event=launch-check)` then `redirect / -> /calendar`.
