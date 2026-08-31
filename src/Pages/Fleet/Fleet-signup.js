import "../../App.css";
import "./fleetResize.css";
import Logo from "../../Components/Logo";
import { useState, useEffect } from "react";
import { getUser, checkFleetByEmail, signUp, checkFleetByUserId, insertFleet } from "../../data/service";
import { useLanguage } from "../../context/LanguageContext";

function FleetSignup({ setPage, setFleetPage, prefillEmail = "", prefillPassword = "" }) {
    const { data: pageData } = useLanguage();
    const signupText = pageData.fleet.signup;
    const [userData, setUserData] = useState({
        fleetName: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        fleetSize: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fromOtp, setFromOtp] = useState(false);
    const [fromPrefill, setFromPrefill] = useState(false);

    useEffect(() => {
        const checkExistingSession = async () => {
            const { data: authData } = await getUser();
            if (authData?.user?.email) {
                setFromOtp(true);
                setUserData(prev => ({ ...prev, contactEmail: authData.user.email }));
            }
        };
        checkExistingSession();
    }, []);

    useEffect(() => {
        const normalizedPrefillEmail = (prefillEmail || "").trim().toLowerCase();
        if (!normalizedPrefillEmail || fromOtp) {
            return;
        }

        setFromPrefill(true);
        setUserData(prev => ({
            ...prev,
            contactEmail: normalizedPrefillEmail,
            password: prefillPassword || prev.password,
            confirmPassword: prefillPassword || prev.confirmPassword,
        }));
    }, [prefillEmail, prefillPassword, fromOtp]);

    const isPasswordValid = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        return regex.test(password);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            let userId;
            let userEmail;

            if (fromOtp) {
                // User came via magic link — already authenticated
                const { data: authData, error: authError } = await getUser();
                if (authError || !authData?.user?.id) {
                    setError(signupText.messages.sessionExpired);
                    setIsSubmitting(false);
                    return;
                }
                userId = authData.user.id;
                userEmail = authData.user.email;
            } else {
                const normalizedEmail = (userData.contactEmail || "").trim().toLowerCase();
                const passwordToUse = fromPrefill ? prefillPassword : userData.password;

                if (!normalizedEmail) {
                    setError(signupText.fields.contactEmail.label);
                    setIsSubmitting(false);
                    return;
                }

                // Manual signup — validate passwords first
                if (!fromPrefill && userData.password !== userData.confirmPassword) {
                    setError(signupText.messages.passwordMismatch);
                    setIsSubmitting(false);
                    return;
                }

                if (!passwordToUse || !isPasswordValid(passwordToUse)) {
                    setError(signupText.messages.passwordRules);
                    setIsSubmitting(false);
                    return;
                }

                // Check if email already in fleets
                const { data: existingFleet, error: checkError } = await checkFleetByEmail(normalizedEmail);

                if (checkError && checkError.code !== "PGRST116") throw checkError;

                if (existingFleet) {
                    setError(signupText.messages.emailExists);
                    setIsSubmitting(false);
                    return;
                }

                const { data, error: signupError } = await signUp(normalizedEmail, passwordToUse);

                if (signupError) {
                    setError(signupError.message || signupText.messages.signupFailed);
                    setIsSubmitting(false);
                    return;
                }

                userId = data?.user?.id;
                userEmail = normalizedEmail;
            }

            if (!userId) {
                setError(signupText.messages.accountFailed);
                setIsSubmitting(false);
                return;
            }

            // Check if fleet record already exists for this user
            const { data: existingRecord } = await checkFleetByUserId(userId);

            if (existingRecord) {
                if (setFleetPage) setFleetPage("dashboard");
                return;
            }

            const { error: insertError } = await insertFleet({
                    userid: userId,
                    email: (userEmail || "").toLowerCase(),
                    phone: userData.contactPhone,
                    fleetname: userData.fleetName,
                    contactpersone: userData.contactPerson,
                    fleetsize: parseInt(userData.fleetSize) || 0,
                });

            if (insertError) {
                setError(`${signupText.messages.saveFleetFailedPrefix} ${insertError.message}`);
                setIsSubmitting(false);
                return;
            }

            setSuccess(signupText.messages.success);
            if (setFleetPage) {
                setTimeout(() => setFleetPage("dashboard"), 1500);
            }

        } catch (err) {
            setError(err.message || signupText.messages.unexpected);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fleet-signup">
            <div className="fleet-signup__content">
                <div className="fleet-signup__logo">
                    <Logo setPage={setPage} transfer="fleet-signup" />
                </div>
                <h1 className="fleet-signup__title">{signupText.title}</h1>
                <form className="fleet-signup__form" onSubmit={handleSubmit}>
                    <div className="fleet-signup__grid">
                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="fleet-name">{signupText.fields.fleetName.label}</label>
                            <input 
                                className="signup_form__form--input" 
                                id="fleet-name" 
                                name="fleetName"
                                type="text" 
                                placeholder={signupText.fields.fleetName.placeholder}
                                value={userData.fleetName}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="contact-person">{signupText.fields.contactPerson.label}</label>
                            <input 
                                className="signup_form__form--input" 
                                id="contact-person" 
                                name="contactPerson"
                                type="text" 
                                placeholder={signupText.fields.contactPerson.placeholder}
                                value={userData.contactPerson}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="contact-email">{signupText.fields.contactEmail.label}</label>
                            <input 
                                className="signup_form__form--input" 
                                id="contact-email" 
                                name="contactEmail"
                                type="email" 
                                placeholder={signupText.fields.contactEmail.placeholder}
                                value={userData.contactEmail}
                                onChange={handleChange}
                                disabled={fromOtp || fromPrefill}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="contact-phone">{signupText.fields.contactPhone.label}</label>
                            <input 
                                className="signup_form__form--input" 
                                id="contact-phone" 
                                name="contactPhone"
                                type="tel" 
                                inputMode="tel" 
                                placeholder={signupText.fields.contactPhone.placeholder}
                                value={userData.contactPhone}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field fleet-signup__field--full">
                            <label className="signup_form__form--label" htmlFor="fleet-size">{signupText.fields.fleetSize.label}</label>
                            <input 
                                className="signup_form__form--input" 
                                id="fleet-size" 
                                name="fleetSize"
                                type="number" 
                                min="1" 
                                placeholder={signupText.fields.fleetSize.placeholder}
                                value={userData.fleetSize}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        {!(fromOtp || fromPrefill) && (
                            <>
                                <div className="fleet-signup__field">
                                    <label className="signup_form__form--label" htmlFor="password">{signupText.fields.password.label}</label>
                                    <input 
                                        className="signup_form__form--input" 
                                        id="password" 
                                        name="password"
                                        type="password" 
                                        placeholder={signupText.fields.password.placeholder}
                                        value={userData.password}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>

                                <div className="fleet-signup__field">
                                    <label className="signup_form__form--label" htmlFor="confirm-password">{signupText.fields.confirmPassword.label}</label>
                                    <input 
                                        className="signup_form__form--input" 
                                        id="confirm-password" 
                                        name="confirmPassword"
                                        type="password" 
                                        placeholder={signupText.fields.confirmPassword.placeholder}
                                        value={userData.confirmPassword}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {error && <p className="signup_form__error fleet-signup__status">{error}</p>}
                    {success && <p className="fleet-signup__status fleet-signup__status--success">{success}</p>}
                    <button className="signup_form__form--button fleet-signup__submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? signupText.buttons.submitting : signupText.buttons.submit}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FleetSignup;