import "../App.css";
import { useEffect, useState } from "react";
import pageData from "../data/data.json";

export default function EmailOTP({ email, onVerify, onCancel, onResend }) {
    const otpText = pageData.content.settings.contactChangeOtp;
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");

    useEffect(() => {
        const onEsc = (event) => {
            if (event.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [onCancel]);

    const handleChange = (e) => {
        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (otp.length !== 6) {
            setError(otpText.status.invalidCode);
            return;
        }

        try {
            setSubmitting(true);
            await onVerify(otp);
        } catch (err) {
            setError(err?.message || otpText.errors.verifyFailed);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setInfo("");
        try {
            setResending(true);
            await onResend();
            setInfo(otpText.status.sent);
        } catch (err) {
            setError(err?.message || otpText.errors.sendFailed);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="add-driver-form ziroPos" onClick={onCancel} style={{ zIndex: 1000 }}>
            <div
                className="add-driver-form___block"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: 420, width: "92%" }}
            >
                <div className="popup__title">
                    <h2>{otpText.title}</h2>
                    <p onClick={onCancel} style={{ cursor: "pointer" }}>{otpText.close}</p>
                </div>

                <p className="get_otp__content--description">
                    {otpText.descriptionStart} <strong className="highlight">{email}</strong>{otpText.descriptionEnd}
                </p>

                <form onSubmit={handleSubmit}>
                    <label className="signup_form__form--label">{otpText.label}</label>
                    <input
                        className="signup_form__form--input"
                        type="text"
                        inputMode="numeric"
                        placeholder={otpText.placeholder}
                        value={otp}
                        onChange={handleChange}
                        maxLength={6}
                        autoFocus
                    />

                    {error && <p style={{ color: "#dc2626", margin: "8px 0 0" }}>{error}</p>}
                    {info && <p style={{ color: "#16a34a", margin: "8px 0 0" }}>{info}</p>}

                    <button
                        className="signup_form__form--button"
                        type="submit"
                        disabled={submitting}
                        style={{ marginTop: 16 }}
                    >
                        {submitting ? otpText.verifying : otpText.verify}
                    </button>

                    <p className="resend" onClick={resending ? undefined : handleResend} style={{ cursor: resending ? "default" : "pointer", textAlign: "center"}}>
                        {resending ? otpText.resending : otpText.resend}
                    </p>
                </form>
            </div>
        </div>
    );
}
