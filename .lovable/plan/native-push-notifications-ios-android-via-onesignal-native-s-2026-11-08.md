# Native push notifications (iOS + Android) via OneSignal native SDK

## What currently depends on push

| Feature | Where it's sent from | How it targets the user | Affected in native today |
|---|---|---|---|
| Daily reminder push | `send-push-daily-reminder` hook | `external_id` (= user id, set by `OneSignal.login`) | Yes, never arrives |
| Weekly summary push | `send-push-weekly-reminder` hook | `external_id` | Yes |
| Shift alerts (before-shift) | `dispatch-shift-alerts` hook -> `sendPushToUser` | stored `onesignal_player_id` (one device only), legacy v1 API | Yes |
| Generic/scheduled push | `send-push-notification` hook -> `sendPushToUser` | stored `onesignal_player_id` | Yes |
| "Enable notifications" bottom prompt | `PushPermissionPrompt` | uses browser `Notification` + web SDK | Crashes/hidden on native |
| Settings > Reminders status card + toggles | `RemindersSettings` (`usePermissionState`, `getPushStatus`, `updatePushPrefs`) | browser `Notification.permission` | Shows wrong state on native |
| Account deletion | `deleteOneSignalUser` | external_id + player id | Works (server-side) |

Email reminders are not affected.

Note: `sendPushToUser` targets a single stored player id, so a user with web + phone only gets shift alerts on whichever device subscribed last. Switching it to `external_id` (like daily/weekly already do) fixes that and makes `OneSignal.login(userId)` the single link for everything.

## Code changes

1. **Add plugin**: `@onesignal/capacitor-plugin`, OneSignal's own Capacitor plugin. OneSignal recommends it for Capacitor apps, and it supports iOS through Swift Package Manager and Android through Gradle (peer `@capacitor/core >=7`). Do not use `onesignal-cordova-plugin`: its guide lists CocoaPods as an iOS requirement, and its SPM support depends on Capacitor 8.4+ Cordova support. Keep `react-onesignal` for web. Leave out the location module with `ONESIGNAL_DISABLE_LOCATION=true`; the app doesn't use location.
2. **New `src/lib/pushClient.ts`** — one small adapter with `init(appId)`, `login(userId)`, `logout()`, `requestPermission()`, `getPermission()` ("granted" | "denied" | "default" | "unsupported"), `getSubscription()` ({ id, optedIn }), `onSubscriptionChange(cb)`, `onPermissionChange(cb)`.
   - Native (`Capacitor.isNativePlatform()`): dynamic import of `@onesignal/capacitor-plugin` after hydration. Always call through the imported module and never return the plugin proxy from an async function, which avoids the earlier Preferences `.then()` bug.
   - Web: dynamic import of `react-onesignal`, current behaviour unchanged (service worker, localhost flag).
   - Every call wrapped in try/catch, logs `[push]` prefix, never throws into UI.
3. **`OneSignalProvider.tsx`** — use the adapter instead of `react-onesignal` directly. Native: initialise with the App ID baked in at build time (`VITE_ONESIGNAL_APP_ID`, publishable) with fallback to `getOneSignalConfig`, so startup doesn't depend on a network call. `login(userId)` on sign-in; `logout()` on sign-out (so the next person on a shared device doesn't get alerts). Persist subscription id/opt-in via existing `updatePushSubscription` on change (unchanged server side). Notification tap: open in-app route from `additionalData.url`/`launchURL` via router instead of WebView navigation.
4. **`PushPermissionPrompt.tsx`** — read permission via adapter (no `window.Notification` on native); call adapter `requestPermission(true)`.
5. **`RemindersSettings.tsx`** — `usePermissionState` and Enable button use the adapter; on native, "blocked" text says "enable in your phone's Settings" and offers a button opening app settings (iOS `app-settings:` / Android via plugin) instead of "browser settings".
6. **`push.server.ts` `sendPushToUser`** — switch to current API (`api.onesignal.com/notifications`, `Key` auth, `include_aliases.external_id`, `target_channel: push`), keep `push_notifications_enabled` check and `send_after`; skip reason `no_player_id` replaced by "no subscription" check only if OneSignal returns no recipients (logged, not an error). Shift alerts then reach all of a user's devices.
7. **Deep-link payload**: send `data: { path }` alongside `url` for native so taps open the right screen; web keeps `url`.
8. **Tests**: `pushClient` platform branching (native never touches `react-onesignal`, web never loads the native plugin) and `sendPushToUser` request body uses `external_id`.
9. **AGENTS.md**: rule "Push goes through pushClient; native uses OneSignal native SDK, web uses react-onesignal; server targets external_id only."

