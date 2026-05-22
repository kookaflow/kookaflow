import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/kookaflow-logo.png";

export function LegalPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
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
          <Link to="/" className="flex items-center gap-2">
            <img
              src={logo}
              alt="Kookaflow"
              style={{ height: 36, width: "auto" }}
              className="object-contain"
            />
          </Link>
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
        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-a:text-primary">
          {children}
        </div>
        <div className="mt-10 flex items-center justify-between text-xs text-muted-foreground">
          <Link to="/login" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Back to sign in
          </Link>
          <LegalFooterLinks />
        </div>
      </main>
    </div>
  );
}

export function LegalFooterLinks() {
  return (
    <nav className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
      <a href="/privacy" className="hover:text-foreground hover:underline">Privacy</a>
      <span aria-hidden>·</span>
      <a href="/terms" className="hover:text-foreground hover:underline">Terms</a>
      <span aria-hidden>·</span>
      <a href="/support" className="hover:text-foreground hover:underline">Support</a>
    </nav>
  );
}