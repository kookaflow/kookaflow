/**
 * Google Calendar error handling shared by server and client.
 * Raw Google responses are logged server-side only; users only ever see
 * the short messages below. `last_sync_error` stores one of these codes.
 */

export type GoogleErrorCode = "needs_reconnect" | "rate_limited" | "network" | "unknown";

export const GOOGLE_READ_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar",
];

export const SCOPE_MISSING_MESSAGE =
  "Kookaflow needs permission to see your calendar. Please connect again and tick the calendar box.";

export const FRIENDLY_GOOGLE_MESSAGES: Record<GoogleErrorCode, string> = {
  needs_reconnect: "Google needs you to reconnect Kookaflow to keep syncing your calendar.",
  rate_limited: "Google is busy right now — we'll try again shortly.",
  network: "Couldn't reach Google — check your connection and try again.",
  unknown: "Sync didn't finish — we'll retry automatically.",
};

export class GoogleApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    context: string,
  ) {
    super(`${context} (${status})`);
    this.name = "GoogleApiError";
  }
}

/** True when the granted scope string includes calendar read access. */
export function hasCalendarReadScope(scope: string | null | undefined): boolean {
  if (!scope) return false;
  const granted = scope.split(/\s+/);
  return GOOGLE_READ_SCOPES.some((s) => granted.includes(s));
}

export function classifyGoogleError(err: unknown): GoogleErrorCode {
  if (err instanceof GoogleApiError) {
    const body = err.body || "";
    if (
      err.status === 401 ||
      /ACCESS_TOKEN_SCOPE_INSUFFICIENT|insufficient authentication scopes|invalid_grant|insufficientPermissions/i.test(
        body,
      )
    )
      return "needs_reconnect";
    if (err.status === 429 || /rateLimitExceeded|userRateLimitExceeded/i.test(body))
      return "rate_limited";
    if (err.status === 403 && /scope/i.test(body)) return "needs_reconnect";
    return "unknown";
  }
  if (err instanceof TypeError) return "network"; // fetch() network failure
  return "unknown";
}

const KNOWN: GoogleErrorCode[] = ["needs_reconnect", "rate_limited", "network", "unknown"];

/** Convert whatever is stored in last_sync_error into a friendly message (or null). */
export function friendlyStoredError(stored: string | null | undefined): {
  code: GoogleErrorCode;
  message: string;
} | null {
  if (!stored) return null;
  const code = (KNOWN as string[]).includes(stored)
    ? (stored as GoogleErrorCode)
    : /scope|invalid_grant|401|403/i.test(stored)
      ? "needs_reconnect"
      : "unknown";
  return { code, message: FRIENDLY_GOOGLE_MESSAGES[code] };
}
