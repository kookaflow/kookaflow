import { c as createServerRpc } from "./createServerRpc-CnQPTA-J.js";
import { z } from "zod";
import { r as requireSupabaseAuth } from "./auth-middleware-DFGJyMRd.js";
import { g as getPlanConfig, a as getStripe } from "./stripe.server-DLwKer5H.js";
import { e as createServerFn, a as getRequestHost$1 } from "./server-DjzWdpJV.js";
import "@supabase/supabase-js";
import "./createMiddleware-BvN2ghIY.js";
import "stripe";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
const PlanSchema = z.object({
  plan: z.enum(["basic", "pro_monthly", "pro_yearly", "lifetime"])
});
function getOrigin() {
  try {
    const host = getRequestHost$1();
    if (host) return `https://${host}`;
  } catch {
  }
  return process.env.PUBLIC_BASE_URL ?? "https://localhost";
}
const createCheckoutSession_createServerFn_handler = createServerRpc({
  id: "c93cfd95f5d3975de7abe7bc53d15d9009664b9f5caa8f53100373f154b153c4",
  name: "createCheckoutSession",
  filename: "src/lib/stripe.functions.ts"
}, (opts) => createCheckoutSession.__executeServer(opts));
const createCheckoutSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => PlanSchema.parse(input)).handler(createCheckoutSession_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId,
    claims
  } = context;
  const plan = getPlanConfig(data.plan);
  const stripe = getStripe();
  const {
    data: profile
  } = await supabase.from("profiles").select("stripe_customer_id").eq("id", userId).maybeSingle();
  let customerId = profile?.stripe_customer_id ?? null;
  if (!customerId) {
    const email = claims?.email;
    const customer = await stripe.customers.create({
      email,
      metadata: {
        supabase_user_id: userId
      }
    });
    customerId = customer.id;
    await supabase.from("profiles").update({
      stripe_customer_id: customerId
    }).eq("id", userId);
  }
  const origin = getOrigin();
  const session = await stripe.checkout.sessions.create({
    mode: plan.mode,
    customer: customerId,
    line_items: [{
      price: plan.priceId,
      quantity: 1
    }],
    success_url: `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    allow_promotion_codes: true,
    client_reference_id: userId,
    metadata: {
      supabase_user_id: userId,
      plan: data.plan
    },
    ...plan.mode === "subscription" ? {
      subscription_data: {
        metadata: {
          supabase_user_id: userId,
          plan: data.plan
        }
      }
    } : {
      payment_intent_data: {
        metadata: {
          supabase_user_id: userId,
          plan: data.plan
        }
      }
    }
  });
  return {
    url: session.url,
    sessionId: session.id
  };
});
const createCustomerPortalSession_createServerFn_handler = createServerRpc({
  id: "d5f6b7ea417b54a5010d6555590bfda871639044b77900b583c2d529ac8d1933",
  name: "createCustomerPortalSession",
  filename: "src/lib/stripe.functions.ts"
}, (opts) => createCustomerPortalSession.__executeServer(opts));
const createCustomerPortalSession = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createCustomerPortalSession_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const stripe = getStripe();
  const {
    data: profile
  } = await supabase.from("profiles").select("stripe_customer_id").eq("id", userId).maybeSingle();
  if (!profile?.stripe_customer_id) {
    throw new Error("No Stripe customer on file for this user");
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: "https://kookaflow.com/more"
  });
  return {
    url: session.url
  };
});
export {
  createCheckoutSession_createServerFn_handler,
  createCustomerPortalSession_createServerFn_handler
};
