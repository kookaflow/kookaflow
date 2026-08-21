# Realtime subscription crash on mobile — findings and proposed fix

## Where the channel lives

`src/hooks/useSubscription.ts` (lines ~134–147) is the only place a realtime channel is created in the app:

```text
supabase
  .channel(`profile-subscription-${user.id}`)
  .on('postgres_changes', { ...UPDATE on profiles, filter id=eq.<uid> }, () => load())
  .subscribe()
```

## The ordering is actually correct — the bug is duplication

In this file `.on()` is called before `.subscribe()`, so the literal ordering is fine. The error comes from the same channel topic being created more than once:

- `supabase.channel(topic)` in the installed realtime client returns the **existing** channel when one with that topic already exists (it does not create a second one).
- `RealtimeChannel.on()` throws exactly this error when the channel it is called on is already joined or joining.

So the second caller gets back the already-subscribed channel and `.on('postgres_changes', ...)` throws.

`useSubscription()` is mounted by several components at once, all with the same topic (`profile-subscription-<user id>`):

- `src/components/subscription/TrialBanner.tsx` (rendered in the authenticated layout, so always mounted)
- `src/components/more/AccountSection.tsx`
- `src/components/subscription/FeatureLock.tsx`
- `src/routes/_authenticated.dashboard.tsx`, `src/routes/pro.success.tsx`

Two or more of those mounted together = second instance throws. There is a second contributing defect: the channel is created inside a fire-and-forget `void (async () => { ... })()` IIFE, so (a) nothing catches the throw — hence the *unhandled* promise rejection you see — and (b) on a fast unmount/remount the cleanup runs before `channel` is assigned, leaking a subscribed channel that the next mount then trips over.

## Does this explain the empty calendar? Unconfirmed

Honest answer: probably not on its own. The throw happens inside an async IIFE that React never awaits, so it cannot unmount or blank the React tree — it only kills that one channel setup. I have not confirmed a mechanism by which it empties the calendar, so I would not claim it as the cause.

One thing worth flagging from the response you inspected: columns `googleEventId, summary, location, start, end, isAllDay` are the **Google calendar cache** shape (`listGoogleEvents`), not Kookaflow's own `listEvents` shape (`title, category, shiftType, ...`). So the evidence confirms the Google query succeeded; it does not yet confirm `listEvents` succeeded. The calendar merges both sources in `src/routes/_authenticated.calendar.tsx`, so if Google rows arrived and nothing renders, something else is filtering/short-circuiting the render.

## Proposed work

1. **Fix the realtime setup (`src/hooks/useSubscription.ts`)** — this removes the unhandled rejection regardless of its render impact:
   - Wrap the channel setup so a failure can never escape: `try/catch` inside the async setup plus a `.catch()` on the IIFE.
   - Guard against duplicates: before creating, look for an existing channel with that topic and remove it (or reuse it without re-registering handlers).
   - Track the channel in a ref and handle the unmount-before-assign race so cleanup always removes what was created.
   - Better still: create the channel once per user in a small module-level shared subscription (single channel, multiple listeners) so N mounted consumers can never collide. This is the durable fix given five call sites.

2. **Then re-check the calendar with the console clean.** With the rejection gone, read the `[events] status / count / error` log already in `src/providers/EventsProvider.tsx` on the device and report what `listEvents` returns. If it returns rows and the grid is still empty, the next suspect is the mapping/rendering path in `MonthView`, not data fetching — I'd investigate that separately rather than guess now.

No code changes made in this pass.
