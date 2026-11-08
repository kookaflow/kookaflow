# Website footer for legal and support pages

Applies to Privacy, Terms, Support, EULA and Delete Account on the website (no `?from=app`).

## What changes
- **Top:** the logo still links to the homepage (unchanged).
- **Bottom:** "Back to sign in" is replaced by a proper footer:
  1. **Download on the App Store** button: the largest, most visible item, linking to https://apps.apple.com/app/id6791698037 (opens in a new tab).
  2. **Get it on Google Play** button: built but hidden until a single on/off setting is switched on. It links to the Kookaflow Play listing.
  3. A row of links: Home · Sign in · Privacy · Terms · Support.
- The store buttons are drawn in the site's own style (dark button, Apple/Play symbol, two-line label) rather than with downloaded badge images.
- Works on phone and desktop widths: buttons stack on narrow screens.

## App mode (`?from=app`)
No change from the previous update: only the Privacy · Terms · Support links show. The store buttons, Home and Sign in stay hidden.

## Turning on Google Play
One setting, `SHOW_GOOGLE_PLAY_BUTTON`, set to `false` for now. When the Play listing is live, tell me and I'll switch it on, or change it to `true` yourself.

## Technical details
- `src/lib/externalLinks.ts`: add `SHOW_GOOGLE_PLAY_BUTTON = false`, `APP_STORE_URL`, `PLAY_STORE_URL` (reuse `APPLE_APP_ID` / `ANDROID_PACKAGE`).
- `src/components/legal/LegalPage.tsx`: new `LegalSiteFooter` (store buttons + Home `/`, Sign in `/login`, legal links) rendered when not `fromApp`; app mode keeps `LegalFooterLinks` with `?from=app`. In the mobile build, keep the existing "Back to app" behaviour.
- Check that EULA, Support and Delete Account all use `LegalPage` so they get the footer. Any that don't get the same footer added.
- Use semantic colour tokens only; check at 390px and 1280px in the browser.
