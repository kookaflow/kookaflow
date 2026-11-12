import { describe, expect, it } from "vitest";
import { deviceProfileUpdate, parseDeviceUpdate } from "./pushDevice";

describe("device push updates", () => {
  it("an old build sending enabled:false does not change the account setting", () => {
    const upd = deviceProfileUpdate(parseDeviceUpdate({ playerId: "abc", enabled: false }));
    expect(upd).toEqual({ onesignal_player_id: "abc" });
    expect("push_notifications_enabled" in upd).toBe(false);
  });
  it("a device that isn't opted in still leaves the account setting alone", () => {
    const upd = deviceProfileUpdate(parseDeviceUpdate({ playerId: "x", optedIn: false, platform: "android" }));
    expect(Object.keys(upd)).toEqual(["onesignal_player_id"]);
  });
});
