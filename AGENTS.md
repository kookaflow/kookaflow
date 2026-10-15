# Architecture rules

- Apply the signed-in app's top safe-area inset once in AppLayout, not again in nested page headers, to avoid doubled device spacing.
- Use PaywallModal for every native upgrade and trial-ended prompt; its native cards render offering priceString only, while web pricing and Stripe checkout remain web-only.
- Keep paywall header and footer outside the plans scroll region; hide the shared dialog's default close only when the paywall supplies its own accessible close control.
- Apply iOS document overrides after hydration only when both the mobile build flag and Capacitor's native iOS platform match; keep web and Android document behavior unchanged.
- On native iOS, keep bottom navigation in the app shell's non-scrolling layout and scroll only the bounded content area so every signed-in page remains navigable.
- Native iOS More uses single-open expandable settings sections; preserve the expanded web layout to shorten native navigation without removing settings.