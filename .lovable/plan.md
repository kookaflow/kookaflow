# Replace every Kookaflow logo and icon

## Final source
Use the attached `Kookaburra_Clock_Sunset_Icon_for_build_8.png` (1254 × 1254, square RGB image) as the sole master artwork.

## Files that will be changed

| File | Exact change |
|---|---|
| `src/assets/kookaflow-logo.png` | Replace the old rounded-square kookaburra artwork with a 512 × 512 optimized PNG generated from the final icon. Keep the path unchanged so all existing imports update automatically. |
| `public/favicon.ico` | Replace with a multi-resolution ICO generated from the final icon (16, 32, and 48 px). |
| `public/favicon-16x16.png` | Replace with a 16 × 16 PNG generated from the final icon. |
| `public/favicon-32x32.png` | Replace with a 32 × 32 PNG generated from the final icon. |
| `public/apple-touch-icon.png` | Replace with a 180 × 180 PNG generated from the final icon. |
| `public/pwa-icon-192.png` | Replace with a 192 × 192 PNG generated from the final icon. |
| `public/pwa-icon-512.png` | Replace with a 512 × 512 PNG generated from the final icon. |
| `public/favicon.svg` | Delete the unreferenced hand-drawn old kookaburra favicon so the old artwork is not available at `/favicon.svg`. |

The square source already fills its canvas, so resizing will preserve its proportions without stretching or adding padding.

## Every source file that references the old in-app logo
These files all import `@/assets/kookaflow-logo.png`. They will show the new artwork through the replacement above; their code will **not** be edited.

- `src/routes/index.tsx`
- `src/routes/_authenticated.calendar.tsx`
- `src/routes/_authenticated.onboarding.tsx`
- `src/components/layout/SplashScreen.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/layout/AppNav.tsx`
- `src/components/auth/AuthShell.tsx`
- `src/components/legal/LegalPage.tsx`
- `src/components/more/MoreHero.tsx`
- `src/components/settings/SettingsHero.tsx`
- `src/components/notifications/PushPermissionPrompt.tsx`

## Every source file that references the public icons

### `src/routes/__root.tsx`
Currently links to:
- `/favicon.ico`
- `/favicon-32x32.png`
- `/favicon-16x16.png`
- `/apple-touch-icon.png`
- `/manifest.json`

**Change:** none. The referenced files keep the same names and are replaced in place.

### `public/manifest.json`
Currently references:
- `/favicon-16x16.png`
- `/favicon-32x32.png`
- `/apple-touch-icon.png`
- `/pwa-icon-192.png`
- `/pwa-icon-512.png`

**Change:** none. The paths, dimensions, MIME types, and existing maskable declaration remain valid.

## Generated output and native scope
- `dist-mobile/` contains generated copies of the old artwork. It will not be hand-edited; it is refreshed only by the normal later mobile-build process.
- No iOS asset catalog exists in this repository, so there is no native App Store icon file here to replace.
- No Capacitor files or configuration will be touched.

## Explicitly out of scope
- RevenueCat
- Paywall and pricing
- Subscriptions and purchases
- Stripe
- Capacitor and native plugin code
- Components, routes, styling, copy, metadata, and Open Graph images

## Verification
- Confirm the master and every generated PNG/ICO visually use the final sunset kookaburra-clock artwork.
- Confirm each output has the intended dimensions and the ICO contains all three sizes.
- Confirm the landing page, authentication page, splash, signed-in header/navigation, and installed-PWA metadata resolve the new image.
- Confirm there are no source references to any removed old-logo filename and the preview build remains clean.
