# Native "Manage Subscription" in the account section

## Root cause

The subscription row in `src/components/more/AccountSection.tsx` only renders a
Manage button when the account has a Stripe customer id:

```
const showManage = (sub.tier === "pro" || sub.tier === "basic") && !!sub.stripeCustomerId;
```

An Apple/RevenueCat subscriber has no Stripe customer id, so the button never
appears. Nothing in the app currently reads Apple's management URL either:
`src/hooks/useSubscription.ts` maps RevenueCat CustomerInfo down to two booleans
(`basic`, `pro`) and `src/lib/revenuecat.ts` discards the rest of CustomerInfo.

## What the store already gives us

The installed RevenueCat Capacitor SDK (13.x) exposes on CustomerInfo:

- `managementURL` — Apple's subscription-management deep link for this customer
- per-entitlement `store` (`APP_STORE` / `STRIPE` / …), `productIdentifier`,
  `expirationDate`, `willRenew`, `periodType`

That `store` field is how we decide Apple vs Stripe, rather than assuming.

RevenueCat Customer Center is not configured in this project (no Customer Center
package or dashboard wiring), so the plan uses `managementURL`, falling back to
`https://apps.apple.com/account/subscriptions`.

## Implementation plan

### 1. `src/lib/revenuecat.ts` — expose subscription details

Add a native-only `getRevenueCatSubscriptionInfo()` returning a small typed
object, `null` on web or on any failure:

- `entitlement`: `"pro" | "basic" | null` (active one, pro wins)
- `store`: the entitlement's `store` string
- `productId`, `periodLabel` (monthly / yearly / lifetime, derived from
  `productIdentifier` via the existing `NATIVE_PACKAGE_MAP`)
- `expirationDate`: `Date | null` (from `expirationDateMillis`)
- `willRenew`, `isLifetime` (`expirationDate === null` or product is lifetime)
- `managementURL`: `string | null`

Add `openNativeSubscriptionManagement(url?)` that opens `managementURL` when
present, otherwise `https://apps.apple.com/account/subscriptions`. Because a
`https://apps.apple.com` link does not reliably leave the WKWebView with
`window.open`, add the `@capacitor/browser` plugin and open through it, falling
back to `window.open(url, "_blank")` if the plugin call fails. Existing helpers
(`purchaseRevenueCatPlan`, `restoreRevenueCatPurchases`,
`refreshRevenueCatEntitlements`) are untouched.

Also remove the temporary `[revenuecat] plans` diagnostic log left from the
earlier paywall investigation.

### 2. `src/hooks/useSubscription.ts` — carry the detail through

Add one optional field to the state: `nativeSubscription` (the object above, or
`null`). It is populated alongside the existing native entitlement read and
refreshed by the same CustomerInfo listener. Access-derivation logic
(`computeDerived`) is not changed — RevenueCat still only ever adds access.

### 3. `src/components/more/AccountSection.tsx` — the UI

Subscription row gains, in this order:

- plan line: existing tier badge, plus cadence when known
  ("Pro — monthly", "Pro — yearly", "Basic — monthly", "Lifetime access")
- renewal line, only when CustomerInfo gives a date:
  "Renews 12 Oct 2026" when `willRenew`, otherwise "Access ends 12 Oct 2026"
- **Manage Subscription** button when the active entitlement came from
  `APP_STORE`/`MAC_APP_STORE` **and** it is not lifetime → opens Apple's sheet
- existing **Manage** (Stripe portal) button unchanged, still gated on
  `stripeCustomerId`, so web/Stripe subscribers never get sent to Apple
- **Restore Purchases** button on native builds only, reusing
  `restoreRevenueCatPurchases()` + `refreshRevenueCatEntitlements()`, shown for
  lifetime too
- Lifetime: no Manage Subscription, shows "Lifetime access", keeps Restore

Nothing is added on web except what already exists there today.

Out of scope and untouched: checkout, Stripe server functions, the RevenueCat
webhook, SSR, Cloudflare functions, auth, calendar, `PaywallModal`, pricing.

## Risks

- `managementURL` is `null` for sandbox/TestFlight customers in some cases; the
  Apple fallback URL covers it, but the sheet may then show all subscriptions
  rather than deep-linking to Kookaflow.
- Adding `@capacitor/browser` requires `npx cap sync ios` and a fresh native
  build; without the sync the button falls back to `window.open`, which may do
  nothing inside the WebView.
- A user with both an Apple and a Stripe subscription would see two manage
  actions. That is honest, but worth labelling clearly ("Apple subscription" /
  "Billing portal").
- Renewal date comes from CustomerInfo, not the database, so it is only shown on
  native and only when present — no invented dates.

## Test checklist

TestFlight on a physical iPhone, sandbox Apple ID:

1. Pro Monthly purchase → account shows "Pro — monthly", a renewal date, and a
   Manage Subscription button.
2. Tap Manage Subscription → Apple's subscription sheet opens, showing
   Kookaflow; cancel there, return to app, state still Pro until expiry.
3. Basic Monthly → same behaviour with "Basic — monthly".
4. Pro Yearly → cadence reads "yearly", renewal date roughly one year out.
5. Lifetime → shows "Lifetime access", **no** Manage Subscription, Restore
   present.
6. Restore Purchases → succeeds and leaves tier unchanged.
7. Web (kookaflow.com) Stripe Pro subscriber → only the Stripe billing portal
   button, no Apple button, no Restore.
8. Trial / expired accounts → unchanged Upgrade behaviour.
9. `bun run build` and `bun run build:mobile` both succeed; typecheck clean.
