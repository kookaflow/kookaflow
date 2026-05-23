
## Important finding: the code you asked me to fix is already correct

I read `src/lib/stripe.functions.ts` and all three fixes you requested are **already implemented**. Applying them again would be a no-op. Before changing anything, we need to find the real root cause.

### What the code already does

**1. `subscription_data.metadata.supabase_user_id` IS being set** (line 63–65):
```ts
...(plan.mode === "subscription"
  ? { subscription_data: { metadata: { supabase_user_id: userId, plan: data.plan } } }
  : { payment_intent_data: { metadata: { supabase_user_id: userId, plan: data.plan } } }),
```

**2. `session.metadata.supabase_user_id` IS being set** (line 62), plus `client_reference_id: userId` (line 61).

**3. `stripe_customer_id` is written to `profiles` BEFORE the Checkout Session starts** (lines 39–51) — when the Stripe customer is first created, the user's profile is updated immediately. The Stripe customer is also created with `metadata: { supabase_user_id }`. So `lookupUserByCustomer()` in the webhook should always find the user even if `sub.metadata` were empty.

In other words: there are already **three independent paths** for the webhook to identify the user (`sub.metadata.supabase_user_id`, customer→profile lookup via `stripe_customer_id`, and the customer's own metadata). The user identification is not the problem.

### So what IS likely causing `stripe_subscription_id` to stay NULL?

Realistic causes, in order of likelihood:

1. **The Stripe webhook endpoint is pointing at the wrong URL.** Earlier in the conversation we confirmed the route at `https://kookaflow.lovable.app/api/public/stripe/webhook` responds with `400 "Missing signature"` (i.e. it's alive and reachable). If Stripe's dashboard endpoint is pointing at a stale preview URL or a typo, "the webhook fires" in Stripe's UI but never reaches our handler.

2. **`STRIPE_WEBHOOK_SECRET` doesn't match the endpoint.** The handler would log `"Stripe webhook signature verification failed"` and return 400 — Stripe shows that as a failed delivery, the DB never updates.

3. **The webhook IS reaching the handler but throwing inside `handleEvent`** — e.g. `planForPriceId(priceId)` returns null and `tier` falls back to `"pro"` (fine), but something else in the update is rejected. We need server logs to confirm.

4. **The Stripe webhook endpoint isn't subscribed to `customer.subscription.created` / `.updated`.** If Stripe only sends `checkout.session.completed` for a subscription mode session, our handler's `mode === "payment"` branch ignores it (correct), and the subscription branch never runs.

5. **Stale test data.** If you tested with a checkout session created **before** lines 47–51 (writing `stripe_customer_id` to the profile at session creation) were added, that historical row never gets repaired. New checkouts should work.

### Proposed investigation plan (read-only first)

Before any code change, I'll:

1. **Pull recent server-function logs** filtered for `stripe` / `webhook` / `Invalid signature` to see whether the handler is being hit and what it logs for the failed event.
2. **Pull recent edge / function logs** via the analytics query tool to confirm POSTs to `/api/public/stripe/webhook` from Stripe IPs and their response status codes.
3. **Inspect the affected `profiles` row** for the user you manually fixed — check whether `stripe_customer_id` was populated at the time the subscription event arrived. If yes, it confirms the issue is delivery/signature, not user identification.
4. **Ask you to share** from the Stripe dashboard:
   - The exact webhook endpoint URL configured
   - The list of events it's subscribed to
   - The HTTP response code Stripe recorded for the failed `customer.subscription.created` delivery (200 / 400 / 404 / 500 / timeout)

### Only after the diagnosis — targeted fix

Based on what the logs show, the fix will be one of:
- **If 400 "Invalid signature":** rotate `STRIPE_WEBHOOK_SECRET` in project secrets to match the current endpoint's signing secret (no code change).
- **If the endpoint URL is wrong / 404:** update it in the Stripe dashboard to `https://kookaflow.lovable.app/api/public/stripe/webhook` (no code change).
- **If missing events:** subscribe the endpoint to `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`, `invoice.payment_failed` (no code change).
- **If the handler is throwing:** then there's a real code bug to fix in `src/routes/api/public/stripe/webhook.ts` — we'll patch it precisely based on the log output.

### What I will NOT do

- Re-add `subscription_data.metadata.supabase_user_id` — already there.
- Re-add `session.metadata.supabase_user_id` — already there.
- Add a "safety net" write of `stripe_customer_id` in `checkout.session.completed` for subscription mode — it's already written earlier, at session creation time. Adding it again would be dead code.
- Touch any UI / frontend / unrelated server code.

### To proceed

Please approve this plan. After you switch me to build mode I'll run the log queries and ask you for the Stripe dashboard details above, then propose the minimal real fix.
