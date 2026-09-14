# Fix: Account section shows "Free trial" while Apple reports active Pro Monthly

Diagnosis only was requested — here is the root cause, the evidence, and the minimal fix.

## Root cause

Every label in the Account subscription row is derived **only** from the database row
(`sub.tier` / `sub.isTrialing`), never from the live Apple/RevenueCat state.

In `src/components/more/AccountSection.tsx`:

- `tierLabel` falls through to `"Free trial"` whenever `sub.tier` is not pro/basic/lifetime/expired.
- `baseSubtitle` prints `"N days left in your free trial"` from the trial countdown.
- The native store detail (`sub.nativeSubscription`) is used only for the cadence suffix,
  the renewal line, and the Manage button — it can never change the badge or the tier label.

In `src/hooks/useSubscription.ts`, `computeDerived()` deliberately lets RevenueCat *add access*
(`hasProAccess = trialActive || proActive || native.pro`) but never lets it change `tier` or
`status`. That was the correct choice for gating; the display layer simply has nothing else to read.

So on the test iPhone: Apple says Pro Monthly renewing 15 Sep, access is correctly unlocked
(via `native.pro`), yet the badge and subtitle still describe the database's trial row.

## Are the DB trial fields stale?

Yes — and they are not merely displayed wrongly, they were never updated.

The signed-in test account (`hello@kookaflow.com`) currently reads:

```text
subscription_tier   = trial
subscription_status = trialling
trial_ends_at       = 25 Sep 2026
stripe_customer_id  = null
```

`trial_ends_at` 25 Sep vs today gives exactly the "12 days left" the app shows, confirming this is
the row being rendered. No `pro` grant was ever written, so the RevenueCat webhook either did not
fire for this purchase or arrived with a non-UUID `app_user_id` (`resolveUserId()` in
`src/lib/revenuecat.server.ts` returns `null` and the webhook acknowledges as a no-op — which
happens when the purchase was made before the RevenueCat user was identified with the Supabase id).

The UI fix below makes the app correct regardless of webhook timing; the webhook gap is tracked
separately and needs no code change to make this display right.

## Minimal fix

One file: `src/components/more/AccountSection.tsx`. Presentation only.

Add a native-first display resolution, used before the existing database-derived labels:

- Compute `nativePaid` = there is a `nativeSubscription` whose entitlement is `pro` or `basic`
  (equivalently `sub.nativeEntitlements.pro || sub.nativeEntitlements.basic`).
- When `IS_NATIVE_IAP && nativePaid`:
  - `tierLabel` becomes `"Lifetime Pro"` when `isLifetime`, otherwise
    `"Pro Monthly"` / `"Pro Yearly"` / `"Basic Monthly"` from the entitlement + `periodLabel`
    (plain `"Pro"` / `"Basic"` when the store gave no reliable cadence).
  - badge class uses the pro/basic styling rather than the muted trial styling.
  - subtitle becomes `"Active"` (or `"Lifetime access — thanks for your support"` for lifetime),
    never the trial countdown.
  - `showUpgrade` is suppressed for an active native **pro** entitlement (an active Basic
    subscriber still sees Upgrade to Pro).
- When there is no active paid native entitlement, everything falls through to today's exact
  behaviour, so a genuine trial still shows "Free trial" and the countdown, and web is untouched.

The existing renewal line already comes from `nativeSubscription.expirationDate` and stays as is.

## Not changed

Purchase, restore and entitlement logic; `useSubscription`'s `computeDerived` access gating;
`src/lib/revenuecat.ts`; the RevenueCat webhook; Stripe checkout and the Stripe billing portal;
web behaviour; auth; SSR; calendar. No new dependencies.

## Test checklist

- TestFlight, active Pro Monthly: badge "Pro Monthly", subtitle "Active", renewal 15 Sep, Manage Subscription present, no trial text, no Upgrade.
- Pro Yearly: badge "Pro Yearly".
- Lifetime: "Lifetime Pro" / "Lifetime access", no Manage, Restore present.
- Native account with no purchase, trial active: unchanged "Free trial" + countdown + Upgrade.
- Web Stripe Pro and web trial: byte-identical to today.
- `bunx tsgo --noEmit`, `bun run build`, `bun run build:mobile` clean.
