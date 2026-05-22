import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock, ShieldCheck, User } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, AuthSubmit } from "@/components/auth/AuthField";
import { LegalFooterLinks } from "@/components/legal/LegalPage";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create account — Kookaflow" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords don't match");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/calendar`,
        data: { full_name: fullName },
      },
    });
    if (error) {
      setLoading(false);
      return toast.error(error.message);
    }
    // Seed full_name on profile if session ready
    if (data.user) {
      await supabase.from("profiles").update({ full_name: fullName }).eq("id", data.user.id);
    }
    setLoading(false);
    if (data.session) navigate({ to: "/onboarding" });
    else toast.success("Check your email to confirm your account");
  };

  return (
    <AuthShell
      tagline={<>Find your flow, whatever your hours <span aria-hidden>✨</span></>}
      subtitle="Join thousands of shift workers managing life better"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="auth-field-in" style={{ animationDelay: "0ms" }}>
          <AuthField
            id="name"
            label="Full name"
            icon={User}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Alex Morgan"
          />
        </div>
        <div className="auth-field-in" style={{ animationDelay: "80ms" }}>
          <AuthField
            id="email"
            label="Email"
            icon={Mail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <div className="auth-field-in" style={{ animationDelay: "160ms" }}>
          <AuthField
            id="password"
            label="Password"
            icon={Lock}
            type="password"
            togglePassword
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </div>
        <div className="auth-field-in" style={{ animationDelay: "240ms" }}>
          <AuthField
            id="confirm"
            label="Confirm password"
            icon={ShieldCheck}
            type="password"
            togglePassword
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            placeholder="Re-enter password"
          />
        </div>

        <p
          className="auth-field-in text-center text-xs font-medium text-emerald-600 dark:text-emerald-400"
          style={{ animationDelay: "320ms" }}
        >
          ✓ Free to start &nbsp; ✓ No credit card required &nbsp; ✓ Cancel anytime
        </p>

        <div className="auth-field-in pt-1" style={{ animationDelay: "400ms" }}>
          <AuthSubmit disabled={loading}>
            {loading ? "Creating…" : "Create Account"}
          </AuthSubmit>
        </div>

        <p
          className="auth-field-in text-center text-[11px] leading-relaxed text-muted-foreground"
          style={{ animationDelay: "480ms" }}
        >
          By creating an account you agree to our{" "}
          <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
        </p>

        <p
          className="auth-field-in text-center text-sm text-muted-foreground"
          style={{ animationDelay: "560ms" }}
        >
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <div className="auth-field-in pt-2" style={{ animationDelay: "640ms" }}>
          <LegalFooterLinks />
        </div>
      </form>
    </AuthShell>
  );
}