# Fix Google Calendar connect on the iOS app

## Diagnosis (confirmed in code)
- The Connect button (`src/components/settings/ConnectedCalendars.tsx`, `handleConnect`) calls the server function `getGoogleAuthUrl` (`src/lib/google-calendar.functions.ts`) and does `const { url } = await fetchAuthUrl()` with no check.
- On the iOS app this server-function call comes back empty — the same failure we saw with event creation: the app's internal server-call channel does not work reliably from the app's own origin (`capacitor://localhost`) to kookaflow.com. Result is `undefined`, so destructuring `url` crashes.
- Secondary problem: `getGoogleAuthUrl` builds `redirect_uri` from the request's origin. From the app that origin is not kookaflow.com, so even a returned URL could carry the wrong return address.
- Then Google blocks sign-in inside the app's built-in web view (403 disallowed_useragent), and the callback page currently forwards to `/settings` on the website, not back into the app.

## Fix

1. Reliable URL fetch on native
   - Add a plain server endpoint `POST /api/public/google/auth-url` that reads the `Authorization: Bearer` token, verifies the user server-side, checks Pro access, and returns `{ url }`. Allows CORS from `capacitor://localhost` / `ionic://localhost` only.
   - `redirect_uri` is always the fixed production address `https://kookaflow.com/auth/google/callback` (from a server setting, falling back to the request origin on web), so it matches Google Console.
   - The signed `state` gains a `native` flag so the callback knows where to send the user.
   - Web keeps using the existing server function unchanged.

2. Guard in the UI
   - `handleConnect` checks the response; if `url` is missing it shows "Couldn't start Google connection — please try again" instead of crashing.

3. Open Google in the system browser (native only)
   - On iOS/Android, open the URL with `@capacitor/browser` (already installed) instead of navigating the web view. Web still uses `window.location.href`.

4. Return to the app
   - Token exchange stays fully server-side in `/auth/google/callback` (unchanged logic).
   - When `state` says native, the success/error page redirects to `com.kookaflow.app://google-calendar?status=connected` (or `error=...`) with a visible "Return to Kookaflow" button as fallback.
   - In the app, listen for the deep link (`@capacitor/app`, to be added), close the browser, refresh connection status, and show "Google Calendar connected".

## Files that change
- `src/components/settings/ConnectedCalendars.tsx` — guard + native branch
- `src/routes/api/public/google/auth-url.ts` — new endpoint (bearer-verified, CORS)
- `src/lib/google-calendar.server.ts` — shared auth-URL builder, fixed redirect URI, `state` with native flag
- `src/lib/google-calendar.functions.ts` — reuse the shared builder (web behaviour identical)
- `src/routes/auth.google.callback.ts` — deep-link redirect when native
- `src/lib/nativeDeepLinks.ts` — new: deep-link listener
- `src/routes/__root.tsx` (or app shell) — register the listener once on native
- `package.json` — add `@capacitor/app`

## Google Cloud Console
- No new redirect URI. Keep (or confirm) `https://kookaflow.com/auth/google/callback` in the Web OAuth client's Authorized redirect URIs. Custom schemes are not allowed on Web clients, which is why the deep link happens after the server callback.

## On MacinCloud
- `bun install`, `bun run build:mobile`, `npx cap sync ios` (installs the Browser and App plugins into the iOS project).
- Info.plist, add URL type:
```text
<key>CFBundleURLTypes</key>
<array><dict>
  <key>CFBundleURLName</key><string>com.kookaflow.app</string>
  <key>CFBundleURLSchemes</key><array><string>com.kookaflow.app</string></array>
</dict></array>
```
- AppDelegate.swift: confirm the default Capacitor `application(_:open:options:)` handler calling `ApplicationDelegateProxy.shared` is present (it is in the standard template).
- Android (if/when built), in the main activity of AndroidManifest.xml:
```text
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="com.kookaflow.app" />
</intent-filter>
```
- Raise build number, archive, upload to TestFlight.

## Verification
- Web: connect flow unchanged, tested in browser.
- Endpoint: call with and without a valid sign-in token (401 without).
- Native: needs a new TestFlight build to confirm on device.
