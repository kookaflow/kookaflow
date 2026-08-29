# Stage 3 — RevenueCat webhook: persist native purchases to the database

Goal: native (App Store) purchases, renewals, and cancellations update the same
subscription fields on the user's profile that Stripe already writes, so gates
survive an app restart and work on the web too.

## What gets built

A single new public endpoint that RevenueCat calls:

`src/routes/api/public/revenuecat/webhook.ts` (POST)

Shape mirrors the existing Stripe webhook: verify the caller, map the event,
write with the service-role client, always return 200 once handled.

### 1. Authenticating the caller

RevenueCat lets you set a fixed `Authorization` header value per webhook.
The handler reads `REVENUECAT_WEBHOOK_SECRET` from the server environment and
compares it to the incoming `Authorization` header with a timing-safe compare.
Mismatch or missing header → `401`, nothing written. Missing secret in env →
`500` (fail closed, never process unverified grants).

Configuration steps (after the endpoint is deployed):
- You generate one strong random value (password manager, or `openssl rand -hex 32`).
- Save it in the app as `REVENUECAT_WEBHOOK_SECRET` (I'll open the secure secret form).
- In RevenueCat → Project → Integrations → Webhooks: URL
  `https://kookaflow.com/api/public/revenuecat/webhook`, Authorization header =
  the same value.

### 2. Finding the user

RevenueCat's `event.app_user_id` is already the Supabase user id (confirmed on
device). The handler looks the profile up by that id; if the id isn't a valid
uuid or no profile matches, it logs and returns 200 (nothing to do — retries
would never succeed).

`original_app_user_id` is used as a fallback when aliases are present.

### 3. Event → subscription mapping

Entitlement ids from Stage 2 (`basic`, `pro`) plus the product id decide the tier.

| RevenueCat event | Result |
| --- | --- |
| INITIAL_PURCHASE, RENEWAL, UNCANCELLATION, PRODUCT_CHANGE, SUBSCRIPTION_EXTENDED | tier from entitlement (`basic`/`pro`), status `active`, expiry = `expiration_at_ms` |
| NON_RENEWING_PURCHASE (lifetime product) | tier `lifetime`, status `active`, expiry `null` |
| CANCELLATION | keep tier and expiry (access runs to period end), status `canceled` |
| EXPIRATION | tier `expired`, status `expired`, expiry = event expiry |
| BILLING_ISSUE | status `past_due`, tier untouched |
| TRANSFER, TEST, anything else | acknowledged, no write |

Entitlement resolution order: `pro` wins over `basic`; the lifetime product id
maps to `lifetime` regardless of entitlement.

### 4. Idempotency and never downgrading

RevenueCat retries, and a user may hold Stripe access as well, so the handler
reads the profile first and applies rules rather than blind overwrites:

- Upgrades/renewals: write only when the incoming state is equal or better
  (`lifetime` > `pro` > `basic`), or when the expiry moves later. Re-delivered
  events therefore produce the same final row.
- Downgrades (EXPIRATION / BILLING_ISSUE): skipped entirely when the profile has
  an active Stripe subscription (`stripe_subscription_id` present with status
  `active`/`trialling`) or tier `lifetime`. Native expiry never removes access
  granted by Stripe.
- Stripe identifier columns are never written by this endpoint.
- Events older than the currently stored expiry are ignored (out-of-order retries).

## Files and columns

- New: `src/routes/api/public/revenuecat/webhook.ts`
- New: `src/lib/revenuecat.server.ts` — event typing, entitlement/product → tier
  mapping, and the reconcile rules (keeps the route file thin and testable).
- Columns written on `profiles`: `subscription_tier`, `subscription_status`,
  `subscription_end_date`. Nothing else.
- Writes go through the existing service-role client, which is the only path the
  database trigger allows for these columns.
- Not touched: paywall, purchase flow, `useSubscription`, `FeatureLock`, Stripe
  webhook and functions.

## Technical notes

- Route lives under `/api/public/*` so RevenueCat can reach it without site auth;
  the shared-secret check inside the handler is the only gate.
- Secret is read inside the handler (env is injected per request).
- Handler returns 200 for handled-and-ignored events and 5xx only on genuine
  server faults, so RevenueCat's retry behaviour stays meaningful.
- No PII in responses; body is `ok`.

## Follow-up (not this stage)

Stage 4: paywall/purchase flow using RevenueCat offerings on native.
