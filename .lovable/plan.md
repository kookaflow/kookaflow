# Native pricing: buy directly from the pricing page, one price source

## What the code does today (verified)

- `src/routes/pricing.tsx:36-92` holds a hardcoded `TIERS` array with the correct AUD prices (A$2.99, A$4.99, A$29.99, A$59.99). This is what the main pricing page renders on every platform, including native.
- `src/routes/pricing.tsx:100-105`: on native, every plan button ignores its own tier and just opens the modal:
  `if (IS_NATIVE_IAP) { setPaywallOpen(true); return; }`
  That is the duplicate paywall. The tapped tier is discarded, which is why "Start Pro Monthly" leads to a second screen showing all four plans.
- `src/components/subscription/PaywallModal.tsx:97-110, 198-238` then loads `getRevenueCatPlans()` and renders `p.priceString` for each package. Those are store-reported strings, which is why the second screen's prices differ from the pricing page's numbers.
- `src/lib/revenuecat.ts:215-251` maps `offerings.current.availablePackages` one-to-one and keeps the original SDK package in `raw`; `src/lib/revenuecat.ts:269-290` purchases exactly that `raw` object. This part is already correct and needs no change: identity is preserved, resolution is not positional, and cancellation is already classified separately.

## Root cause

Two separate causes, one per symptom.

1. **Duplicate paywall**: the native branch on the pricing page is a stub that opens `PaywallModal` instead of purchasing the tapped tier. Nothing maps a pricing-page tier to a RevenueCat package yet.
2. **Inconsistent prices**: two different price sources appear in one flow. The pricing page shows hardcoded AUD text; the modal shows RevenueCat/StoreKit `priceString`. Apple's final sheet is authoritative and shows A$4.99, and the console already confirmed the correct package/product (`pro_monthly` / `com.kookaflow.app.pro.monthly`) reaches `purchasePackage`. So the wrong "$2.99" is a display value from stale or fallback offering metadata, not a wrong product.

### Why priceString can look US-shaped on an AU device

`priceString` is whatever store metadata was attached to the package at fetch time. It becomes stale or non-AU when:
- the offering/product metadata was cached before the AU price tiers or the product mapping were finalised, and the cached copy is still served to the app;
- the StoreKit product fetch for one or more products did not resolve in this build, so a dashboard/server-side price is shown instead of the live storefront price;
- the offering being served to the app is not the same clean offering that now backs the StoreKit sheet.

The distinguishing evidence is the existing `[revenuecat] plans` log: if `pro_monthly` / `com.kookaflow.app.pro.monthly` logs `$2.99` while Apple's sheet for that same package shows A$4.99, the string is stale/fallback metadata rather than a mapping error. The fix is to stop rendering that string in this flow, not to hardcode prices.

## Expected mapping (resolved by identifier, never by position)

| Package identifier | App Store product ID |
|---|---|
| `basic_monthly` | `com.kookaflow.app.basic.monthly` |
| `pro_monthly` | `com.kookaflow.app.pro.monthly` |
| `pro_yearly` | `com.kookaflow.app.pro.yearly` |
| `lifetime` | `com.kookaflow.app.lifetime` |

Entitlements stay as they are: `basic` for Basic, `pro` for the other three.

## Implementation plan

### 1. `src/lib/revenuecat.ts` — add package lookup and a customer-info refresh
- Add an exported map from the pricing page's tier keys to RevenueCat package identifiers and expected product IDs:
  `basic → basic_monthly / com.kookaflow.app.basic.monthly`, `pro_monthly → pro_monthly / com.kookaflow.app.pro.monthly`, `pro_yearly → pro_yearly / com.kookaflow.app.pro.yearly`, `lifetime → lifetime / com.kookaflow.app.lifetime`.
