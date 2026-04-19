import "../../../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../data/supabase";

function Security() {
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(true);
    const [is2FASubmitting, setIs2FASubmitting] = useState(false);
    const [securityStatus, setSecurityStatus] = useState({ type: "", text: "" });
    const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
    const [setupFactorId, setSetupFactorId] = useState("");
    const [setupQrCode, setSetupQrCode] = useState("");
    const [setupSecret, setSetupSecret] = useState("");
    const [setupCode, setSetupCode] = useState("");

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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState({ type: "", text: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const load2FAState = async () => {
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (!isMounted) return;

            if (authError || !authData?.user) {
                setIs2FALoading(false);
                if (authError) {
                    setSecurityStatus({ type: "error", text: authError.message });
                }
                return;
            }

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("auntufication")
                .eq("userid", authData.user.id)
                .maybeSingle();

            if (!isMounted) return;

            if (error) {
                setSecurityStatus({ type: "error", text: error.message || "Failed to load 2FA settings." });
                setIs2FALoading(false);
                return;
            }

            setIs2FAEnabled(Boolean(profile?.auntufication));
            setIs2FALoading(false);
        };

        load2FAState();

        return () => {
            isMounted = false;
        };
    }, []);

    const persist2FAFlag = async (enabled) => {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
            throw new Error(authError?.message || "User is not authenticated.");
        }

        const { error } = await supabase
            .from("profiles")
            .update({ auntufication: enabled })
            .eq("userid", authData.user.id);

        if (error) {
            throw new Error(error.message || "Failed to update 2FA setting.");
        }
    };

    const handleDisable2FA = async () => {
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) {
            throw new Error(factorsError.message || "Failed to load MFA factors.");
        }

        const verifiedTotpFactors = (factorsData?.totp || []).filter((factor) => factor.status === "verified");
        for (const factor of verifiedTotpFactors) {
            const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
            if (error) {
                throw new Error(error.message || "Failed to disable authenticator factor.");
            }
        }

        await persist2FAFlag(false);
        setIs2FAEnabled(false);
        setSecurityStatus({ type: "success", text: "2FA disabled." });
    };

    const handleEnable2FA = async () => {
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) {
            throw new Error(factorsError.message || "Failed to load MFA factors.");
        }

        const verifiedTotpFactor = (factorsData?.totp || []).find((factor) => factor.status === "verified");
        if (verifiedTotpFactor) {
            await persist2FAFlag(true);
            setIs2FAEnabled(true);
            setSecurityStatus({ type: "success", text: "2FA enabled." });
            return;
        }

        const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
            factorType: "totp",
            friendlyName: "Google Authenticator",
        });

        if (enrollError || !enrollData?.id) {
            throw new Error(enrollError?.message || "Failed to create Google Authenticator setup.");
        }

        setSetupFactorId(enrollData.id);
        setSetupQrCode(enrollData.totp?.qr_code || "");
        setSetupSecret(enrollData.totp?.secret || "");
        setSetupCode("");
        setIs2FASetupOpen(true);
        setSecurityStatus({ type: "", text: "" });
    };

    const handleToggle2FA = async () => {
        if (is2FALoading || is2FASubmitting) return;

        setIs2FASubmitting(true);
        setSecurityStatus({ type: "", text: "" });

        try {
            if (is2FAEnabled) {
                await handleDisable2FA();
            } else {
                await handleEnable2FA();
            }
        } catch (error) {
            setSecurityStatus({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to change 2FA setting.",
            });
        } finally {
            setIs2FASubmitting(false);
        }
    };

    const handleConfirm2FASetup = async (event) => {
        event.preventDefault();
        setSecurityStatus({ type: "", text: "" });

        if (!setupFactorId) {
            setSecurityStatus({ type: "error", text: "2FA factor is missing." });
            return;
        }

        if (setupCode.length !== 6) {
            setSecurityStatus({ type: "error", text: "Enter a valid 6-digit code." });
            return;
        }

        setIs2FASubmitting(true);

        const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
            factorId: setupFactorId,
        });

        if (challengeError || !challengeData?.id) {
            setSecurityStatus({ type: "error", text: challengeError?.message || "Failed to request verification challenge." });
            setIs2FASubmitting(false);
            return;
        }

        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId: setupFactorId,
            challengeId: challengeData.id,
            code: setupCode,
        });

        if (verifyError) {
            setSecurityStatus({ type: "error", text: verifyError.message || "Invalid authenticator code." });
            setIs2FASubmitting(false);
            return;
        }

        try {
            await persist2FAFlag(true);
            setIs2FAEnabled(true);
            setIs2FASetupOpen(false);
            setSetupCode("");
            setSetupFactorId("");
            setSetupQrCode("");
            setSetupSecret("");
            setSecurityStatus({ type: "success", text: "2FA enabled successfully." });
        } catch (error) {
            setSecurityStatus({
                type: "error",
                text: error instanceof Error ? error.message : "Failed to persist 2FA setting.",
            });
        } finally {
            setIs2FASubmitting(false);
        }
    };

    const resetModalState = () => {
        setNewPassword("");
        setConfirmPassword("");
        setStatus({ type: "", text: "" });
        setIsSubmitting(false);
    };

    const openModal = () => {
        resetModalState();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetModalState();
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setStatus({ type: "", text: "" });

        if (newPassword.length < 8) {
            setStatus({ type: "error", text: "Password must be at least 8 characters long." });
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one uppercase letter." });
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one lowercase letter." });
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one digit." });
            return;
        }

        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one special symbol." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: "error", text: "Passwords do not match." });
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setStatus({ type: "error", text: error.message || "Failed to update password." });
            setIsSubmitting(false);
            return;
        }

        setStatus({ type: "success", text: "Password changed successfully." });
        setIsSubmitting(false);
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="settings__block">
            <div className="notification__block--wrapper">
                <h1 className="title">Security Settings</h1>

                <div className="changePassword">
                    <div className="changePassword__content">
                        <h2 className="second__title">Google Authenticator 2FA</h2>
                        <p className="description">Use 6-digit TOTP code on each sign in.</p>
                    </div>
                    <button
                        className="signup_form__form--button changePassword__button"
                        onClick={handleToggle2FA}
                        disabled={is2FALoading || is2FASubmitting}
                    >
                        {is2FALoading ? "Loading..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </button>
                </div>

                {securityStatus.type === "success" && <p className="settings-form__status settings-form__status--success">{securityStatus.text}</p>}
                {securityStatus.type === "error" && <p className="settings-form__status settings-form__status--error">{securityStatus.text}</p>}

                <div className="changePassword">
                    <div className="changePassword__content">
                        <h2 className="second__title">Change Password</h2>
                        <p className="description">Update your password regularly to keep your account secure.</p>
                    </div>
                    <button className="signup_form__form--button changePassword__button" onClick={openModal}>Change Password</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal__content security-modal" onClick={(event) => event.stopPropagation()}>
                        <h2 className="modal__title">Change Password</h2>
                        <p className="modal__text">Enter your new password and confirm it to update your account credentials.</p>

                        <form className="security-modal__form" onSubmit={handleChangePassword}>
                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="newPassword">New Password</label>
                                <br />
                                <input
                                    id="newPassword"
                                    type="password"
                                    className="signup_form__form--input"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    style={{
                                        width: "100%"
                                    }}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="confirmPassword">Confirm New Password</label>
                                <br />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="signup_form__form--input"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    style={{
                                        width: "100%"
                                    }}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                />
                            </div>

                            {status.type === "success" && <p className="settings-form__status settings-form__status--success">{status.text}</p>}
                            {status.type === "error" && <p className="settings-form__status settings-form__status--error">{status.text}</p>}

                            <div className="security-modal__actions">
                                <button
                                    type="button"
                                    className="security-modal__button security-modal__button--ghost"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="security-modal__button signup_form__form--button"
                                    disabled={isSubmitting}
                                    style={{ padding: "0.5em 1.5em" }}
                                >
                                    {isSubmitting ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {is2FASetupOpen && (
                <div className="modal" onClick={() => !is2FASubmitting && setIs2FASetupOpen(false)}>
                    <div className="modal__content security-modal" onClick={(event) => event.stopPropagation()}>
                        <h2 className="modal__title">Set up Google Authenticator</h2>
                        <p className="modal__text">Scan QR in Google Authenticator and enter the 6-digit code.</p>

                        {setupQrCode ? (
                            <div style={{ display: "flex", justifyContent: "center", margin: "1em auto" }}>
                                <img
                                    src={normalizeQrCodeSrc(setupQrCode)}
                                    alt="Google Authenticator QR"
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
                        ) : null}

                        {setupSecret && (
                            <p className="description" style={{ wordBreak: "break-all" }}>
                                Secret: {setupSecret}
                            </p>
                        )}

                        <form className="security-modal__form" onSubmit={handleConfirm2FASetup}>
                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="totpCode">Authenticator Code</label>
                                <br />
                                <input
                                    id="totpCode"
                                    type="text"
                                    inputMode="numeric"
                                    className="signup_form__form--input"
                                    placeholder="123456"
                                    value={setupCode}
                                    style={{ width: "100%" }}
                                    onChange={(event) => setSetupCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                />
                            </div>

                            <div className="security-modal__actions">
                                <button
                                    type="button"
                                    className="security-modal__button security-modal__button--ghost"
                                    onClick={() => setIs2FASetupOpen(false)}
                                    disabled={is2FASubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="security-modal__button signup_form__form--button"
                                    disabled={is2FASubmitting}
                                    style={{ padding: "0.5em 1.5em" }}
                                >
                                    {is2FASubmitting ? "Verifying..." : "Confirm"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Security;