Website behaviour stays the same.

## Setup you must do yourself

### OneSignal dashboard
1. Settings > Platforms: keep **Web** as is. Add **Apple iOS (APNs)** and **Google Android (FCM)** to the same app (same App ID, so `external_id` links across web and phones).
2. iOS: upload the APNs **.p8** key, Key ID, Team ID, bundle ID `com.kookaflow.app`.
3. Android: upload the Firebase **service account JSON** (FCM v1).
4. Copy the App ID (needed as `VITE_ONESIGNAL_APP_ID` for mobile builds; same value as existing `ONESIGNAL_APP_ID`).

### Apple (APNs key)
1. developer.apple.com > Certificates, IDs & Profiles > Keys > "+" > enable **Apple Push Notifications service (APNs)** > download the .p8 (once only), note Key ID and Team ID.
2. Identifiers > `com.kookaflow.app` > enable **Push Notifications**; regenerate provisioning profiles if managed manually.

### Xcode (ios/App)
1. Target App > Signing & Capabilities > **+ Push Notifications**.
2. **+ Background Modes** > tick **Remote notifications**.
3. Skip the Notification Service Extension, App Groups and second target for launch. Notifications will be text-only; rich images can come later.
4. No Podfile or CocoaPods. Run `ONESIGNAL_DISABLE_LOCATION=true npx cap sync ios`; Capacitor adds the package to `CapApp-SPM/Package.swift` automatically, so don't edit that file. If needed, use Xcode > File > Packages > Resolve Package Versions.
5. Archive and upload a new build.

### Firebase / FCM (Android)
1. console.firebase.google.com > add project (or use existing) > Add Android app, package `com.kookaflow.app`.
2. Download **google-services.json** to `android/app/google-services.json` (Capacitor's Android template already applies the Google services plugin when this file exists).
3. Project settings > Service accounts > **Generate new private key** > upload JSON to OneSignal (step above). Ensure "Firebase Cloud Messaging API (V1)" is enabled.

### AndroidManifest (`android/app/src/main/AndroidManifest.xml`)
1. Add `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` (Android 13+ runtime permission; plugin also merges it, adding it explicitly is safe).
2. Optional small icon: add `ic_stat_onesignal_default` drawables under `android/app/src/main/res/drawable-*` (white, transparent) so notifications don't show a grey square.
3. Keep the existing Google Calendar deep-link intent filter; no other changes.

### Build
`npm install`, `npm run build:mobile`, `ONESIGNAL_DISABLE_LOCATION=true npx cap sync ios`; on Windows, `npx cross-env ONESIGNAL_DISABLE_LOCATION=true npx cap sync android`, then new TestFlight / Play internal builds. Website changes go live on Publish.

## How to verify
- Logcat/Xcode: `[push] native init ok`, `[push] login <userId>`, subscription id saved.
- OneSignal dashboard > Audience: user shows External ID + iOS/Android subscription.
- Settings > Reminders shows "active on this device"; send a test from dashboard by External ID; trigger a shift alert.

## Not covered
- No server alert schedule changes; email reminders untouched.
- Device testing must be done by you after the new builds.
