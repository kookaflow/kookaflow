import logo from "@/assets/kookaflow-logo.png";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export function MoreHero() {
  return (
    <div
      className="relative mb-6 flex flex-col items-center justify-center overflow-hidden rounded-b-3xl text-center text-white shadow-lg"
      style={{
        height: 160,
        background:
          "radial-gradient(ellipse at 80% 20%, #ffc338 0%, #fb862a 25%, #7e294d 60%, #251074 100%)",
      }}
    >
      <div className="absolute top-3 right-3 z-20">
        <ThemeToggle />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4), transparent 60%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.25), transparent 55%)",
        }}
      />
      <img
        src={logo}
        alt="Kookaflow"
        style={{ height: 52, width: "auto" }}
        className="relative z-10 object-contain drop-shadow"
      />
      <p
        className="relative z-10 mt-2 px-4 text-white/95"
        style={{
          fontSize: 14,
          fontWeight: 400,
          letterSpacing: "0.3px",
        }}
      >
        Find your flow, whatever your hours
      </p>
      <svg
        aria-hidden
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute -bottom-px left-0 h-[40px] w-full text-background"
      >
        <path
          d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
