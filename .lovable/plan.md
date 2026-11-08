# Data safety check: RevenueCat and OneSignal (no code changes)

Neither collects crash logs, diagnostics or other performance data as used in Kookaflow.

- RevenueCat (@revenuecat/purchases-capacitor 13.4.2): Google Play guidance says App info and performance is not collected. Declare Financial info, Purchase history. Optional SDK diagnostics are off by default and the app does not turn them on.
- OneSignal (react-onesignal 3.5.3, web SDK): guidance says Crash logs, Diagnostics and Other performance data are not collected. Declare App interactions (sessions, notification clicks); Purchase history only if in-app purchases are reported to OneSignal. The app identifies users with OneSignal.login, so Device or other IDs / User IDs may apply.

No changes to build.
