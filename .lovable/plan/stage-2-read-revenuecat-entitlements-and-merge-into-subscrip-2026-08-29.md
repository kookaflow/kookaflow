# Stage 2 — Read RevenueCat entitlements and merge into subscription state

Read-only entitlement merging. No paywall UI, no purchase flow, no webhook.

## What changes

### 1. `src/lib/revenuecat.ts` — add a small read/listen helper

Same posture as Stage 1: everything returns early unless `IS_NATIVE_IAP` and a browser context; SDK loaded via dynamic import; every path wrapped in try/catch so a failure never breaks rendering.

New exports:

- `type RevenueCatEntitlements = { basic: boolean; pro: boolean }` — `NONE` constant `{ basic: false, pro: false }`.
- `getRevenueCatEntitlements(): Promise<RevenueCatEntitlements>` — calls `configureRevenueCat()`, then `Purchases.getCustomerInfo()`, and maps `customerInfo.entitlements.active` keys `basic` / `pro` to booleans. Returns `NONE` on web or on any error.
- `onRevenueCatEntitlementsChange(cb): () => void` — registers `Purchases.addCustomerInfoUpdateListener(info => cb(mapEntitlements(info)))` and returns an unsubscribe function (removes the listener if the plugin exposes removal; otherwise a flag makes the callback a no-op after teardown). Returns a no-op unsubscribe on web.

Mapping is shared by both so the pro-grants-both convention stays in one place; `pro` active implies pro-level access, `basic` active implies basic-level access.

### 2. `src/hooks/useSubscription.ts` — merge, never downgrade

- Add two fields to `SubscriptionState`: `nativeEntitlements: { basic: boolean; pro: boolean }` (defaults to both false) — useful for debugging and Stage 3 — and keep the existing public API otherwise identical so no gate needs editing.
- Extend `computeDerived(...)` with an extra argument for the native entitlements. Logic becomes:
  - `hasProAccess = trialActive || proActive || native.pro`
  - `hasFullAccess = hasProAccess || basicActive || native.basic`
  - `isLocked = !hasFullAccess`
  - `tier`, `status`, trial fields, and Stripe ids stay exactly as read from `profiles` — RevenueCat only ever adds access, never removes or rewrites Stripe state.
- In the hook effect (native only, guarded by `IS_NATIVE_IAP`):
  - one initial `getRevenueCatEntitlements()` fetch after `load()`, stored in a ref + state so the existing 60s countdown tick recomputes against it;
  - `onRevenueCatEntitlementsChange` subscription kept live for the hook's lifetime so a purchase flips gates without an app restart;
  - re-fetch entitlements on `SIGNED_IN` / `TOKEN_REFRESHED` alongside the existing profile `load()`;
  - reset to `NONE` on `SIGNED_OUT`;
  - unsubscribe on unmount.
- On web the native block never runs: no dynamic import, no SDK call, entitlements stay `{ basic: false, pro: false }`, and derived flags are byte-for-byte the current Stripe-only result.

## Notes

- The existing shared Supabase realtime profile channel and the per-minute derived-flag tick are untouched.
- Nothing else is modified: paywall, `FeatureLock`, Stripe functions, server code, and the webhook stay as they are.

## Files

- `src/lib/revenuecat.ts` (add helpers)
- `src/hooks/useSubscription.ts` (merge entitlements into derived access)
