import { describe, expect, it } from "vitest";
import {
  classifyGoogleError,
  friendlyStoredError,
  GoogleApiError,
  hasCalendarReadScope,
} from "./googleErrors";

describe("hasCalendarReadScope", () => {
  it("accepts calendar.readonly", () => {
    expect(hasCalendarReadScope("openid email https://www.googleapis.com/auth/calendar.readonly")).toBe(true);
  });
  it("rejects a token without any calendar scope", () => {
    expect(hasCalendarReadScope("openid email profile")).toBe(false);
  });
});

describe("classifyGoogleError", () => {
  it("403 insufficient scopes needs reconnect", () => {
    const e = new GoogleApiError(403, '{"error":{"status":"PERMISSION_DENIED","details":[{"reason":"ACCESS_TOKEN_SCOPE_INSUFFICIENT"}]}}', "list");
    expect(classifyGoogleError(e)).toBe("needs_reconnect");
  });
  it("invalid_grant on refresh needs reconnect", () => {
    expect(classifyGoogleError(new GoogleApiError(400, '{"error":"invalid_grant"}', "refresh"))).toBe("needs_reconnect");
  });
  it("429 is rate limited", () => {
    expect(classifyGoogleError(new GoogleApiError(429, "", "list"))).toBe("rate_limited");
  });
});

describe("friendlyStoredError", () => {
  it("never returns raw stored text", () => {
    const r = friendlyStoredError("Calendar list failed (403): ACCESS_TOKEN_SCOPE_INSUFFICIENT");
    expect(r?.code).toBe("needs_reconnect");
    expect(r?.message).not.toContain("403");
  });
});
