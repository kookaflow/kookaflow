# Account deletion: cancel Stripe and remove OneSignal record

## Changes to deleteAccount (src/lib/account.functions.ts)
Before any data is deleted, read the user's profile (stripe_customer_id, stripe_subscription_id, onesignal_player_id). Then, each step wrapped in its own try/catch that logs `[deleteAccount] ...` and continues:

1. **Stripe:** using the existing `getStripe()` helper, list the customer's subscriptions with status active, trialing or past_due (plus the stored stripe_subscription_id if present) and cancel each immediately (`subscriptions.cancel`, no proration refund). Skipped if no Stripe customer/subscription. App Store / Google Play subscriptions are untouched (cannot be cancelled by us).
2. **OneSignal:** call `DELETE https://api.onesignal.com/apps/{ONESIGNAL_APP_ID}/users/by/external_id/{userId}` with the existing API key (the app links devices via `OneSignal.login(userId)`), which removes the user and their push subscriptions. If the profile has a stored player ID not tied to the user, also delete that subscription (`DELETE /apps/{app_id}/subscriptions/{id}`). A 404 is treated as already gone.

Existing table and sign-in deletion then runs as now. Helper for OneSignal goes in src/lib/reminders/push.server.ts (`deleteOneSignalUser`), loaded inside the handler.

## /delete-account page
- "What is deleted": replace the push line with "Your push notification registration with our notification provider, plus scheduled alerts and reminder history."
- Add: "Any active subscription paid by card on our website (Stripe) is cancelled immediately."
- Subscriptions section: website-card bullet changes to "cancelled automatically when you delete your account"; App Store / Google Play still must be cancelled in the store.

## Files
- src/lib/account.functions.ts
- src/lib/reminders/push.server.ts
- src/routes/delete-account.tsx

## Verification
Typecheck; run the OneSignal and Stripe helpers against a missing ID to confirm failures log and deletion continues.
