import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoUrl from "@/assets/kookaflow-logo.png";

const DISMISS_KEY = "kookaflow.push.dismissedAt";
const DISMISS_DAYS = 7;

function recentlyDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function PushPermissionPrompt() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "default") return;
    if (recentlyDismissed()) return;
    const t = window.setTimeout(() => setOpen(true), 1500);
    return () => window.clearTimeout(t);
  }, []);

  if (!open) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const enable = async () => {
    setBusy(true);
    try {
      await OneSignal.Notifications.requestPermission();
    } catch (e) {
      console.error("Permission request failed", e);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6 animate-in slide-in-from-bottom-8 duration-300">
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Kookaflow" className="h-10 w-auto" />
        </div>
        <div className="mt-3 flex items-start gap-3">
          <div className="rounded-full bg-amber-500/15 p-2">
            <Bell className="h-8 w-8 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">
              Never miss a shift 🦅
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Enable notifications to get reminders before your shifts start and
              your daily summary each morning.
            </p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Button
            onClick={enable}
            disabled={busy}
            className="w-full bg-gradient-to-r from-[hsl(var(--brand-navy,231_56%_27%))] to-amber-500 text-white hover:opacity-95"
            style={{
              backgroundImage:
                "linear-gradient(to right, #1E2A6E, #F59E0B)",
            }}
          >
            {busy ? "Asking…" : "Enable notifications"}
          </Button>
          <button
            type="button"
            onClick={dismiss}
            className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}