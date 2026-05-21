# Plan: Unify app color system around ShiftSync brand palette

## Goal
Single source of truth for ShiftSync brand colors, applied consistently to the Midnight theme (light + dark), all gradient surfaces, and logo treatment. No drift, no approximations.

## Brand palette (exact, from logo)
- `BRAND_NAVY` `#162264`
- `BRAND_INDIGO` `#232B7E`
- `BRAND_PURPLE` `#5D46DC`
- `BRAND_HIGHLIGHT` `#B6BAE3`
- `BRAND_BACKGROUND_DARK` `#101A4F`
- `BRAND_GRADIENT` `linear-gradient(135deg, #162264 0%, #232B7E 50%, #5D46DC 100%)`

## Files to change (in order)

1. **Create** `src/lib/colours.ts` — named TS constants for all brand values + gradient string. Single import surface for any component that needs raw hex.

2. **Update** `src/styles/themes.css` — Midnight theme tokens only:
   - Light mode: `--background: #F5F6FF`, `--foreground: #162264`, `--card: #FFFFFF`, `--primary: #232B7E`, `--accent: #5D46DC`, `--ring: #5D46DC`, secondary/muted tinted from `#B6BAE3`. Page header `--page-header-from: #162264`, `--page-header-to: #5D46DC`. Add brand tokens `--brand-navy`, `--brand-indigo`, `--brand-purple`, `--brand-highlight`, `--brand-background-dark`, `--brand-gradient`.
   - Dark mode: `--background: #101A4F`, `--card: #162264`, `--primary: #5D46DC`, secondary/muted `#232B7E`, `--muted-foreground: #B6BAE3`, borders `rgba(182,186,227,0.18)`. Same page-header gradient + brand tokens.

3. **Update** `src/styles.css` — Midnight `[data-theme="midnight"]` auth overrides:
   - `--auth-gradient-from: #162264`, `--auth-gradient-to: #5D46DC`, `--auth-accent: #B6BAE3`.

4. **Update** `src/components/layout/SplashScreen.tsx` — gradient from `BRAND_GRADIENT` (or `var(--brand-gradient)`).

5. **Update** `src/components/layout/PageHeader.tsx` — verify it consumes `var(--page-header-from/to)`; no further change.

6. **Update** `src/routes/_authenticated.onboarding.tsx` — header gradient reads from `var(--brand-gradient)`.

7. **Audit auth surfaces** — `src/components/auth/AuthShell.tsx` / `AuthField.tsx` — switch any inline hex to brand tokens.

8. **Update** `src/components/calendar-page/TodayPanel.tsx` — replace stray brand hex with tokens.

9. **Logo container treatment** — wherever logo renders on a light background (AuthShell header, onboarding slide, sidebar in light mode), wrap `<img>` in a rounded-square div with `background: var(--brand-gradient)` + padding. On dark backgrounds render the logo directly so its dark areas blend.

## Not changing
- Life category tokens (`--cat-*`)
- Slate / Lavender / Forest themes
- Auth, routing, Supabase, business logic
- Font sizes, spacing, layout

## QA
- Toggle Midnight light ↔ dark — both cohesive
- Splash, login, signup, onboarding, dashboard + calendar headers share the exact same gradient
- Logo on dark bg: only white symbol + glow visible; on light bg: sits in gradient container
- No leftover `#1E2A6E`, `#3D3DA0`, `#6B35CC`, `#5B8DEF` in `src/`
