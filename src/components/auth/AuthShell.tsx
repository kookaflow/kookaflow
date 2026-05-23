import type { ReactNode } from "react";
import logo from "@/assets/kookaflow-logo.png";

export function AuthShell({
  tagline,
  subtitle,
  children,
}: {
  tagline: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 80% 20%, #ffc338 0%, #fb862a 25%, #7e294d 60%, #251074 100%)",
      }}
    >
      {/* Header (~40vh) */}
      <header className="relative flex min-h-[40vh] flex-col items-center justify-center px-6 pb-16 pt-12 text-white">
        {/* Floating decorative shapes */}
        <div
          aria-hidden
          className="auth-float-a pointer-events-none absolute left-6 top-10 size-20 rounded-full bg-white/30 blur-2xl"
        />
        <div
          aria-hidden
          className="auth-float-b pointer-events-none absolute right-8 top-16 size-[50px] rounded-full bg-white/40 blur-xl"
        />
        <div
          aria-hidden
          className="auth-float-c pointer-events-none absolute left-10 top-1/2 size-[30px] rounded-full"
          style={{ background: "var(--auth-accent)" }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Kookaflow"
            style={{ height: 100, width: "auto" }}
            className="mb-4 object-contain"
          />
          <h1
            className="font-bold leading-tight tracking-tight text-white"
            style={{ fontSize: 24, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}
          >
            {tagline}
          </h1>
          {subtitle && (
            <p
              className="mt-2 max-w-xs"
              style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.85)" }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Smooth symmetrical wave separator */}
        <svg
          aria-hidden
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="absolute -bottom-px left-0 h-[80px] w-full text-card"
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="currentColor"
          />
        </svg>
      </header>

      {/* Card section */}
      <main className="relative -mt-6 flex-1 bg-card px-6 pb-12 pt-8 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.18)]" style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
        <div className="auth-card-in mx-auto w-full max-w-sm">
          {children}
        </div>
      </main>
    </div>
  );
}