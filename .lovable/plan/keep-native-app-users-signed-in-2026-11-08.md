# Keep native app users signed in

## Findings
1. **Where the session lives on native:** in the WebView's localStorage. The auto-generated sign-in client (which can't be edited) uses localStorage everywhere except Lovable preview hosts. iOS can clear WebView storage when the phone runs low on space or after long inactivity; when that happens the app sees no session and sends the user to sign-in. Android's WebView can also lose it (e.g. "Clear cache" or a WebView update).
2. **Refresh on resume:** the signed-in layout calls `refreshSession()` on every `visibilitychange`, while the client's own auto-refresh may also be refreshing. Two refreshes racing with the same one-time refresh token can make the server reject the second one as "already used", which signs the user out. There is no `appStateChange` handling.
3. **Sign-outs from errors:** no code calls `signOut()` on a network or server-call error (only the three sign-out/delete buttons do). The layout only redirects when the session is missing or `getUser()` returns an explicit "session not found / refresh token not found" error; network errors are already ignored. The risky paths are (1) and (2), plus the startup check: with an expired access token after long sleep, `getUser()` can return "invalid JWT" before the refresh finishes.

## Fix (native only; web unchanged)
- **Durable session copy:** after every sign-in and token refresh, save the session to `@capacitor/preferences` (UserDefaults on iOS, SharedPreferences on Android — not cleared with WebView storage). Remove it on explicit sign-out only.
- **Restore instead of logging out:** when the signed-in layout finds no session on native, first restore from Preferences with `supabase.auth.setSession(...)` (refreshes the token if it's expired) before considering sign-in. Existing users are migrated automatically: on first launch of the update their current localStorage session is copied into Preferences.
- **Resume handling:** use `@capacitor/app` `appStateChange` — `startAutoRefresh()` when active, `stopAutoRefresh()` when backgrounded. On native, drop the extra `refreshSession()` on visibility to remove the race (web keeps it).
- **Startup check:** on native, before the background `getUser()` check, ensure the session is fresh (refresh once if expired), and only send to sign-in when the refresh itself fails with an explicit "refresh token not found / revoked" error — never on network or expired-JWT errors.
- **Session-timed-out toast:** shown only for real sign-outs (unchanged behaviour), and the root listener ignores token-refresh events so resuming doesn't refetch everything.

## Files that change
- src/lib/nativeAuthPersistence.ts (new): save/restore/clear session in Preferences, appStateChange auto-refresh wiring, migration.
- src/routes/__root.tsx: start native persistence once; filter auth events.
- src/routes/_authenticated.tsx: restore-before-redirect, native-only refresh handling.
- src/components/more/SignOutSection.tsx, src/components/settings/SecuritySection.tsx, src/components/settings/DangerZone.tsx: clear the saved copy on deliberate sign-out/delete.
- package.json: add `@capacitor/preferences@^8`.

## Also check (backend setting)
Read the backend sign-in settings for session time limits / inactivity timeout and refresh-token reuse interval; if a session time limit is set it would log users out regardless — report and, if you agree, turn it off.

## Native steps for you
1. `npm install` / `bun install`, `npm run build:mobile`.
2. `npx cap sync ios` and `npx cap sync android` (registers Preferences; no code or permission changes).
3. Raise build numbers, upload new builds. Users already signed in stay signed in through the update.
