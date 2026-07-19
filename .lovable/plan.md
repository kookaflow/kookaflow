## Findings

### 1. Viewport meta is present and correct
The built `dist-mobile/client/index.html` already includes:
```
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
and `src/styles.css` sets `html, body { overflow-x: hidden; max-width: 100vw }`.

So a *missing* viewport tag is **not** the root cause.

### 2. Why the iOS Capacitor build still overflows
iOS WKWebView is stricter than desktop Safari in two ways that match your symptoms:

- **`overflow-x: hidden` on `html`/`body` is unreliable in WKWebView when a fixed-position descendant or a `100vw` element extends past the layout viewport.** The visual viewport then grows to fit that element, and the user can pan horizontally. `overflow-x: clip` is the reliable equivalent.
- **`100vw` includes the area under the notch/home indicator when `viewport-fit=cover` is set.** Combined with `env(safe-area-inset-*)`, this can push content ~30–50px wider than the device on iPhones with a notch. That's exactly enough to shove the 4th nav tab ("More") off-screen.

The bottom nav (`AppNav`) uses `fixed inset-x-0` — its width tracks the layout viewport. So if *any* child of `<body>` establishes a wider layout viewport, the nav stretches with it and its last flex child (More) sits beyond the visible area. Because `QuickAddFab` is also `fixed` and anchored `right: max(16px, env(safe-area-inset-right))`, it lands in that same off-screen zone.

### 3. Likely wide-content culprits found in a scan
No components use hardcoded pixel widths, but candidates that can force layout expansion under iOS include:
- `SplashScreen` / gradient backdrops using `fixed inset-0` combined with `100vw` math
- `PageHeader` / `MoreHero` sections that use `w-screen` or full-bleed backgrounds
- Long unbroken strings (email addresses, tokens) in `AccountSection` or trial banners without `break-words`

Confirming the exact culprit needs a device-side inspection (Safari Web Inspector attached to the iOS simulator), but the web-layer fixes below neutralise *all* of them at once.

### 4. Capacitor config is not in the repo
There is no `capacitor.config.ts` / `.json` in this project — you're running Capacitor from a separate mobile shell. That means we can only fix this at the web layer (which is enough), but I'll also flag a native-side setting to verify.

---

## Plan (2 small edits, no logic changes)

### Edit 1 — `src/styles.css` (base layer)
Harden the root overflow rules so WKWebView cannot expand the layout viewport:

```css
html, body {
  overflow-x: clip;        /* replaces `hidden`; not defeated by fixed children */
  width: 100%;             /* replaces `max-width: 100vw` — avoids notch math */
  max-width: 100%;
}
```

Add horizontal safe-area padding to the bottom nav so nothing sits under the notch in landscape:

```css
@supports (padding: env(safe-area-inset-left)) {
  nav[data-app-bottom-nav] {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
}
```

### Edit 2 — `src/components/layout/AppNav.tsx`
- Add `data-app-bottom-nav` attribute to the mobile `<nav>` so the CSS above targets it.
- Add `min-w-0` to each nav `<Link>` so the 4 tabs share width evenly even if a label wraps.

### Edit 3 — `src/components/calendar/QuickAddFab.tsx` (verification only)
Once the viewport no longer overflows, the FAB's existing `bottom-[calc(72px+env(safe-area-inset-bottom))] md:bottom-5` + `right: max(16px, env(safe-area-inset-right))` will correctly place it above the bottom nav and inside the safe area. No code change expected — I'll verify visually after Edit 1/2.

### Native-side check (for you to confirm after rebuild)
In the iOS Xcode project, open `ios/App/App/Info.plist` and confirm there is **no** `UIRequiresFullScreen = YES` and no custom `WKWebView` viewport override. Capacitor's defaults are correct; a stray override would defeat the meta tag. No code change needed from me here.

---

## Verification after implementation
1. `npm run build:mobile`, `npx cap sync ios`, run on device/simulator.
2. Confirm no horizontal scroll on `/calendar`, `/dashboard`, `/shifts`, `/more`.
3. Confirm all 4 bottom-nav tabs are visible and tappable.
4. Confirm `+` FAB sits above the bottom nav with no overlap.

No business logic, no server code, no data layer touched — purely CSS/markup.
