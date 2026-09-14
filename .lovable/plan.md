# Manage Subscription — native iOS diagnosis

## Finding: this is already built

The Apple-aware Manage Subscription behaviour was implemented in an earlier session and is present in the current code. The button no longer routes native Apple subscribers to Stripe.

### 1. Where it lives
`src/components/more/AccountSection.tsx` (the Subscription row):
- `showAppleManage` (line 105) → renders the "Manage Subscription" button, `handleAppleManage()` (line 130) calls `openNativeSubscriptionManagement(native?.managementURL)`.
- `showStripeManage` (line 107) → renders "Billing portal", `handlePortal()` (line 117) creates/opens the Stripe portal. Unchanged.

### 2. How native is distinguished
Via the existing single flag `IS_NATIVE_IAP` in `src/lib/revenuecat.ts` (line 16), used by `useSubscription`, `pricing.tsx`, `PaywallModal` and `AccountSection`. No second mechanism exists or is needed.

Store attribution is not assumed from the flag alone: `getRevenueCatSubscriptionInfo()` reads the active entitlement's `store` field, and `AccountSection` gates the Apple button on `APP_STORE`/`MAC_APP_STORE`. Stripe's button stays gated on `stripe_customer_id`.

### 3. How Apple's page is opened
`openNativeSubscriptionManagement()` in `src/lib/revenuecat.ts` (line 472) opens RevenueCat's `customerInfo.managementURL` when present, falling back to `APPLE_SUBSCRIPTIONS_URL` = `https://apps.apple.com/account/subscriptions`. It uses the already-installed `@capacitor/browser` with a `window.open` fallback. No new dependency needed.

### 4. Lifetime
`isNativeLifetime` suppresses the Manage button (`showAppleManage = isAppleSubscriber && !isNativeLifetime`), the row shows "Lifetime access — thanks for your support", no renewal line, and Restore purchases stays available.

### 5. RevenueCat API vs Apple URL
`@revenuecat/purchases-capacitor@13.4.2` does expose `customerInfo.managementURL`, which is the preferred source because it deep-links to the exact subscription. It is often `null` in sandbox/TestFlight, so Apple's official URL is kept as the fallback. Both paths are already implemented; Customer Center is not configured and is not required.

## Proposed change (only remaining gap)

One edge case: a user who previously subscribed on the web and later bought through Apple keeps a `stripe_customer_id`, so both buttons can appear on the native build.

Minimal fix in `src/components/more/AccountSection.tsx` only:

```
const showStripeManage =
  !IS_NATIVE_IAP && (sub.tier === "pro" || sub.tier === "basic") && !!sub.stripeCustomerId;
```

Nothing else changes. Purchase, restore, entitlement, webhook, Stripe checkout, SSR, auth and calendar logic untouched. Web behaviour is byte-identical because `IS_NATIVE_IAP` is false there.

## Verification
- `bunx tsgo --noEmit`, `bun run build`, `bun run build:mobile`.
- TestFlight on a physical iPhone: Pro Monthly shows cadence + renewal + Manage Subscription; tapping it opens Apple's sheet; Lifetime shows "Lifetime access" with no Manage; Restore works; web Pro still shows only the Stripe billing portal.
