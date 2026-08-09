# iOS 402 vs 352 viewport mismatch — investigation report

## What the audit found

### 1. The mobile build being tested is stale (highest-confidence finding)
The built stylesheet the simulator loads still contains the **old** rule:

```text
dist-mobile/client/assets/styles-Buh1dAF0.css
html,body{max-width:100vw;overflow-x:hidden}
```

The current source (`src/styles.css`, lines 146-150) is:

```text
html, body { overflow-x: clip; width: 100%; max-width: 100%; }
```

So the `width:100%` fix is **not** in the bundle running on the device — `max-width:100vw` is, and it is the only viewport-unit width declaration anywhere in the shipped CSS. Under `viewport-fit=cover`, `100vw` includes the safe-area insets and resolves against the layout viewport rather than the visual viewport. Any conclusion drawn from the current simulator run is measuring pre-fix code.

### 2. No other full-bleed offender exists in the source tree
Searched all of `src/` for `100vw`, `w-screen`, `100dvw`, `min-width`, and fixed widths >= 393px:

- App shell `src/routes/_authenticated.calendar.tsx:179` — `flex h-[100dvh] flex-col bg-background overflow-hidden`: height only, no width declaration.
- `src/components/layout/SplashScreen.tsx:22` — `fixed inset-0`: sized by containing block, no `100vw`.
- `src/components/layout/PageHeader.tsx:20` — `relative w-full`; wave SVG is `block w-full` with `preserveAspectRatio="none"`: percentage-based.
- `src/components/more/MoreHero.tsx` — no width declaration; inner backdrop is `absolute inset-0`.
- `src/components/calendar/QuickAddFab.tsx` — `fixed`, offset via `right: max(16px, env(safe-area-inset-right))` and `bottom: calc(72px + env(safe-area-inset-bottom))`: no `100vw` math.
- `src/components/layout/AppNav.tsx:55` — bottom nav is `fixed inset-x-0` plus safe-area padding: no `100vw`.
- Only fixed min-widths found are small and safe: `min-w-[180px]` (`DatePicker.tsx:30`), `min-w-[8rem]`/`min-w-[12rem]` in shadcn menus, `min-w-[140px]` (`RemindersSettings.tsx:260`).
- `src/components/today/TodayPanel.tsx:29` uses `h-[calc(100vh-65px)]` — vertical only, cannot cause horizontal overflow.

### 3. 402 is very likely correct; 352 is the anomaly
iPhone 17 Pro's portrait CSS width is 402pt. `documentElement.scrollWidth = 402` with every widest element at exactly `width:402, left:0` and no rogue child is what a **correctly sized** page looks like on that device. A `window.innerWidth` of 352 that is *smaller* than the layout viewport means the visual viewport is scaled in (~1.14x) or the WKWebView frame is narrower than the screen — both native-side conditions, not CSS overflow. This is unconfirmed and should be measured before any CSS change.

## Proposed sequence

1. **Rebuild and re-test before changing anything.** `bun run build:mobile`, then `npx cap sync ios`, then re-measure. Confirm the bundle contains `html,body{width:100%;overflow-x:clip}` and no `100vw`.
2. **Run one diagnostic snippet** in Web Inspector to separate CSS overflow from native scaling (below).
3. **Then fix based on the result:**
   - If a `100vw`/`w-screen` element is still present: replace with `100%` / `w-full`. Full-bleed is not required anywhere in this shell — `PageHeader`, `MoreHero`, `AppNav` and the app shell are already percentage or `inset-x-0` based.
   - If the snippet shows `visualViewport.scale > 1`, or a webview frame narrower than `screen.width`: the fix is native-side (Capacitor iOS contentInset/zoom settings, or adding `maximum-scale=1, user-scalable=no` to the viewport meta at `src/routes/__root.tsx:88`), not a CSS width change.

## Diagnostic snippet to run

```js
JSON.stringify({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  innerW: window.innerWidth,
  screenW: screen.width,
  vv: { w: visualViewport.width, scale: visualViewport.scale, offsetLeft: visualViewport.offsetLeft },
  htmlRule: [...document.styleSheets].flatMap(s => { try { return [...s.cssRules] } catch { return [] } })
    .filter(r => r.selectorText && /^html\s*,\s*body$/.test(r.selectorText))
    .map(r => r.cssText),
  wide: [...document.querySelectorAll('*')]
    .map(e => ({ t: e.tagName + '.' + e.className, w: Math.round(e.getBoundingClientRect().width), cw: getComputedStyle(e).width, mw: getComputedStyle(e).maxWidth }))
    .filter(x => x.w >= 393).slice(0, 25)
}, null, 2)
```

`htmlRule` confirms or rules out the stale-bundle theory; `vv.scale` plus `screenW` distinguishes native scaling from CSS overflow.

## Notes

- No code changes were made in this investigation.
- `dist-mobile/` is checked-in build output; it does not update when `src/styles.css` changes, so the Capacitor project must be re-synced after every CSS fix or the device keeps testing old CSS.