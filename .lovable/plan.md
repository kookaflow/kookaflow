# Remove the temporary RevenueCat diagnostic log before TestFlight

## What the code currently does (verified by reading the files)

The `[revenuecat] plans = [...]` log you remember was already removed from `getRevenueCatPlans()` in an earlier session — the current `src/lib/revenuecat.ts` contains only permanent `console.warn("[revenuecat] … failed", …)` error handlers, no plans dump.

The surviving diagnostic from the same paywall investigation lives one call-site up the chain. In `src/components/subscription/PaywallModal.tsx`, `handleNativePick()` opens with a temporary log that prints the tapped package's identifier, product id, and price string to the device console:

```ts
  async function handleNativePick(plan: RevenueCatPlan) {
    // TEMPORARY diagnostic — confirm which package was actually tapped.
    console.log("[paywall] native pick", {
      identifier: plan.identifier,
      productId: plan.productId,
      priceString: plan.priceString,
    });
    const busyKey = plan.productId || plan.identifier;
    ...
```

It is marked `// TEMPORARY diagnostic` in the source. It runs on every native paywall tap during TestFlight and has no production purpose.

## Exact removal

**File:** `src/components/subscription/PaywallModal.tsx`
**Lines to remove:** 146–151 (the comment + the entire `console.log("[paywall] native pick", { … });` block), i.e.

```ts
    // TEMPORARY diagnostic — confirm which package was actually tapped.
    console.log("[paywall] native pick", {
      identifier: plan.identifier,
      productId: plan.productId,
      priceString: plan.priceString,
    });
```

After removal, `handleNativePick` begins directly at `const busyKey = plan.productId || plan.identifier;`. No other line changes.

## What is NOT touched (per your instructions)

- `getRevenueCatPlans()` behaviour, package identifiers, ordering — unchanged.
- `NATIVE_PACKAGE_MAP`, `findRevenueCatPlan`, `purchaseRevenueCatPlan`, restore purchases, entitlement handling — unchanged.
- RevenueCat configuration / SDK key / log level — unchanged.
- Stripe/web branch, the RevenueCat webhook, SSR, auth, calendar — unchanged.
- The server-side `console.log("[revenuecat] applied", …)` in `src/routes/api/public/revenuecat/webhook.ts` is a separate server log (not client-facing, not in/around `getRevenueCatPlans`), so it is left as-is.

## Note on the built bundle

`dist-mobile/client/assets/PaywallModal-B9n0TtBa.js` still contains the minified log because it predates this cleanup. It will be regenerated clean on the next `bun run build:mobile` + `npx cap sync ios` after the source edit.

## Test checklist

- `bunx tsgo --noEmit` clean.
- `bun run build` + `bun run build:mobile` succeed.
- On TestFlight: open the paywall, tap a plan — purchase flow still works; device console no longer prints `[paywall] native pick`.
