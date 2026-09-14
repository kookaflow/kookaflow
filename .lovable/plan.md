# Manage Subscription should open Apple's real subscription sheet

## What is happening

Tapping Manage Subscription today calls `openNativeSubscriptionManagement(native?.managementURL)`
in `src/lib/revenuecat.ts` (lines 499-516). That function takes whatever URL it
is given and opens it with the Capacitor Browser plugin — an in-app Safari view.

Two things combine to produce the Apple sign-in page:

1. For an App Store purchase, the management URL RevenueCat reports is Apple's
   own web page `https://apps.apple.com/account/subscriptions`. It is not a
   per-subscription deep link, so even the "good" value is the generic page.
   In TestFlight/sandbox it is frequently missing entirely, and the code then
   falls back to the same address.
2. That address opened inside an in-app browser has no App Store session, so
   Apple redirects it to `account.apple.com` and asks the user to sign in.

So the URL is not really wrong — the problem is opening an https Apple page in
an embedded browser instead of handing it to iOS.

## The Apple-supported way

Apple's supported route from an app is either StoreKit's
`showManageSubscriptions` sheet or the `itms-apps://apps.apple.com/account/subscriptions`
deep link, which iOS resolves to the subscription screen for the signed-in Apple
Account with no web login.

The installed RevenueCat Capacitor SDK (13.4.2) does **not** expose a
manage-subscriptions sheet — its only native iOS sheet is the refund request
flow. RevenueCat's Customer Center, which does wrap that sheet, is not set up in
this project and would be a much larger change. So the deep link is the right
tool here, and it needs no new dependency: Capacitor's web view hands non-http
schemes to iOS automatically when the app navigates to them.

## Recommended change

One file: `src/lib/revenuecat.ts`, inside `openNativeSubscriptionManagement()`
only. Nothing else changes.

New behaviour on native iOS, in order:

1. Try `itms-apps://apps.apple.com/account/subscriptions` by assigning it to
   `window.location.href`. iOS opens the native subscription screen.
2. If that throws, fall back to the current Capacitor Browser open of
   `https://apps.apple.com/account/subscriptions`.
3. Keep `window.open` as the last resort.

The passed-in `managementURL` is deliberately ignored for the App Store case,
because for App Store customers it never carries more information than the
generic page while costing the user a sign-in. The parameter stays in the
signature so the call site in `AccountSection.tsx` is untouched, and a
non-Apple management URL (should RevenueCat ever report a Stripe one through
this path) still goes through the browser route.

Stripe/web management is a completely separate path (`handlePortal` →
`openPortal`) and is not touched. Purchase, restore, entitlement, webhook, auth,
SSR and calendar code are not touched.

## Risk

`itms-apps://` cannot be verified in a simulator or on the web — it only works
on a physical device with an App Store session. The https fallback covers the
failure case, which is today's behaviour.

## Test checklist (physical iPhone, TestFlight)

1. Account → Manage Subscription opens the iOS subscription list showing
   Kookaflow Pro Monthly, no Apple sign-in prompt.
2. Cancel there, return to the app: still Pro until 15 Sep 2026.
3. Lifetime account: no Manage Subscription button (unchanged).
4. Web Stripe subscriber on kookaflow.com: still the billing portal.