- Add `findRevenueCatPlan(tierKey)`: calls the existing `getRevenueCatPlans()`, then selects the plan whose `identifier` matches, falling back to a `productId` match. No index/position lookup, no synthesised package. Returns `null` when absent.
- Add `refreshRevenueCatEntitlements()`: a thin wrapper over the existing `getRevenueCatEntitlements()` that first invalidates the customer-info cache, so entitlement state is re-read after a purchase.
- Reuse `purchaseRevenueCatPlan()` unchanged: it already passes `plan.raw` straight to `Purchases.purchasePackage` and already returns `cancelled` distinctly.

### 2. `src/routes/pricing.tsx` — native buttons purchase directly
- Replace the `if (IS_NATIVE_IAP) { setPaywallOpen(true); ... }` stub with a native branch that:
  1. sets a per-tier busy state so the tapped button shows a spinner and all four buttons are disabled (prevents double purchase);
  2. resolves the package with `findRevenueCatPlan(t.key)`;
  3. if resolution fails, shows a single "plans unavailable, please try again" message and clears busy state;
  4. otherwise calls `purchaseRevenueCatPlan(plan)`;
  5. on `purchased`, calls the refresh helper, shows a success message, and lets the existing entitlement listener unlock gates;
  6. on `cancelled`, silently clears busy state with no error surface;
  7. on `error`, shows the returned message.
- Keep the web branch byte-for-byte: sign-in check, `createCheckoutSession`, `window.location.assign(res.url)`.
- Remove the `PaywallModal` render and its `paywallOpen` state from this route so no second all-plans screen can open from the pricing page.
- Add a visible "Restore purchases" action on this page for native builds (calling the existing `restoreRevenueCatPurchases()`), so restore stays reachable once the modal is no longer opened from here.
- Optional, native-only display consistency: where a resolved package's `priceString` is available and trustworthy it may be shown; otherwise the page keeps its existing text. Prices are never fabricated.

### 3. `src/components/subscription/PaywallModal.tsx` — leave as the gate paywall
- No change to its purchase logic. It remains the paywall reached from feature gates (`FeatureLock`, trial expiry), a separate entry point from the pricing page.
- The temporary `[revenuecat] plans` and `[paywall] native pick` diagnostics stay until the price-source question is closed, then get removed.

Untouched: SSR, Cloudflare server functions, auth, calendar, the Stripe server functions and webhook, and the public web build.

## Risks

- **Native detection**: everything hinges on `IS_NATIVE_IAP`. If a native build ever evaluated it false, the pricing page would fall through to Stripe. Verify on device before shipping.
- **Package resolution failure**: if the current offering omits an identifier, that plan cannot be bought from the pricing page. Handled with an explicit unavailable message rather than a silent no-op.
- **Entitlement timing**: store-side propagation can lag slightly; the refresh plus the existing listener cover it, but the first render after purchase may briefly show the old tier.
- **Restore discoverability**: Apple requires a reachable restore action; it must be present on the pricing page for native, not only inside the modal.
- **Stale price metadata**: removing the modal from this flow hides the inconsistent string but does not correct the underlying metadata; the offering/product price data still needs verifying before any future price display.

## Test checklist (AU TestFlight device)

1. Pricing page shows four plans and no second modal opens on any plan tap.
2. Tapping Start Pro Monthly goes straight to Apple's sheet showing Pro Monthly at A$4.99.
3. Each other button opens Apple's sheet for its own product: Basic A$2.99, Pro Yearly A$29.99, Lifetime A$59.99.
4. `[revenuecat] plans` and `[paywall] native pick` logs confirm the tapped identifier and product ID match the sheet every time.
5. Tapping a button disables all four and shows a spinner; rapid double taps produce only one sheet.
6. Cancelling Apple's sheet returns to the pricing page with no error message and buttons re-enabled.
7. A completed sandbox purchase unlocks gated features without restarting the app.
8. Restore purchases works from the pricing page and reports "no purchases" cleanly on a fresh account.
9. The feature-gate paywall still opens and purchases correctly from within the app.
10. Web: pricing page still redirects to Stripe checkout for all four plans, signed in and signed out.
