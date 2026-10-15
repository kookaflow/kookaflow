# Architecture rules

- Apply the signed-in app's top safe-area inset once in AppLayout, not again in nested page headers, to avoid doubled device spacing.
- Use PaywallModal for every native upgrade and trial-ended prompt; its native cards render offering priceString only, while web pricing and Stripe checkout remain web-only.
- Keep paywall header and footer outside the plans scroll region; hide the shared dialog's default close only when the paywall supplies its own accessible close control.
- Apply iOS document overrides after hydration only when both the mobile build flag and Capacitor's native iOS platform match; keep web and Android document behavior unchanged.