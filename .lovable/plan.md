# Reduce avoidable database work

## Changes

1. **Skip unchanged appearance writes**
   - Track the last theme and mode successfully loaded or saved.
   - Keep applying preferences locally, but avoid writing the same values back to the database after startup, sign-in, or a server read.
   - Preserve the existing debounce and cross-device preference sync.

2. **Cache Google Calendar connection status for five minutes**
   - Give both the Calendar and Connected Calendars screens the same five-minute cache window for the shared connection-status query.
   - Keep the existing explicit refreshes after connect, disconnect, sync, and two-way-sync changes so user actions still update immediately.
   - Do not cache token-refresh or background-sync operations that require fresh connection data.

3. **Load events for a bounded date range**
   - Make event loading accept a date window and include events that overlap it, rather than downloading the user's entire history.
   - Drive the window from the active calendar date/view, with enough surrounding range for month grids, weekly summaries, today's login summary, and recurrence expansion.
   - Include recurring series whose first event predates the window but can generate occurrences inside it.
   - Use range-specific query keys so navigation reuses cached months and mutations refresh the relevant event queries.
   - Preserve create, edit, delete, stamping, alerts, mobile direct reads, and the existing recurrence behavior.

## Validation

- Confirm opening the app without changing appearance causes no database preference update.
- Confirm changing theme or mode still saves once and survives reload.
- Confirm Calendar and Connected Calendars share cached connection status and explicit actions refresh it.
- Test month, week, and day navigation across past and future dates, including overnight and recurring shifts.
- Test create, edit, delete, stamping, daily summary, weekly summary, and mobile calendar loading.

## Technical scope

Frontend query and persistence changes only. No schema, billing, subscription, webhook, or pricing changes.
