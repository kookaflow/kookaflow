# Relieve database pressure

## Current state
- Live database size: **Tiny** (shared CPU, up to 0.5 GB memory, about 0.08 credits per active hour).
- Today at 01:14 UTC the database ran out of its disk read/write allowance (budget at 0).
- At 02:40 UTC it was not responding to health or query checks, so current per-query timings could not be measured.

## Why change
- Tiny is meant for prototypes. Kookaflow has real users, paying subscribers and background jobs.
- An empty read/write allowance means the database is overloaded, not just slow at the edges.
- The likely heavy job is the Google Calendar background sync. For every connected user, it saves each event one at a time and then deletes leftovers, all within a 210-day window, on every run.

## Steps
1. **Resize to Mini** (1 GB memory, about 0.10 credits per hour). That is roughly 0.02 credits more per active hour, or about 15 credits more per month if it runs nonstop. This lets the database recover. You'll approve it in a card.
2. **Lighten the Google sync** (only changes how events are saved):
   - Save each page of Google events in one batch, not one at a time.
   - Delete cancelled events in batches.
   - Keep the full-state deletion check so deleted Google events still disappear.
3. **Check the sync schedule** under More > Cloud > Jobs and run it less often if it runs more than needed. I'll confirm the frequency with you first.
4. **Verify:** re-check database health and the slowest queries after the resize, and add indexes if a query needs one.

## Cost comparison
| Size | Memory | Credits/hour |
|---|---|---|
| Tiny (current) | up to 0.5 GB | 0.08 |
| Mini (proposed) | 1 GB | 0.10 |
| Small | 2 GB | 0.17 |

## Technical details
- File: `src/lib/google-calendar.server.ts`, function `syncUserCalendar`. Use batched `upsert` arrays per page and batched `.in()` deletes. The cron route and its secret check stay unchanged.
