import { useState, useEffect } from "react";
import "../App.css";
import { supabase } from "../data/supabase";
import Logo from "../Components/Logo";

function Singin({data, setPage}) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [factorId, setFactorId] = useState("");
    const [challengeId, setChallengeId] = useState("");
    const [totpCode, setTotpCode] = useState("");

    // Get data from JSON file if it changed
    useEffect(() => {
        const initialState = Object.fromEntries(
            data.inputs.map(input => [input.name, ""])
        );
        setFormData(initialState);
    }, [data]);

    // Handel input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle Submit 
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });

        if (error) {
            setError(error.message);
            setIsSubmitting(false);
            return;
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("auntufication")
            .eq("userid", authData?.user?.id)
            .maybeSingle();

        if (profileError) {
            setError(profileError.message || "Failed to load security settings.");
            setIsSubmitting(false);
            return;
        }

        if (profile?.auntufication) {
            const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();

            if (factorsError) {
                setError(factorsError.message || "Failed to load authenticator factors.");
                setIsSubmitting(false);
                return;
            }

            const verifiedFactor = (factorsData?.totp || []).find((factor) => factor.status === "verified");
            if (!verifiedFactor) {
                setError("2FA is enabled, but no verified Google Authenticator factor was found.");
                setIsSubmitting(false);
                return;
            }

            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId: verifiedFactor.id,
            });

            if (challengeError || !challengeData?.id) {
                setError(challengeError?.message || "Failed to create 2FA challenge.");
                setIsSubmitting(false);
                return;
            }

            setFactorId(verifiedFactor.id);
            setChallengeId(challengeData.id);
            setRequires2FA(true);
            setIsSubmitting(false);
            return;
        }

        setError("");
        setIsSubmitting(false);

        if (authData?.user) {
            console.log("Logined");
            setPage("content"); // или нужная страница
        }
    };

    const handleVerify2FA = async (event) => {
        event.preventDefault();

        if (!factorId || !challengeId) {
            setError("2FA challenge is missing. Please sign in again.");
            return;
        }

        setIsSubmitting(true);
        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: totpCode,
        });

        if (verifyError) {
            setError(verifyError.message || "Invalid code.");
            setIsSubmitting(false);
            return;
        }

        setError("");
        setIsSubmitting(false);
        setRequires2FA(false);
        setTotpCode("");
        setPage("content");
    };
            
    return(
        <div className="singin">
            <div className="signin__content">
                <Logo setPage={setPage} transfer="signup"/>
                <h2 className="signup_form__title">{data.title}</h2>
                <p className="signup_form__description">{data.description}</p>
                <form className="signin__form" onSubmit={handleSubmit}>
                    {
                        data.inputs.map((input) => (
                            <div key={input.name}>
                                <label htmlFor={input.name} className="signup_form__form--label">
                                    {input.lable}
                                </label>
                                <br />
                                <input 
                                    id={input.name}
                                    name={input.name}
                                    placeholder={input.placeholder}
                                    className="signup_form__form--input"
                                    type={input.type}
                                    value={formData[input.name] || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ))
                    }
                    {error && <p className="signup_form__error">{error}</p>}
                    <p className="highlight forgot_pass" onClick={() => setPage("otplink")}>{data.forgot}</p>
                    <button type="submit" className="signup_form__form--button signin__button" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : data.button}
                    </button>
                    <p className="signup_form__description signin__createAccount">{data.accoutn[0]}<span className="highlight highlight_link" onClick={() =>  setPage("signup")}>{data.accoutn[1]}</span></p>
                </form>
                <div className="terms__block">
                    <p className="terms" onClick={() => setPage("privacy")}>{data.terms[0]}</p>
                    <p className="terms" onClick={() => setPage("terms")}>{data.terms[1]}</p>
                </div>
            </div>

            {requires2FA && (
                <div className="modal" onClick={() => !isSubmitting && setRequires2FA(false)}>
                    <div className="modal__content security-modal" onClick={(event) => event.stopPropagation()}>
                        <h2 className="modal__title">Two-Factor Authentication</h2>
                        <p className="modal__text">Enter the 6-digit code from Google Authenticator.</p>

                        <form className="security-modal__form" onSubmit={handleVerify2FA}>
                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="signinTotp">Authenticator Code</label>
                                <br />
                                <input
                                    id="signinTotp"
                                    type="text"
                                    inputMode="numeric"
                                    className="signup_form__form--input"
                                    placeholder="123456"
                                    value={totpCode}
                                    style={{ width: "100%" }}
                                    onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                    required
                                />
                            </div>

                            <div className="security-modal__actions">
                                <button
                                    type="button"
                                    className="security-modal__button security-modal__button--ghost"
                                    onClick={() => setRequires2FA(false)}
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
                                    {isSubmitting ? "Verifying..." : "Verify"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Singin;