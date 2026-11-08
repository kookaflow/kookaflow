# Native More page: links that stay inside the app

## Why it happens today
- **Rate** points to `"#"` (a placeholder), so it does nothing.
- **Privacy, Terms, Support, EULA** are pages inside the app's own bundle. They use the website's legal layout, whose logo links to the homepage and whose only way back is "Back to sign in". So users land on the website sign-in with no way back to the app.
- **mailto links** on Support/Terms/Privacy/Delete-account pages need to be handed to the phone's Mail app explicitly; inside the app's browser they can fail silently.

## Every link on the More page (native)

| Section | Link / button | Now on native | After the fix |
|---|---|---|---|
| Hero / Shifts row | Shifts | In-app page | Unchanged |
| Account | Upgrade / Choose plan | Apple/Play paywall | Unchanged |
| Account | Manage subscription | App Store / Play management | Unchanged |
| Account | Stripe billing portal | Hidden on native | Unchanged |
| Connected Calendars | Connect Google | System browser + deep link | Unchanged |
| Export | PDF / CSV | Share sheet | Unchanged |
| About | Privacy Policy | Opens in-app route, stranded | In-app browser with Done: kookaflow.com/privacy |
| About | Terms of Service | Same | In-app browser: /terms |
| About | Support & Help | Same | In-app browser: /support |
| About | EULA | Same | In-app browser: /eula |
| About | Rate Kookaflow | Nothing (`#`) | iOS: App Store write-review page; Android: Play Store listing |
| About | Share Kookaflow | Phone share sheet (text) | Native share sheet via @capacitor/share, with the link |
| Danger Zone | Delete Account | In-app confirm dialog | Unchanged; add "How deletion works" opening /delete-account in the in-app browser |
| Sign out | Sign out | Signs out | Unchanged |

Pages opened in the in-app browser: their mailto links then open Mail normally (they're in Safari/Chrome Custom Tabs, not the app).

## App-wide guard (native only)
- New helper `openExternal(url)`: native → `@capacitor/browser` (`Browser.open`), mailto/tel/store links → handed to the OS; web → current behaviour.
- One global click listener (native only, registered in the root) that intercepts any `<a>` whose target is off-app (other origin, `target="_blank"`, `mailto:`, `tel:`) and routes it through `openExternal` instead of letting the app navigate away.
- On native, the in-bundle routes `/privacy`, `/terms`, `/support`, `/eula`, `/delete-account`, `/` (landing) redirect: legal pages open in the in-app browser and return to More; landing goes to the calendar or login.
- Other off-app links found: Google event "open in Google" on the calendar, Google permissions link on Privacy — both covered by the guard.
- Paywall/Account Stripe `window.location.assign` stay web-only (already blocked on native).

## Needed from you
- Your **Apple App ID** (the number in App Store Connect → App Information → Apple ID). Until provided, Rate on iOS falls back to opening the App Store search for Kookaflow.

## Technical details
- Files: `src/lib/externalLinks.ts` (new: `openExternal`, `openStoreReview`, `installNativeLinkGuard`), `src/components/settings/AboutSection.tsx`, `src/components/settings/DangerZone.tsx`, `src/components/legal/LegalPage.tsx` (native: hide logo/back-to-sign-in links), `src/routes/__root.tsx` (install guard), `src/routes/index.tsx` + legal routes (native redirect in `beforeLoad`).
- Native detection reuses `VITE_IS_MOBILE_BUILD` + `Capacitor.isNativePlatform()`; platform via `Capacitor.getPlatform()`.
- Store URLs: iOS `https://apps.apple.com/app/id<APPLE_ID>?action=write-review` (via `window.open(url,"_system")`/Browser so the App Store app takes over), Android `https://play.google.com/store/apps/details?id=com.kookaflow.app`.
- No new packages (browser, share, app already installed). No Info.plist/Manifest changes; Android 11+ may need a `<queries>` entry for mailto — will note if so.
- Rebuild: `build:mobile`, `cap sync ios/android`, new store builds.
