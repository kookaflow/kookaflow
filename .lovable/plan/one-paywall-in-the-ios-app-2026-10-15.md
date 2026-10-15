# One paywall in the iOS app

All changes apply only when `IS_NATIVE_IAP` is true. The website keeps today's behaviour.

## 1. Every upgrade entry point opens the native paywall
Upgrade links that currently go to `/pricing`:
- **Account → Subscription "Upgrade" button** (`AccountSection.tsx`, line 225). On native this opens `PaywallModal`, which gets its own open state. On the web it stays a `<Link to="/pricing">`.
- **Trial banner "Compare plans"** (`TrialBanner.tsx`, line 71). On native this button is hidden, because the "Upgrade" button next to it already opens `PaywallModal`. The web keeps the link.
- **PaywallModal "See full comparison"** (line 316). This already only shows on the web, because native shows "Restore purchases" there. No change.
- Feature locks (`FeatureLock`, `useUpgradePrompt`) already open `PaywallModal`. No change.

## 2. Block `/pricing` inside the iOS app
- In `src/routes/pricing.tsx`, add a native-only redirect. Before the page renders it goes to `/calendar?paywall=1`.
- In `src/routes/_authenticated.calendar.tsx`, check for `paywall=1` on native. If present, open `PaywallModal` once, then remove the flag from the URL with `replace` so going back doesn't reopen it.
- The pricing page's own purchase code stays in the file but isn't used on native.

## 3. Safe areas
- `viewport-fit=cover` is already set in `__root.tsx`. No change.
- **PaywallModal**: add top padding of `max(1.5rem, env(safe-area-inset-top))` (bottom padding is already there). Limit its height to the visible screen minus both safe areas so it scrolls instead of running under the status bar or home indicator.
- **Other full-screen views** that need top safe-area padding on native (styling only):
  - `_authenticated.onboarding.tsx` (full-screen layout)
  - `SplashScreen.tsx` (fixed full-screen)
  - `AuthShell.tsx` (login/signup)
  - `pro.success.tsx`
  - `components/ui/sheet.tsx` (full-height side sheets, top and bottom)

  Pages under the shared header (`PageHeader`/`AppNav`) are checked on an iPhone-sized screen and only changed if the header actually overlaps the status bar.

## 4. A close option that's always visible
- PaywallModal already has a "Not now" button and a corner X, but on small screens both can scroll out of view. The footer with "Not now" and Restore will stick to the bottom of the modal, and the X will stay pinned at the top right. Closing only closes the modal, so the user stays on the screen they were on.

## Files to change
- `src/components/more/AccountSection.tsx`
- `src/components/subscription/TrialBanner.tsx`
- `src/components/subscription/PaywallModal.tsx` (layout and styling only)
- `src/routes/pricing.tsx` (native redirect only)
- `src/routes/_authenticated.calendar.tsx` (opens the paywall from `?paywall=1`)
- `src/routes/_authenticated.onboarding.tsx`, `src/components/layout/SplashScreen.tsx`, `src/components/auth/AuthShell.tsx`, `src/routes/pro.success.tsx`, `src/components/ui/sheet.tsx` (safe-area padding only)
- Possibly `src/components/layout/PageHeader.tsx`, only if the iPhone-size check shows it overlapping the status bar

## Not touched
RevenueCat purchase/restore logic, entitlements, Stripe checkout, webhooks, Capacitor config.

## Notes
- These changes only reach iPhones after a new mobile build, iOS sync and TestFlight upload.
- Test checklist: Account Upgrade, trial banner and a locked feature each open the same Apple-priced paywall. Opening `/pricing` on native ends up on the calendar with the paywall open. "Not now" returns to the previous screen. Nothing sits under the notch or home bar. The website `/pricing` is unchanged.
