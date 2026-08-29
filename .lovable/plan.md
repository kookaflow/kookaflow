# Stage 4 — Native paywall + purchase flow (RevenueCat on iOS, Stripe on web)

## Goal
Inside the iOS app, the paywall shows App Store prices from the RevenueCat `current` offering and buys through native IAP. On the web, nothing changes — Stripe checkout stays exactly as it is.

## How native vs web is split
One flag decides everything: `IS_NATIVE_IAP` (already exported from `src/lib/revenuecat.ts`, derived from `VITE_IS_MOBILE_BUILD`). The paywall renders two branches:

```text
PaywallModal
├── IS_NATIVE_IAP === false  → existing Stripe path (unchanged)
│     createCheckoutSession → window.location.assign(url)
└── IS_NATIVE_IAP === true   → RevenueCat path
      getRevenueCatOfferings() → packages with store prices
      tap → purchaseRevenueCatPackage() → entitlement listener unlocks gates
```

The Stripe import stays, but on native the `handlePick` Stripe branch is unreachable: the native branch has its own handler, and the checkout call is guarded by `if (IS_NATIVE_IAP) return;` as a second safety net so a redirect can never fire inside the WebView.

## What gets added to `src/lib/revenuecat.ts`
Same posture as Stages 1–3: native guard, dynamic import, try/catch, never throws.

- `getRevenueCatOfferings()` — configures if needed, calls `Purchases.getOfferings()`, returns the `current` offering's packages mapped to a small app-shaped type: `{ id, identifier, title, priceString, productId, periodLabel, entitlement }`. Returns `[]` on web or any failure.
- `purchaseRevenueCatPackage(pkg)` — calls `Purchases.purchasePackage({ aPackage })` and returns a discriminated result: `{ status: "purchased", entitlements }`, `{ status: "cancelled" }`, or `{ status: "error", message }`. User cancellation is detected from the SDK's `userCancelled` flag / error code and is never surfaced as an error toast.
- `restoreRevenueCatPurchases()` — `Purchases.restorePurchases()`, returning mapped entitlements. Apple requires a visible Restore Purchases action on any paywall, so this is included.

Package identifiers expected from the dashboard offering: `basic_monthly`, `pro_monthly`, `pro_yearly`, `lifetime`. Ordering and highlight badges ("Best value", "Pay once") are applied by identifier so the native list reads like the web one; unknown identifiers still render, just unranked.

## What changes in `src/components/subscription/PaywallModal.tsx`
- Native only: load offerings when the modal opens (`useEffect` on `open && IS_NATIVE_IAP`), with a spinner while loading.
- Render `priceString` from the store (localized, correct currency) instead of the hardcoded `$29.99` etc. The hardcoded `PLANS` array remains as the web source of truth.
- If offerings come back empty on native (no products configured / StoreKit unavailable), show a short "Purchases are unavailable right now" state with a Restore button — no Stripe fallback.
- Tap handler on native: `purchaseRevenueCatPackage` → on `purchased`, success toast and `onOpenChange(false)`; on `cancelled`, silently reset button state; on `error`, `toast.error` with the SDK message.
- Add a "Restore purchases" ghost button in the footer on native.
- Native: hide the "See full comparison" link that navigates to `/pricing` (that page is Stripe-only), so the Stripe surface is not reachable from the paywall on iOS.
- Gates unlock through the Stage 2 `onRevenueCatEntitlementsChange` listener already wired into `useSubscription` — no extra refresh logic, no restart.

## `src/routes/pricing.tsx` (public marketing page)
It is part of the SPA bundle, so it is technically reachable in the native app by URL. Keep all its Stripe copy and behaviour for web, and add the same guard at the top of its `handlePick`: on native, do not call `createCheckoutSession`; instead open `PaywallModal` (native branch) so the user buys through IAP. Its plan buttons on native therefore route into the native purchase flow rather than the browser. No visual redesign of the page.

## Not touched
`src/hooks/useSubscription.ts` (merge logic), `src/lib/revenuecat.server.ts`, the RevenueCat webhook, `src/lib/stripe.functions.ts` / `stripe.server.ts`, `FeatureLock`, `TrialBanner`.

## Files touched
- `src/lib/revenuecat.ts` — add offerings, purchase, restore helpers.
- `src/components/subscription/PaywallModal.tsx` — native branch, store prices, restore, hide `/pricing` link on native.
- `src/routes/pricing.tsx` — native guard on the checkout handler only.

## Verification
- Typecheck.
- Web preview: paywall still shows the hardcoded plans and opens Stripe checkout (unchanged).
- Native: after `bun run build:mobile` + `npx cap sync ios`, the paywall lists App Store prices, a sandbox purchase unlocks gates without restart, cancel closes cleanly, and no Stripe URL is ever navigated to.
