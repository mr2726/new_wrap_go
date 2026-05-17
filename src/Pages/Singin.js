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

    useEffect(() => {
        const initialState = Object.fromEntries(
            data.inputs.map(input => [input.name, ""])
        );
        setFormData(initialState);
    }, [data]);
    // Автоматический вход, если есть сессия
    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                setPage && setPage("content");
            }
        });
    }, [setPage]);

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

        const user = authData?.user;
        if (!user) {
            setError("Failed to read authenticated user.");
            setIsSubmitting(false);
            return;
        }

        if (!user.email_confirmed_at) {
            setError("Please confirm your email first.");
            setIsSubmitting(false);
            setPage("confirm-email");
            return;
        }

        const isMissingColumnError = (queryError) => {
            const message = (queryError?.message || "").toLowerCase();
            return message.includes("column") || message.includes("does not exist");
        };

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("auntufication")
            .eq("userid", user.id)
            .maybeSingle();

        if (profileError) {
            setError(profileError.message || "Failed to load profile settings.");
            setIsSubmitting(false);
            return;
        }

        if (profile) {
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
            setPage("content");
            return;
        }

        const { data: fleet, error: fleetError } = await supabase
            .from("fleets")
            .select("userid")
            .eq("userid", user.id)
            .maybeSingle();

        if (fleetError) {
            setError(fleetError.message || "Failed to load fleet account.");
            setIsSubmitting(false);
            return;
        }

        if (fleet) {
            setError("");
            setIsSubmitting(false);
            setPage("fleet-content");
            return;
        }

        const { data: driverByUserId, error: driverByUserIdError } = await supabase
            .from("drivers")
            .select("id")
            .eq("userid", user.id)
            .maybeSingle();

        if (!driverByUserIdError && driverByUserId) {
            setError("");
            setIsSubmitting(false);
            setPage("drivers-download");
            return;
        }

        if (driverByUserIdError && !isMissingColumnError(driverByUserIdError)) {
            setError(driverByUserIdError.message || "Failed to load driver account.");
            setIsSubmitting(false);
            return;
        }

        const { data: driverByEmail, error: driverByEmailError } = await supabase
            .from("drivers")
            .select("id")
            .eq("email", (user.email || "").toLowerCase())
            .maybeSingle();

        if (!driverByEmailError && driverByEmail) {
            setError("");
            setIsSubmitting(false);
            setPage("drivers-download");
            return;
        }

        if (driverByEmailError && !isMissingColumnError(driverByEmailError)) {
            setError(driverByEmailError.message || "Failed to load driver account.");
            setIsSubmitting(false);
            return;
        }

        setError("");
        setIsSubmitting(false);
        setPage("company-info");
    };

    const handleVerify2FA = async (event) => {
        event.preventDefault();

        if (!factorId || !challengeId) {
            setError(data.twoFactor.errors.missingChallenge);
            return;
        }

        setIsSubmitting(true);
        const { error: verifyError } = await supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: totpCode,
        });

        if (verifyError) {
            setError(verifyError.message || data.twoFactor.errors.invalidCode);
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
                <Logo setPage={setPage} transfer="/"/>
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
                        <h2 className="modal__title">{data.twoFactor.title}</h2>
                        <p className="modal__text">{data.twoFactor.description}</p>

                        <form className="security-modal__form" onSubmit={handleVerify2FA}>
                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="signinTotp">{data.twoFactor.label}</label>
                                <br />
                                <input
                                    id="signinTotp"
                                    type="text"
                                    inputMode="numeric"
                                    className="signup_form__form--input"
                                    placeholder={data.twoFactor.placeholder}
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
                                    {data.twoFactor.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="security-modal__button signup_form__form--button"
                                    disabled={isSubmitting}
                                    style={{ padding: "0.5em 1.5em" }}
                                >
                                    {isSubmitting ? data.twoFactor.verifying : data.twoFactor.verify}
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