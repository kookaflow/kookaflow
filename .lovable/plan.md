# Google Calendar: missing-permission handling and friendly errors

## What I found
- Kookaflow only asks Google for **read-only** calendar access (`calendar.readonly`). Two-way sync (copying shifts into Google) needs write access, so it can't work as currently requested. Push failures are only logged, so nobody noticed.
- The sign-in return page saves the connection without checking which permissions the person actually ticked.
- Sync errors are stored as raw Google text and shown on the More page ("Sync failed: Calendar list failed (403): {...}"). The return page also shows raw error text.

## Changes

1. **Request the right permissions**
   - Ask for `calendar.readonly` (reading events) + `calendar.events` (creating/updating/deleting the shifts Kookaflow copies in). `calendar.events` is the narrowest scope that allows two-way sync.
   - **You need to do this in Google Cloud Console** → Google Auth Platform → Data Access: add `.../auth/calendar.events` next to `calendar.readonly`. It's a "sensitive" scope, so if the app is published/verified, Google may ask you to resubmit verification. Until then, new users see an "unverified app" warning for that permission. Tell me if you'd rather keep two-way sync off for now and stay read-only.

2. **Check permissions when someone connects**
   - Read the granted scopes from Google's token reply. If read access is missing: don't save the connection, revoke the token, and show "Kookaflow needs permission to see your calendar. Please connect again and tick the calendar box." (on web, and on the "Return to Kookaflow" page in the app, which then shows a toast).
   - If read access is granted but write access isn't: save the connection, turn two-way sync off, and show "Connected. To copy shifts into Google, reconnect and tick the 'edit events' box."
   - Turning on two-way sync without write access shows a Reconnect prompt instead of failing quietly.

3. **Existing connections that hit the 403**
   - When Google answers 403 "insufficient scopes" (or an expired/revoked refresh token, `invalid_grant`), mark the connection as **needs reconnection**.
   - The More → Connected Calendars card then shows "Google needs you to reconnect Kookaflow" with a **Reconnect** button. This button runs the normal connect flow, so it works in the app through the system browser. No error text is shown.
   - The background sync for all users skips connections marked this way until they reconnect.

4. **No raw errors anywhere**
   - One translation function turns Google failures into short messages:
     - Permissions: "Reconnect needed"
     - Rate limit: "Google is busy — we'll try again shortly"
     - Network: "Couldn't reach Google — check your connection"
     - Anything else: "Sync didn't finish — we'll retry automatically"
   - The full details go to the server log only.
   - This covers manual sync, background sync, the connect return page, push and delete of shifts, and the events list on the calendar.

## Live after Publish vs new app build
- **Server-side, live after Publish (website and existing app builds):** the permission request, the scope check on connect, the friendly return page, marking connections as needing reconnection, the friendly stored messages, and skipping in background sync. Existing apps immediately stop showing raw text, because the More card displays whatever message the server stores.
- **Needs a new app build:** the dedicated **Reconnect** button and banner on the More card, the "needs edit permission" prompt on the two-way sync switch, and the friendlier toasts after tapping Sync now. On older builds, the More card still shows a friendly sentence plus the old Connect button.

## Technical details
- `google-calendar.server.ts`: `GOOGLE_SCOPES` add `calendar.events`; new `classifyGoogleError(status, body)` → `{ code: "needs_reconnect" | "rate_limited" | "network" | "unknown", message }`; a typed `GoogleApiError` thrown by list/refresh/push. On `needs_reconnect`, write `last_sync_error = "needs_reconnect"` (no schema change; the existing column stores a code instead of raw text) and keep tokens.
- `auth.google.callback.ts`: parse `tokens.scope`; require `calendar.readonly` or `calendar`; without read access → `revokeGoogleAccess` path + friendly page/deep link `status=scope_missing`; generic catch shows a friendly message and does `console.error` with the details.
- `google-calendar.functions.ts`: `getGoogleConnectionStatus` returns `needsReconnect` and `canWrite` (from the stored scope) and a mapped `lastSyncError` message; `triggerGoogleSync` stores and returns friendly messages; `setTwoWaySync` rejects with "reconnect needed" when `!canWrite`; `listGoogleEvents` returns an empty list and logs on failure.
- `api/public/google/sync-all.ts`: skip `needs_reconnect` rows and store codes/friendly text.
- `ConnectedCalendars.tsx`: Reconnect state, two-way switch guard, friendly toasts; `nativeDeepLinks.ts`: handle `status=scope_missing`.
- Tests: `classifyGoogleError` (403 insufficient scope → needs_reconnect, invalid_grant → needs_reconnect, 429 → rate_limited) and a scope-check helper (readonly only → read ok and write false; no calendar scope → rejected).
