// Edge Function: send-invite-code
// Emails a fleet driver invite code to the given address via Resend.
import { corsHeaders } from "../_shared/cors.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    return jsonResponse({ error: "Email service is not configured" }, 500);
  }

  try {
    const payload = await req.json();
    const email = String(payload.email || "").trim().toLowerCase();
    const inviteCode = String(payload.inviteCode || "").trim();
    const fleetName = String(payload.fleetName || "").trim();

    if (!email || !inviteCode) {
      return jsonResponse({ error: "Email and invite code are required" }, 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: "Please provide a valid email address" }, 400);
    }

    const greeting = fleetName ? `${fleetName} invited you to join WrapGo` : "You've been invited to join WrapGo";

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject: "Your WrapGo driver invite code",
        html: `
          <p>${greeting}.</p>
          <p>Your invite code is:</p>
          <h2 style="letter-spacing: 4px;">${inviteCode}</h2>
          <p>Enter this code in the WrapGo driver app to link your account.</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      return jsonResponse({ error: "Unable to deliver the invite code" }, 502);
    }

    return jsonResponse({ success: true }, 200);
  } catch {
    return jsonResponse({ error: "Unable to process the request" }, 500);
  }
});
