import md5 from "npm:js-md5@0.8.3";

export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const textResponse = (body: string, status = 200) =>
    new Response(body, {
        status,
        headers: {
            ...corsHeaders,
            "content-type": "text/plain; charset=utf-8",
        },
    });

export const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            ...corsHeaders,
            "content-type": "application/json; charset=utf-8",
        },
    });

export const normalizeAmount = (value: unknown) => {
    const numericValue = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
        return null;
    }

    return Math.round(numericValue);
};

export const generateOrderId = () => `idram_${Date.now()}_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

export const parseRequestPayload = async (request: Request) => {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await request.json();
    }

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        return Object.fromEntries(formData.entries());
    }

    const rawBody = await request.text();
    if (!rawBody) {
        return {};
    }

    try {
        return JSON.parse(rawBody);
    } catch {
        return Object.fromEntries(new URLSearchParams(rawBody).entries());
    }
};

const collectChecksumCandidates = (payload: Record<string, unknown>, secretKey: string) => {
    const billNo = String(payload.EDP_BILL_NO ?? payload.bill_no ?? payload.orderId ?? payload.order_id ?? "").trim();
    const amount = String(payload.EDP_AMOUNT ?? payload.amount ?? "").trim();
    const payerAccount = String(payload.EDP_PAYER_ACCOUNT ?? payload.payer_account ?? "").trim();
    const recAccount = String(payload.EDP_REC_ACCOUNT ?? payload.rec_account ?? "").trim();

    return [
        [billNo, amount, secretKey],
        [billNo, amount, recAccount, secretKey],
        [payerAccount, billNo, amount, secretKey],
        [payerAccount, amount, billNo, secretKey],
        [billNo, amount, payerAccount, recAccount, secretKey],
    ]
        .filter((parts) => parts.every(Boolean))
        .map((parts) => parts.join(""));
};

export const verifyIdramChecksum = (payload: Record<string, unknown>, secretKey: string) => {
    const receivedChecksum = String(payload.EDP_CHECKSUM ?? payload.checksum ?? "").trim().toLowerCase();

    if (!receivedChecksum || !secretKey) {
        return false;
    }

    return collectChecksumCandidates(payload, secretKey).some((candidate) => md5(candidate).toLowerCase() === receivedChecksum);
};

export const isPrecheckRequest = (payload: Record<string, unknown>) => {
    const values = [
        payload.EDP_PRECHECK,
        payload.precheck,
        payload.action,
        payload.command,
        payload.operation,
        payload.type,
        payload.EDP_OPERATION,
    ]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value).trim().toUpperCase());

    return values.some((value) => value === "YES" || value === "PRECHECK" || value.includes("PRECHECK"));
};

export const isConfirmationRequest = (payload: Record<string, unknown>) => {
    const values = [
        payload.EDP_CONFIRM,
        payload.confirm,
        payload.action,
        payload.command,
        payload.operation,
        payload.type,
        payload.EDP_OPERATION,
    ]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value).trim().toUpperCase());

    return values.some((value) => value.includes("PAY") || value.includes("CONFIRM") || value.includes("PURCHASE"));
};
