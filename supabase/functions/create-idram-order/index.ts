// @ts-nocheck

import { createClient } from "npm:@supabase/supabase-js@2.99.2";
import { generateOrderId, jsonResponse, normalizeAmount, textResponse } from "../_shared/idram.ts";

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return textResponse("OK");
    }

    if (request.method !== "POST") {
        return textResponse("Method not allowed", 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
        return jsonResponse({ error: "Supabase environment variables are not configured" }, 500);
    }

    const authHeader = request.headers.get("Authorization") ?? "";
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: authHeader,
            },
        },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: userData, error: userError } = await authClient.auth.getUser();
    if (userError || !userData?.user) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await request.json().catch(() => ({}));
    const amount = normalizeAmount(body.amount);

    if (!amount || amount < 1000) {
        return jsonResponse({ error: "Invalid amount" }, 400);
    }

    const orderId = generateOrderId();
    const description = String(body.description ?? "Balance topup");

    const { error: insertError } = await adminClient.from("idram_orders").insert({
        order_id: orderId,
        user_id: userData.user.id,
        amount,
        status: "created",
        payment_method: "idram",
        description,
        raw_payload: body,
    });

    if (insertError) {
        return jsonResponse({ error: insertError.message }, 500);
    }

    return jsonResponse({ orderId, amount });
});
