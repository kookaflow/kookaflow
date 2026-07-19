// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
//
// Dual-target build:
//   - Default (web):    SSR on Cloudflare Workers, outputs `.output/`.
//   - `BUILD_TARGET=mobile`: static SPA for Capacitor, outputs `dist-mobile/`.
//       Run with:  BUILD_TARGET=mobile vite build   (or `npm run build:mobile`).
//
// Web behavior is unchanged — kookaflow.com continues to host webhooks,
// cron endpoints, Stripe/Google OAuth callbacks, and MCP.
const isMobileBuild = process.env.BUILD_TARGET === "mobile";
// Origin the mobile bundle points server functions at.
// Overridable per-build with MOBILE_SERVER_ORIGIN=... npm run build:mobile
const mobileServerOrigin =
  process.env.MOBILE_SERVER_ORIGIN ?? "https://kookaflow.com";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    // SPA mode prerenders a single shell index.html and routes client-side.
    // Server functions still transform into HTTP calls — the mobile app will
    // point them at https://kookaflow.com (wired up in a later stage).
    ...(isMobileBuild ? { spa: { enabled: true } } : {}),
  },
  // Skip Nitro/Cloudflare Worker output for the mobile build.
  ...(isMobileBuild ? { nitro: false as const } : {}),
  vite: {
    plugins: [mcpPlugin()],
    define: {
      "import.meta.env.VITE_IS_MOBILE_BUILD": JSON.stringify(isMobileBuild),
      "import.meta.env.VITE_MOBILE_SERVER_ORIGIN": JSON.stringify(mobileServerOrigin),
    },
    ...(isMobileBuild ? { build: { outDir: "dist-mobile", emptyOutDir: true } } : {}),
  },
});
