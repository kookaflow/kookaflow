import { describe, expect, it, vi } from "vitest";

vi.mock("@capacitor/core", () => ({ Capacitor: { isNativePlatform: () => false } }));

import { maskToken, nativePermissionState, pathFromClick } from "./pushClient";
import { buildPushBody } from "./reminders/push.server";

describe("push targeting", () => {
  it("targets users by external_id so every signed-in device gets it", () => {
    const body = buildPushBody({
      appId: "app",
      externalUserIds: ["user-1"],
      heading: "Shift soon",
      content: "Starts in 1h",
      url: "https://kookaflow.com/calendar",
    });
    expect(body.include_aliases).toEqual({ external_id: ["user-1"] });
    expect(body.target_channel).toBe("push");
    expect(body).not.toHaveProperty("include_player_ids");
  });

  it("opens the website link on web only and the in-app path on phones", () => {
    const body = buildPushBody({
      appId: "app",
      externalUserIds: ["u"],
      heading: "h",
      content: "c",
      url: "https://kookaflow.com/calendar?d=1",
    });
    expect(body).not.toHaveProperty("url");
    expect(body.web_url).toBe("https://kookaflow.com/calendar?d=1");
    expect(body.data).toEqual({ path: "/calendar?d=1" });
  });

  it("does not turn outside links into in-app paths", () => {
    expect(pathFromClick({ result: { url: "https://evil.com/x" } })).toBeNull();
    expect(pathFromClick({ notification: { additionalData: { path: "/calendar" } } })).toBe("/calendar");
  });
});

describe("native push permission + token logging", () => {
  it("maps Android permission: granted, can still ask, or denied", () => {
    expect(nativePermissionState(true, false)).toBe("granted");
    expect(nativePermissionState(false, true)).toBe("default");
    expect(nativePermissionState(false, false)).toBe("denied");
  });

  it("never logs more than 6 characters of the push token", () => {
    expect(maskToken("abcdefghijklmnop")).toBe("present (abcdef…)");
    expect(maskToken(null)).toBe("missing");
  });
});
