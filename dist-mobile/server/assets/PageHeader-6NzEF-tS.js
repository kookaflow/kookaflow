import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { l as logo } from "./router-CfW6Ca5m.js";
function PageHeader({ title, subtitle, right, children }) {
  return /* @__PURE__ */ jsxs(
    "header",
    {
      className: "relative w-full text-white",
      style: {
        background: "linear-gradient(135deg, var(--page-header-from), var(--page-header-to))",
        minHeight: 140
      },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 pb-10 pt-4 sm:px-6", children: [
          /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "flex items-center gap-2 shrink-0", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: logo,
              alt: "Kookaflow",
              style: { height: 36, width: "auto" },
              className: "object-contain"
            }
          ) }),
          children ? /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children }) : null,
          /* @__PURE__ */ jsx("div", { className: "ml-auto flex items-center gap-2", children: right }),
          /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold tracking-tight text-white sm:text-2xl", children: title }),
            subtitle ? /* @__PURE__ */ jsx("p", { className: "text-xs text-white/80 sm:text-sm", children: subtitle }) : null
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "block w-full",
            viewBox: "0 0 1440 60",
            preserveAspectRatio: "none",
            "aria-hidden": true,
            style: { display: "block", height: 32, color: "var(--background)" },
            children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z",
                fill: "currentColor"
              }
            )
          }
        )
      ]
    }
  );
}
export {
  PageHeader as P
};
