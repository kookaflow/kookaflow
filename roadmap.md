# Roadmap

- [x] Bound native iOS document width and keep bottom navigation outside page scrolling; signed-in More, Dashboard and Calendar passed 320px/390px browser simulation. Physical Build 10 cannot be modified remotely; next native build needs device verification.
- [x] Compress native More into single-open expandable sections while preserving web layout; expansion and navigation checked with a signed-in account.

- [x] Apply native-iOS-only field font sizing, viewport zoom limit, and horizontal gesture containment; browser simulation verified iOS settings and unchanged web/Android settings. Actual iPhone drag behavior requires a fresh native build and device check.

- [x] iOS: bound calendar/banner/header widths, apply safe areas, and pin paywall Close/Restore; verified at narrow phone and landscape widths.
- [x] Verify trial-ended and upgrade screens share RevenueCat prices with no native static-price fallback; signed-in browser tests used simulated offerings, purchase and restore responses.
- [ ] Verify fresh mobile artifact and physical iPhone safe areas/real Apple purchases (requires the next native build and device testing; not published or uploaded here).

- [x] Native pricing page: each plan button purchases its matching RevenueCat package directly; no second paywall modal on native.
- [x] Restore Purchases action on the native pricing page.
- [ ] RevenueCat storefront metadata: priceString returns US-looking amounts on AU devices. Not fixed by this change; needs dashboard/App Store price metadata verification (external, blocked on dashboard access).
- [x] RevenueCat: block purchases until identification completes; webhook resolves UUID from aliases; TRANSFER reconciled from authoritative subscriber lookup.
- [ ] Add REVENUECAT_SECRET_API_KEY secret (required for TRANSFER reconciliation) and confirm the RevenueCat webhook is enabled on the production URL.
- [x] One-time correction for hello@kookaflow.com applied manually (pro/active, end 2026-09-15); REVENUECAT_SECRET_API_KEY saved.
- [x] Native Manage Subscription: present Apple's StoreKit 2 management sheet through a dedicated Capacitor iOS bridge; never open account.apple.com.
- [x] Remove horizontal overflow and improve bottom-edge scrolling across mobile paywalls and signed-in views.
- [x] Replace all Kookaflow logo, favicon, Apple touch, and PWA artwork with the Build 8 icon; round only in-app displays through styling.
