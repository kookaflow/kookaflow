import { jsx } from "react/jsx-runtime";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { c as cn, b as createSsrRpc } from "./router-CfW6Ca5m.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
import { e as createServerFn } from "./server-CYeycCdn.js";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const getGoogleConnectionStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("03305b83649e1831dd1875753e29a022ce70ccfa45058b8b329d58c53bd34205"));
const disconnectGoogleCalendar = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("f47001c7b50d728b7b3afdc065fde20eb6a1496fdb3f7485068f8b1565984b1a"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  enabled: z.boolean()
}).parse(input)).handler(createSsrRpc("66589359688c511d93d7e14904fcfd9e016d7460f9d6a0cf87662bed87f1726e"));
const triggerGoogleSync = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("0e7ccde1a5a5fcb40fbb52b075197f107de282f6f00c538cd58410467c564313"));
const listGoogleEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  from: z.string().optional(),
  to: z.string().optional()
}).parse(input ?? {})).handler(createSsrRpc("a50a554d47691af745399865673e1edd0aa80e647e41a5d97bdfd1e24bde50e2"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  eventId: z.string().uuid()
}).parse(input)).handler(createSsrRpc("fc2944345a6748985f57af6831ef33a0fcf1e970a9eca1433283d98844653598"));
createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
  googleEventId: z.string()
}).parse(input)).handler(createSsrRpc("f6acea5009bac50036700a6ce377760abf3af61c45a745efac22b9596b0275ea"));
const getGoogleAuthUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("a29e741db0385b31d8cce65589be80a5c3b2f55c2c335dd8c718186314a5eef7"));
export {
  Switch as S,
  getGoogleAuthUrl as a,
  disconnectGoogleCalendar as d,
  getGoogleConnectionStatus as g,
  listGoogleEvents as l,
  triggerGoogleSync as t
};
