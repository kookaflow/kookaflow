import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/kookaflow-logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kookaflow — Find your flow, whatever your hours" },
      {
        name: "description",
        content:
          "Kookaflow is the shift calendar that cares about your whole life. Built for nurses, paramedics, and shift workers who want balance, not burnout.",
      },
      { property: "og:title", content: "Kookaflow — The shift worker life balance calendar" },
      {
        property: "og:description",
        content:
          "Track shifts, see your life balance, and get gentle nudges toward rest, wellness, and family.",
      },
    ],
  }),
  component: LandingPage,
});

const BRAND_GRADIENT =
  "linear-gradient(135deg, #251074 0%, #7e294d 45%, #fb862a 80%, #ffc338 100%)";

const FEATURES = [
  {
    icon: "🗓️",
    title: "Smart Shift Calendar",
    body: "Month, week and day views with a quick-add stamp panel.",
  },
  {
    icon: "📊",
    title: "Life Balance Dashboard",
    body: "See your balance score across work, rest, wellness and family.",
  },
  {
    icon: "🌿",
    title: "Wellness Nudges",
    body: "Gentle reminders to rest, exercise and connect with loved ones.",
  },
  {
    icon: "📧",
    title: "Daily Summaries",
    body: "Beautiful morning emails showing your day ahead.",
  },
  {
    icon: "📅",
    title: "Google Calendar Sync",
    body: "Import your Google Calendar alongside your shifts.",
  },
  {
    icon: "💰",
    title: "Earnings Tracker",
    body: "Automatically calculate your shift earnings.",
  },
];

const PLANS = [
  { name: "Free Trial", price: "14 days", sub: "Full access, no card required" },
  { name: "Basic", price: "$2.99", sub: "AUD / month" },
  { name: "Pro", price: "$4.99", sub: "AUD / month  •  or $29.99 / year" },
  { name: "Lifetime", price: "$59.99", sub: "AUD one-time" },
];

const PROFESSIONS = [
  { icon: "👩‍⚕️", label: "Nurses and midwives" },
  { icon: "🚑", label: "Paramedics and ambos" },
  { icon: "🏭", label: "Factory and manufacturing workers" },
  { icon: "🔒", label: "Security officers" },
  { icon: "🏨", label: "Hospitality staff" },
  { icon: "🚌", label: "Transport workers" },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section
        className="relative overflow-hidden px-6 pb-24 pt-16 text-white"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <img
            src={logo}
            alt="Kookaflow"
            className="mb-6 h-28 w-auto object-contain drop-shadow-lg sm:h-32"
          />
          <h1
            className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl md:text-7xl"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
          >
            Kookaflow
          </h1>
          <p className="mt-4 text-xl font-medium text-white/95 sm:text-2xl">
            Find your flow, whatever your hours
          </p>
          <p className="mt-5 max-w-2xl text-base text-white/90 sm:text-lg">
            The shift calendar that cares about your whole life, not just your shifts.
            Built for nurses, paramedics, and every shift worker who deserves better.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-[#251074] hover:bg-white/90 [background:white]">
              <Link to="/signup">Start Free 14-Day Trial</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/70 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a shift worker needs
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, fair pricing
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {p.name}
                </div>
                <div className="mt-3 text-3xl font-bold">{p.price}</div>
                <div className="mt-2 text-sm text-muted-foreground">{p.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Built for shift workers
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {PROFESSIONS.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="text-base">{p.label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-muted-foreground">
            And anyone working irregular hours.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="px-6 py-12 text-white"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <div className="text-2xl font-bold tracking-tight">Kookaflow</div>
          <p className="text-sm text-white/90">Find your flow, whatever your hours</p>
          <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/privacy" className="text-white/90 hover:text-white hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/90 hover:text-white hover:underline">
              Terms of Service
            </Link>
            <Link to="/support" className="text-white/90 hover:text-white hover:underline">
              Support
            </Link>
            <Link to="/login" className="text-white/90 hover:text-white hover:underline">
              Sign In
            </Link>
          </nav>
          <p className="mt-4 text-xs text-white/70">
            © {new Date().getFullYear()} Kookaflow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}