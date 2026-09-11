# Diagnose native RevenueCat wrong-product purchase

## Verified code path

```text
Purchases.getOfferings()
  → offerings.current.availablePackages
  → one RevenueCatPlan per SDK package
      identifier = pkg.identifier
      productId   = pkg.product.identifier
      priceString = pkg.product.priceString
      raw         = the same pkg object
  → sort whole plan objects by package identifier
  → render one card per plan
  → label from NATIVE_COPY[p.identifier]
  → click closure passes that exact p
  → purchaseRevenueCatPlan(p)
  → Purchases.purchasePackage({ aPackage: p.raw })
```

Evidence:
- `src/lib/revenuecat.ts:220-229` reads only `offerings.current.availablePackages` and keeps the original SDK package as `raw`.
- `src/lib/revenuecat.ts:241-246` sorts whole objects; it cannot mix fields between packages.
- `src/components/subscription/PaywallModal.tsx:200-238` creates a per-item `p` binding and passes that exact object in `onClick`.
- `src/lib/revenuecat.ts:278-280` submits that plan's original `raw` package.
- The installed native bridge ultimately purchases by the submitted package identifier plus its presented-offering context; it does not use the card label.

## Diagnosis

There is no normal closure, index, sort, or package-copy path that substitutes Lifetime after a correctly bound Pro Monthly card is clicked.

There is one important distinction: the visible name is intentionally derived from the **package identifier**, not the Store product title. Therefore, if the current offering returns a package named `pro_monthly` that is attached to the Lifetime Store product, the code will display **Pro Monthly** while `purchasePackage()` correctly purchases the Lifetime product attached to that package. That exactly matches the reported symptom and is most likely an external current-offering/package mapping problem.

A secondary UI risk exists because the React key is `p.productId || p.identifier`. If a bad offering returns duplicate `productId` values, React receives duplicate keys. That can make reconciliation unreliable after list refreshes. It does not explain or repair the underlying duplicate product attachment, and no code change should be made until the logs establish whether duplicate keys exist.

The wrong currency/price is separate unless the Pro Monthly row itself reports the Lifetime price. A US sandbox storefront or an Xcode StoreKit configuration can explain US `$39.99`; region alone cannot turn Pro Monthly into Lifetime.

## Exact identifiers and product mapping

The code expects these RevenueCat **package identifiers**:

| Card | Package identifier | Display order |
|---|---|---:|
| Pro Yearly | `pro_yearly` | 1 |
| Lifetime | `lifetime` | 2 |
| Pro Monthly | `pro_monthly` | 3 |
| Basic | `basic_monthly` | 4 |

The repository and its history contain **no literal App Store product ID strings**. They are read dynamically from `pkg.product.identifier`, so they must be copied from the runtime log, RevenueCat dashboard, or App Store configuration rather than guessed.

Expected semantic mapping:

| RevenueCat package identifier | Required distinct App Store product |
|---|---|
| `basic_monthly` | the Basic monthly subscription product ID shown in the dashboard/console |
| `pro_monthly` | the Pro monthly subscription product ID shown in the dashboard/console |
| `pro_yearly` | the Pro yearly subscription product ID shown in the dashboard/console |
| `lifetime` | the Lifetime non-consumable product ID shown in the dashboard/console |

The entitlement identifiers are separate: Basic uses `basic`; the Pro Monthly, Pro Yearly, and Lifetime products use `pro`. These are not App Store product IDs.

## Console evidence decision tree

Use one paywall opening and one tap, then compare the complete `[revenuecat] plans` array with the immediately following `[paywall] native pick` object.

### A. Wrong current offering or package-to-product mapping

Evidence:
- `[revenuecat] plans` contains `identifier: "pro_monthly"`, but its `productId` is the Lifetime Store product ID and its `priceString` is the Lifetime price; or
- two package rows share the same `productId`; or
- the four expected identifiers are absent/replaced by entries from the older offering.

