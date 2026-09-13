import "../App.css";
import { useEffect, useState } from "react";
import { MdLockReset } from "react-icons/md";
import { getUser, resendSignupEmail, verifySignupEmailOtp } from "../data/service";
import { resolveAuthPage } from "../data/accountRouting";

function ConfirmEmail ({data, setPage, email, onConfirmed}){
    const [resolvedEmail, setResolvedEmail] = useState(email || "");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (email) {
            setResolvedEmail(email);
            return;
        }

        const loadUserEmail = async () => {
            const { data: authData } = await getUser();
            if (authData?.user?.email) {
                setResolvedEmail(authData.user.email);
            }
        };

        loadUserEmail();
    }, [email]);

    const handleCodeChange = (e) => {
        setCode(e.target.value.replace(/\D/g, "").slice(0, 8));
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setInfo("");

        if (code.length !== 8) {
            setError(data.errors.invalidCode);
            return;
        }

        setSubmitting(true);
        try {
            const { data: verifyData, error: verifyError } = await verifySignupEmailOtp(resolvedEmail, code);

            if (verifyError || !verifyData?.session) {
                setError(verifyError?.message || data.errors.verifyFailed);
                return;
            }

            onConfirmed?.();
            const nextPage = await resolveAuthPage(verifyData.session);
            setPage(nextPage);
        } catch (verifyError) {
            setError(verifyError?.message || data.errors.verifyFailed);
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setInfo("");
        setResending(true);
        try {
            const { error: resendError } = await resendSignupEmail(resolvedEmail);
            if (resendError) {
                setError(resendError.message || data.errors.sendFailed);
                return;
            }
            setInfo(data.status.sent);
        } catch (resendError) {
            setError(resendError?.message || data.errors.sendFailed);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="confirm">
            <div className="get_otp">
                <div className="get_otp__content">
                    <div className="get_otp__content--icon"><MdLockReset className="icon" /></div>
                    <h3 className="get_otp__content--title">{data.title}</h3>
                    <p className="get_otp__content--description">{data.descriptionStart} <strong className="highlight">{resolvedEmail || "..."}</strong>{data.descriptionEnd}</p>

                    <form className="get_otp_content--form" onSubmit={handleVerify}>
                        <label htmlFor="confirm-email-code" className="signup_form__form--label">{data.codeLabel}</label>
                        <input
                            id="confirm-email-code"
                            name="confirm-email-code"
                            type="text"
                            inputMode="numeric"
                            placeholder={data.codePlaceholder}
                            className="signup_form__form--input"
                            value={code}
                            onChange={handleCodeChange}
                            maxLength={8}
                            autoFocus
                        />

                        {error && <p className="signup_form__error">{error}</p>}
                        {info && <p className="settings-form__status settings-form__status--success">{info}</p>}

                        <button className="signup_form__form--button" type="submit" disabled={submitting}>
                            {submitting ? data.verifying : data.verify}
                        </button>

                        <p className="resend" onClick={resending ? undefined : handleResend} style={{ cursor: resending ? "default" : "pointer" }}>
                            {resending ? data.resending : data.resend}
                        </p>
                    </form>

                    <div className="get_otp__content--underline"></div>
                    <p className="back_to" onClick={() => setPage("signup")}>{data.back}</p>
                </div>
            </div>
        </div>
    );
}

export default ConfirmEmail;
