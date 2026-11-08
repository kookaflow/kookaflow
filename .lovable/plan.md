# /delete-account: "Delete some of your data" section

## What disconnecting Google Calendar removes (checked)
It deletes the stored Google connection, including its access and refresh tokens and sync settings, and all cached Google events from Kookaflow. It does not revoke Kookaflow's access in the Google account, and it does not remove shifts Kookaflow already copied into Google Calendar (two-way sync) — those stay in Google.

## New section (id="delete-some-data")
Placed after "Request deletion without the app". Title: "Delete some of your data without deleting your account".
- Delete individual shifts, events and shift templates in the app at any time — open the item and choose Delete.
- Disconnect Google Calendar (More → Connected Calendars → Disconnect): removes the connection and its access tokens, and deletes the Google events Kookaflow had stored. Shifts already copied to your Google Calendar stay there; to fully remove Kookaflow's access, also remove it under your Google Account → Security → Third-party apps.
- Anything else: email hello@kookaflow.com from your account's email address with subject "Delete some of my data" (mailto link pre-filled); handled within 30 days.

## Files
- src/routes/delete-account.tsx
