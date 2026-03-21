// supabase/functions/stripe-webhook/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

    if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !stripeWebhookSecret) {
      return new Response(
        JSON.stringify({ error: "Missing required environment secrets" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10",
    });

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.text();

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        session.metadata?.supabase_user_id ||
        session.subscription_details?.metadata?.supabase_user_id ||
        "";

      const plan =
        session.metadata?.plan ||
        session.subscription_details?.metadata?.plan ||
        "monthly";

      const customerId = typeof session.customer === "string" ? session.customer : "";
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : "";
      const customerEmail = session.customer_details?.email || session.customer_email || "";

      if (userId) {
        await supabaseAdmin.from("payments").upsert({
          user_id: userId,
          email: customerEmail,
          payment_type: "premium_membership",
          provider: "stripe",
          plan,
          status: "paid",
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          stripe_checkout_session_id: session.id,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        await supabaseAdmin
          .from("creator_profiles")
          .upsert({
            user_id: userId,
            premium_member: true,
            membership_plan: plan,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        await supabaseAdmin
          .from("profiles")
          .update({
            premium_member: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            premium_member: true,
            is_premium: true,
            membership_plan: plan,
            plan,
          },
        });
      }
    }

    if (
      event.type === "customer.subscription.deleted" ||
      event.type === "customer.subscription.updated"
    ) {
      const subscription = event.data.object as Stripe.Subscription;

      const status = subscription.status;
      const userId = subscription.metadata?.supabase_user_id || "";
      const plan = subscription.metadata?.plan || "";

      if (userId) {
        const premiumActive = status === "active" || status === "trialing";

        await supabaseAdmin
          .from("creator_profiles")
          .upsert({
            user_id: userId,
            premium_member: premiumActive,
            membership_plan: premiumActive ? plan : null,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        await supabaseAdmin
          .from("profiles")
          .update({
            premium_member: premiumActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            premium_member: premiumActive,
            is_premium: premiumActive,
            membership_plan: premiumActive ? plan : null,
            plan: premiumActive ? plan : null,
          },
        });

        await supabaseAdmin
          .from("payments")
          .update({
            status: premiumActive ? "paid" : "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown webhook error",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});