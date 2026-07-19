import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { l as logo } from "./router-CfW6Ca5m.js";
function LegalPage({
  title,
  subtitle,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxs(
      "header",
      {
        className: "relative w-full text-white",
        style: {
          background: "linear-gradient(135deg, var(--page-header-from), var(--page-header-to))"
        },
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-10 pt-6 sm:px-6", children: [
            /* @__PURE__ */ jsx(Link, { to: "/", className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: logo,
                alt: "Kookaflow",
                style: { height: 36, width: "auto" },
                className: "object-contain"
              }
            ) }),
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight sm:text-3xl", children: title }),
            subtitle ? /* @__PURE__ */ jsx("p", { className: "text-sm text-white/80", children: subtitle }) : null
          ] }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: "block w-full",
              viewBox: "0 0 1440 60",
              preserveAspectRatio: "none",
              "aria-hidden": true,
              style: { display: "block", height: 32, color: "var(--background)" },
              children: /* @__PURE__ */ jsx("path", { d: "M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z", fill: "currentColor" })
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl px-4 py-8 sm:px-6", children: [
      /* @__PURE__ */ jsx("div", { className: "legal-content space-y-4 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline [&_strong]:text-foreground", children }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 flex items-center justify-between text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/login", className: "inline-flex items-center gap-1 hover:text-foreground", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "size-3.5" }),
          " Back to sign in"
        ] }),
        /* @__PURE__ */ jsx(LegalFooterLinks, {})
      ] })
    ] })
  ] });
}
function LegalFooterLinks() {
  return /* @__PURE__ */ jsxs("nav", { className: "flex items-center justify-center gap-3 text-[11px] text-muted-foreground", children: [
    /* @__PURE__ */ jsx(Link, { to: "/privacy", className: "hover:text-foreground hover:underline", children: "Privacy" }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "·" }),
    /* @__PURE__ */ jsx(Link, { to: "/terms", className: "hover:text-foreground hover:underline", children: "Terms" }),
    /* @__PURE__ */ jsx("span", { "aria-hidden": true, children: "·" }),
    /* @__PURE__ */ jsx(Link, { to: "/support", className: "hover:text-foreground hover:underline", children: "Support" })
  ] });
}
export {
  LegalPage as L,
  LegalFooterLinks as a
};
