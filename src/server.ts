import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// -----------------------------------------------------------------------------
// CORS for Capacitor WebView clients calling this origin (/_serverFn/*, /api/*)
// -----------------------------------------------------------------------------
// Capacitor's WebView origins are fixed and safe to allow-list. Any other
// origin is denied (same-origin browser requests don't need CORS headers).
// This lives here — not in a request middleware — because this wrapper owns the
// final Response object; middleware `next()` does not resolve to a Response.
const ALLOWED_MOBILE_ORIGINS = new Set([
  "capacitor://localhost",
  "https://localhost",
  "ionic://localhost",
]);

function allowedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  return origin && ALLOWED_MOBILE_ORIGINS.has(origin) ? origin : null;
}

function preflightResponse(request: Request, origin: string): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers":
        request.headers.get("access-control-request-headers") ??
        "authorization,content-type",
      "access-control-max-age": "86400",
      vary: "origin",
    },
  });
}

function withCorsHeaders(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin);
  const vary = headers.get("vary");
  headers.set("vary", vary && !/\borigin\b/i.test(vary) ? `${vary}, origin` : "origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const origin = allowedOrigin(request);

    if (origin && request.method === "OPTIONS") {
      return preflightResponse(request, origin);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return origin ? withCorsHeaders(normalized, origin) : normalized;
    } catch (error) {
      console.error(error);
      const errorResponse = brandedErrorResponse();
      return origin ? withCorsHeaders(errorResponse, origin) : errorResponse;
    }
  },
};
