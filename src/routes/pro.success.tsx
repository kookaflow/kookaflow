import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

export const Route = createFileRoute("/pro/success")({
  head: () => ({
    meta: [
      { title: "Welcome to Pro — Kookaflow" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProSuccessPage,
});

function ProSuccessPage() {
  const sub = useSubscription();

  // Webhook is async — poll the subscription state for ~10s after returning from Stripe.
  useEffect(() => {
    if (sub.tier === "pro" || sub.tier === "lifetime" || sub.tier === "basic") return;
    const id = setInterval(() => { void sub.refresh(); }, 1500);
    const timeout = setTimeout(() => clearInterval(id), 10_000);
    return () => { clearInterval(id); clearTimeout(timeout); };
  }, [sub]);

  const tierLabel =
    sub.tier === "lifetime" ? "Lifetime Pro" :
    sub.tier === "pro" ? "Pro" :
    sub.tier === "basic" ? "Basic" : "your plan";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">You're all set!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Thanks for upgrading to <span className="font-medium text-foreground">{tierLabel}</span>.
          Your account is being updated — this usually takes just a few seconds.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button asChild>
            <Link to="/calendar">
              <Sparkles className="mr-2 h-4 w-4" /> Go to your calendar
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link to="/settings">Manage subscription</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}