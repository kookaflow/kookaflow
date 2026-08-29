# Native paywall: all cards buy Lifetime, and Lifetime shows $39.99

## What the code actually does (verified by reading both files)

`PaywallModal.tsx` native branch, lines 193-231: `nativePlans.map((p) => ...)`, and the tap handler is
`onClick={() => void handleNativePick(p)}`. `p` is a per-iteration arrow-function parameter, so there is
**no closure/loop-variable bug** — each card captures its own package object. `handleNativePick` passes that
same object straight to `purchaseRevenueCatPlan(plan)`, which calls
`Purchases.purchasePackage({ aPackage: plan.raw })` with that package's own `raw`.

`getRevenueCatPlans()` in `src/lib/revenuecat.ts` (lines 215-241) maps with a pure callback:
`identifier: pkg.identifier`, `productId: pkg.product?.identifier`, `priceString: pkg.product?.priceString`,
`raw: pkg`. Nothing is hoisted, mutated, or reassigned between iterations, so no field can be overwritten by a
later package. The only post-processing is a `sort()` by identifier for display order.

There is also **nothing in the codebase that can force USD or a US price**. Every native price string comes
from `pkg.product.priceString`, which StoreKit fills in from the active storefront. The hardcoded `$59.99`
in `PLANS` is the web/Stripe array only and is not rendered on native.

## Therefore both symptoms point outside the React code

### 1. Every card opening the Lifetime sheet
Because each card demonstrably passes a distinct package object, the most likely cause is that the packages in
the RevenueCat **`current` offering** are not attached to four distinct App Store products — e.g. all four
packages (or several of them) have the Lifetime product attached in the dashboard, so `purchasePackage`
correctly buys "the product on this package" and that product is Lifetime for all of them. A second, less
likely variant: the four packages share the same `identifier`, in which case React's `key={p.identifier}`
collides and the rendered/pressed card can resolve to the wrong sibling.

Both are distinguishable from the data itself, which is why the fix starts with one diagnostic log.

### 2. Lifetime showing $39.99
$39.99 is the US tier price. `priceString` is whatever StoreKit hands back for the current **storefront**,
which in the simulator/sandbox is driven by the Apple ID signed into *Settings > App Store > Sandbox Account*
(and, in the simulator, sometimes by a local StoreKit configuration file in the Xcode scheme rather than App
Store Connect at all). A US storefront or a StoreKit `.storekit` config with US prices produces exactly this.
This is an environment issue, not a code issue — no change to `revenuecat.ts` will alter it.

## Proposed fix (in order)

1. **Add a temporary diagnostic log** in `getRevenueCatPlans()` — one `console.log` of
   `plans.map(p => ({ identifier: p.identifier, productId: p.productId, priceString: p.priceString }))`,
   plus one log in `handleNativePick` of the tapped `plan.identifier` / `plan.productId`. Run the paywall on
   device/simulator and read the four rows.
   - If two or more rows show the **same `productId`** → the dashboard offering is mis-configured: in
     RevenueCat, each package (`basic_monthly`, `pro_monthly`, `pro_yearly`, `lifetime`) must have its own
     matching App Store product attached. Fix in the dashboard; no app code change needed.
   - If `productId`s are distinct but the purchase sheet still shows Lifetime → the wrong product is attached
     under a correct-looking identifier, or the sheet is showing a cached StoreKit transaction; re-check the
     product ids in App Store Connect against the ones logged.
2. **Harden the card key** regardless: use `key={p.productId || p.identifier}` (and the same value for the
   `nativeBusy` comparison) so duplicate package identifiers can never make two cards share React state.
3. **Price**: verify the storefront rather than the code — confirm the Xcode scheme is not using a
   `.storekit` configuration file (that bypasses App Store Connect pricing entirely), and confirm the sandbox
   Apple ID's country is Australia. Once the storefront is AU, `priceString` will render `A$59.99`
   automatically. If the AU price genuinely reads $39.99 in App Store Connect, correct the price tier there.

## Files that would change
- `src/lib/revenuecat.ts` — temporary diagnostic log in `getRevenueCatPlans()` (removed after diagnosis).
- `src/components/subscription/PaywallModal.tsx` — log the tapped package; switch card key / busy key to
  `productId`.

No changes to the web/Stripe branch, `useSubscription`, the webhook, or gates.

## Note on rebuilding
The checked-in `dist-mobile` bundle here does not contain `getOfferings`/`purchasePackage`, so it predates
Stage 4. Any verification must run against a fresh `bun run build:mobile` + `npx cap sync ios`.
