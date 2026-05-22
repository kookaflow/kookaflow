import { useEffect, useState } from "react";

/**
 * Detects browser online/offline status using window events.
 *
 * - When offline: shows an amber banner that can't be dismissed.
 * - When connection returns: briefly shows a green "Back online" banner
 *   for 3 seconds, then hides itself.
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);

    const goOffline = () => setIsOnline(false);
    const goOnline = () => {
      setIsOnline((prev) => {
        if (!prev) setShowRecovered(true);
        return true;
      });
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  useEffect(() => {
    if (!showRecovered) return;
    const t = setTimeout(() => setShowRecovered(false), 3000);
    return () => clearTimeout(t);
  }, [showRecovered]);

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 flex h-9 w-full items-center justify-center bg-[#F59E0B] px-4 text-[13px] font-bold text-white"
      >
        You're offline — changes will sync when you reconnect
      </div>
    );
  }

  if (showRecovered) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 flex h-9 w-full items-center justify-center bg-[#10B981] px-4 text-[13px] font-bold text-white animate-in fade-in slide-in-from-top-2 duration-200"
      >
        Back online — syncing... ✓
      </div>
    );
  }

  return null;
}