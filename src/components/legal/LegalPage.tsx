import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/kookaflow-logo.png";
import { APP_STORE_URL, PLAY_STORE_URL, SHOW_GOOGLE_PLAY_BUTTON } from "@/lib/externalLinks";

/** True when the page was opened from the phone app's in-app browser (?from=app). */
export function useFromApp(): boolean {
  const [fromApp, setFromApp] = useState(false);
  useEffect(() => {
    setFromApp(new URLSearchParams(window.location.search).get("from") === "app");
  }, []);
  return fromApp;
}

export function LegalPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const fromApp = useFromApp();
  const logoImg = (
    <img
      src={logo}
      alt="Kookaflow"
      style={{ height: 36, width: "auto" }}
      className="overflow-hidden rounded-[22%] object-contain"
    />
  );
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header
        className="relative w-full text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--page-header-from), var(--page-header-to))",
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-10 pt-6 sm:px-6">
          {fromApp ? (
            <div className="flex items-center gap-2">{logoImg}</div>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              {logoImg}
            </Link>
          )}
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-white/80">{subtitle}</p>
          ) : null}
        </div>
        <svg
          className="block w-full"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          aria-hidden
          style={{ display: "block", height: 32, color: "var(--background)" }}
        >
          <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" fill="currentColor" />
        </svg>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="legal-content space-y-4 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:text-foreground">
          {children}
        </div>
        {fromApp ? (
          <div className="mt-10 flex justify-end">
            <LegalFooterLinks />
          </div>
        ) : import.meta.env.VITE_IS_MOBILE_BUILD ? (
          <div className="mt-10 flex items-center justify-between text-xs text-muted-foreground">
            <Link to="/more" className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Back to app
            </Link>
            <LegalFooterLinks />
          </div>
        ) : (
          <LegalSiteFooter />
        )}
      </main>
    </div>
  );
}

/** Website footer: official store badges (unaltered artwork) plus site navigation. */
function LegalSiteFooter() {
  return (
    <footer className="mt-12 border-t border-border pt-8 text-center">
      <p className="mb-4 text-sm font-medium text-foreground">Get Kookaflow on your phone</p>
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
          <img src="/badges/app-store-badge.svg" alt="Download on the App Store" style={{ height: 56, width: "auto" }} />
        </a>
        {SHOW_GOOGLE_PLAY_BUTTON ? (
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
            <img src="/badges/google-play-badge.png" alt="Get it on Google Play" style={{ height: 83, width: "auto" }} />
          </a>
        ) : null}
      </div>
      <nav className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground hover:underline">Home</Link>
        <span aria-hidden>·</span>
        <Link to="/login" className="hover:text-foreground hover:underline">Sign in</Link>
        <span aria-hidden>·</span>
        <Link to="/privacy" className="hover:text-foreground hover:underline">Privacy</Link>
        <span aria-hidden>·</span>
        <Link to="/terms" className="hover:text-foreground hover:underline">Terms</Link>
        <span aria-hidden>·</span>
        <Link to="/support" className="hover:text-foreground hover:underline">Support</Link>
      </nav>
    </footer>
  );
}

export function LegalFooterLinks() {
  const fromApp = useFromApp();
  const q = fromApp ? "?from=app" : "";
  if (fromApp) {
    return (
      <nav className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
        <a href={`/privacy${q}`} className="hover:text-foreground hover:underline">Privacy</a>
        <span aria-hidden>·</span>
        <a href={`/terms${q}`} className="hover:text-foreground hover:underline">Terms</a>
        <span aria-hidden>·</span>
        <a href={`/support${q}`} className="hover:text-foreground hover:underline">Support</a>
      </nav>
    );
  }
  return (
    <nav className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
      <Link to="/privacy" className="hover:text-foreground hover:underline">Privacy</Link>
      <span aria-hidden>·</span>
      <Link to="/terms" className="hover:text-foreground hover:underline">Terms</Link>
      <span aria-hidden>·</span>
      <Link to="/support" className="hover:text-foreground hover:underline">Support</Link>
    </nav>
  );
}
