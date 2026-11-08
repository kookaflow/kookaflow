# Fix native "stay signed in" on app launch

## What's actually happening

1. **First page on launch: the welcome page, with no sign-in check.** The phone app always opens at `/`. That page (`src/routes/index.tsx`) has no sign-in check at all. It just shows "Find your flow…", even when a valid sign-in is saved. Restoring the saved sign-in only runs inside the signed-in area (`_authenticated.tsx`), so it never runs on launch.
2. **The sign-in page doesn't check either.** Tapping "Sign in" from the welcome page opens `/login`, which always shows the form. It only goes to the calendar after a fresh sign-in. So a person who is still signed in looks signed out.
3. **Saving to phone storage:** this does happen, in two places: a one-time copy at startup, and on every sign-in, token refresh and user update (`startNativeAuthPersistence`). But it starts late (after the first screen has drawn) and logs nothing on success, so you can't see it working. I can't confirm from here that it ran on your emulator. The new logs will show it.

So most likely the sign-in was never lost. The app just never checked for it on launch.

## The fix (phone apps only; website unchanged)

**One shared launch check, run before any page decision:**
- New `resolveNativeSession()` in `src/lib/nativeAuthPersistence.ts`. It runs once per launch (shared, so it never runs twice in parallel):
  1. Read the session the app's browser storage holds.
  2. If there's none, restore it from phone storage (Preferences).
  3. If found, write it back to Preferences so the durable copy is fresh.
  4. Return whether a session now exists.

**Where it's used:**
- **`/` (welcome page):** on native only, a `beforeLoad` runs the check, then redirects to `/calendar` if signed in, or to `/login` if not. The welcome page never shows in the app. The website never runs this check, so it keeps working as now.
- **`/login` and `/signup`:** on native only, a `beforeLoad` redirects to `/calendar` when a session exists or can be restored. Otherwise the form shows.
- **`_authenticated.tsx`:** uses the same shared check in place of its own getSession + restore. All other behaviour stays the same, including the background refresh and "only a dead refresh token signs you out".
- **Startup persistence:** `startNativeAuthPersistence` waits for the shared check to finish before its migration copy, so the two can't race.

**Temporary `[native-auth]` logs (native only):**
- `[native-auth] launch check start`
- `[native-auth] webview session: present|missing`
- `[native-auth] preferences copy: present|missing`
- `[native-auth] restore ok|failed: <reason>` (never logs tokens)
- `[native-auth] saved (event=SIGNED_IN|TOKEN_REFRESHED|INITIAL_SESSION|USER_UPDATED|migration)`
- `[native-auth] cleared (deliberate sign-out)`
- `[native-auth] redirect / -> /calendar|/login`, `[native-auth] redirect /login -> /calendar`, `[native-auth] _authenticated -> /login (reason)`

You can see these in Android Studio Logcat (filter "native-auth") or in Chrome at `chrome://inspect`.

## Files that change
- `src/lib/nativeAuthPersistence.ts`: shared `resolveNativeSession()`, logs on save, restore and clear
- `src/routes/index.tsx`: native-only launch redirect
- `src/routes/login.tsx`, `src/routes/signup.tsx`: native-only "already signed in" redirect
- `src/routes/_authenticated.tsx`: use the shared check, plus redirect logs
- `src/lib/nativeAuthPersistence.test.ts` (new): with a session it goes to the calendar; with no session but a phone-storage copy it restores and goes to the calendar; with neither it goes to login; a dead saved copy is cleared and goes to login

## How to verify on the emulator
1. `npm run build:mobile`, then `npx cap sync android`, then run from Android Studio.
2. Sign in. Logcat should show `saved (event=SIGNED_IN)`.
3. Reinstall or relaunch. Logcat should show `launch check start`, then `redirect / -> /calendar`, and the calendar opens.
4. Sign out from More. It should show `cleared`. The next launch should log `redirect / -> /login` and open the sign-in page, not the welcome page.

## Technical notes
- The mobile build is SPA mode, so `beforeLoad` runs only in the client there. On the website, `isNativeAuthPlatform()` is false at build time, so the check is skipped and server rendering of `/` is unchanged.
- The landing route's `head()` stays as it is, for SEO.
- I'll remove the logs in a later change once you've confirmed it works.
