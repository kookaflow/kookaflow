# Rebuild the app bundle and publish the website

## What this gets you

- A fresh app bundle containing the iOS fixes made at 16:59 (no sideways dragging, bottom navigation that stays put, the collapsed More page, the 16px field and viewport rules). You can then upload the next TestFlight build yourself.
- kookaflow.com updated with the same code, so the website and the app match.

## Steps

1. Regenerate the mobile bundle with the project's mobile build command, which writes the app copy that Capacitor packages.
2. Confirm the new bundle actually contains the fixes: the iOS viewport/zoom setting, the horizontal gesture rules, the shell/bottom-navigation layout markers, and the collapsed More sections.
3. Read the build log to confirm the rebuild produced no errors.
4. Check for unresolved critical security findings, then request publishing for the website.
5. Report what is now in the bundle, and remind you that the TestFlight upload and build number are yours to set.

## Technical notes

- The mobile bundle is a snapshot: `build:mobile` outputs `dist-mobile/` (a static SPA whose server calls point at `https://kookaflow.com`). The current snapshot predates the fixes, so a rebuild is required before any TestFlight upload.
- Publishing only changes the website and the data endpoints. The app's screens ship inside the app, so publishing alone cannot fix the phone.
- No purchase, entitlement, Stripe, RevenueCat or Capacitor project changes are involved. The iOS project and app icon are untouched.
