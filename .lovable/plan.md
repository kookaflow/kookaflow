# Fix: Apple purchases not reconciling to the stored account record

## What is happening

Apple and RevenueCat both agree the test account has an active Pro Monthly subscription, but the stored account record still says "trial". The Account screen now reads the live Apple state, so the tester sees the right thing — but the stored record drives reminders, web sign-in, and everything outside the iPhone app, so it has to be correct too.

## Root cause

The purchase notification arrived with an **anonymous purchaser ID**, and our handler deliberately drops anything that isn't a real account ID.

Confirmed in code:

- `resolveUserId()` in `src/lib/revenuecat.server.ts` accepts only `app_user_id` / `original_app_user_id`, and only when the value is a Supabase UUID. Anything else returns `null`.
- The webhook route (`src/routes/api/public/revenuecat/webhook.ts`, lines 37-41) then answers OK without writing. RevenueCat sees success and never retries.
- `RevenueCatProvider.tsx` sets RevenueCat up first and signs the user in afterwards (`identifyRevenueCatUser`). Anything bought in that gap is recorded against the anonymous ID. Nothing in the purchase path waits for identification.
- When identification later happens, RevenueCat moves the purchase onto the real ID and sends a `TRANSFER` event. `reconcile()` treats unknown types as acknowledge-only, so nothing is written then either.
- `RevenueCatEvent` has no `aliases` field, so the real ID is invisible to us even when RevenueCat includes it.

The stored record agrees: no paid grant was ever written, no Apple/Stripe ids, and the only recent change is the manual trial reset made earlier today.

Answers to the specific questions: the purchase was made under an anonymous ID; RevenueCat later linked it to the real account but the event we received carried the anonymous ID; and the handler accepts only a UUID in the two id fields, ignoring aliases and transfers entirely.

Also worth confirming outside the code: the webhook must be enabled in the RevenueCat dashboard, pointed at the production URL, with the Authorization secret set. The fix below is needed either way.

## SUBSCRIBER_ALIAS

It is a legacy event type and is **not** part of the event set this integration handles. There is no code branch for it — only a stale mention in a comment on line 171 of `src/lib/revenuecat.server.ts`. That comment reference gets removed; no branch is added.

## The fix

Three files. Secret validation stays fail-closed and untouched; gating, purchase selection, restore, Stripe and web behaviour, and the Account screen are all unchanged.

### 1. `src/lib/revenuecat.ts` — never buy while anonymous

Track the in-flight identification in a module-level promise set by `identifyRevenueCatUser()`. `purchaseRevenueCatPlan()` awaits it before calling `purchasePackage()`. Which package is bought and how entitlements are checked do not change.

### 2. `src/lib/revenuecat.server.ts` — find the real account ID, and look up truth for transfers

- Extend `RevenueCatEvent` with `aliases?: string[]`, `transferred_to?: string[]`, `transferred_from?: string[]`.
- `resolveUserId()` searches, in order, `app_user_id`, `original_app_user_id`, then `aliases`, returning the first valid Supabase UUID. Still UUID-only — anonymous IDs, emails, and product lookups are never trusted as identity.
- New `resolveTransferTarget()` searches `transferred_to` then `aliases` for a valid UUID.
- New `fetchRevenueCatSubscriber(userId)`: one authenticated `GET https://api.revenuecat.com/v1/subscribers/{id}` using a new server secret `REVENUECAT_SECRET_API_KEY` (no such key exists today — it must be added before this ships). Returns `null` on any non-200 or network error.
- New `updateFromSubscriber(subscriber, profile)` turns that authoritative state into a `SubscriptionUpdate` and passes it through the existing `applyGrant()`, so never-downgrade, lifetime protection, Stripe protection and idempotency are all unchanged.
- `reconcile()` keeps every current branch as-is. `TRANSFER` becomes a separate path in the route (below) because it needs an async lookup, not a pure function.

### 3. `src/routes/api/public/revenuecat/webhook.ts`

- After secret validation, if `event.type === "TRANSFER"`: resolve the destination UUID, load the profile, fetch the subscriber from RevenueCat, compute the update via `updateFromSubscriber`, write it. If the destination UUID or the lookup is unavailable, log and answer 200 (no write).
- All other event types follow today's exact path.
- Keep the "no usable id" branch answering 200, but log the raw id so a future anonymous-only event is visible.

## How TRANSFER reconciliation decides each value

Purely from the fetched subscriber record — nothing is inferred from the transfer event itself:

- **pro vs basic vs lifetime** — from `subscriber.entitlements`. A `lifetime` entitlement, or a non-subscription (one-time) purchase behind an active entitlement, means lifetime. Otherwise an active `pro` entitlement means pro, an active `basic` entitlement means basic. Pro beats basic when both are present.
- **active vs canceled** — the matching entry in `subscriber.subscriptions` carries `unsubscribe_detected_at`. Present means `canceled` (access still runs to the end date), absent means `active`. `billing_issues_detected_at` means `past_due`.
- **end date** — `expires_date` on that subscription, converted to a timestamp. Lifetime writes a null end date, matching current behaviour.
- No active paid entitlement in the fetched record means **no write at all** — a transfer never removes access.

## The existing hello@kookaflow.com purchase

Restore Purchases alone is **not** reliably sufficient. It links the purchase to the account inside the app and may cause RevenueCat to emit a transfer we can act on, but if RevenueCat considers the purchase already attached, no new event fires and nothing reconciles.

So: deploy, ask the tester to tap Restore Purchases, then check the record. If it still reads trial, apply a one-time correction setting the account to pro / active with Apple's renewal date (15 Sep 2026). Plan on needing that correction.

## Technical notes

- New secret required: `REVENUECAT_SECRET_API_KEY` (RevenueCat V1 secret key). Without it, transfer handling logs and no-ops rather than failing.
- The subscriber lookup is server-only, inside the route handler, and never enters the client bundle.
- Roadmap item to add when implementing: RevenueCat transfer reconciliation via subscriber lookup.

## Test checklist

- Fresh install, sign in, buy Pro Monthly: record becomes pro/active with Apple's renewal date.
- Buy immediately at launch before the account finishes loading: purchase still lands on the right account.
- Simulated TRANSFER event whose payload lacks product/entitlement/expiry: record still reconciles correctly from the lookup.
- Existing lifetime account receiving a monthly event or transfer: stays lifetime.
- Web Stripe subscriber: unchanged, still managed through the billing portal.
- Cancel in Apple: status becomes canceled, access continues to the paid-through date.
- Webhook called with a wrong or missing secret: still rejected.
