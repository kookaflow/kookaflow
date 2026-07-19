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

// -----------------------------------------------------------------------------
// CORS for cross-origin Capacitor clients hitting kookaflow.com/_serverFn/*
// -----------------------------------------------------------------------------
// Capacitor's WebView origins are fixed and safe to allow-list. Any other
// origin is denied (same-origin browser requests don't need CORS headers).
const ALLOWED_MOBILE_ORIGINS = new Set([
  "capacitor://localhost",
  "https://localhost",
  "ionic://localhost",
]);

const corsMiddleware = createMiddleware().server(async ({ next }) => {
  const { getRequest, setResponseHeaders } = await import(
    "@tanstack/react-start/server"
  );
  const req = getRequest();
  const origin = req.headers.get("origin");
  const allowed = origin && ALLOWED_MOBILE_ORIGINS.has(origin) ? origin : null;

  // Handle preflight before running the rest of the pipeline.
  if (allowed && req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": allowed,
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers":
          req.headers.get("access-control-request-headers") ??
          "authorization,content-type",
        "access-control-max-age": "86400",
        vary: "origin",
      },
    });
  }

  const result = await next();
  if (allowed) {
    setResponseHeaders({
      "access-control-allow-origin": allowed,
      vary: "origin",
    });
  }
  return result;
});

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
  requestMiddleware: [corsMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
  ...(IS_MOBILE_BUILD ? { serverFns: { fetch: mobileServerFnFetch } } : {}),
}));
