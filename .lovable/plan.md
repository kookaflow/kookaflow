# iOS screen width, safe areas, and one shared paywall

## Agreed behavior
- The trial-ended paywall opens only when someone taps Upgrade or a locked feature, not automatically.
- Both ordinary upgrade and trial-ended paywalls remain dismissible. Closing returns to the underlying screen; existing feature restrictions remain unchanged.
- Website pricing and Stripe checkout stay unchanged.

## 1. Fix width constraints and safe areas
- Keep the existing horizontal overflow protection on `html` and `body`; add explicit `width: 100%` and `overflow-x: hidden` to `#root`.
- The viewport already declares `width=device-width, initial-scale=1, viewport-fit=cover` in the root document. Keep it; this app generates its document rather than using a source `index.html`.
- Give the app shell one top safe-area inset before banners and page headers, avoiding duplicate padding on nested headers. Keep the bottom tab bar’s existing home-indicator inset and left/right safe-area padding.
- Replace the shared header’s unconstrained mobile flex row with shrinkable grid/text containers; bound the calendar’s mobile header and controls to available width.
- Change the active calendar time grid’s `1fr` tracks to `minmax(0, 1fr)` and constrain its scroll container, so content cannot widen the week/day grid.
- Make the trial banner use a shrinkable text column and fixed action column. Allow actions to wrap at small widths instead of pushing the page sideways.

## 2. Keep Close and Restore visible
- Refactor the paywall layout into a bounded outer frame with a fixed header, a vertically scrolling plans area, and a fixed footer. Remove the footer’s negative margins.
- Place an explicit accessible X button at the top right of the paywall, outside the scrolling plans area and inside the safe-area boundaries. Add an optional switch to the shared dialog to hide its default scrolling X only for this paywall; other dialogs stay unchanged.
- Keep Not now and Restore purchases visible in both native paywall variants, including loading and unavailable-plan states.
- Preserve existing successful purchase/restore closure and cancellation behavior; do not change the purchase or restore helpers.
- Let titles, price/cadence rows and badges wrap without overlaps or clipped text. Move promotional labels out of absolute positioning when needed.

## 3. Use the same Apple-priced plans everywhere
- Reuse the existing `PaywallModal` for both upgrade and trial-ended cases; they already share its native plans renderer.
- Native prices remain exclusively `RevenueCatPlan.priceString`, which is already mapped from `package.product.priceString`. Never substitute hardcoded prices when offerings are unavailable.
- Preserve the existing native `/pricing` redirect to the calendar plus paywall. The website’s hardcoded Stripe price displays remain web-only, not removed from the website.
- Pass the trial-ended reason from Account when applicable so its title agrees with the trial banner and locked-feature entry points.

## Files to change
1. `src/styles.css` — explicit root width/overflow safety net.
2. `src/routes/__root.tsx` — single app-shell top safe-area inset.
3. `src/components/layout/PageHeader.tsx` — bounded mobile header layout.
4. `src/routes/_authenticated.calendar.tsx` — bounded mobile header/control rows.
5. `src/components/calendar-page/TimeGrid.tsx` — shrinkable week/day tracks and scroll bounds.
6. `src/components/subscription/TrialBanner.tsx` — bounded banner/action layout.
7. `src/components/ui/dialog.tsx` — optional default-close visibility, preserving other dialogs.
8. `src/components/subscription/PaywallModal.tsx` — fixed Close/header/footer, scrolling plans, wrapping labels.
9. `src/components/more/AccountSection.tsx` — consistent trial-ended reason.

Existing viewport metadata, bottom tab safe areas, native pricing redirect and RevenueCat price mapping require verification, not replacement. Do not edit generated `dist-mobile` files.

## Verification and delivery
- Check narrow phone widths, landscape safe areas, long feature names and localized prices, with enough plans to require scrolling.
- Verify document and paywall have no horizontal overflow; X, Not now and Restore remain visible while plans scroll.
- Check Account Upgrade, trial-ended Upgrade and locked features open identical native plan labels/prices; `/pricing` cannot render the website price page on native.
- Check ordinary web pricing and checkout remain unchanged. Review available build diagnostics and run relevant existing tests.
- Real Apple offerings, purchases, restores and notch/home-indicator behavior require a fresh mobile build, iOS sync and physical-device testing. Browser checks alone cannot certify StoreKit behavior.
- Publishing requires your explicit request; this plan does not publish or upload a TestFlight build.

## Not changed
RevenueCat identity, package selection, purchase/restore helpers, entitlements, gating, webhooks, Stripe checkout, authentication, database and Capacitor configuration.