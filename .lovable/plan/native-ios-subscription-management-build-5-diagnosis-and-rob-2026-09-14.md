# Native iOS subscription management — Build 5 diagnosis and robust fix

## Confirmed Build 5 behavior

`AccountSection` calls `openNativeSubscriptionManagement(native?.managementURL)`. The compiled mobile bundle contains this exact sequence:

```text
window.open("itms-apps://apps.apple.com/account/subscriptions", "_system")
  → if a Window object is returned, report success immediately
  → otherwise assign the same URL to window.location.href
  → only on a thrown error, open managementURL or the Apple HTTPS URL with Capacitor Browser
```

The important compiled expression is effectively:

```text
window.open(itmsUrl, "_system") || (window.location.href = itmsUrl)
```

Therefore Build 5 does **not** verify that iOS opened subscription management. `window.open()` can return a truthy `WindowProxy` as soon as the new-window request is created, so the function returns `true` before the native result is known. The `window.location.href` fallback is skipped, and asynchronous URL-opening failure cannot reach the `catch` block.

## Why `_system` failed

The earlier assumption that `_system` has special Capacitor 8 semantics was incorrect.

Capacitor 8 does not define `_system` as a native StoreKit or App Store command. In the installed iOS bridge, a new-window navigation reaches `WKUIDelegate.createWebViewWith`, which calls `UIApplication.shared.open(url)` and returns `nil`; it does not inspect `_system`, call StoreKit, or report success/failure to this JavaScript promise.

The installed `@capacitor/browser` plugin is also unsuitable for this job: on iOS it presents `SFSafariViewController`, an in-app web browser. That is why RevenueCat's `customerInfo.managementURL` or the HTTPS fallback reaches `account.apple.com` and requires a web sign-in. RevenueCat documents `managementURL` as a store management URL, not as a native-sheet API.

## Supported native solution

Apple provides the exact API needed:

```swift
try await AppStore.showManageSubscriptions(in: windowScene)
```

It presents Apple's native App Store subscription-management sheet inside the app and uses the iPhone's signed-in App Store account. It does not navigate to `account.apple.com` or require a website login. Apple documents this API as “Presents the App Store sheet for managing subscriptions.” [Apple documentation](https://developer.apple.com/documentation/storekit/appstore/showmanagesubscriptions(in:))

Capacitor JavaScript cannot call this API directly because it requires native Swift execution and the app's active `UIWindowScene`. A small Capacitor iOS bridge is required.

## RevenueCat alternative

The installed `@revenuecat/purchases-capacitor` 13.4.2 package does **not** expose Customer Center or a manage-subscriptions method. Its available native account-related sheet is the refund-request flow, which is not the same feature.

RevenueCat now supports Customer Center for Capacitor through a separate package, `@revenuecat/purchases-capacitor-ui`; it is not installed here. The matching 13.4.2 UI package is compatible with Capacitor 8 and the installed RevenueCat package. RevenueCat's integration uses `RevenueCatUI.presentCustomerCenter()`. [RevenueCat documentation](https://www.revenuecat.com/docs/tools/customer-center/customer-center-capacitor)

Customer Center is a valid supported option, but it adds another native dependency, requires RevenueCat-side Customer Center configuration, and first presents RevenueCat's broader self-service interface. It is larger than this requirement and is not as direct as calling Apple's sheet.

## Recommendation

Use a tiny iOS-only Capacitor plugin that exposes one method, `showManageSubscriptions()`, and calls StoreKit 2 directly.

Native implementation:

1. Run on `@MainActor`.
2. Obtain the active scene from `bridge?.viewController?.view.window?.windowScene`.
3. Call `AppStore.showManageSubscriptions(in: scene)`.
4. Resolve only after the native call successfully presents the sheet; reject with a controlled error if the scene is unavailable or StoreKit throws.
5. Do **not** fall back to `managementURL`, Capacitor Browser, `window.open`, `window.location`, or any HTTPS Apple Account page on native iOS. A visible retry message is safer than sending the user to the wrong login page.

This is the smallest and most reliable App Store-safe approach because it uses Apple's current first-party API and adds no competing purchase or entitlement system.

## Exact implementation scope

The implementation should affect only:

- The Capacitor iOS shell used to build TestFlight: add and register a one-method Swift plugin for `AppStore.showManageSubscriptions(in:)`.
- A small TypeScript bridge definition for that plugin.
- `src/lib/revenuecat.ts`: change only `openNativeSubscriptionManagement()` so the native path calls the new plugin; remove the inaccurate `_system` logic and native web fallback. Keep its current return contract.
- The native project/package registration files required by Capacitor, followed by the normal mobile build and iOS sync.

The repository currently contains the web/mobile bundle but no checked-in `ios/` project or Capacitor configuration. The Swift file must therefore be added to the actual iOS shell used for Build 6; it cannot be implemented solely inside the compiled web bundle.

Unchanged:

- `AccountSection` display and Lifetime behavior
- RevenueCat purchase, restore, identity, entitlement, and webhook logic
- RevenueCat `managementURL` collection (it may remain for diagnostics or non-iOS use, but native Apple management will ignore it)
- Web/Stripe billing portal behavior
- Auth, SSR, and calendar code

## Why this is preferred over Customer Center

| Option | Opens native Apple UI | Extra setup | Scope | Recommendation |
|---|---:|---:|---|---|
| Current `_system`/URL approach | Not reliably | None | URL navigation only | Reject |
| Capacitor Browser + `managementURL` | No; opens web UI | Already installed | In-app browser | Reject |
| RevenueCat Customer Center | Can route into supported store management | New UI package and dashboard configuration | Full self-service center | Valid future option |
| Tiny StoreKit 2 Capacitor plugin | Yes, directly | One native bridge method | Exact requested action | **Recommended** |

## Physical-device test checklist

1. TestFlight Account → Manage Subscription presents Apple's native subscription sheet, not Safari or an in-app browser.
2. Kookaflow Pro Monthly appears under the signed-in App Store account without a website login.
3. Dismissing the sheet returns to Kookaflow normally.
4. A StoreKit presentation error shows a retryable app message and never opens `account.apple.com`.
5. Lifetime users still have no Manage Subscription action.
6. Web users still open the Stripe billing portal.
7. Purchase, Restore Purchases, entitlement refresh, and webhook reconciliation behave exactly as before.
