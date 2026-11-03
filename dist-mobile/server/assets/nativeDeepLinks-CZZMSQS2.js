import { toast } from "sonner";
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
    else toast.error("Google Calendar connection didn't finish — please try again");
  });
  return () => void handle.remove();
}
export {
  registerNativeDeepLinks
};
