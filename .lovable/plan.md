# Make every server call work in the iOS/Android app, then fix Google Calendar connect

## Root cause (checked this turn)

1. Sign-in reaching the server: not the problem. The app does not rely on cookies. `src/start.ts` already registers `attachSupabaseAuth`, which adds `Authorization: Bearer <access token>` to every server-function call, and protected functions verify it with `requireSupabaseAuth`.
2. Preflight: works. A live test against kookaflow.com from origin `capacitor://localhost` returned 204 with the origin allowed, POST allowed, and the requested headers (incl. `authorization`) echoed back. No credentials are needed because nothing uses cookies.
3. Base URL: correct. Server calls go to `/_serverFn/<id>`, and `src/start.ts` rewrites them to `https://kookaflow.com` in the mobile bundle (confirmed in the built files). Note: `www.kookaflow.com` answers with a 307 redirect, which would break preflight — the app must keep using the bare domain.
4. The actual cause: the reply's special headers are invisible to the app. TanStack's client decides how to decode a reply by reading the response header `x-tss-serialized` (and `x-tss-raw`). On a cross-origin request the browser/WebView hides every non-standard response header unless the server lists it in `Access-Control-Expose-Headers`. `src/server.ts` sets `Access-Control-Allow-Origin` but never exposes these headers. So in the app the client cannot see `x-tss-serialized`, skips the proper decoding, and hands back the wrong value (raw encoded data or the bare reply instead of the result). That is why `createEvent` produced no `category` and `getGoogleAuthUrl` produced no `url`. On the website calls are same-origin, so all headers are visible and everything works.

## The one central fix

In `src/server.ts` (`withCorsHeaders`, applied to every reply to an allowed app origin, including errors):
- Add `Access-Control-Expose-Headers: x-tss-serialized, x-tss-raw, x-tss-context, content-type`.
- Preflight: also allow `x-tsr-serverfn` and `accept` explicitly (currently relying on echo), keep `authorization, content-type`.
- Keep the allow-list exactly: `capacitor://localhost`, `https://localhost`, `ionic://localhost`. No credentials mode needed.

Belt-and-braces (same files, no per-function changes):
- `src/start.ts`: in the mobile fetch wrapper, if a reply comes back without `x-tss-serialized` on a server-function call, throw a clear error ("Server reply unreadable — please update the app") instead of returning a wrong value, so any future regression shows a readable message rather than a crash.
- Keep `attachSupabaseAuth` as the token attacher; no new server middleware is needed since `requireSupabaseAuth` already verifies the bearer on every protected function.

This fixes every server function on native at once: shift templates, shift alerts, push settings, preferences, Google Calendar, delete account, and events (events already moved to direct database calls; they can stay that way).

## How it will be tested before a new TestFlight build
- Live header check: POST to a real server function on the preview with `Origin: capacitor://localhost` and confirm the reply carries `Access-Control-Expose-Headers` including `x-tss-serialized`.
- App-in-a-browser test: serve the built mobile files from a second local address that mimics the app (a different origin pointing at the preview server, allowed only outside production), sign in, then:
  - open Shift templates and confirm `listShiftTemplates` returns the real list (and create/delete one);
  - run `deleteAccount` against a throwaway test account only, and confirm the account is gone and the app signs out.
- Then on the phone after the new build: Shift templates list, Sound & notifications save, Google Calendar connect.

## Google Calendar connect (on top of the fix)
1. Guard: `handleConnect` in `src/components/settings/ConnectedCalendars.tsx` checks for a `url` and shows "Couldn't start Google connection — please try again" instead of crashing.
2. Keep the existing `getGoogleAuthUrl` server function (works once the central fix is in) — no separate endpoint needed. Its `redirect_uri` becomes the fixed address `https://kookaflow.com/auth/google/callback` on native (from the request origin on web), and the signed `state` carries a `native` flag.
3. Native only: open the Google page with `@capacitor/browser` (installed) instead of navigating inside the app; web keeps `window.location.href`.
4. The token exchange stays server-side in `/auth/google/callback`. When `state` says native, the finished page redirects to `com.kookaflow.app://google-calendar?status=connected` (or `error=...`), with a "Return to Kookaflow" button as fallback.
5. In the app, listen for that link (`@capacitor/app`, to be added), close the browser, refresh the connection status and show "Google Calendar connected".
6. Shared Pro check `hasProAccess(userId)` used by all Google functions:
   - trial active (`profiles.trial_ends_at` in the future), or
   - `lifetime`, or `pro` with status active/trialling, or `pro` with `subscription_end_date` still in the future — `profiles` is written by both the Stripe webhook and the RevenueCat webhook (never-downgrade rules in `src/lib/revenuecat.server.ts`), or
   - only if those deny: a live server-side RevenueCat lookup (existing `fetchRevenueCatSubscriber`, secret key stays on the server) to catch a purchase the webhook hasn't recorded yet.

## Files that change
- `src/server.ts` — expose headers, explicit preflight headers (the root-cause fix)
- `src/start.ts` — clear error when a reply is unreadable
- `src/components/settings/ConnectedCalendars.tsx` — guard + native browser
- `src/lib/google-calendar.functions.ts` — shared Pro check, native redirect/state
- `src/lib/google-calendar.server.ts` — Pro helper, fixed redirect URI, `state` with native flag
- `src/routes/auth.google.callback.ts` — deep-link return when native
- `src/lib/nativeDeepLinks.ts` — new deep-link listener, registered once in `src/routes/__root.tsx`
- `package.json` — add `@capacitor/app`

## Google Cloud Console
- No new redirect URI. Confirm `https://kookaflow.com/auth/google/callback` is listed on the Web OAuth client. Custom app links are not allowed there, which is why the app link happens after the server step.

## On MacinCloud
- Publish the site first (the header fix lives on kookaflow.com and helps the existing build too — server calls may start working in Build 10 without a new build).
- `bun install`, `bun run build:mobile`, `npx cap sync ios`.
- Info.plist, add:
```text
<key>CFBundleURLTypes</key>
<array><dict>
  <key>CFBundleURLName</key><string>com.kookaflow.app</string>
  <key>CFBundleURLSchemes</key><array><string>com.kookaflow.app</string></array>
</dict></array>
```
- AppDelegate.swift: keep the standard Capacitor `application(_:open:options:)` handler.
- Android, in the main activity of AndroidManifest.xml:
```text
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="com.kookaflow.app" />
</intent-filter>
```
- Raise the build number, archive, upload to TestFlight.
