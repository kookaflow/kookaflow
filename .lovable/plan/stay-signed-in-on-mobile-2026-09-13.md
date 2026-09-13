# Stay signed in on mobile

## What's happening

Your login itself is not expiring. The saved session lives in the phone browser's
long-term storage and, on the backend, logins are not time-limited or set to expire
after inactivity.

What's actually kicking you out: every time the app opens a signed-in page, it asks
the server "who is this user?" before showing anything. If that one request fails —
patchy mobile signal, the phone waking from sleep, or the server being slow (we saw
a batch of these requests time out on kookaflow recently) — the app treats it as
"not signed in" and sends you to the login screen, even though your session is still
saved and valid.

So the fix is to stop treating a failed or slow check as a sign-out, and to only send
someone to the login screen when there is genuinely no saved session.

## Plan

1. **Trust the saved session first.** On opening a signed-in page, read the session
   already stored on the device. If one exists, show the app immediately instead of
   waiting on a server round-trip.
2. **Never sign out on a network or server error.** If the "who is this user?" check
   fails or times out, keep the user signed in and let the app retry in the background.
   Only redirect to login when there is no stored session at all, or when the server
   explicitly says the session is invalid (revoked/expired token).
3. **Refresh quietly in the background.** Let the session renew itself on its own
   schedule, and when the app comes back to the foreground after being backgrounded,
   attempt one silent renewal so a long-idle phone reconnects instead of bouncing.
4. **Keep the real sign-out working.** Tapping "Sign out" still signs out immediately
   and clears everything; if the backend genuinely invalidates a session, the user is
   still returned to login.

Result: you stay signed in for as long as you keep using the app, and a two-week gap
between uses will still find you signed in. Only a deliberate sign-out, clearing your
browser data, or a password/session reset ends it.

## Technical detail

- `src/routes/_authenticated.tsx`: the gate currently calls `supabase.auth.getUser()`
  and redirects to `/login` whenever `data.user` is falsy — which includes network
  failures and 504s. Replace with: read `getSession()` (local, no network) to admit
  the user; then validate with `getUser()` in the background, redirecting only on an
  explicit auth error (invalid/expired refresh token), not on a transport error.
  The onboarding profile lookup moves behind the same non-fatal handling so a failed
  profile read doesn't strand the user either.
- Add a `visibilitychange` handler that calls `supabase.auth.refreshSession()` once
  when the tab returns to the foreground, so a phone that slept for days re-arms its
  access token before the first data request.
- `onAuthStateChange`: keep redirecting on `SIGNED_OUT` only. Do not redirect on
  `TOKEN_REFRESHED` failures or `INITIAL_SESSION`.
- The generated Supabase client already uses `persistSession: true`,
  `autoRefreshToken: true`, and `localStorage` on kookaflow.com — no change there,
  and no edits to generated integration files.
- Backend auth settings stay as they are (no session time-box, no inactivity timeout),
  which is what allows a 2-week gap to keep working. Refresh-token reuse detection
  stays on, so a stale token from a duplicated tab still recovers via rotation.

Out of scope: checkout, webhooks, calendar sync, the native iOS build, and any change
to Sign Out behaviour.
