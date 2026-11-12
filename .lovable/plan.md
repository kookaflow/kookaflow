# Push setting: only the user's switch can change it

## What's wrong today
- When the app starts, it saves the phone's or browser's notification state to the account. If that device hasn't allowed notifications, the account's push setting is switched **off**. Shift alerts and reminders then stop on every device.
- Reminders & Notifications has **no account-level push switch**. It only shows this device's permission, plus a shift-alerts switch.

## Changes

1. **Server enforcement (protects the apps already released)**
   - The device-update call (used by every app version on load) will only save this device's details. It ignores any value it sends for the account setting, so older builds that still send it can't switch push off.
   - A new call, `setPushEnabled`, is the only way to change the account setting. It is used only by the new switch.
   - The daily and weekly reminder settings are already saved only from the settings screen. That stays the same.
   - Database safeguard: a check that refuses changes to the account push setting unless they come through `setPushEnabled`. This covers older builds that write to the database directly. It sits alongside the existing protected-fields check.

2. **App start-up no longer touches the account**
   - Start-up, sign-in and device-change events report only this device's subscription id and opted-in state, for display.
   - Device details are saved per device, so a second phone doesn't overwrite the first. This is a new record per device (user, subscription id, platform, opted in, last seen) that only the account owner can read. The old single device field stays as it is, so nothing breaks.

3. **Reminders & Notifications screen**
   - New account switch: "Push notifications for this account", saved through `setPushEnabled`.
   - Under it, a separate status line for this device. When the account switch is on but the device hasn't allowed notifications, it reads: "Notifications are off on this device. Allow them in your phone or browser settings." On phones there's an Open Settings button, and in browsers an Enable button.
   - Turning the switch on does not ask for device permission by itself. The device line offers that separately.

4. **Accounts that may already be affected (list only, nothing changed)**
   Six of the 11 accounts currently have push off:
   - njokiwinfred88@yahoo.com
   - elsiewahome@yahoo.com
   - njerianneus@yahoo.com
   - rouz.rubasha@gmail.com
   - elsiewahome@yshoo.com
   - scan-…@blockaid-scan.invalid (a security scanner account)

   Caveat: new accounts start with push off, and until now there was no switch for it. So I can't tell which of these were switched off by the bug and which were never on. Five of the six have never registered a device, which points to "never on". I'll leave all of them as they are.

5. **Tests**
   - The device update ignores the account setting.
   - Only `setPushEnabled` changes it.
   - Device state is never mapped onto the account.

## Live on Publish vs new app build
- **Live on Publish:** the server ignoring the account setting from device updates, `setPushEnabled`, the database safeguard and per-device saving. From then on, older phone builds can no longer switch accounts off. They just won't show the new switch.
- **Website on Publish:** the new switch and the device status line.
- **New iOS/Android build needed:** the new switch and the device status line inside the apps, and start-up sending device-only data. Until then, old builds keep sending the old value, and the server ignores it.

## Technical details
- `src/lib/push.functions.ts`:
  - `updatePushSubscription` accepts `{playerId, enabled?, optedIn?, platform?}`. It drops `enabled`, upserts `push_devices` and keeps `onesignal_player_id` updated.
  - Add `setPushEnabled({enabled})`. It runs `select set_config('app.push_toggle','on',true)` and the update inside one RPC, a security-definer function `set_push_enabled(_enabled)` that runs as the caller.
- Migration:
  - Table `push_devices` with grants and owner RLS.
  - The function `set_push_enabled`.
  - A BEFORE UPDATE trigger on profiles that restores the old `push_notifications_enabled` unless `current_setting('app.push_toggle', true) = 'on'`.
- `OneSignalProvider.tsx`: send `optedIn` and the platform, never `enabled`.
- `RemindersSettings.tsx`: add the switch using `getPushStatus` / `setPushEnabled`, and rework `NotificationStatusCard` copy.
