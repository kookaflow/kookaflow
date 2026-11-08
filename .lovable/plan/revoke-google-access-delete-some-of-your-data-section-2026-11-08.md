# Revoke Google access + "Delete some of your data" section

## Revoke at Google
- New helper `revokeGoogleAccess(userId)` in src/lib/google-calendar.server.ts: reads the user's stored refresh token (falls back to access token) from google_calendar_connections and POSTs it to `https://oauth2.googleapis.com/revoke` (form body `token=...`). Revoking the refresh token removes Kookaflow's whole grant from the Google account. Non-OK responses or network errors are logged (`[google-revoke] ...`) and never thrown. No-op if no connection.
- `disconnectGoogleCalendar` (src/lib/google-calendar.functions.ts): call the helper first, then delete cached events and the connection as now.
- `deleteAccount` (src/lib/account.functions.ts): call the helper (in try/catch, logged) before the table deletions.

## New page section (id="delete-some-data")
On /delete-account, after "Request deletion without the app". Title: "Delete some of your data without deleting your account".
- Delete individual shifts, events and shift templates in the app at any time — open the item and choose Delete.
- Disconnect Google Calendar (More → Connected Calendars → Disconnect): removes Kookaflow's access to your Google account, deletes the stored connection and its tokens, and deletes the Google events Kookaflow had stored. Shifts already copied into your Google Calendar stay in Google.
- Anything else: email hello@kookaflow.com from your account's email address with subject "Delete some of my data" (pre-filled email link); handled within 30 days.
- "What is deleted" Google line updated to mention access is revoked at Google.

## Files
- src/lib/google-calendar.server.ts
- src/lib/google-calendar.functions.ts
- src/lib/account.functions.ts
- src/routes/delete-account.tsx
