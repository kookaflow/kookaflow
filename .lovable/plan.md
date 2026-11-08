# Fix native push on Android: permission prompt, login, push token

## What is wrong today (from the code)

- **No prompt:** the in-app explanation only opens when `getPushPermission()` returns `"default"`. On native it maps `permissionNative()` codes, which on Android do not reliably report "not asked yet", so the explanation (and therefore the system dialog) never shows. It also waits until both `ready` and `userId` are set.
- **No `[push] login`:** the user id comes from `supabase.auth.getUser()` (a network call that can stall at launch while the session is being restored) plus `onAuthStateChange`. If neither fires after init finishes, `loginPush` never runs. The subscription listener is only attached after both init and user are known, hence "No listeners found for event pushSubscriptionChange".
- **No Push Token:** the `android/` folder is not in this project (it lives on your Windows machine), so I cannot see whether the Google services Gradle plugin is applied. I will add logs and give you the exact Gradle lines to check.

## Changes

### 1. `src/lib/pushClient.ts`
- `initPush` becomes a shared promise (`whenPushReady()`), so login and listeners always wait for init to finish, never race it.
- Register the push-subscription `change` listener and the `permissionChange` listener immediately after `initialize()` inside `initPush` (native), forwarding to subscribers added later. This removes the "No listeners found" warning.
- `getPushPermission()` on native: use `Notifications.getPermissionAsync()` (granted?) plus `Notifications.canRequestPermission()` → returns `"granted"`, `"default"` (can still ask) or `"denied"`.
- `requestPushPermission()` native: logs `[push] permission request` and result; calls `Notifications.requestPermission(true)` which shows the Android 13+ POST_NOTIFICATIONS dialog.
- `loginPush` awaits `whenPushReady()` first, logs `[push] login start <id>` and `[push] login ok`.
- New `logPushState(label)`: logs `[push] state` with permission, `canRequest`, subscription id, push token (`getTokenAsync()`) shown only as `present (abc123…)` (first 6 characters at most) or `missing`, never the full token, and optedIn. Called after init, after login, after permission change, after subscription change, and 3s/10s after login so you can see if a token ever arrives.

### 2. `src/providers/OneSignalProvider.tsx`
- Get the user from `supabase.auth.getSession()` (local, no network) in a deferred tick, plus `onAuthStateChange` (deferred with `setTimeout`, no awaited auth calls inside). Covers restored sessions at launch and fresh sign-ins.
- Login effect runs on `ready && userId` and calls `loginPush` (which itself waits for init). Logs `[push] session user present/none`.
- Subscription persistence uses the listener registered at init.

### 3. `src/components/notifications/PushPermissionPrompt.tsx`
- On native, show our existing "Never miss a shift" explanation when permission is `"default"` after sign-in / on launch for a signed-in user who hasn't been asked; "Enable notifications" calls `requestPushPermission()` → system dialog.
- Store a native "asked" flag so we don't re-show after the system dialog was answered; "Maybe later" keeps the existing 7-day snooze.
- Web behaviour unchanged.

### 4. Tests
- Update `src/lib/pushClient.test.ts`: native permission mapping (granted / can-request / denied), login waits for init, listeners registered right after init.

## Your Android setup to check (Windows, `android/` folder)

1. `android/build.gradle` → in `buildscript.dependencies`: `classpath 'com.google.gms:google-services:4.4.2'` (Capacitor's template includes it).
2. `android/app/build.gradle` → at the bottom Capacitor's template has:
   ```text
   try {
       def servicesJSON = file('google-services.json')
       if (servicesJSON.text) {
           apply plugin: 'com.google.gms.google-services'
       }
   } catch(Exception e) { logger.info("google-services.json not found ...") }
   ```
   Keep it, and confirm the build log does NOT print "google-services.json not found".
3. `android/app/google-services.json` package name must be exactly `com.kookaflow.app`.
4. OneSignal dashboard → Settings → Push → Google Android (FCM): upload the **Firebase service account JSON** (FCM v1) from the same Firebase project.
5. `AndroidManifest.xml`: `<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>` (the plugin merges it; verify in merged manifest). Use an emulator image **with Google Play services**, or no token is issued.

## After building

Run `npm run build:mobile`, `npx cap sync android`, reinstall. In Logcat filter `[push]`: expect `native init ok` → `session user present` → `login ok` → `state … token=present`. If token stays missing, the `state` lines show whether permission, Google services or FCM is the blocker.

Website push behaviour stays the same.
