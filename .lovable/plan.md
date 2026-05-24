## Basic plan → $2.99 AUD/month subscription

### 1. `src/lib/stripe.server.ts`
Change Basic's PlanConfig: `mode: "payment"` → `mode: "subscription"`. Tier stays `"basic"`. No other server changes.

### 2. Stripe webhook — no code change
The existing `customer.subscription.created`/`updated` handler already resolves the price via `planForPriceId` and writes `subscription_tier: "basic"`, `subscription_status: "active"`, `stripe_subscription_id`, and `subscription_end_date`. Once Basic checkout runs in subscription mode, Stripe fires `customer.subscription.created` and the right branch handles it. The `checkout.session.completed` payment-mode branch naturally no longer applies to Basic.

### 3. Pricing displays
- `src/components/subscription/PaywallModal.tsx` — Basic: `price: "$2.99"`, `cadence: "AUD / month"`, description "Core calendar + shift tracking only. Cancel anytime."
- `src/routes/pricing.tsx` — Basic: `price: "$2.99"`, `cadence: "AUD / month"`.
- `src/components/more/AccountSection.tsx` — no price shown, no change.
- `src/routes/pro.success.tsx` — no price shown, no change.

### 4. Email/listing copy
- `src/routes/api/public/hooks/send-trial-reminders.ts` line 174: `"Basic — $9.99 one-time (core calendar & shifts)"` → `"Basic — $2.99 / month (core calendar & shifts)"`.
- No App Store listing files exist in this repo (Lovable web app).

### 5. Stripe price ID secret
After approving, I'll trigger an `update_secret` flow for `STRIPE_BASIC_PRICE_ID` so you can paste the new recurring $2.99/month `price_…` ID from Stripe. The Basic checkout will fail until the new price ID is saved.

### Out of scope
Pro Monthly, Pro Yearly, Lifetime pricing/modes; existing `basic`-tier customers (their stored tier stays as-is until a new Stripe event arrives).