# Android RevenueCat key + paywall ready for retiring Basic

## What changes
1. **Android key** — set `REVENUECAT_ANDROID_API_KEY` to `goog_nxQAeFIlOikLZXuFgjnlCnlyZaK` (a public SDK key, safe in code). iOS key untouched.
2. **Paywall shows whatever the offering returns** — 2, 3 or 4 plans, laid out in the existing grid with no gaps.
   - Order: Pro Monthly, Pro Yearly, Lifetime, then Basic last while it is still in the offering.
   - A plan is skipped (never an empty card) if it has no price from the store or no product.
   - Unknown package identifiers are skipped, so a stray test package can't appear.
   - If nothing usable comes back, the existing "Plans unavailable" message with Restore shows instead of an empty grid.
3. **Basic subscribers keep access** — no change to entitlement checks: the `basic` entitlement still unlocks Basic features and Restore still recognises it. Only the Basic *card* disappears once you remove `basic_monthly` from the offering.

## Technical details
- `src/lib/revenuecat.ts`: set key; in `getRevenueCatPlans()` change order to `["pro_monthly","pro_yearly","lifetime","basic_monthly"]`, filter to known identifiers with non-empty `priceString` and product id. Extract the filter/sort into a pure `selectNativePlans(packages)` helper.
- `src/components/subscription/PaywallModal.tsx`: no structural change needed beyond relying on the filtered list (copy lookup already falls back safely).
- New test `src/lib/revenuecat.test.ts`: 4 packages → correct order; offering without basic → 3 Pro plans; missing pro_yearly → 2 plans, no blank; package with empty price dropped; empty offering → [].

## Live on Publish vs new builds
- Everything here runs inside the phone apps, so it needs new iOS and Android builds (`npm run build:mobile`, `npx cap sync`). Publishing the website changes nothing (web uses Stripe pricing).
- Removing `basic_monthly` in the RevenueCat dashboard takes effect immediately for any build; older builds also cope (they only show what's returned), but only new builds get the new order and blank-card protection.
