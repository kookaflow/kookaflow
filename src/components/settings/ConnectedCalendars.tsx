import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGoogleConnectionStatus,
  disconnectGoogleCalendar,
  triggerGoogleSync,
  getGoogleAuthUrl,
} from "@/lib/google-calendar.functions";
import { CalendarCheck2, RefreshCw, Unplug, AlertTriangle, Coffee } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useUpgradePrompt } from "@/components/subscription/useUpgradePrompt";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#34A853"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#EA4335"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export function ConnectedCalendars() {
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getGoogleConnectionStatus);
  const disconnect = useServerFn(disconnectGoogleCalendar);
  const triggerSync = useServerFn(triggerGoogleSync);
  const fetchAuthUrl = useServerFn(getGoogleAuthUrl);
  const [connecting, setConnecting] = useState(false);
  const { requirePro, upgradeModal } = useUpgradePrompt();

  const { data: status, isLoading } = useQuery({
    queryKey: ["google-connection-status"],
    queryFn: () => fetchStatus(),
    staleTime: 5 * 60_000,
  });

  // Refresh on return from OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google") === "connected") {
      qc.invalidateQueries({ queryKey: ["google-connection-status"] });
      qc.invalidateQueries({ queryKey: ["google-events"] });
      toast.success("Google Calendar connected");
      params.delete("google");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params}` : "") +
        window.location.hash;
      window.history.replaceState({}, "", newUrl);
    }
  }, [qc]);

  const syncMut = useMutation({
    onError: (e) => {
      console.error("[google] sync request failed", e);
      toast.dismiss("google-sync");
      toast.error("Sync didn't finish — please try again.");
    },
    mutationFn: () => {
      toast.message(
        "Syncing your calendar — this may take a few minutes depending on how many events you have ☕",
        { icon: <Coffee className="size-4" />, duration: 8000, id: "google-sync" },
      );
      return triggerSync();
    },
    onSuccess: (res) => {
      toast.dismiss("google-sync");
      if (res.ok) {
        toast.success(
          `Synced ${res.imported} event${res.imported === 1 ? "" : "s"}${
            res.removed ? `, removed ${res.removed}` : ""
          }`,
        );
      } else {
        toast.error(res.error ?? "Sync didn't finish — we'll retry automatically.");
      }
      qc.invalidateQueries({ queryKey: ["google-connection-status"] });
      qc.invalidateQueries({ queryKey: ["google-events"] });
    },
  });

  const disconnectMut = useMutation({
    onError: (e) => {
      console.error("[google] disconnect failed", e);
      toast.error("Couldn't disconnect Google Calendar — please try again.");
    },
    mutationFn: () => disconnect(),
    onSuccess: () => {
      toast.success("Google Calendar disconnected");
      qc.invalidateQueries({ queryKey: ["google-connection-status"] });
      qc.invalidateQueries({ queryKey: ["google-events"] });
    },
  });

  const handleConnect = async () => {
    if (!requirePro("Google Calendar sync")) return;
    setConnecting(true);
    try {
      let native = false;
      if (import.meta.env.VITE_IS_MOBILE_BUILD === true) {
        const { Capacitor } = await import("@capacitor/core");
        native = Capacitor.isNativePlatform();
      }
      const res = await fetchAuthUrl({ data: { native } });
      const url = res && typeof res === "object" ? (res as { url?: unknown }).url : undefined;
      if (typeof url !== "string" || !url.startsWith("https://accounts.google.com/")) {
        throw new Error("Couldn't start Google connection — please try again");
      }
      if (native) {
        // Google blocks sign-in inside app web views; use the system browser.
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url, presentationStyle: "popover" });
        setConnecting(false);
        return;
      }
      window.location.href = url;
    } catch (e) {
      setConnecting(false);
      console.error("[google] connect failed", e);
      toast.error("Couldn't start Google connection — please try again.");
    }
  };

  return (
    <section className="mb-6">
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Connected Calendars
      </h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GoogleLogo className="size-5" />
            Google Calendar
          </CardTitle>
          <CardDescription>
            Import your Google Calendar events alongside your shifts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : status?.connected ? (
            <>
              <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgb(16,185,129)]" />
                  <div>
                    <p className="text-sm font-medium">
                      Connected{status.googleEmail ? ` as ${status.googleEmail}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {status.lastSyncedAt
                        ? `Last synced ${formatDistanceToNow(new Date(status.lastSyncedAt), { addSuffix: true })}`
                        : "Not synced yet"}
                    </p>
                  </div>
                </div>
                <CalendarCheck2 className="size-5 text-emerald-500" />
              </div>

              {status.needsReconnect ? (
                <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>
                      Google needs you to reconnect Kookaflow. When Google asks, tick the box
                      to let Kookaflow see your calendar.
                    </span>
                  </div>
                  <Button size="sm" onClick={handleConnect} disabled={connecting} className="gap-2">
                    <GoogleLogo className="size-4" />
                    {connecting ? "Opening Google…" : "Reconnect"}
                  </Button>
                </div>
              ) : status.lastSyncError ? (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{status.lastSyncError}</span>
                </div>
              ) : null}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncMut.mutate()}
                  disabled={syncMut.isPending}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`size-4 ${syncMut.isPending ? "animate-spin" : ""}`}
                  />
                  {syncMut.isPending ? "Syncing…" : "Sync now"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        "Disconnect Google Calendar? Your imported events will be removed from Kookaflow.",
                      )
                    )
                      disconnectMut.mutate();
                  }}
                  disabled={disconnectMut.isPending}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Unplug className="size-4" />
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Import your Google Calendar events into Kookaflow.
              </p>
              <Button
                onClick={handleConnect}
                disabled={connecting}
                variant="outline"
                className="gap-2 bg-background"
              >
                <GoogleLogo className="size-4" />
                {connecting ? "Connecting…" : "Connect"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {upgradeModal}
    </section>
  );
}