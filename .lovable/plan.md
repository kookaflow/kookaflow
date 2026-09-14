# Fix: Apple purchases not reconciling to the Supabase profile

## What is happening

Apple and RevenueCat both agree the test account has an active Pro Monthly subscription, but the stored account record still says "trial". The app's Account screen now reads the live Apple state, so the user sees the right thing — but the stored record is what powers email reminders, web sign-in, and anything outside the iPhone app. It needs to be correct too.

## Root cause

The purchase notification from RevenueCat is arriving with an **anonymous purchaser ID**, not the account's real ID, and our handler deliberately drops anything that isn't a real account ID.

Confirmed in code:

- `resolveUserId()` in `src/lib/revenuecat.server.ts` only accepts `app_user_id` or `original_app_user_id` when the value looks like a Supabase UUID. Anything else returns `null`.
- The webhook route (`src/routes/api/public/revenuecat/webhook.ts`, lines 37-41) then logs "event without a usable app_user_id" and answers OK without writing anything. RevenueCat sees success and never retries.
- `RevenueCatProvider.tsx` configures RevenueCat first and only *then* signs the RevenueCat user in (`identifyRevenueCatUser`). Between app launch and that call completing, RevenueCat is an anonymous user. A purchase in that window is recorded against the anonymous ID.
- When sign-in later happens, RevenueCat transfers the purchase onto the real account ID and emits `TRANSFER` / `SUBSCRIBER_ALIAS` events. `reconcile()` (line 170-172) treats both as "acknowledge only", so nothing is written then either.
- `RevenueCatEvent` has no `aliases` field, so even when RevenueCat includes the real ID in the alias list, we never look at it.

The stored record confirms this: no Pro grant was ever written, no Apple/Stripe ids, and the only recent change is the manual trial reset made earlier today.

So: (2) yes, the purchase was almost certainly made under an anonymous ID; (3) yes, RevenueCat later links it to the real account but the event we received carried the anonymous ID; (4) the handler only accepts a UUID and ignores aliases and transfers entirely.

Secondary check that is not code (worth confirming in the RevenueCat dashboard): the webhook must be enabled and pointed at the production URL with the Authorization secret set. If it was never firing, the same symptom appears. The fix below is needed regardless.

## The fix (smallest safe change)

Two files, no change to secret validation, gating, purchase/restore flows, Stripe/web behaviour, or the Account screen.

1. **`src/lib/revenuecat.ts` — identify before anything else can be bought.**
   Make sign-in part of the setup handshake so a purchase can never happen while anonymous: have the purchase entry point await the pending identify call, and keep a module-level "identified user id" promise that `purchaseRevenueCatPlan` awaits before calling `purchasePackage`. No change to which package is bought or to entitlement checks.

2. **`src/lib/revenuecat.server.ts` — accept the account ID wherever RevenueCat puts it.**
   - Add `aliases?: string[]` to `RevenueCatEvent`.
   - `resolveUserId()` scans `app_user_id`, `original_app_user_id`, then `aliases`, returning the first valid UUID. Still strictly UUID-only — an anonymous ID is never trusted, and no fallback to email or product lookups.
   - Handle `TRANSFER` in `reconcile()`: when a transfer names a real account, re-grant based on the event's entitlement/product exactly like `INITIAL_PURCHASE`, going through the same `applyGrant()` so never-downgrade, lifetime protection, Stripe protection, and idempotency all still apply.
   - Keep the "no usable id" branch answering 200, but log the raw id so a future anonymous-only event is visible.

Nothing about the never-downgrade rules changes: every write still flows through `applyGrant()`.

## One-time manual reconciliation

Yes — the existing purchase will not resend its original event. After the code change, do both:

- Ask the tester to open the app and tap **Restore Purchases**, which links the Apple purchase to the account and makes RevenueCat emit a transfer the new handler can act on.
- If the record still reads trial afterwards, set `hello@kookaflow.com` directly to `pro` / `active` with the end date Apple reports (15 Sep 2026) as a one-off correction.

## Test checklist

- Fresh TestFlight install, sign in, buy Pro Monthly: stored record becomes pro/active with the Apple renewal date.
- Buy immediately on launch before the account finishes loading: purchase still lands on the right account.
- Existing lifetime account receiving a monthly event: stays lifetime.
- Web Stripe subscriber: unchanged, still managed through the billing portal.
- Cancel in Apple: status becomes canceled, access continues to the paid-through date.
