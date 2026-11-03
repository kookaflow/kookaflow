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

const rawMobileFetch: typeof fetch = (input, init) => {
  if (typeof input === "string" && input.startsWith("/")) {
    return fetch(`${MOBILE_SERVER_ORIGIN}${input}`, init);
  }
  if (input instanceof Request && input.url.startsWith("/")) {
    return fetch(new Request(`${MOBILE_SERVER_ORIGIN}${input.url}`, input), init);
  }
  return fetch(input, init);
};

// If the server's decoding headers are not visible (e.g. a server without the
// expose-headers fix), fail loudly instead of returning a wrongly-decoded value.
const mobileServerFnFetch: typeof fetch = async (input, init) => {
  const res = await rawMobileFetch(input, init);
  if (
    res.ok &&
    !res.headers.get("x-tss-serialized") &&
    !res.headers.get("x-tss-raw")
  ) {
    throw new Error("Server reply unreadable — please update the app and try again.");
  }
  return res;
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
