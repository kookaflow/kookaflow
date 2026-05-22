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
          "linear-gradient(160deg, var(--auth-gradient-from) 0%, var(--auth-gradient-to) 100%)",
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
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {tagline}
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-xs text-sm text-white/80">{subtitle}</p>
          )}
        </div>

        {/* Curved wave separator */}
        <svg
          aria-hidden
          viewBox="0 0 390 60"
          preserveAspectRatio="none"
          className="absolute -bottom-px left-0 h-[60px] w-full text-card"
        >
          <path
            d="M0,40 C90,80 180,0 270,30 C330,50 360,40 390,30 L390,60 L0,60 Z"
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