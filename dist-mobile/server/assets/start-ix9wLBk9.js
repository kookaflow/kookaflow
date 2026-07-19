import { s as supabase } from "./client-BiJkZOJ7.js";
import { c as createMiddleware } from "./createMiddleware-BvN2ghIY.js";
import { r as renderErrorPage } from "../server.js";
import "@supabase/supabase-js";
function dedupeSerializationAdapters(deduped, serializationAdapters) {
  for (let i = 0, len = serializationAdapters.length; i < len; i++) {
    const current = serializationAdapters[i];
    if (!deduped.has(current)) {
      deduped.add(current);
      if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
    }
  }
}
var createStart = (getOptions) => {
  return {
    getOptions: async () => {
      const options = await getOptions();
      if (options.serializationAdapters) {
        const deduped = /* @__PURE__ */ new Set();
        dedupeSerializationAdapters(deduped, options.serializationAdapters);
        options.serializationAdapters = Array.from(deduped);
      }
      return options;
    },
    createMiddleware
  };
};
const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }
);
const MOBILE_SERVER_ORIGIN = "https://kookaflow.com";
const mobileServerFnFetch = (input, init) => {
  if (typeof input === "string" && input.startsWith("/")) {
    return fetch(`${MOBILE_SERVER_ORIGIN}${input}`, init);
  }
  if (input instanceof URL) {
    return fetch(input, init);
  }
  if (input instanceof Request && input.url.startsWith("/")) {
    return fetch(
      new Request(`${MOBILE_SERVER_ORIGIN}${input.url}`, input),
      init
    );
  }
  return fetch(input, init);
};
const ALLOWED_MOBILE_ORIGINS = /* @__PURE__ */ new Set([
  "capacitor://localhost",
  "https://localhost",
  "ionic://localhost"
]);
const corsMiddleware = createMiddleware().server(async ({ next }) => {
  const { getRequest } = await import("./server-CHKIdKAD.js");
  const req = getRequest();
  const origin = req.headers.get("origin");
  const allowed = origin && ALLOWED_MOBILE_ORIGINS.has(origin) ? origin : null;
  if (allowed && req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": allowed,
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": req.headers.get("access-control-request-headers") ?? "authorization,content-type",
        "access-control-max-age": "86400",
        vary: "origin"
      }
    });
  }
  const result = await next();
  if (allowed && result instanceof Response) {
    try {
      result.headers.set("access-control-allow-origin", allowed);
      result.headers.set("vary", "origin");
    } catch {
    }
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
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  }
});
const startInstance = createStart(() => ({
  requestMiddleware: [corsMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
  ...{ serverFns: { fetch: mobileServerFnFetch } }
}));
export {
  startInstance
};
