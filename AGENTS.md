# Architecture rules

- Apply the signed-in app's top safe-area inset once in AppLayout, not again in nested page headers, to avoid doubled device spacing.
- Use PaywallModal for every native upgrade and trial-ended prompt; its native cards render offering priceString only, while web pricing and Stripe checkout remain web-only.
- Keep paywall header and footer outside the plans scroll region; hide the shared dialog's default close only when the paywall supplies its own accessible close control.
- Apply iOS document overrides after hydration only when both the mobile build flag and Capacitor's native iOS platform match; keep web and Android document behavior unchanged.
- On native iOS, keep bottom navigation in the app shell's non-scrolling layout and scroll only the bounded content area so every signed-in page remains navigable.
- Native iOS More uses single-open expandable settings sections; preserve the expanded web layout to shorten native navigation without removing settings.- Native app server calls are cross-origin: src/server.ts must expose TanStack's x-tss-* reply headers to allowed app origins, or every server function returns a wrongly decoded value on iOS/Android.
- Native store wording and subscription management branch on Capacitor.getPlatform() via storeLabels()/openNativeSubscriptionManagement in revenuecat.ts; Android must never show Apple wording (Play policy).
- Push goes through src/lib/pushClient.ts: native uses @onesignal/capacitor-plugin, web uses react-onesignal; servers target external_id (OneSignal.login(userId)) so every device of a user receives it.
