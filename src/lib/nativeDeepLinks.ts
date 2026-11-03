import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Native-only: handle com.kookaflow.app://google-calendar?status=... links that
 * the Google OAuth callback page opens after the server-side token exchange.
 * Returns a cleanup function. No-op on web.
 */
export async function registerNativeDeepLinks(queryClient: QueryClient): Promise<() => void> {
  if (import.meta.env.VITE_IS_MOBILE_BUILD !== true) return () => {};
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return () => {};
  const { App } = await import("@capacitor/app");
  const handle = await App.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith("com.kookaflow.app://google-calendar")) return;
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.close();
    } catch {
      /* browser may already be closed */
    }
    const status = new URL(url.replace("com.kookaflow.app://", "https://app/")).searchParams.get(
      "status",
    );
    queryClient.invalidateQueries({ queryKey: ["google-connection-status"] });
    queryClient.invalidateQueries({ queryKey: ["google-events"] });
    if (status === "connected") toast.success("Google Calendar connected");
    else toast.error("Google Calendar connection didn't finish — please try again");
  });
  return () => void handle.remove();
}
