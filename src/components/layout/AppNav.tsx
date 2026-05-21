import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarDays, LayoutDashboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/shiftsync-logo.png";

const NAV_ITEMS = [
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col border-r border-border bg-card md:flex lg:w-56">
        <div className="flex items-center gap-2 px-5 py-5">
          <img
            src={logo}
            alt="ShiftSync"
            style={{ height: 48, width: "auto" }}
            className="object-contain"
          />
          <span className="text-lg font-bold tracking-tight">ShiftSync</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-card shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.15)] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-[22px]", active && "text-primary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}