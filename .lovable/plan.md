# Stage 1 — RevenueCat SDK install + init (native only)

Scope: dependencies, a guarded init module, and a mount point. No changes to the paywall, `FeatureLock`, gates, or `useSubscription`.

## Current state relevant to this stage

- `package.json` has no `@capacitor/*` and no RevenueCat packages — the iOS wrapper currently lives outside this repo, so nothing in the web build references Capacitor.
- `src/start.ts` already reads `import.meta.env.VITE_IS_MOBILE_BUILD` (defined in `vite.config.ts` via `define`, set by `bun run build:mobile`).
- Auth state is available client-side through `supabase.auth.getUser()` / `onAuthStateChange`; the protected shell lives in `src/routes/_authenticated.tsx`, and global providers mount in `src/routes/__root.tsx`.

## 1. Dependencies

Add as runtime dependencies (via `bun add`, so they land in `package.json` and survive installs):

- `@revenuecat/purchases-capacitor`
- `@capacitor/core`
- `@capacitor/ios`
- `@capacitor/cli` (devDependency)

Note: `@capacitor/core` in the dependency list means the web/SSR bundle can now resolve it, so all Capacitor access must stay behind the mobile guard and dynamic imports (below) to keep the Cloudflare Worker build clean.

## 2. Native-only init module — `src/lib/revenuecat.ts` (new)

A small module with no top-level Capacitor imports:

- `export const IS_NATIVE_IAP = import.meta.env.VITE_IS_MOBILE_BUILD === true` (mirrors `src/start.ts`).
- `configureRevenueCat()` — no-op unless `IS_NATIVE_IAP` and `typeof window !== "undefined"`; otherwise `await import("@revenuecat/purchases-capacitor")` and call `Purchases.configure({ apiKey })`, plus `setLogLevel` (DEBUG in dev, ERROR otherwise). Idempotent via a module-level `configured` flag so double-mounts / HMR can't reconfigure.
- `identifyRevenueCatUser(userId)` — `Purchases.logIn({ appUserID: userId })`.
- `logOutRevenueCatUser()` — `Purchases.logOut()` on sign-out so an anonymous ID takes over.
- Everything wrapped in try/catch with `console.warn`; a RevenueCat failure must never block rendering (same posture as the realtime setup in `useSubscription`).

Key handling: the iOS public key (`appl_…`) is publishable and safe in the client bundle, but it should not be hardcoded. It will be read from `import.meta.env.VITE_REVENUECAT_IOS_KEY`, exposed by adding a `define` entry in `vite.config.ts` alongside the existing mobile flags and passing it in the `build:mobile` script. If the key is absent, `configureRevenueCat()` logs a warning and returns without configuring.

## 3. Where init runs

`src/providers/RevenueCatProvider.tsx` (new, render-null component) mounted inside `src/routes/_authenticated.tsx`, next to the existing watchers:

- On mount: `configureRevenueCat()` once.
- Then resolve the current user with `supabase.auth.getUser()` and call `identifyRevenueCatUser(user.id)` — the same Supabase user id that keys `profiles`, so RevenueCat entitlements line up with the existing subscription rows.
- Subscribe to `supabase.auth.onAuthStateChange`: `SIGNED_IN` → re-identify, `SIGNED_OUT` → `logOut`.

Rationale for `_authenticated.tsx` rather than `__root.tsx`: it renders once for the whole signed-in app, runs after the auth check has resolved (so the user id is known at first identify), and never mounts on the public/SSR marketing routes. It is also client-side only in practice, matching Capacitor.

## 4. Files touched

| File | Change |
|---|---|
| `package.json` | add RevenueCat + Capacitor deps |
| `src/lib/revenuecat.ts` | new — guarded configure / logIn / logOut helpers |
| `src/providers/RevenueCatProvider.tsx` | new — runs init once, keeps app user id in sync |
| `src/routes/_authenticated.tsx` | mount the provider alongside existing watchers |
| `vite.config.ts` | `define` for `VITE_REVENUECAT_IOS_KEY` |
| `package.json` (`build:mobile`) | pass the key through to the mobile build |

Untouched: `useSubscription.ts`, `FeatureLock.tsx`, `PaywallModal.tsx`, `pricing.tsx`, `stripe.*`, all server functions.

## 5. Verification for this stage

- Web build (`bun run build`) succeeds and the Worker bundle contains no Capacitor runtime import — the dynamic import stays behind the mobile flag.
- Mobile build (`bun run build:mobile`) succeeds with the key injected.
- On device: console shows a single RevenueCat configure log and a `logIn` for the signed-in Supabase user id; no purchases or entitlement reads yet.

## What I need from you

The iOS public API key (`appl_…`). It is a publishable key, but I'll store it as a build-time env value rather than committing it inline; tell me if you'd prefer it hardcoded in `src/lib/revenuecat.ts` for simplicity.

Out of scope until Stage 2: offerings/products, purchase flow, entitlement → tier mapping, RevenueCat webhook → `profiles`, and hiding Stripe checkout inside the native app.
