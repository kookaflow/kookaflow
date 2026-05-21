import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface AuthFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  icon: LucideIcon;
  type?: string;
  /** Show a built-in show/hide toggle. Only valid when type === "password". */
  togglePassword?: boolean;
}

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ id, label, icon: Icon, type = "text", togglePassword, className, ...props }, ref) => {
    const [reveal, setReveal] = React.useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && togglePassword && reveal ? "text" : type;

    return (
      <div className="space-y-1.5">
        <Label htmlFor={id} className="text-foreground/80">
          {label}
        </Label>
        <div className="relative">
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={ref}
            id={id}
            type={effectiveType}
            className={cn(
              "flex h-11 w-full rounded-xl bg-secondary/70 pl-10 pr-10 text-sm text-foreground",
              "placeholder:text-muted-foreground/70 transition-shadow",
              "border border-transparent focus:outline-none focus:border-transparent",
              "focus:ring-2 focus:ring-ring/60 focus:bg-secondary",
              "disabled:cursor-not-allowed disabled:opacity-60",
              className,
            )}
            {...props}
          />
          {isPassword && togglePassword && (
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
            >
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
        </div>
      </div>
    );
  },
);
AuthField.displayName = "AuthField";

export function AuthSubmit({
  children,
  disabled,
  type = "submit",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "group relative inline-flex h-12 w-full items-center justify-center rounded-full",
        "text-sm font-semibold text-white shadow-md transition-all",
        "hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
        "disabled:opacity-60 disabled:pointer-events-none",
      )}
      style={{
        background:
          "linear-gradient(135deg, var(--auth-gradient-from) 0%, var(--auth-gradient-to) 100%)",
      }}
    >
      {children}
    </button>
  );
}