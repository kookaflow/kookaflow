# Roadmap

- [x] Native pricing page: each plan button purchases its matching RevenueCat package directly; no second paywall modal on native.
- [x] Restore Purchases action on the native pricing page.
- [ ] RevenueCat storefront metadata: priceString returns US-looking amounts on AU devices. Not fixed by this change; needs dashboard/App Store price metadata verification (external, blocked on dashboard access).
- [x] RevenueCat: block purchases until identification completes; webhook resolves UUID from aliases; TRANSFER reconciled from authoritative subscriber lookup.
- [ ] Add REVENUECAT_SECRET_API_KEY secret (required for TRANSFER reconciliation) and confirm the RevenueCat webhook is enabled on the production URL.
- [ ] One-time correction for hello@kookaflow.com if Restore Purchases does not reconcile it.