Interpretation:
- The app is faithfully rendering what `offerings.current` returned.
- If RevenueCat's current-offering screen shows the same mapping, the dashboard configuration is wrong.
- If the clean offering is correct but is not marked current, the app is loading the older current offering.

### B. Stale RevenueCat/App Store metadata

Evidence:
- The RevenueCat dashboard confirms the clean offering is current and shows four distinct product attachments;
- the logged plans still show an older package/product mapping or old prices after a network-connected cold launch; and
- after uninstalling the simulator app, resetting StoreKit/sandbox state as applicable, reinstalling a freshly synced build, and reopening the paywall, the logged rows change to the dashboard mapping.

Interpretation:
- The pre-reset result was cached metadata or a stale native build.
- A price/currency-only mismatch with otherwise correct, distinct product IDs points to the simulator sandbox storefront or an Xcode `.storekit` configuration, not React.
- Logs alone cannot distinguish stale cache from a dashboard offering that is not actually current; the current-offering dashboard status must be checked first.

### C. UI/React binding bug

Evidence required:
- `[revenuecat] plans` has a correct, distinct `pro_monthly` row;
- the visible tapped card corresponds to that row;
- `[paywall] native pick` immediately reports a **different** identifier/product ID than the tapped card.

Interpretation:
- Only this mismatch implicates rendering/click binding.
- Check first for duplicate React keys caused by repeated `productId` values. With four unique product IDs, the current per-item closure and object flow provide no static code path for this mismatch.
- If the pick log correctly says `pro_monthly` with the correct Pro Monthly product ID but Apple's sheet says Lifetime, the UI binding is exonerated; investigate stale native StoreKit/RevenueCat metadata or product configuration.

## Minimal ordered resolution plan

### 1. Capture evidence before changing anything
1. Open the native paywall once and save the full four-row `[revenuecat] plans` output.
2. Tap Pro Monthly once and save `[paywall] native pick`.
3. Record the Apple sheet's product title and localized price.
4. Compare identifier, product ID, and price across all three observations.

### 2. RevenueCat dashboard actions
1. Confirm the clean offering—not the older/tangled offering—is explicitly the project's **current** offering for this app/project.
2. In that current offering, confirm the exact four package identifiers listed above.
3. Confirm each package points to a different Store product ID and that `pro_monthly` points to the monthly Pro product, not Lifetime.
4. Confirm Basic grants `basic`, while Pro Monthly, Pro Yearly, and Lifetime grant `pro`.
5. Re-read the runtime logs after dashboard changes; do not infer success from the dashboard alone.

### 3. Simulator and cache reset actions
1. Ensure the Xcode run scheme is not selecting a local `.storekit` configuration unless that file is deliberately maintained with the same products and prices.
2. Confirm the sandbox account/storefront uses the intended region.
3. Terminate and uninstall the app from the simulator, then install a newly built and newly synced mobile bundle.
4. If StoreKit state remains inconsistent, erase/reset the simulator's content and settings or use a fresh simulator, then retest online.
5. Treat corrected logs after reset as confirmation of stale metadata; treat unchanged wrong logs as evidence that the selected current offering/configuration remains wrong.

### 4. Code action only if the evidence requires it
- Make **no speculative purchase-flow change**. The current object flow is correct.
- If the logs reveal duplicate product IDs, correct the RevenueCat mapping first. Only afterward consider changing the React key to a guaranteed package-unique composite such as package identifier plus product ID; this is defensive UI hardening, not the purchase fix.
- If unique correct plan rows produce a different native-pick row, capture that exact pair before altering the rendering code.
- Remove the temporary diagnostics only after all four rows and all four purchase sheets have been verified.

## Most likely cause

The clean offering is either not actually selected as `current`, or the current offering still maps `pro_monthly` to the Lifetime Store product. The code would then label the card “Pro Monthly” from the package identifier while purchasing the Lifetime product attached to that package. The US price is likely an additional simulator storefront or StoreKit-configuration issue.
