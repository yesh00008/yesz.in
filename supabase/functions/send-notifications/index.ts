// Send email notifications
// deno run --allow-net https://supabase.example.com/functions/send-notifications

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { userId, type, title, message, actionUrl } = await req.json();

    // Create notification
    const { error: notifError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
          action_url: actionUrl,
        },
      ]);

    if (notifError) throw notifError;

    // Get user email and preferences
    const { data: user } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    const { data: subscription } = await supabase
      .from("email_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (
      !user?.email ||
      !subscription ||
      subscription.frequency === "never"
    ) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "notifications@yeszz.in",
        to: user.email,
        subject: title,
        html: `
          <h2>${title}</h2>
          <p>${message || ""}</p>
          ${
            actionUrl
              ? `<a href="${actionUrl}" style="color: #3b82f6; text-decoration: none;">View More</a>`
              : ""
          }
        `,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Email send failed:", await emailResponse.text());
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
