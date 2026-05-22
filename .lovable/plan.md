# Kookaflow Push Notifications — OneSignal Integration Plan

Your message was cut off mid-spec (Part 3 ended at the request body). This plan covers everything you described and flags assumptions for the truncated section — please confirm before I build.

## Important stack note

Kookaflow runs on **TanStack Start**, not Supabase Edge Functions. Per project conventions, server-side logic must be written as `createServerFn` (internal RPCs) or server routes under `src/routes/api/public/*` (external/cron endpoints). I'll implement what you called "Edge Functions" using these — same behaviour, correct stack. Existing daily/weekly push hooks already follow this pattern (`src/routes/api/public/hooks/send-push-*-reminder.ts`).

## Existing code to reuse

- `src/lib/reminders/push.server.ts` — already has `sendOneSignalPush()`, `pickTip()`, `computeBalanceScore()`. Built around `include_aliases: { external_id: [userId] }`.
- `src/routes/api/public/hooks/send-push-daily-reminder.ts` and `send-push-weekly-reminder.ts` — already deployed; will be updated to honour the new per-user push preferences.

## Secret naming

Existing secret is `ONESIGNAL_REST_API_KEY`. You asked for `ONESIGNAL_API_KEY`. I'll standardise on **`ONESIGNAL_API_KEY`** (rename in code, ask you to re-add the secret value) — confirm or I'll keep the existing name.

## Part 1 — Frontend SDK

1. Install `react-onesignal`.
2. New `src/providers/OneSignalProvider.tsx` mounted in `__root.tsx`:
   - Initialises with `VITE_ONESIGNAL_APP_ID` (publishable; added to `.env` and project env).
   - On auth `SIGNED_IN`, calls `OneSignal.login(userId)` so `external_id` matches our `profiles.id` (this is what `push.server.ts` already targets).
   - Subscribes to subscription change → writes `onesignal_player_id` + `push_notifications_enabled=true` to `profiles` via a new `updatePushSubscription` server fn.
3. New `src/components/notifications/PushPermissionPrompt.tsx`:
   - Bottom slide-up card, Kookaflow logo (40px), Lucide `Bell` (32px amber), heading "Never miss a shift 🦅", body copy as specified, navy→amber gradient "Enable notifications" + muted "Maybe later".
   - Shows when: user signed in AND `Notification.permission === 'default'` AND not dismissed within 7 days (localStorage key `kookaflow.push.dismissedAt`).
   - Enable → `OneSignal.Notifications.requestPermission()` then persists subscription.
   - Denied → no further auto-prompts; Settings shows the "Notifications blocked — enable in your browser settings" note.
4. Settings hook into existing `RemindersSettings.tsx` (UI changes minimal — you said "do not edit any UI pages" earlier; for this phase I'll add the prompt + a small status row in Settings since you explicitly described it. Confirm).

## Part 2 — Database migration

Add to `profiles`:
- `onesignal_player_id text`
- `push_notifications_enabled boolean not null default false`
- `push_daily_reminder boolean not null default false`
- `push_weekly_reminder boolean not null default false`
- `push_shift_alerts boolean not null default true`

Existing RLS (`profiles_update_own`) already covers these. No new policies needed.

## Part 3 — Reusable send function (assumed completion of your truncated spec)

`src/lib/reminders/push.server.ts` gets a new export `sendPushToUser({ userId, title, message, url, scheduledFor? })`:
1. Look up `onesignal_player_id` + `push_notifications_enabled` from `profiles` via `supabaseAdmin`.
2. If missing/disabled → return `{ skipped: true }` silently.
3. POST `https://onesignal.com/api/v1/notifications` with:
   ```
   { app_id, include_player_ids: [player_id],
     headings: { en: title }, contents: { en: message },
     url, send_after?: scheduledFor }
   ```
   Header: `Authorization: Basic ${ONESIGNAL_API_KEY}`.
4. Returns OneSignal response or throws with status + body.

Exposed two ways:
- **Internal**: as a helper imported by other server fns/routes (shift alerts, ad-hoc sends).
- **External**: thin server route `src/routes/api/public/hooks/send-push-notification.ts` (apikey-gated like the existing hooks) so cron/external triggers can call it.

## Part 4 — Wire existing daily/weekly hooks to new prefs

Update `send-push-daily-reminder.ts` / `send-push-weekly-reminder.ts` to additionally require `profiles.push_daily_reminder` / `push_weekly_reminder` = true (currently they only check `user_preferences.*_channel`).

## Files to add / change

**Add**
- `supabase/migrations/<ts>_profiles_push_columns.sql`
- `src/providers/OneSignalProvider.tsx`
- `src/components/notifications/PushPermissionPrompt.tsx`
- `src/lib/push.functions.ts` (`updatePushSubscription`, `getPushStatus`)
- `src/routes/api/public/hooks/send-push-notification.ts`

**Edit**
- `src/lib/reminders/push.server.ts` (add `sendPushToUser`, rename env var)
- `src/routes/__root.tsx` (mount provider + prompt)
- `src/routes/api/public/hooks/send-push-{daily,weekly}-reminder.ts` (honour new prefs)
- `package.json` (add `react-onesignal`)
- `.env` (`VITE_ONESIGNAL_APP_ID`)

## Open questions before I build

1. Confirm secret name → `ONESIGNAL_API_KEY` (rename) or keep `ONESIGNAL_REST_API_KEY`?
2. Confirm I may touch Settings UI to add the "blocked" note + a toggle row (you previously said "do not edit any UI pages"; this phase implies UI work).
3. Your spec stopped mid-JSON in Part 3 — anything beyond the standard `include_player_ids` / `headings` / `contents` / `url` / `send_after` (e.g. `data` payload, `chrome_web_icon`, `large_icon`)?
4. Should `send-push-notification` be callable from the browser (authenticated `createServerFn`) too, or only via the apikey-protected public route?
