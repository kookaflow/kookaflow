import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { EyeOff, Eye } from "lucide-react";
import { c as cn } from "./router-BND-OwId.js";
import { L as Label } from "./label-DyyUUh84.js";
const AuthField = React.forwardRef(
  ({ id, label, icon: Icon, type = "text", togglePassword, className, ...props }, ref) => {
    const [reveal, setReveal] = React.useState(false);
    const isPassword = type === "password";
    const effectiveType = isPassword && togglePassword && reveal ? "text" : type;
    return /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: id, className: "text-foreground/80", children: label }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Icon, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            ref,
            id,
            type: effectiveType,
            className: cn(
              "flex h-11 w-full rounded-xl bg-secondary/70 pl-10 pr-10 text-sm text-foreground",
              "placeholder:text-muted-foreground/70 transition-shadow",
              "border border-transparent focus:outline-none focus:border-transparent",
              "focus:ring-2 focus:ring-ring/60 focus:bg-secondary",
              "disabled:cursor-not-allowed disabled:opacity-60",
              className
            ),
            ...props
          }
        ),
        isPassword && togglePassword && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setReveal((v) => !v),
            "aria-label": reveal ? "Hide password" : "Show password",
            className: "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground",
            children: reveal ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" })
          }
        )
      ] })
    ] });
  }
);
AuthField.displayName = "AuthField";
function AuthSubmit({
  children,
  disabled,
  type = "submit"
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type,
      disabled,
      className: cn(
        "group relative inline-flex h-12 w-full items-center justify-center rounded-full",
        "text-sm font-semibold text-white shadow-md transition-all",
        "hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0",
        "disabled:opacity-60 disabled:pointer-events-none"
      ),
      style: {
        background: "linear-gradient(135deg, var(--auth-gradient-from) 0%, var(--auth-gradient-to) 100%)"
      },
      children
    }
  );
}
export {
  AuthField as A,
  AuthSubmit as a
};
