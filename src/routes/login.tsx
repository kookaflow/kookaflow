import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthField, AuthSubmit } from "@/components/auth/AuthField";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Kookaflow" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/calendar" });
  };

  const sendReset = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setResetting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetting(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email for a reset link");
  };

  return (
    <AuthShell
      tagline={<>Welcome back <span aria-hidden>👋</span></>}
      subtitle="Find your flow, whatever your hours"
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="auth-field-in" style={{ animationDelay: "0ms" }}>
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
        <div className="auth-field-in" style={{ animationDelay: "80ms" }}>
          <AuthField
            id="password"
            label="Password"
            icon={Lock}
            type="password"
            togglePassword
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <div className="auth-field-in flex justify-end" style={{ animationDelay: "160ms" }}>
          <button
            type="button"
            onClick={sendReset}
            disabled={resetting}
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot your password?
          </button>
        </div>

        <div className="auth-field-in pt-1" style={{ animationDelay: "240ms" }}>
          <AuthSubmit disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </AuthSubmit>
        </div>

        <div className="auth-field-in relative py-2" style={{ animationDelay: "320ms" }}>
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground">or</span>
          </div>
        </div>

        <p className="auth-field-in text-center text-xs text-muted-foreground" style={{ animationDelay: "400ms" }}>
          🔒 Secure • Private • No ads
        </p>

        <p className="auth-field-in text-center text-sm text-muted-foreground" style={{ animationDelay: "480ms" }}>
          New to Kookaflow?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}