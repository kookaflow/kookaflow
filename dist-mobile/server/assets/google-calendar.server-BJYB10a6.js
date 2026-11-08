import crypto from "crypto";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
const GOOGLE_EVENT_COLORS = {
  "1": "#7986CB",
  // Lavender
  "2": "#33B679",
  // Sage
  "3": "#8E24AA",
  // Grape
  "4": "#E67C73",
  // Flamingo
  "5": "#F6BF26",
  // Banana
  "6": "#F4511E",
  // Tangerine
  "7": "#039BE5",
  // Peacock
  "8": "#616161",
  // Graphite
  "9": "#3F51B5",
  // Blueberry
  "10": "#0B8043",
  // Basil
  "11": "#D50000"
  // Tomato
};
const GOOGLE_DEFAULT_COLOR = "#0B0BDE";
function resolveGoogleEventColor(colorId, _calendarColor) {
  if (colorId && GOOGLE_EVENT_COLORS[colorId]) return GOOGLE_EVENT_COLORS[colorId];
  return GOOGLE_DEFAULT_COLOR;
}
const GOOGLE_READ_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar"
];
const SCOPE_MISSING_MESSAGE = "Kookaflow needs permission to see your calendar. Please connect again and tick the calendar box.";
const FRIENDLY_GOOGLE_MESSAGES = {
  needs_reconnect: "Google needs you to reconnect Kookaflow to keep syncing your calendar.",
  rate_limited: "Google is busy right now — we'll try again shortly.",
  network: "Couldn't reach Google — check your connection and try again.",
  unknown: "Sync didn't finish — we'll retry automatically."
};
class GoogleApiError extends Error {
  constructor(status, body, context) {
    super(`${context} (${status})`);
    this.status = status;
    this.body = body;
    this.name = "GoogleApiError";
  }
  status;
  body;
}
function hasCalendarReadScope(scope) {
  if (!scope) return false;
  const granted = scope.split(/\s+/);
  return GOOGLE_READ_SCOPES.some((s) => granted.includes(s));
}
function classifyGoogleError(err) {
  if (err instanceof GoogleApiError) {
    const body = err.body || "";
    if (err.status === 401 || /ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient authentication scopes|invalid_grant|insufficientPermissions/i.test(
      body
    ))
      return "needs_reconnect";
    if (err.status === 429 || /rateLimitExceeded|userRateLimitExceeded/i.test(body))
      return "rate_limited";
    if (err.status === 403 && /scope/i.test(body)) return "needs_reconnect";
    return "unknown";
  }
  if (err instanceof TypeError) return "network";
  return "unknown";
}
const KNOWN = ["needs_reconnect", "rate_limited", "network", "unknown"];
function friendlyStoredError(stored) {
  if (!stored) return null;
  const code = KNOWN.includes(stored) ? stored : /scope|invalid_grant|401|403/i.test(stored) ? "needs_reconnect" : "unknown";
  return { code, message: FRIENDLY_GOOGLE_MESSAGES[code] };
}
const TWO_WAY_SYNC_AVAILABLE = false;
function getSigningKey() {
  const key = process.env.GOOGLE_OAUTH_STATE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "OAuth state signing secret is not configured (set GOOGLE_OAUTH_STATE_SECRET or SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return key;
}
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "openid",
  "email",
  "profile"
].join(" ");
function signState(userId, native = false) {
  const payload = `${userId}.${Date.now()}${native ? ".n" : ""}`;
  const sig = crypto.createHmac("sha256", getSigningKey()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}
function verifyState(state) {
  return verifyStateDetailed(state)?.userId ?? null;
}
function verifyStateDetailed(state) {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(".");
    const native = parts.length === 4 && parts[2] === "n";
    if (parts.length !== 3 && !native) return null;
    const [userId, ts] = parts;
    const sig = parts[parts.length - 1];
    if (!userId || !ts || !sig) return null;
    const expected = crypto.createHmac("sha256", getSigningKey()).update(native ? `${userId}.${ts}.n` : `${userId}.${ts}`).digest("hex");
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
      return null;
    if (Date.now() - Number(ts) > 15 * 60 * 1e3) return null;
    return { userId, native };
  } catch {
    return null;
  }
}
function getRedirectUri(request) {
  const url = new URL(request.url);
  return `${url.origin}/auth/google/callback`;
}
async function exchangeCodeForTokens(code, redirectUri) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("Google OAuth credentials not configured");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }
  return res.json();
}
async function refreshAccessToken(refreshToken) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("Google OAuth credentials not configured");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[google] token refresh failed [${res.status}]: ${text}`);
    throw new GoogleApiError(res.status, text, "Google token refresh failed");
  }
  return res.json();
}
async function getUserInfoEmail(accessToken) {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.email ?? null;
  } catch {
    return null;
  }
}
async function getValidAccessToken(userId) {
  const { data: conn } = await supabaseAdmin.from("google_calendar_connections").select("access_token, refresh_token, token_expires_at").eq("user_id", userId).maybeSingle();
  if (!conn) return null;
  const expiresAt = new Date(conn.token_expires_at).getTime();
  if (expiresAt - Date.now() > 6e4) return conn.access_token;
  const fresh = await refreshAccessToken(conn.refresh_token);
  const newExpiresAt = new Date(Date.now() + fresh.expires_in * 1e3);
  await supabaseAdmin.from("google_calendar_connections").update({
    access_token: fresh.access_token,
    token_expires_at: newExpiresAt.toISOString()
  }).eq("user_id", userId);
  return fresh.access_token;
}
async function fetchCalendarColor(accessToken, calendarId) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/users/me/calendarList/${calendarId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.backgroundColor ?? null;
  } catch {
    return null;
  }
}
function parseEventTime(t) {
  if (!t) return null;
  if (t.dateTime) return { iso: t.dateTime, allDay: false };
  if (t.date) return { iso: (/* @__PURE__ */ new Date(`${t.date}T00:00:00Z`)).toISOString(), allDay: true };
  return null;
}
async function syncUserCalendar(userId) {
  const { data: conn } = await supabaseAdmin.from("google_calendar_connections").select("sync_token, google_calendar_id").eq("user_id", userId).maybeSingle();
  if (!conn) throw new Error("No Google connection");
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) throw new Error("Cannot obtain access token");
  const calendarId = encodeURIComponent(conn.google_calendar_id || "primary");
  await fetchCalendarColor(accessToken, calendarId);
  let pageToken;
  let nextSyncToken;
  let imported = 0;
  let removed = 0;
  const fullSync = true;
  const windowMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  const windowMax = new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3).toISOString();
  let seenIds = /* @__PURE__ */ new Set();
  const baseParams = () => {
    const p = new URLSearchParams();
    p.set("timeMin", windowMin);
    p.set("timeMax", windowMax);
    p.set("singleEvents", "true");
    p.set("maxResults", "250");
    return p;
  };
  for (let i = 0; i < 20; i++) {
    const params = baseParams();
    if (pageToken) params.set("pageToken", pageToken);
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (res.status === 410) {
      await supabaseAdmin.from("google_calendar_connections").update({ sync_token: null }).eq("user_id", userId);
      pageToken = void 0;
      seenIds = /* @__PURE__ */ new Set();
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      console.error(`[google] events list failed [${res.status}]: ${text}`);
      throw new GoogleApiError(res.status, text, "Calendar list failed");
    }
    const data = await res.json();
    const cancelledIds = [];
    const rows = [];
    for (const item of data.items ?? []) {
      if (item.status === "cancelled") {
        cancelledIds.push(item.id);
        continue;
      }
      const start = parseEventTime(item.start);
      const end = parseEventTime(item.end);
      if (!start || !end) continue;
      seenIds.add(item.id);
      rows.push({
        user_id: userId,
        google_event_id: item.id,
        google_calendar_id: conn.google_calendar_id || "primary",
        summary: item.summary ?? null,
        description: item.description ?? null,
        location: item.location ?? null,
        html_link: item.htmlLink ?? null,
        start_time: start.iso,
        end_time: end.iso,
        is_all_day: start.allDay,
        status: item.status ?? null,
        color_id: item.colorId ?? null,
        color_hex: resolveGoogleEventColor(item.colorId)
      });
    }
    if (cancelledIds.length) {
      await supabaseAdmin.from("google_events_cache").delete().eq("user_id", userId).in("google_event_id", cancelledIds);
      removed += cancelledIds.length;
    }
    if (rows.length) {
      const { error } = await supabaseAdmin.from("google_events_cache").upsert(rows, { onConflict: "user_id,google_event_id" });
      if (error) throw new Error(`Cache upsert failed: ${error.message}`);
      imported += rows.length;
    }
    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
      continue;
    }
    nextSyncToken = data.nextSyncToken;
    break;
  }
  {
    const { data: cached } = await supabaseAdmin.from("google_events_cache").select("google_event_id").eq("user_id", userId).lt("start_time", windowMax).gt("end_time", windowMin);
    const stale = (cached ?? []).map((r) => r.google_event_id).filter((id) => !seenIds.has(id));
    for (let i = 0; i < stale.length; i += 100) {
      const batch = stale.slice(i, i + 100);
      const { error } = await supabaseAdmin.from("google_events_cache").delete().eq("user_id", userId).in("google_event_id", batch);
      if (!error) removed += batch.length;
    }
  }
  await supabaseAdmin.from("google_calendar_connections").update({
    sync_token: nextSyncToken ?? null,
    last_synced_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_sync_error: null
  }).eq("user_id", userId);
  return { imported, removed, fullSync };
}
async function pushEventToGoogle(userId, eventId) {
  return;
}
async function deleteEventFromGoogle(userId, googleEventId) {
  return;
}
async function revokeGoogleAccess(userId) {
  try {
    const { data: conn } = await supabaseAdmin.from("google_calendar_connections").select("access_token, refresh_token").eq("user_id", userId).maybeSingle();
    const token = conn?.refresh_token || conn?.access_token;
    if (!token) return;
    const res = await fetch("https://oauth2.googleapis.com/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }).toString()
    });
    if (!res.ok) {
      console.error(`[google-revoke] failed [${res.status}]:`, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[google-revoke] error:", e.message);
  }
}
const googleCalendar_server = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GOOGLE_SCOPES,
  TWO_WAY_SYNC_AVAILABLE,
  deleteEventFromGoogle,
  exchangeCodeForTokens,
  getRedirectUri,
  getUserInfoEmail,
  getValidAccessToken,
  pushEventToGoogle,
  refreshAccessToken,
  revokeGoogleAccess,
  signState,
  syncUserCalendar,
  verifyState,
  verifyStateDetailed
}, Symbol.toStringTag, { value: "Module" }));
export {
  FRIENDLY_GOOGLE_MESSAGES as F,
  GOOGLE_SCOPES as G,
  SCOPE_MISSING_MESSAGE as S,
  TWO_WAY_SYNC_AVAILABLE as T,
  signState as a,
  GOOGLE_DEFAULT_COLOR as b,
  classifyGoogleError as c,
  deleteEventFromGoogle as d,
  exchangeCodeForTokens as e,
  friendlyStoredError as f,
  getRedirectUri as g,
  hasCalendarReadScope as h,
  getUserInfoEmail as i,
  googleCalendar_server as j,
  pushEventToGoogle as p,
  resolveGoogleEventColor as r,
  syncUserCalendar as s,
  verifyStateDetailed as v
};
