import "../../../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../data/supabase";

function TwoFactorAuth({ onClose, onEnabled }) {
    const [setupFactorId, setSetupFactorId] = useState("");
    const [setupQrCode, setSetupQrCode] = useState("");
    const [setupSecret, setSetupSecret] = useState("");
    const [setupCode, setSetupCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: "", text: "" });

    const withAuthLockRetry = async (callback, retries = 1) => {
        try {
            return await callback();
        } catch (error) {
            const isLockAbort =
                error?.name === "AbortError" ||
                String(error?.message || "").includes("Lock broken by another request");

            if (!isLockAbort || retries <= 0) {
                throw error;
            }

            await new Promise((resolve) => setTimeout(resolve, 200));
            return withAuthLockRetry(callback, retries - 1);
        }
    };

    const normalizeQrCodeSrc = (value) => {
        if (!value) return "";
        const trimmed = value.trim();

        if (trimmed.startsWith("data:image")) {
            return trimmed;
        }

        if (trimmed.startsWith("<svg")) {
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
        }

        return trimmed;
    };

    useEffect(() => {
        const onEsc = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [onClose]);

    useEffect(() => {
        let isMounted = true;

        const enroll2FA = async () => {
            setIsSubmitting(true);
            setStatus({ type: "", text: "" });

            const { data: factorsData, error: factorsError } = await withAuthLockRetry(() => supabase.auth.mfa.listFactors());
            if (!isMounted) return;

            if (factorsError) {
                setStatus({ type: "error", text: factorsError.message || "Failed to load MFA factors." });
                setIsSubmitting(false);
                return;
            }

            const verifiedTotpFactor = (factorsData?.totp || []).find((factor) => factor.status === "verified");
            if (verifiedTotpFactor) {
                setStatus({ type: "success", text: "2FA is already enabled for this account." });
                setIsSubmitting(false);
                return;
            }

            const unverifiedFactor = (factorsData?.totp || []).find((factor) => factor.status !== "verified");
            if (unverifiedFactor) {
                setSetupFactorId(unverifiedFactor.id);
            }

            const { data: enrollData, error: enrollError } = await withAuthLockRetry(() => supabase.auth.mfa.enroll({
                factorType: "totp",
                friendlyName: "Fleet Authenticator",
            }));

            if (!isMounted) return;

            if (enrollError || !enrollData?.id) {
                setStatus({ type: "error", text: enrollError?.message || "Failed to create 2FA setup." });
                setIsSubmitting(false);
                return;
            }

            setSetupFactorId(enrollData.id);
            setSetupQrCode(enrollData.totp?.qr_code || "");
            setSetupSecret(enrollData.totp?.secret || "");
            setIsSubmitting(false);
        };

        enroll2FA();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleConfirm = async (event) => {
        event.preventDefault();
        setStatus({ type: "", text: "" });

        if (!setupFactorId) {
            setStatus({ type: "error", text: "2FA factor is missing." });
            return;
        }

        if (setupCode.length !== 6) {
            setStatus({ type: "error", text: "Enter a valid 6-digit code." });
            return;
        }

        setIsSubmitting(true);

        const { data: challengeData, error: challengeError } = await withAuthLockRetry(() => supabase.auth.mfa.challenge({
            factorId: setupFactorId,
        }));

        if (challengeError || !challengeData?.id) {
            setStatus({ type: "error", text: challengeError?.message || "Failed to request verification challenge." });
            setIsSubmitting(false);
            return;
        }

        const { error: verifyError } = await withAuthLockRetry(() => supabase.auth.mfa.verify({
            factorId: setupFactorId,
            challengeId: challengeData.id,
            code: setupCode,
        }));

        if (verifyError) {
            setStatus({ type: "error", text: verifyError.message || "Invalid authenticator code." });
            setIsSubmitting(false);
            return;
        }

        setStatus({ type: "success", text: "2FA enabled successfully." });
        setIsSubmitting(false);

        if (onEnabled) {
            setTimeout(() => {
                onEnabled();
            }, 600);
        }
    };

    return (
        <div className="add-driver-form" onClick={onClose} style={{ zIndex: 1000 }}>
            <div
                className="add-driver-form___block"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: 520, width: "92%" }}
            >
                <div className="popup__title">
                    <h2>Two-Factor Authentication</h2>
                    <p onClick={onClose} style={{ cursor: "pointer" }}>Close</p>
                </div>

                <p className="description">Scan the QR code with Google Authenticator or Authy.</p>

                {setupQrCode ? (
                    <div style={{ display: "flex", justifyContent: "center", margin: "1em auto" }}>
                        <img
                            src={normalizeQrCodeSrc(setupQrCode)}
                            alt="2FA QR"
                            width={240}
                            height={240}
                            style={{
                                width: "240px",
                                height: "240px",
                                borderRadius: "8px",
                                backgroundColor: "#fff",
                                padding: "8px"
                            }}
                        />
                    </div>
                ) : (
                    <p className="description">Generating QR code...</p>
                )}

                {setupSecret && (
                    <p className="description" style={{ wordBreak: "break-all" }}>
                        Secret: {setupSecret}
                    </p>
                )}

                <form onSubmit={handleConfirm}>
                    <label className="signup_form__form--label" htmlFor="fleet-totp-code">Authenticator code</label>
                    <input
                        id="fleet-totp-code"
                        type="text"
                        inputMode="numeric"
                        className="signup_form__form--input"
                        placeholder="123456"
                        value={setupCode}
                        onChange={(event) => setSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                    />

                    {status.text && (
                        <p style={{ color: status.type === "success" ? "#16a34a" : "#dc2626", marginTop: 8 }}>
                            {status.text}
                        </p>
                    )}

                    <button
                        className="signup_form__form--button"
                        type="submit"
                        disabled={isSubmitting || !setupQrCode}
                        style={{ marginTop: 16 }}
                    >
                        {isSubmitting ? "Processing..." : "Confirm 2FA"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default TwoFactorAuth;