// @ts-nocheck

import { createClient } from "npm:@supabase/supabase-js@2.99.2";
import {
    isConfirmationRequest,
    isPrecheckRequest,
    jsonResponse,
    normalizeAmount,
    parseRequestPayload,
    textResponse,
    verifyIdramChecksum,
} from "../_shared/idram.ts";

Deno.serve(async (request) => {
    if (request.method === "OPTIONS") {
        return textResponse("OK");
    }

    if (request.method !== "POST") {
        return textResponse("Method not allowed", 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const idramSecretKey = Deno.env.get("IDRAM_SECRET_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceRoleKey || !idramSecretKey) {
        return jsonResponse({ error: "Supabase or Idram secrets are not configured" }, 500);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const payload = (await parseRequestPayload(request)) as Record<string, unknown>;

    if (!verifyIdramChecksum(payload, idramSecretKey)) {
        return textResponse("OK");
    }

    const orderId = String(payload.EDP_BILL_NO ?? payload.bill_no ?? payload.orderId ?? payload.order_id ?? "").trim();
    const amount = normalizeAmount(payload.EDP_AMOUNT ?? payload.amount);
    const transactionId = String(payload.EDP_TRANS_ID ?? payload.transaction_id ?? payload.trans_id ?? "").trim();

    if (!orderId) {
        return textResponse("OK");
    }

    const { data: orderRow, error: orderError } = await adminClient
        .from("idram_orders")
        .select("id, order_id, user_id, amount, status")
        .eq("order_id", orderId)
        .maybeSingle();

    if (orderError || !orderRow) {
        return textResponse("OK");
    }

    const incomingAmount = amount ?? Number(orderRow.amount ?? 0);
    if (Number.isFinite(Number(orderRow.amount)) && incomingAmount !== Number(orderRow.amount)) {
        return textResponse("OK");
    }

    if (isPrecheckRequest(payload)) {
        if (orderRow.status !== "prechecked" && orderRow.status !== "paid") {
            await adminClient
                .from("idram_orders")
                .update({
                    status: "prechecked",
                    prechecked_at: new Date().toISOString(),
                    raw_payload: payload,
                    updated_at: new Date().toISOString(),
                })
                .eq("order_id", orderId);
        }

        return textResponse("OK");
    }

    if (isConfirmationRequest(payload) || !isPrecheckRequest(payload)) {
        if (orderRow.status === "paid") {
            return textResponse("OK");
        }

        const { error: orderUpdateError } = await adminClient
            .from("idram_orders")
            .update({
                status: "paid",
                transaction_id: transactionId || null,
                raw_payload: payload,
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("order_id", orderId);

        if (orderUpdateError) {
            return textResponse("OK");
        }

        const { data: profileRow, error: profileError } = await adminClient
            .from("profiles")
            .select("userid, balance")
            .eq("userid", orderRow.user_id)
            .maybeSingle();

        if (!profileError && profileRow) {
            const currentBalance = Number(profileRow.balance ?? 0);
            const nextBalance = currentBalance + Number(orderRow.amount ?? incomingAmount ?? 0);

            await adminClient
                .from("profiles")
                .update({ balance: nextBalance })
                .eq("userid", orderRow.user_id);
        }
    }

    return textResponse("OK");
});
