import { describe, it, expect } from "vitest";
import { profileHasProAccess } from "./proAccess";

const now = Date.parse("2026-11-03T00:00:00Z");
const future = "2026-12-01T00:00:00Z";
const past = "2026-10-01T00:00:00Z";

describe("profileHasProAccess", () => {
  it("grants an active trial", () => {
    expect(profileHasProAccess({ subscription_tier: "trial", trial_ends_at: future }, now)).toBe(true);
  });
  it("denies an expired trial", () => {
    expect(profileHasProAccess({ subscription_tier: "trial", trial_ends_at: past }, now)).toBe(false);
  });
  it("grants active pro (Stripe or RevenueCat webhook)", () => {
    expect(profileHasProAccess({ subscription_tier: "pro", subscription_status: "active" }, now)).toBe(true);
  });
  it("grants cancelled pro still paid through", () => {
    expect(
      profileHasProAccess({ subscription_tier: "pro", subscription_status: "canceled", subscription_end_date: future }, now),
    ).toBe(true);
  });
  it("grants lifetime", () => {
    expect(profileHasProAccess({ subscription_tier: "lifetime" }, now)).toBe(true);
  });
  it("denies basic", () => {
    expect(profileHasProAccess({ subscription_tier: "basic", subscription_status: "active" }, now)).toBe(false);
  });
});
