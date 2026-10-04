# Replace Kookaflow logo and app icon everywhere

## Source asset
- The final icon file: the one re-uploaded in chat (arrives in `/mnt/user-uploads/`). No implementation starts until it is present.
- All derived sizes are generated from that single file with ImageMagick. Nothing else in the code changes.

## What changes

### 1. In-app logo — one file, zero code edits
Every screen imports the same path `@/assets/kookaflow-logo.png`, so replacing that file updates all of them at once. No imports or components are touched.

Files that display it (reference list only — no edits needed):
- `src/routes/index.tsx` (landing page)
- `src/routes/_authenticated.calendar.tsx`
- `src/routes/_authenticated.onboarding.tsx`
- `src/components/layout/SplashScreen.tsx` (app-launch splash)
- `src/components/layout/PageHeader.tsx` (signed-in page header band)
- `src/components/layout/AppNav.tsx`
- `src/components/auth/AuthShell.tsx` (sign-in / sign-up shells)
- `src/components/legal/LegalPage.tsx` (privacy, terms, support, EULA)
- `src/components/more/MoreHero.tsx`
- `src/components/settings/SettingsHero.tsx`
- `src/components/notifications/PushPermissionPrompt.tsx`

Action: downscale the uploaded icon to 512x512 (it renders at 36–140px; keeps the app bundle light), keep the exact filename `kookaflow-logo.png`, preserve transparency.

### 2. Browser + PWA icons in `/public` — regenerated from the same icon
| File | Action |
|---|---|
| `public/favicon.ico` | Regenerate (16/32/48 multi-size) |
| `public/favicon-16x16.png` | Regenerate at 16x16 |
| `public/favicon-32x32.png` | Regenerate at 32x32 |
| `public/apple-touch-icon.png` | Regenerate at 180x180 |
| `public/pwa-icon-192.png` | Regenerate at 192x192 |
| `public/pwa-icon-512.png` | Regenerate at 512x512, full-bleed version so Android maskable icons aren't cropped |

Filenames stay identical, so `src/routes/__root.tsx` head links and `public/manifest.json` need no edits.

### 3. Stale hand-drawn favicon
- `public/favicon.svg` is a hand-drawn kookaburra sketch that no code references. Delete it so the old brand never gets served at `/favicon.svg`.

### 4. Regenerated automatically (not hand-edited)
- `dist-mobile/` build output — refreshed next time `bun run build:mobile` runs.
- The iPhone home-screen icon lives in the Xcode asset catalog, outside this web project; it gets the new icon when you prepare Build 6. Flagged here so it isn't forgotten — no Capacitor code is touched.

## What will NOT change
- No RevenueCat, paywall, subscription, Stripe, or Capacitor code.
- No component code, imports, routes, manifest entries, or head links.
- The og:image meta tags keep pointing at the existing preview screenshot URL.

## Verification
- Confirm every regenerated file exists at the right dimensions.
- Load the landing page, sign-in shell, and a signed-in page at phone width and screenshot to confirm the new logo renders in the splash, header, and nav.
- Confirm no build errors after the swap.
