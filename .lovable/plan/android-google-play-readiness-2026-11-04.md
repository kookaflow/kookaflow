# Android (Google Play) readiness

## Findings (current code)
1. **RevenueCat key** — `src/lib/revenuecat.ts` always configures the Apple key (`appl_…`). On Android this would fail, so purchases would not work. Needs a fix.
2. **Stripe block** — `IS_NATIVE_IAP` comes from the mobile build flag, not from the device type, so it is already true on Android too. Web pricing redirect, Stripe "Manage" hiding and the Apple-priced paywall already apply on Android. No change.
3. **Manage subscription** — the button only shows for App Store purchases and calls a custom iOS-only plugin. On Android the button would never appear. Needs a fix.
4. **Server calls (CORS)** — `https://localhost` is already on the allow-list in `src/server.ts`, including preflight and the exposed reply headers. The bearer-token middleware in `src/start.ts` doesn't depend on platform. No change.
5. **Google Calendar** — the system-browser + `com.kookaflow.app://google-calendar` flow uses only cross-platform add-ons (`@capacitor/browser`, `@capacitor/app`), so the code works on Android. You still need to register the link scheme in the Android project (see below). No code change.
6. **Pro access on the server** — the RevenueCat webhook maps tiers from product/entitlement IDs, not the store, so Play purchases are recorded the same way. This works only if the Play product IDs are attached to the same `pro`/`basic` entitlements in RevenueCat.

## Changes

### `src/lib/revenuecat.ts`
- Add `REVENUECAT_ANDROID_API_KEY = "goog_…"`. It's a public key, so it's safe in the app code. **This is where your Google key goes**: RevenueCat → Project → API keys → your Google Play app → Public SDK key.
- In `configureRevenueCat()`, use `Capacitor.getPlatform()`: `"android"` → Google key, otherwise the Apple key. iOS is unchanged.
- `openNativeSubscriptionManagement(managementURL, productId)`:
  - iOS: same StoreKit plugin call as now.
  - Android: open `https://play.google.com/store/account/subscriptions?sku=<productId>&package=com.kookaflow.app` with `@capacitor/browser` (falls back to RevenueCat's `managementURL`). Android hands that link to the Play Store app.

### `src/components/more/AccountSection.tsx`
- Rename the store check to `isStoreSubscriber`: App Store, Mac App Store **or** `PLAY_STORE`.
- Use store wording: "Could not open Apple's subscription settings" becomes "…Google Play's…", and "No previous purchases found for this Apple ID" becomes "…for this Google account".

### Store wording (from a full search for Apple and App Store)
Only three messages people can see mention Apple. The terms, privacy and pricing pages have none.
- `src/lib/revenuecat.ts`: add a small `storeLabels()` helper that returns Apple wording on iOS and Google Play wording on Android.
- `src/components/subscription/PaywallModal.tsx`:
  - "No previous purchases found for this Apple ID" becomes "…for this Google account".
  - "The App Store didn't return any plans" becomes "Google Play didn't return any plans".
- iOS text stays word-for-word the same.

### `package.json`
- Add `"@capacitor/android": "^8.5.0"`, matching `@capacitor/core`, so `npm install` picks it up.

No other files change. Web and iOS behave the same as now.

## What you set up yourself (Windows laptop / consoles)
- **On Windows:** run `npm install`, then `npm run build:mobile`, then `npx cap add android` (first time only), then `npx cap sync android`. Open the project in Android Studio.
- **AndroidManifest.xml**, inside the main `<activity>`, add this intent filter:
  ```text
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="com.kookaflow.app" />
  </intent-filter>
  ```
- **Google Cloud Console:** no new redirect URI is needed. The callback is still `https://kookaflow.com/auth/google/callback`.
- **RevenueCat:** add the Google Play app with its service-account credentials. Attach the Play products to the `pro`/`basic` entitlements and the current offering. Use the same webhook.
- **Play Console:** create the matching subscriptions and the in-app product (lifetime), then upload a build to the internal testing track so the products load.

## Testing
- Typecheck, then `bun run build:mobile`. Confirm the bundle has both keys and the Play management link.
- On an Android test device: the paywall shows Play prices; buy with a test account; the Account page shows Manage Subscription and opens Play; Google Calendar Connect opens Chrome and returns to the app.
- On iOS: run the same quick check to confirm nothing changed.
