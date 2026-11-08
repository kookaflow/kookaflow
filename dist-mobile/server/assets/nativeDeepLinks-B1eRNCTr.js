import { toast } from "sonner";
import { S as SCOPE_MISSING_MESSAGE } from "./google-calendar.server-BJYB10a6.js";
import "crypto";
import "./client.server-U_pH-Evd.js";
import "@supabase/supabase-js";
async function registerNativeDeepLinks(queryClient) {
  const { Capacitor } = await import("@capacitor/core");
  if (!Capacitor.isNativePlatform()) return () => {
  };
  const { App } = await import("@capacitor/app");
  const handle = await App.addListener("appUrlOpen", async ({ url }) => {
    if (!url.startsWith("com.kookaflow.app://google-calendar")) return;
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.close();
    } catch {
    }
    const status = new URL(url.replace("com.kookaflow.app://", "https://app/")).searchParams.get(
      "status"
    );
    queryClient.invalidateQueries({ queryKey: ["google-connection-status"] });
    queryClient.invalidateQueries({ queryKey: ["google-events"] });
    if (status === "connected") toast.success("Google Calendar connected");
    else if (status === "scope_missing") toast.error(SCOPE_MISSING_MESSAGE, { duration: 8e3 });
    else toast.error("Google Calendar connection didn't finish — please try again");
  });
  return () => void handle.remove();
}
export {
  registerNativeDeepLinks
};
