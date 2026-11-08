import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();
const auth = {
  getSession: vi.fn(),
  setSession: vi.fn(),
};

// Mimic Capacitor's plugin proxy: touching ".then" throws, like on device.
vi.mock("@capacitor/preferences", () => {
  const impl = {
    get: async ({ key }: { key: string }) => ({ value: store.get(key) ?? null }),
    set: async ({ key, value }: { key: string; value: string }) => void store.set(key, value),
    remove: async ({ key }: { key: string }) => void store.delete(key),
  };
  const Preferences = new Proxy(impl, {
    get(t, prop) {
      if (prop === "then") throw new Error('"Preferences.then()" is not implemented');
      return (t as Record<string | symbol, unknown>)[prop];
    },
  });
  return { Preferences };
});
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));

const KEY = "kookaflow.auth.session";
const session = (rt: string) => ({ access_token: "a-" + rt, refresh_token: rt, expires_at: 0 });

async function load() {
  return import("./nativeAuthPersistence");
}

describe("native launch sign-in check", () => {
  beforeEach(() => {
    store.clear();
    auth.getSession.mockReset();
    auth.setSession.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("existing app session -> signed in, and the phone copy is saved", async () => {
    const m = await load();
    auth.getSession.mockResolvedValue({ data: { session: session("r1") } });
    expect(await m.checkNativeSession()).toBe(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(JSON.parse(store.get(KEY)!).refresh_token).toBe("r1");
  });

  it("no app session but a phone copy -> restored, signed in, rotated token saved", async () => {
    const m = await load();
    store.set(KEY, JSON.stringify(session("old")));
    auth.getSession.mockResolvedValue({ data: { session: null } });
    auth.setSession.mockResolvedValue({ data: { session: session("new") }, error: null });
    expect(await m.checkNativeSession()).toBe(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(JSON.parse(store.get(KEY)!).refresh_token).toBe("new");
  });

  it("no session anywhere -> not signed in (goes to login)", async () => {
    const m = await load();
    auth.getSession.mockResolvedValue({ data: { session: null } });
    expect(await m.checkNativeSession()).toBe(false);
    expect(auth.setSession).not.toHaveBeenCalled();
  });

  it("dead phone copy -> cleared and not signed in", async () => {
    const m = await load();
    store.set(KEY, JSON.stringify(session("dead")));
    auth.getSession.mockResolvedValue({ data: { session: null } });
    auth.setSession.mockResolvedValue({
      data: { session: null },
      error: { message: "Invalid Refresh Token: Already Used" },
    });
    expect(await m.checkNativeSession()).toBe(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(store.has(KEY)).toBe(false);
  });

  it("network error during restore keeps the phone copy", async () => {
    const m = await load();
    store.set(KEY, JSON.stringify(session("keep")));
    auth.getSession.mockResolvedValue({ data: { session: null } });
    auth.setSession.mockResolvedValue({ data: { session: null }, error: { message: "Failed to fetch" } });
    expect(await m.checkNativeSession()).toBe(false);
    expect(store.has(KEY)).toBe(true);
  });

  it("launch check that throws resolves to not signed in (login, not blank)", async () => {
    const m = await load();
    auth.getSession.mockRejectedValue(new Error("boom"));
    expect(await m.checkNativeSession()).toBe(false);
  });

  it("existing session resolves at once even if the phone save never finishes", async () => {
    const m = await load();
    const prefs = (await import("@capacitor/preferences")).Preferences as unknown as { set: unknown };
    const orig = prefs.set;
    (prefs as { set: unknown }).set = () => new Promise(() => {});
    auth.getSession.mockResolvedValue({ data: { session: session("r9") } });
    const started = Date.now();
    expect(await m.checkNativeSession()).toBe(true);
    expect(Date.now() - started).toBeLessThan(100);
    (prefs as { set: unknown }).set = orig;
  });

  it("a stuck getSession gives up after 3 seconds -> login", async () => {
    vi.useFakeTimers();
    const m = await load();
    auth.getSession.mockReturnValue(new Promise(() => {}));
    const p = m.checkNativeSession();
    await vi.advanceTimersByTimeAsync(3001);
    expect(await p).toBe(false);
    vi.useRealTimers();
  });
});
