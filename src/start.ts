import { createStart, createMiddleware } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

import { renderErrorPage } from "./lib/error-page";

// -----------------------------------------------------------------------------
// Mobile (Capacitor) support
// -----------------------------------------------------------------------------
// The Capacitor bundle is served from `capacitor://localhost` (iOS) or
// `https://localhost` (Android) — there is no server on that origin.
// Rewrite server-fn calls (`/_serverFn/<hash>`) to hit the deployed web app.
const IS_MOBILE_BUILD =
  (import.meta.env.VITE_IS_MOBILE_BUILD as boolean | undefined) === true;
const MOBILE_SERVER_ORIGIN =
  (import.meta.env.VITE_MOBILE_SERVER_ORIGIN as string | undefined) ??
  "https://kookaflow.com";

const mobileServerFnFetch: typeof fetch = (input, init) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[mobile serverFn]", input);
  }
  if (typeof input === "string" && input.startsWith("/")) {
    return fetch(`${MOBILE_SERVER_ORIGIN}${input}`, init);
  }
  if (input instanceof URL) {
    return fetch(input, init);
  }
  if (input instanceof Request && input.url.startsWith("/")) {
    return fetch(
      new Request(`${MOBILE_SERVER_ORIGIN}${input.url}`, input),
      init,
    );
  }
  return fetch(input, init);
};

// CORS for Capacitor WebView origins is handled in src/server.ts, which owns
// the final Response object (a request middleware's `next()` does not resolve
// to a Response, so headers set there never reached real /_serverFn/* replies).

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
  ...(IS_MOBILE_BUILD ? { serverFns: { fetch: mobileServerFnFetch } } : {}),
}));
