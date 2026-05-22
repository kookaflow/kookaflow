import { Link } from "@tanstack/react-router";
import { ChevronRight, FileText, HelpCircle, Scale, Share2, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

const SHARE_TEXT =
  "I use Kookaflow to manage my shifts and find my flow — find your flow too! kookaflow.com";

const APP_STORE_URL = "#"; // placeholder until live

export function AboutSection() {
  async function share() {
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share({ title: "Kookaflow", text: SHARE_TEXT });
        return;
      } catch {
        // user cancelled — fall through
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_TEXT);
      toast.success("Share message copied to clipboard");
    } catch {
      toast.error("Couldn't open share sheet");
    }
  }

  return (
    <section className="mb-10">
      <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        About
      </h2>
      <Card className="overflow-hidden p-0">
        <RowLink to="/privacy" icon={<ShieldCheck size={18} />} label="Privacy Policy" />
        <Divider />
        <RowLink to="/terms" icon={<FileText size={18} />} label="Terms of Service" />
        <Divider />
        <RowLink to="/support" icon={<HelpCircle size={18} />} label="Support & Help" />
        <Divider />
        <RowLink to="/eula" icon={<Scale size={18} />} label="EULA" />
        <Divider />
        <RowExternal href={APP_STORE_URL} icon={<Star size={18} />} label="Rate Kookaflow ⭐" />
        <Divider />
        <RowButton onClick={share} icon={<Share2 size={18} />} label="Share Kookaflow" />
      </Card>
      <div className="mt-3 space-y-0.5 text-center text-[11px] text-muted-foreground">
        <div>App Version v1.0.0</div>
        <div>© 2026 Kookaflow</div>
      </div>
    </section>
  );
}

function Divider() {
  return <div className="mx-4 h-px bg-border" />;
}

function RowShell({ icon, label, trailing }: { icon: React.ReactNode; label: string; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 text-sm font-medium">{label}</div>
      {trailing ?? <ChevronRight className="size-4 text-muted-foreground" />}
    </div>
  );
}

function RowLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="block transition-colors hover:bg-accent/40">
      <RowShell icon={icon} label={label} />
    </Link>
  );
}

function RowExternal({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className="block transition-colors hover:bg-accent/40">
      <RowShell icon={icon} label={label} />
    </a>
  );
}

function RowButton({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick} className="block w-full text-left transition-colors hover:bg-accent/40">
      <RowShell icon={icon} label={label} />
    </button>
  );
}