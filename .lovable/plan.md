# Subscription state audit — pre-RevenueCat

Investigation only. No code changed.

## 1. Tiers recognised in code

`src/hooks/useSubscription.ts`:

```
SubscriptionTier  = "trial" | "basic" | "pro" | "lifetime" | "expired"
SubscriptionStatus = "active" | "trialling" | "past_due" | "canceled" | "expired" | null
```

Note `"trialling"` (double-l) is the spelling the code accepts.

Stripe plan keys are a separate vocabulary (`src/lib/stripe.server.ts`):

| PlanKey | mode | tier written |
|---|---|---|
| `basic` | subscription | `basic` |
| `pro_monthly` | subscription | `pro` |
| `pro_yearly` | subscription | `pro` |
| `lifetime` | payment (one-time) | `lifetime` |

Derived flags (the only things gates read):
- `isTrialing` = tier `trial` AND `trial_ends_at` in the future
- `hasProAccess` = isTrialing OR (tier `pro` AND status active/trialling) OR tier `lifetime`
- `hasFullAccess` = hasProAccess OR tier `basic`
- `isLocked` = !hasFullAccess
- `trialDaysRemaining` = ceil days to `trial_ends_at` (14-day trial)

So there are effectively **two entitlement levels**: full/basic access, and pro access. RevenueCat would need two entitlements (e.g. `basic`, `pro`) plus lifetime mapped to `pro`.

## 2. Every place subscription state is checked

Client:
- `src/hooks/useSubscription.ts` — single source of truth; reads `profiles` directly + realtime channel on profile UPDATE.
- `src/components/subscription/FeatureLock.tsx` — wrapper gate, prop `requires: "pro" | "full"` (default `pro`); renders lock card + `PaywallModal`.
- `src/routes/_authenticated.dashboard.tsx:69` — early return behind `FeatureLock` when `!hasProAccess`.
- `src/components/subscription/TrialBanner.tsx` — hidden for pro/lifetime/basic; shows countdown or expired state, opens paywall.
- `src/components/more/AccountSection.tsx` — tier label/description, "Manage" (Stripe portal, needs `stripe_customer_id`) and "Upgrade" buttons per tier.
- `src/routes/pro.success.tsx` — polls tier for ~10s after Stripe return.
- `src/routes/pricing.tsx` — plan grid (public), requires sign-in before checkout.

Server:
- `src/lib/google-calendar.functions.ts:14-32` — server-side pro gate, duplicates the `hasProAccess` derivation and throws `"Subscription required..."`.
- `src/routes/api/public/stripe/webhook.ts` — the only writer of `subscription_tier` / `subscription_status` / `subscription_end_date` / `stripe_*` ids (lines ~60, 79, 87, 104; sets `expired` on cancel).
- `src/routes/api/public/hooks/send-trial-reminders.ts` — reads trial fields for reminder emails.
- DB trigger `profiles_prevent_privileged_updates` blocks client-side edits of subscription columns (service role only).

`FeatureLock` is currently used in **one** place (dashboard). It is not applied to sync/SMS/push settings sections.

## 3. Feature → required tier (as enforced today)

| Feature | Required | Enforced where |
|---|---|---|
| Calendar, shifts, templates, stamps, day summaries | any signed-in (incl. expired — not gated) | no gate in code |
| Life-balance dashboard (charts, balance score, wellness nudges) | Pro / Lifetime / trial | dashboard route + FeatureLock |
| Google Calendar sync | Pro / Lifetime / trial | server gate in `google-calendar.functions.ts` |
| Email reminders | marketed as Basic | **not gated in code** |
| SMS reminders, push notifications | marketed as Pro | **not gated in code** |
| Stripe billing portal | tier `pro` or `basic` with a `stripe_customer_id` | AccountSection |

Marketing copy (pricing page) promises more gating than the code enforces — worth aligning during the RevenueCat work.

## 4. Paywall UI and products

- `src/components/subscription/PaywallModal.tsx` — 4 plan cards, **hardcoded** const `PLANS` (pro_yearly $29.99/yr, lifetime $59.99 one-time, pro_monthly $4.99/mo, basic $2.99/mo, all AUD). Clicking calls the `createCheckoutSession` server fn and `window.location.assign(url)`.
- `src/routes/pricing.tsx` — full 4-column comparison, also **hardcoded** prices/feature bullets, same checkout call.
- Real price IDs live only server-side as env secrets: `STRIPE_BASIC_MONTHLY_PRICE_ID`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_PRO_LIFETIME_PRICE_ID`.
- Nothing fetches prices from Stripe at runtime, so no store/product metadata layer exists to reuse.

## 5. Existing RevenueCat / IAP code

None. Searches for `revenuecat`, `Purchases`, `IAP`, `in-app purchase` return no implementation (only unrelated copy in `src/routes/eula.tsx`). No `@capacitor/*` or `@revenuecat/*` entries in `package.json` either — the iOS wrapper is built from the `dist-mobile` SPA target outside this repo's dependency list.

Subscription state today is **Stripe-driven → Supabase `profiles` columns → client hook**: `subscription_tier`, `subscription_status`, `trial_starts_at`, `trial_ends_at`, `subscription_end_date`, `stripe_customer_id`, `stripe_subscription_id`. No mock data path.

## Implications for the RevenueCat integration (for discussion, not implemented)

- Two RevenueCat entitlements (`basic`, `pro`) map cleanly onto `hasFullAccess` / `hasProAccess`; lifetime becomes a non-consumable granting `pro`.
- `useSubscription` is the only read surface, so a RevenueCat source can be merged there (take the higher of Stripe-derived and RC-derived entitlement) without touching gates.
- Writes must go through a server path: the `profiles` trigger blocks client updates, so an RC webhook endpoint under `src/routes/api/public/` mirroring the Stripe webhook is the natural shape.
- Paywall pricing is hardcoded in two files; App Store review will expect prices/products from RevenueCat offerings on iOS, and the Stripe checkout redirect must not run inside the native app.
