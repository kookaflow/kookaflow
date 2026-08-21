let lastCapturedError;
const TTL_MS = 5e3;
function record(error) {
  lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => record(event.error ?? event));
  globalThis.addEventListener(
    "unhandledrejection",
    (event) => record(event.reason)
  );
}
function consumeLastCapturedError() {
  if (!lastCapturedError) return void 0;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = void 0;
    return void 0;
  }
  const { error } = lastCapturedError;
  lastCapturedError = void 0;
  return error;
}
function renderErrorPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
let serverEntryPromise;
async function getServerEntry() {
  if (!serverEntryPromise) {
    serverEntryPromise = import("./assets/server-CzGi1_X2.js").then((n) => n.s).then(
      (m) => m.default ?? m
    );
  }
  return serverEntryPromise;
}
function brandedErrorResponse() {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
function isCatastrophicSsrErrorBody(body, responseStatus) {
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }
  const fields = payload;
  const expectedKeys = /* @__PURE__ */ new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }
  return fields.unhandled === true && fields.message === "HTTPError" && (fields.status === void 0 || fields.status === responseStatus);
}
async function normalizeCatastrophicSsrResponse(response) {
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
const ALLOWED_MOBILE_ORIGINS = /* @__PURE__ */ new Set([
  "capacitor://localhost",
  "https://localhost",
  "ionic://localhost"
]);
function allowedOrigin(request) {
  const origin = request.headers.get("origin");
  return origin && ALLOWED_MOBILE_ORIGINS.has(origin) ? origin : null;
}
function preflightResponse(request, origin) {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": request.headers.get("access-control-request-headers") ?? "authorization,content-type",
      "access-control-max-age": "86400",
      vary: "origin"
    }
  });
}
function withCorsHeaders(response, origin) {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin);
  const vary = headers.get("vary");
  headers.set("vary", vary && !/\borigin\b/i.test(vary) ? `${vary}, origin` : "origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
const server = {
  async fetch(request, env, ctx) {
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
  }
};
export {
  server as default,
  renderErrorPage as r
};
