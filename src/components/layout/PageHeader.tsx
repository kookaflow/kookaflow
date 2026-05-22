import { Link } from "@tanstack/react-router";
import logo from "@/assets/kookaflow-logo.png";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Branded page header band — uses the active theme's gradient
 * (--page-header-from → --page-header-to) and finishes with an SVG wave
 * filled with --background so it flows into the content surface in both
 * light and dark modes.
 */
export function PageHeader({ title, subtitle, right, children }: PageHeaderProps) {
  return (
    <header
      className="relative w-full text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--page-header-from), var(--page-header-to))",
        minHeight: 140,
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 pb-10 pt-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <img
            src={logo}
            alt="Kookaflow"
            style={{ height: 36, width: "auto" }}
            className="object-contain"
          />
        </Link>
        {children ? <div className="flex items-center gap-2">{children}</div> : null}
        <div className="ml-auto flex items-center gap-2">{right}</div>
        <div className="w-full">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-xs text-white/80 sm:text-sm">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {/* Wave edge — fill resolves to the page background per theme/mode. */}
      <svg
        className="block w-full"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden
        style={{ display: "block", height: 32, color: "var(--background)" }}
      >
        <path
          d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z"
          fill="currentColor"
        />
      </svg>
    </header>
  );
}