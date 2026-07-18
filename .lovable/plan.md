# Static build for Capacitor — investigation (no code changes)

## 1. What this project actually is

- **Framework:** TanStack **Start** (full-stack React 19 meta-framework), not plain Vite React and not TanStack Router-only.
- **Build tool:** Vite 7 via the Lovable preset `@lovable.dev/vite-tanstack-config`, which internally wires the `tanstackStart` Vite plugin.
- **Deploy target:** Cloudflare Workers via `@cloudflare/vite-plugin` + `wrangler.jsonc` (`main: src/server.ts`). Under the hood TanStack Start uses Nitro to emit the server bundle — that's the `.output/server` folder you're seeing.
- **Routing:** File-based routes in `src/routes/`, generated into `src/routeTree.gen.ts`. Root shell is in `src/routes/__root.tsx` and uses `HeadContent` / `Scripts` — this is SSR shell markup, there is no static `index.html` template anywhere in the repo.

## 2. Why `npm run build` produces a server, not static files

TanStack Start is an **SSR framework by design**. `vite build` runs the `tanstackStart` plugin which:

1. Builds the client bundle.
2. Builds a **server entry** (`src/server.ts` → Cloudflare Worker) that renders every route on the fly using `renderToPipeableStream` and injects head/scripts.
3. Emits everything to `.output/` in the Nitro/Worker layout, with **no `index.html`** — the HTML is produced per-request by the Worker.

So there is no config flag on the current setup that says "just emit static files". A static export would require either (a) full prerendering of every route, or (b) migrating off TanStack Start to a plain Vite React SPA. And the app has real server code that rules out (a) as-is (see §4).

## 3. What it would take to get a Capacitor-ready static SPA

There is no small config toggle. Two realistic paths:

### Path A — Migrate the shell to a plain Vite React SPA (recommended for Capacitor)

Capacitor wraps a static `dist/` folder (index.html + JS/CSS). The clean way to get there:

1. Replace `@lovable.dev/vite-tanstack-config` + `tanstackStart` plugin with plain `@vitejs/plugin-react` (+ keep `@tanstack/router-plugin` in **SPA mode**, or switch to `react-router`).
2. Add a real `index.html` at the project root with a `<div id="root">` and a client entry (`src/main.tsx`) that mounts the router with `createRouter` + `RouterProvider` — no `shellComponent`, no `HeadContent`/`Scripts`, no `__root.tsx` html/head/body.
3. Remove/relocate everything under `src/routes/api/**` (they are server routes — invalid in SPA mode) and rewrite `createServerFn` call sites (see §4).
4. Remove `src/server.ts`, `src/start.ts`, `wrangler.jsonc`, `@cloudflare/vite-plugin`, `nitro`.
5. Move head metadata from route `head()` to `react-helmet-async` (or similar) since there's no SSR to render `<HeadContent>`.
6. `vite build` then outputs static `dist/` → point `capacitor.config.ts` `webDir: "dist"`.

This is a meaningful refactor (touches routing shell, ~10 server-function files, all API routes, head metadata, and env access), but it's the only way to get a clean SPA that Capacitor can wrap.

### Path B — Keep TanStack Start for web, add a parallel Capacitor build

Not currently supported by TanStack Start's `prerender` option for a fully dynamic app like this (auth-gated routes, per-user data, server functions). Not recommended.

### Recommendation

Go with **Path A**. Capacitor + TanStack Start SSR do not mix — mobile apps can't ship a Cloudflare Worker inside the bundle.

## 4. Server-side features that will break in a static build

The app has substantial server code that must be re-homed before it can run as a static SPA. Everything in these two buckets runs on the server today:

**Server routes (`src/routes/api/public/**`)** — external HTTP endpoints. In a static build they simply cease to exist:

- `stripe/webhook.ts` — Stripe webhook receiver
- `hooks/send-daily-reminder.ts`, `send-weekly-reminder.ts`, `send-trial-reminders.ts`, `send-push-*.ts`, `dispatch-shift-alerts.ts` — pg_cron-triggered jobs
- `google/sync-all.ts` — scheduled Google Calendar sync
- `auth.google.callback.ts` — Google OAuth callback
- MCP endpoints under `src/routes/[.mcp]/` and `[.well-known]/oauth-protected-resource.ts`

**Server functions (`*.functions.ts`) — 9 files** currently using `createServerFn` + `requireSupabaseAuth`:

- `account`, `events`, `preferences`, `push`, `shift-alerts`, `shift-templates`, `google-calendar`, `stripe`, plus MCP helpers

**Handling strategy for a Capacitor SPA:**

| Concern | Solution |
|---|---|
| Server routes (webhooks, cron, OAuth callback, MCP) | **Keep them running on the web deployment** at kookaflow.com. Mobile app never calls them; Stripe/pg_cron/Google keep hitting the web origin. |
| `createServerFn` calls (events CRUD, preferences, shift templates, etc.) | Rewrite each as a **direct Supabase client call** from the browser using the already-generated `@/integrations/supabase/client`. RLS already scopes them to `auth.uid()`, so this is mostly deleting the `.handler()` wrapper and calling `supabase.from(...)` inline (or via a thin client helper). |
| `createServerFn` calls that use `supabaseAdmin` or secrets (Stripe checkout session, Google OAuth token exchange) | Move to a small **Supabase Edge Function** or keep them on the web origin and call over `fetch(https://kookaflow.com/api/...)` from the mobile app. Google OAuth in Capacitor should switch to the native `@capacitor-community/generic-oauth2` plugin. |
| `process.env.*` reads | Server-only. Replace secret-backed logic per row above; public config becomes `import.meta.env.VITE_*`. |
| SSR head metadata (`head()` per route) | Replace with `react-helmet-async` for the web SPA. Inside Capacitor the head barely matters (no share previews, no SEO). |
| OneSignal / push | Already client-side — fine as-is, but on mobile you'll want the Capacitor OneSignal SDK instead of `react-onesignal`. |
| Google Calendar sync loop | Keep the pg_cron→web-origin `sync-all` endpoint; the mobile app just reads the cached rows via Supabase. |

## 5. What I need from you before writing a plan to implement

Before I write an implementation plan, please confirm:

1. **Ship model:** Are you OK with **two builds** (web SPA/SSR on kookaflow.com continues to host webhooks + cron + Stripe/Google callbacks; mobile is a static SPA that talks to Supabase directly and calls the web origin only for Stripe/OAuth)? Or do you want to fully decommission the web version?
2. **Router:** Keep TanStack Router in **SPA/client-only mode**, or switch to `react-router-dom`? (TanStack Router SPA mode preserves your file-based routes with the least churn.)
3. **Google sign-in on mobile:** switch to Capacitor's native OAuth plugin, or open the web OAuth flow in an in-app browser?
4. **Stripe on mobile:** iOS App Store forbids external payments for digital goods. Do you plan to use **RevenueCat / native IAP** on mobile (recommended), or keep Stripe Checkout via an in-app browser (Android-only feasible; iOS will likely reject)?

Once you answer these, I'll produce a concrete step-by-step migration plan.
