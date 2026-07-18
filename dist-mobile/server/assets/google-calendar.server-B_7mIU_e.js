import crypto from "crypto";
import { s as supabaseAdmin } from "./client.server-U_pH-Evd.js";
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
function signState(userId) {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", getSigningKey()).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}
function verifyState(state) {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [userId, ts, sig] = decoded.split(".");
    if (!userId || !ts || !sig) return null;
    const expected = crypto.createHmac("sha256", getSigningKey()).update(`${userId}.${ts}`).digest("hex");
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)))
      return null;
    if (Date.now() - Number(ts) > 15 * 60 * 1e3) return null;
    return userId;
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
    throw new Error(`Google token refresh failed (${res.status}): ${text}`);
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
  let pageToken;
  let nextSyncToken;
  let imported = 0;
  let removed = 0;
  let fullSync = !conn.sync_token;
  const baseParams = () => {
    const p = new URLSearchParams();
    if (conn.sync_token && !fullSync) {
      p.set("syncToken", conn.sync_token);
    } else {
      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
      const timeMax = new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3).toISOString();
      p.set("timeMin", timeMin);
      p.set("timeMax", timeMax);
      p.set("singleEvents", "true");
    }
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
      fullSync = true;
      pageToken = void 0;
      continue;
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Calendar list failed (${res.status}): ${text}`);
    }
    const data = await res.json();
    for (const item of data.items ?? []) {
      if (item.status === "cancelled") {
        await supabaseAdmin.from("google_events_cache").delete().eq("user_id", userId).eq("google_event_id", item.id);
        removed++;
        continue;
      }
      const start = parseEventTime(item.start);
      const end = parseEventTime(item.end);
      if (!start || !end) continue;
      await supabaseAdmin.from("google_events_cache").upsert(
        {
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
          status: item.status ?? null
        },
        { onConflict: "user_id,google_event_id" }
      );
      imported++;
    }
    if (data.nextPageToken) {
      pageToken = data.nextPageToken;
      continue;
    }
    nextSyncToken = data.nextSyncToken;
    break;
  }
  await supabaseAdmin.from("google_calendar_connections").update({
    sync_token: nextSyncToken ?? null,
    last_synced_at: (/* @__PURE__ */ new Date()).toISOString(),
    last_sync_error: null
  }).eq("user_id", userId);
  return { imported, removed, fullSync };
}
async function pushEventToGoogle(userId, eventId) {
  const { data: event } = await supabaseAdmin.from("events").select(
    "id, user_id, title, start_time, end_time, is_all_day, location, notes, category, google_event_id"
  ).eq("id", eventId).maybeSingle();
  if (!event || event.user_id !== userId) return;
  if (event.category !== "work") return;
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return;
  const { data: conn } = await supabaseAdmin.from("google_calendar_connections").select("google_calendar_id, two_way_sync_enabled").eq("user_id", userId).maybeSingle();
  if (!conn || !conn.two_way_sync_enabled) return;
  const calendarId = encodeURIComponent(conn.google_calendar_id || "primary");
  const body = {
    summary: event.title,
    description: (event.notes ?? "") + (event.notes ? "\n\n" : "") + "Synced from Kookaflow",
    location: event.location ?? void 0,
    start: event.is_all_day ? { date: event.start_time.slice(0, 10) } : { dateTime: event.start_time },
    end: event.is_all_day ? { date: event.end_time.slice(0, 10) } : { dateTime: event.end_time }
  };
  if (event.google_event_id) {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(event.google_event_id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
    if (res.status === 404) {
      await supabaseAdmin.from("events").update({ google_event_id: null }).eq("id", event.id);
      return pushEventToGoogle(userId, eventId);
    }
    if (!res.ok) {
      const text = await res.text();
      console.warn(`Google update failed: ${res.status} ${text}`);
    }
  } else {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.warn(`Google create failed: ${res.status} ${text}`);
      return;
    }
    const created = await res.json();
    await supabaseAdmin.from("events").update({ google_event_id: created.id }).eq("id", event.id);
  }
}
async function deleteEventFromGoogle(userId, googleEventId) {
  const accessToken = await getValidAccessToken(userId);
  if (!accessToken) return;
  const { data: conn } = await supabaseAdmin.from("google_calendar_connections").select("google_calendar_id, two_way_sync_enabled").eq("user_id", userId).maybeSingle();
  if (!conn || !conn.two_way_sync_enabled) return;
  const calendarId = encodeURIComponent(conn.google_calendar_id || "primary");
  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(googleEventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );
}
export {
  GOOGLE_SCOPES as G,
  signState as a,
  getUserInfoEmail as b,
  deleteEventFromGoogle as d,
  exchangeCodeForTokens as e,
  getRedirectUri as g,
  pushEventToGoogle as p,
  syncUserCalendar as s,
  verifyState as v
};
