import { b as createSsrRpc } from "./router-CfW6Ca5m.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-COIRGScg.js";
import { e as createServerFn } from "./server-CYeycCdn.js";
const PlanSchema = z.object({
  plan: z.enum(["basic", "pro_monthly", "pro_yearly", "lifetime"])
});
const createCheckoutSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => PlanSchema.parse(input)).handler(createSsrRpc("c93cfd95f5d3975de7abe7bc53d15d9009664b9f5caa8f53100373f154b153c4"));
const createCustomerPortalSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("d5f6b7ea417b54a5010d6555590bfda871639044b77900b583c2d529ac8d1933"));
export {
  createCustomerPortalSession as a,
  createCheckoutSession as c
};
