import { useEffect, useState } from "react";
import logo from "@/assets/shiftsync-logo.png";

export function SplashScreen({ duration = 1500 }: { duration?: number }) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), duration);
    const t2 = setTimeout(() => setVisible(false), duration + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        background: "linear-gradient(160deg, #1E2A6E 0%, #6B35CC 100%)",
        opacity: fade ? 0 : 1,
        pointerEvents: fade ? "none" : "auto",
      }}
    >
      <img
        src={logo}
        alt="ShiftSync"
        style={{ height: 120, width: "auto" }}
        className="object-contain"
      />
      <div className="mt-4 text-3xl font-bold tracking-tight text-white">
        ShiftSync
      </div>
    </div>
  );
}