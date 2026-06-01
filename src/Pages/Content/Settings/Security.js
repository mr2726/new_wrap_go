import "../../../App.css";
import { useEffect, useState } from "react";
import {
  getUser,
  getProfileField,
  updateProfile,
  mfaListFactors,
  mfaUnenroll,
  mfaEnroll,
  mfaChallenge,
  mfaVerify,
  updateUserPassword,
} from "../../../data/service";
import pageData from "../../../data/data.json";

function Security() {
    const securityData = pageData.content.settings.security;
    const twoFaData = securityData.twoFa;
    const passwordData = securityData.password;
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
            const { data: authData, error: authError } = await getUser();
            if (!isMounted) return;

            if (authError || !authData?.user) {
                setIs2FALoading(false);
                if (authError) {
                    setSecurityStatus({ type: "error", text: authError.message });
                }
                return;
            }

            const { data: profile, error } = await getProfileField(authData.user.id, "auntufication");

            if (!isMounted) return;

            if (error) {
                setSecurityStatus({ type: "error", text: error.message || twoFaData.errors.loadFailed });
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
    }, [twoFaData.errors.loadFailed]);

    const persist2FAFlag = async (enabled) => {
        const { data: authData, error: authError } = await getUser();
        if (authError || !authData?.user) {
            throw new Error(authError?.message || twoFaData.errors.userNotAuthenticated);
        }

        const { error } = await updateProfile(authData.user.id, { auntufication: enabled });

        if (error) {
            throw new Error(error.message || twoFaData.errors.updateFailed);
        }
    };

    const handleDisable2FA = async () => {
        const { data: factorsData, error: factorsError } = await mfaListFactors();
        if (factorsError) {
            throw new Error(factorsError.message || twoFaData.errors.loadFactorsFailed);
        }

        const verifiedTotpFactors = (factorsData?.totp || []).filter((factor) => factor.status === "verified");
        for (const factor of verifiedTotpFactors) {
            const { error } = await mfaUnenroll(factor.id);
            if (error) {
                throw new Error(error.message || twoFaData.errors.disableFactorFailed);
            }
        }

        await persist2FAFlag(false);
        setIs2FAEnabled(false);
        setSecurityStatus({ type: "success", text: twoFaData.status.disabled });
    };

    const handleEnable2FA = async () => {
        const { data: factorsData, error: factorsError } = await mfaListFactors();
        if (factorsError) {
            throw new Error(factorsError.message || twoFaData.errors.loadFactorsFailed);
        }

        const verifiedTotpFactor = (factorsData?.totp || []).find((factor) => factor.status === "verified");
        if (verifiedTotpFactor) {
            await persist2FAFlag(true);
            setIs2FAEnabled(true);
            setSecurityStatus({ type: "success", text: twoFaData.status.enabled });
            return;
        }

        const { data: enrollData, error: enrollError } = await mfaEnroll("totp", twoFaData.friendlyName);

        if (enrollError || !enrollData?.id) {
            throw new Error(enrollError?.message || twoFaData.errors.setupCreateFailed);
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
                text: error instanceof Error ? error.message : twoFaData.errors.toggleFailed,
            });
        } finally {
            setIs2FASubmitting(false);
        }
    };

    const handleConfirm2FASetup = async (event) => {
        event.preventDefault();
        setSecurityStatus({ type: "", text: "" });

        if (!setupFactorId) {
            setSecurityStatus({ type: "error", text: twoFaData.errors.factorMissing });
            return;
        }

        if (setupCode.length !== 6) {
            setSecurityStatus({ type: "error", text: twoFaData.errors.invalidCode });
            return;
        }

        setIs2FASubmitting(true);

        const { data: challengeData, error: challengeError } = await mfaChallenge(setupFactorId);

        if (challengeError || !challengeData?.id) {
            setSecurityStatus({ type: "error", text: challengeError?.message || twoFaData.errors.challengeFailed });
            setIs2FASubmitting(false);
            return;
        }

        const { error: verifyError } = await mfaVerify(setupFactorId, challengeData.id, setupCode);

        if (verifyError) {
            setSecurityStatus({ type: "error", text: verifyError.message || twoFaData.errors.verifyFailed });
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
            setSecurityStatus({ type: "success", text: twoFaData.status.enabledSuccess });
        } catch (error) {
            setSecurityStatus({
                type: "error",
                text: error instanceof Error ? error.message : twoFaData.errors.persistFailed,
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
            setStatus({ type: "error", text: passwordData.errors.minLength });
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setStatus({ type: "error", text: passwordData.errors.missingUpper });
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            setStatus({ type: "error", text: passwordData.errors.missingLower });
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            setStatus({ type: "error", text: passwordData.errors.missingDigit });
            return;
        }

        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            setStatus({ type: "error", text: passwordData.errors.missingSymbol });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: "error", text: passwordData.errors.mismatch });
            return;
        }

        setIsSubmitting(true);

        const { error } = await updateUserPassword(newPassword);

        if (error) {
            setStatus({ type: "error", text: error.message || passwordData.errors.updateFailed });
            setIsSubmitting(false);
            return;
        }

        setStatus({ type: "success", text: passwordData.status.changed });
        setIsSubmitting(false);
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="settings__block">
            <div className="notification__block--wrapper">
                <h1 className="title">{securityData.title}</h1>

                <div className="changePassword">
                    <div className="changePassword__content">
                        <h2 className="second__title">{twoFaData.title}</h2>
                        <p className="description">{twoFaData.description}</p>
                    </div>
                    <button
                        className="signup_form__form--button changePassword__button"
                        onClick={handleToggle2FA}
                        disabled={is2FALoading || is2FASubmitting}
                    >
                        {is2FALoading ? twoFaData.loading : is2FAEnabled ? twoFaData.disable : twoFaData.enable}
                    </button>
                </div>

                {securityStatus.type === "success" && <p className="settings-form__status settings-form__status--success">{securityStatus.text}</p>}
                {securityStatus.type === "error" && <p className="settings-form__status settings-form__status--error">{securityStatus.text}</p>}

                <div className="changePassword">
                    <div className="changePassword__content">
                        <h2 className="second__title">{passwordData.title}</h2>
                        <p className="description">{passwordData.description}</p>
                    </div>
                    <button className="signup_form__form--button changePassword__button" onClick={openModal}>{passwordData.submit}</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal__content security-modal" onClick={(event) => event.stopPropagation()}>
                        <h2 className="modal__title">{passwordData.modalTitle}</h2>
                        <p className="modal__text">{passwordData.modalText}</p>

                        <form className="security-modal__form" onSubmit={handleChangePassword}>
                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="newPassword">{passwordData.newLabel}</label>
                                <br />
                                <input
                                    id="newPassword"
                                    type="password"
                                    className="signup_form__form--input"
                                    placeholder={passwordData.newPlaceholder}
                                    value={newPassword}
                                    style={{
                                        width: "100%"
                                    }}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="confirmPassword">{passwordData.confirmLabel}</label>
                                <br />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="signup_form__form--input"
                                    placeholder={passwordData.confirmPlaceholder}
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
                                    {passwordData.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="security-modal__button signup_form__form--button"
                                    disabled={isSubmitting}
                                    style={{ padding: "0.5em 1.5em" }}
                                >
                                    {isSubmitting ? passwordData.submitting : passwordData.submit}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {is2FASetupOpen && (
                <div className="modal" onClick={() => !is2FASubmitting && setIs2FASetupOpen(false)}>
                    <div className="modal__content security-modal" onClick={(event) => event.stopPropagation()}>
                        <h2 className="modal__title">{twoFaData.setupTitle}</h2>
                        <p className="modal__text">{twoFaData.setupDescription}</p>

                        {setupQrCode ? (
                            <div style={{ display: "flex", justifyContent: "center", margin: "1em auto" }}>
                                <img
                                    src={normalizeQrCodeSrc(setupQrCode)}
                                    alt={twoFaData.qrAlt}
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
                                {twoFaData.secretPrefix} {setupSecret}
                            </p>
                        )}

                        <form className="security-modal__form" onSubmit={handleConfirm2FASetup}>
                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="totpCode">{twoFaData.authCodeLabel}</label>
                                <br />
                                <input
                                    id="totpCode"
                                    type="text"
                                    inputMode="numeric"
                                    className="signup_form__form--input"
                                    placeholder={twoFaData.authCodePlaceholder}
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
                                    {twoFaData.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="security-modal__button signup_form__form--button"
                                    disabled={is2FASubmitting}
                                    style={{ padding: "0.5em 1.5em" }}
                                >
                                    {is2FASubmitting ? twoFaData.verifying : twoFaData.confirm}
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