# Mobile CORS: why `capacitor://localhost` is blocked

## What I verified against the live server

Preflight is fine:

```text
OPTIONS /_serverFn/... , Origin: capacitor://localhost
-> 204
   access-control-allow-origin: capacitor://localhost
   access-control-allow-methods: GET,POST,OPTIONS
   access-control-allow-headers: authorization,content-type
   access-control-max-age: 86400
   vary: origin
```

The actual request is not:

```text
GET /_serverFn/<real hash>, Origin: capacitor://localhost
-> 200  (no access-control-allow-origin header at all)
```

That is exactly the Safari message: "Origin capacitor://localhost is not allowed by Access-Control-Allow-Origin. Status code: 200". The preflight passes, the real read succeeds server-side, then WebKit throws the response away because the header is missing — `listEvents` rejects with `TypeError: Load failed` and the calendar falls back to empty.

## Root cause

`corsMiddleware` in `src/start.ts` does two things:

1. Early-returns a 204 `Response` for `OPTIONS` — this path works, which is why the preflight is correct.
2. For every other request it does `const result = await next()` and then adds the CORS headers only `if (result instanceof Response)`.

In TanStack Start, `next()` from a request middleware does **not** resolve to a `Response`; it resolves to a middleware result object that *wraps* the response. So the `instanceof Response` check is always false and the header is silently never attached to any real `/_serverFn/*` response. The allow-list constant is correct and does include `capacitor://localhost` — it just isn't applied to the responses that matter.

Two secondary points, both consistent with the trace and neither the blocker:
- Allowed headers (`authorization, content-type`) already cover what the TanStack client sends; the payload rides in the query string, so no extra headers are needed.
- `Access-Control-Allow-Credentials` is not required: auth travels in the `Authorization` header, not cookies, and the client does not send credentialed requests. Adding it would also force dropping wildcards, which we don't use.

## Proposed fix

Move CORS header attachment to the place that unambiguously owns the final `Response`: the `fetch` wrapper in `src/server.ts`.

- Read the request `Origin`; if it is in the allow-list (`capacitor://localhost`, `https://localhost`, `ionic://localhost`), answer `OPTIONS` with 204 + the CORS headers, and for all other methods clone the outgoing response and set `access-control-allow-origin: <echoed origin>` plus `vary: origin` on it.
- Always echo the request origin — never a hardcoded `https://kookaflow.com`.
- Keep the allow-list narrow so browser traffic on kookaflow.com is unaffected (same-origin needs no headers).
- Remove the now-redundant `corsMiddleware` from `src/start.ts` (or reduce it to nothing) so there is a single CORS source of truth.

## Verification after the change

1. `curl -i -X OPTIONS https://kookaflow.com/_serverFn/x -H 'Origin: capacitor://localhost'` -> 204 with the four CORS headers (already passing; must stay passing).
2. `curl -D- https://kookaflow.com/_serverFn/<hash> -H 'Origin: capacitor://localhost'` -> 200 **with** `access-control-allow-origin: capacitor://localhost`.
3. Same curl without an `Origin` header -> unchanged response, no CORS headers.
4. Reload the iOS simulator build: `[events] status` logs `success` with a non-zero count and the calendar renders.

Note: the fix only takes effect on `kookaflow.com` after the web target is published; the mobile bundle itself doesn't need a rebuild for this.
