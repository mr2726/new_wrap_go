import { corsHeaders } from "../_shared/cors.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") ?? "";
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

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return jsonResponse({ error: "Contact service is not configured" }, 500);
  }

  try {
    const payload = await req.json();
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim().toLowerCase();
    const subject = String(payload.subject || "").trim();
    const message = String(payload.message || "").trim();

    if (!name || !email || !subject || !message) {
      return jsonResponse({ error: "Name, email, subject, and message are required" }, 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      return jsonResponse({ error: "Please provide a valid email address" }, 400);
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `New Contact Form Submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`,
        }),
      },
    );

    if (!telegramResponse.ok) {
      return jsonResponse({ error: "Unable to deliver your message" }, 502);
    }

    return jsonResponse({ success: true }, 200);
  } catch {
    return jsonResponse({ error: "Unable to process your message" }, 500);
  }
});
