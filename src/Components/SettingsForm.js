import "../App.css";
import { useState, useEffect } from "react";
import { getUser, updateProfile, sendEmailOtp, verifyEmailOtp, updateUserEmailImmediate } from "../data/service";
import pageData from "../data/data.json";
import EmailOTP from "./EmailOTP";

// dbKeys that require re-verification of the account owner via an OTP sent to the current email.
const SENSITIVE_KEYS = ["email", "phone"];

// Formats digits into "+CCC XX XXXXXX" (3-digit country code, e.g. +374 XX XXXXXX).
const formatPhoneMask = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (!digits) return "";

    let result = `+${digits.slice(0, 3)}`;
    if (digits.length > 3) result += ` ${digits.slice(3, 5)}`;
    if (digits.length > 5) result += ` ${digits.slice(5, 11)}`;
    return result;
};

function SettingsForm({title, description, data}) {
    const formText = pageData.content.settings.formCommon;
    const otpText = pageData.content.settings.contactChangeOtp;
    const [formValues, setFormValues] = useState({});
    const [initialValues, setInitialValues] = useState({});
    const [status, setStatus] = useState(null); // "success" | "error" | null
    const [pendingChange, setPendingChange] = useState(null); // { oldEmail, safeFormValues, emailChanged }
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const initial = {};
        data.forEach(item => { initial[item.dbKey] = item.value || ""; });
        setFormValues(initial);
        setInitialValues(initial);
    }, [data]);

    const handleChange = (dbKey, value) => {
        const nextValue = dbKey === "phone" ? formatPhoneMask(value) : value;
        setFormValues(prev => ({ ...prev, [dbKey]: nextValue }));
    };

    const applyProfileUpdate = async (safeFormValues) => {
        const { data: { user } } = await getUser();
        if (!user) return { error: { message: otpText.errors.sessionMissing } };
        return updateProfile(user.id, safeFormValues);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);
        setSaving(true);

        try {
            const { data: { user } } = await getUser();
            if (!user) return;

            // userid must never be written through this form
            const { userid: _userid, ...withoutUserId } = formValues;

            const hasSensitiveChange = SENSITIVE_KEYS.some(
                (key) => key in formValues && formValues[key] !== initialValues[key]
            );

            if (hasSensitiveChange) {
                const { error } = await sendEmailOtp(user.email);
                if (error) {
                    console.error(error.message);
                    setStatus("error");
                    return;
                }

                setPendingChange({
                    oldEmail: user.email,
                    safeFormValues: withoutUserId,
                    emailChanged: formValues.email !== initialValues.email,
                });
                return;
            }

            // Email can only be changed via the OTP-verified flow above.
            const { email: _email, ...safeFormValues } = withoutUserId;
            const { error } = await applyProfileUpdate(safeFormValues);

            if (error) {
                console.error(error.message);
                setStatus("error");
                return;
            }
            setStatus("success");
        } finally {
            setSaving(false);
        }
    };

    const handleOtpVerify = async (code) => {
        setSaving(true);
        try {
            const { oldEmail, safeFormValues, emailChanged } = pendingChange;

            const { error: verifyError } = await verifyEmailOtp(oldEmail, code);
            if (verifyError) {
                throw new Error(otpText.errors.verifyFailed);
            }

            if (emailChanged) {
                const { error: authError } = await updateUserEmailImmediate(safeFormValues.email);
                if (authError) {
                    throw new Error(authError.message || otpText.errors.updateFailed);
                }
            }

            const { error: profileError } = await applyProfileUpdate(safeFormValues);
            if (profileError) {
                throw new Error(profileError.message || otpText.errors.updateFailed);
            }

            setInitialValues((prev) => ({ ...prev, ...safeFormValues }));
            setPendingChange(null);
            setStatus("success");
        } finally {
            setSaving(false);
        }
    };

    const handleOtpResend = async () => {
        const { error } = await sendEmailOtp(pendingChange.oldEmail);
        if (error) {
            throw new Error(error.message || otpText.errors.sendFailed);
        }
    };

    return (
        <div className="settings-form">
            <h2 className="settings-form__title title">{title}</h2>
            <p className="settings-form__description description">{description}</p>
            <form className="settings-form__form" onSubmit={handleSubmit}>
                {
                    data.map((item, index) => (
                        <div className="settings-form__group" key={index}>
                            <label className="settings-form__label signup_form__form--label">{item.title}</label>
                            {item.options ? (
                                <select
                                    className="settings-form__input signup_form__form--input"
                                    value={formValues[item.dbKey] ?? ""}
                                    onChange={(e) => handleChange(item.dbKey, e.target.value)}
                                >
                                    <option value="">{formText.selectPrefix} {item.title.toLowerCase()}</option>
                                    {item.options.map((option, optIndex) => (
                                        <option key={optIndex} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : item.dbKey === "phone" ? (
                                <input
                                    type="tel"
                                    inputMode="tel"
                                    className="settings-form__input signup_form__form--input"
                                    placeholder={pageData.content.settings.profileFields.phonePlaceholder}
                                    value={formValues[item.dbKey] ?? ""}
                                    onChange={(e) => handleChange(item.dbKey, e.target.value)}
                                    maxLength={16}
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="settings-form__input signup_form__form--input"
                                    placeholder={`${formText.enterPrefix} ${item.title.toLowerCase()}`}
                                    value={formValues[item.dbKey] ?? ""}
                                    onChange={(e) => handleChange(item.dbKey, e.target.value)}
                                />
                            )}
                        </div>
                    ))
                }
                {status === "success" && <p className="settings-form__status settings-form__status--success">{formText.status.success}</p>}
                {status === "error" && <p className="settings-form__status settings-form__status--error">{formText.status.error}</p>}
                <button type="submit" className="settings-form__button overview__header--button" disabled={saving}>
                    {saving && <span className="button-spinner"></span>}
                    {saving ? formText.saving : formText.saveChanges}
                </button>
            </form>
            {pendingChange && (
                <EmailOTP
                    email={pendingChange.oldEmail}
                    onVerify={handleOtpVerify}
                    onResend={handleOtpResend}
                    onCancel={() => setPendingChange(null)}
                />
            )}
        </div>
    );
}

export default SettingsForm;
