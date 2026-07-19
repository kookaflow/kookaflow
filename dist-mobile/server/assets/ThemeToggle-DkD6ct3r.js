import { jsx } from "react/jsx-runtime";
import { Sun, Moon } from "lucide-react";
import { d as usePreferences, B as Button } from "./router-CfW6Ca5m.js";
function ThemeToggle() {
  const { prefs, toggleMode } = usePreferences();
  const isDark = prefs.mode === "dark" || prefs.mode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  return /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: toggleMode, "aria-label": "Toggle theme", children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "size-4" }) : /* @__PURE__ */ jsx(Moon, { className: "size-4" }) });
}
export {
  ThemeToggle as T
};
