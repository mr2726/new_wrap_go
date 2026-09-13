import { useEffect, useState } from "react";
import "../App.css";
import { MdCheckCircleOutline  } from "react-icons/md";
import { getSession, signUp } from "../data/service";
import { resolveAuthPage } from "../data/accountRouting";
import Logo from "../Components/Logo";

function Signup({data, setPage, setEmail, setFleetSignupPrefill, signupDraft, setSignupDraft}) {
    const [formData, setFormData] = useState(signupDraft?.formData || {});
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [passNotValid, setPassNotValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tab, setTab] = useState(signupDraft?.tab || "customer");
    const [termsAccepted, setTermsAccepted] = useState(signupDraft?.termsAccepted || false);


    useEffect(() => {
        // Автоматический вход, если есть сессия
        getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                const nextPage = await resolveAuthPage(session);
                setPage && setPage(nextPage);
            }
        });
    }, [setPage]);

    useEffect(() => {
        if (!data?.signup_form?.signup_form_inputs) return;

        const initialState = Object.fromEntries(
            data.signup_form.signup_form_inputs.map(input => [input.name, ""])
        );

        setFormData(prev => ({ ...initialState, ...prev }));
    }, [data]);

    const resolveEmailRedirectTo = () => {
        const envBaseUrl = (process.env.REACT_APP_WEB_URL || "").trim();
        if (envBaseUrl) {
            return `${envBaseUrl.replace(/\/$/, "")}/app?view=company-info`;
        }

        return `${window.location.origin}/app?view=company-info`;
    };

    // Password validation
    const validationPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        return regex.test(password);
    }

    const validationEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    const getSignupErrorMessage = (signupError) => {
        const message = (signupError?.message || "").toLowerCase();

        if (message.includes("anonymous sign-ins are disabled")) {
            return "Account creation is temporarily unavailable. Please try again later.";
        }

        if (message.includes("already registered") || message.includes("user already exists")) {
            return "An account with this email already exists. Please sign in instead.";
        }

        if (message.includes("invalid email")) {
            return "Please enter a valid work email address.";
        }

        return "We couldn't create your account. Please check your details and try again.";
    }

    // Input changes handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextFormData = {
            ...formData,
            [name]: value
        };

        setFormData(nextFormData);
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: "" }));
        }
        setSignupDraft?.(draft => ({ ...draft, formData: nextFormData }));
    };

    // submit Handler
    const handleSubmite = async (e) => {
        e.preventDefault();
        setError("");
        setPassNotValid(false);
        setFieldErrors({});

        const normalizedEmail = (formData.email || "").trim().toLowerCase();
        const nextFieldErrors = {};

        if (!normalizedEmail) {
            nextFieldErrors.email = "Work email is required.";
        } else if (!validationEmail(normalizedEmail)) {
            nextFieldErrors.email = "Please enter a valid work email address.";
        }

        if (!formData.password) {
            nextFieldErrors.password = "Password is required.";
        }

        if (!formData.confirmpassword) {
            nextFieldErrors.confirmpassword = "Please confirm your password.";
        }

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            return;
        }

        if (!termsAccepted) {
            setError("Please accept the Terms of Service and Privacy Policy.");
            return;
        }

        if (tab === "fleet_owner") {
            if (!validationPassword(formData.password)) {
                setError(data.signup_form.inputErrors.notvalidPassword);
                setPassNotValid(true);
                return;
            }

            if (formData.password !== formData.confirmpassword) {
                setError(data.signup_form.inputErrors.passwordisnotsame);
                setPassNotValid(true);
                return;
            }

            if (setFleetSignupPrefill) {
                setFleetSignupPrefill({
                    email: normalizedEmail,
                    password: formData.password,
                });
            }

            if (setEmail) {
                setEmail(normalizedEmail);
            }

            setPage("fleet-signup");
            return;
        }

        if (!validationPassword(formData.password)) {
            setError(data.signup_form.inputErrors.notvalidPassword);
            setPassNotValid(true);
            return;
        }

        if (formData.password !== formData.confirmpassword) {
            setError(data.signup_form.inputErrors.passwordisnotsame);
            setPassNotValid(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const { error: signUpError } = await signUp(normalizedEmail, formData.password, resolveEmailRedirectTo());

            if (signUpError) {
                setError(getSignupErrorMessage(signUpError));
                return;
            }
        } catch (signupError) {
            setError(getSignupErrorMessage(signupError));
            return;
        } finally {
            setIsSubmitting(false);
        }

        if (setEmail) {
            setEmail(normalizedEmail);
        }

        setPage("confirm-email");
    };
    const Blocks = ({block}) => {
        return (
            <div className="signup_content_container__blocks--block">
                <MdCheckCircleOutline className="signup_content_container__blocks--block__icon" />
                <div className="signup_content_container__blocks--block__content">
                    <h2 className="signup_content_container__blocks--block__title">{block.title}</h2>
                    <p className="signup_content_container__blocks--block__description">{block.description}</p>
                </div>
            </div>
        )
    }
    const handleTabChange = (selectedTab) => {
        setTab(selectedTab);
        setSignupDraft?.(draft => ({ ...draft, tab: selectedTab }));
    }
    return (
        <div className="signup">
            <div className="signup_content_container">
                <div className="singup_content_container__bg"></div>
                <div className="signup_content_container__content">
                    <Logo transfer="/" setPage={setPage} />
                    <div className="tag"><p>{data.tag}</p></div>
                    <h1 className="signup_content_container__title">{data.title[0]}<span className="highlight">{data.title[1]}</span></h1>
                    <p className="signup_content_container__description">{data.description}</p>
                    <div className="signup_content_container__blocks">
                        {data.blocks?.map((block, index) => (
                            <Blocks key={index} block={block} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="signup_form">
                <h2 className="signup_form__title">{data.signup_form.title}</h2>
                <p className="signup_form__description">{data.signup_form.description}</p>
                <div className="signup_Switcher">
                    <button className={tab === "customer" ? "active_tab" : ""} onClick={() => handleTabChange("customer")}>Customer</button>
                    <button className={tab === "fleet_owner" ? "active_tab" : ""} onClick={() => handleTabChange("fleet_owner")}>Fleet owner</button>
                </div>
                <form className="signup_form__form" onSubmit={handleSubmite} noValidate>
                    {
                        data.signup_form.signup_form_inputs.map((input, index) => (
                            <div key={index}>
                                <label htmlFor={input.name} className="signup_form__form--label">{input.lable}</label>
                                <input
                                    id={input.name}
                                    name={input.name}
                                    type={input.type}
                                    placeholder={input.placeholder}
                                    value={formData[input.name] || ""}
                                    onChange={handleChange}
                                    required
                                    aria-invalid={Boolean(fieldErrors[input.name])}
                                    aria-describedby={fieldErrors[input.name] ? `${input.name}-error` : undefined}
                                    className={`signup_form__form--input${fieldErrors[input.name] || ((input.name === "password" || input.name === "confirmpassword") && passNotValid) ? " input-error" : ""}`}
                                />
                                {fieldErrors[input.name] && <p id={`${input.name}-error`} className="signup_form__error">{fieldErrors[input.name]}</p>}
                            </div>
                        ))
                    }

                    <div className="signup_form__terms">
                        <input
                            type="checkbox"
                            id="terms"
                            className="signup_form__checkbox"
                            checked={termsAccepted}
                            onChange={(event) => {
                                setTermsAccepted(event.target.checked);
                                setSignupDraft?.(draft => ({ ...draft, termsAccepted: event.target.checked }));
                            }}
                            required
                        />

                        <label htmlFor="terms" className="signup_form__terms--label row">
                            {data.signup_form.checkbox[0]}
                            <p className="signup_form__terms--link" onClick={() => setPage("terms")}>{data.signup_form.checkbox[1]}</p> 
                            {data.signup_form.checkbox[2]}
                            <p className="signup_form__terms--link" onClick={() => setPage("privacy")}>{data.signup_form.checkbox[3]}</p>
                        </label>

                    </div>

                    <button type="submit" className="signup_form__form--button" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : data.signup_form.button}
                    </button>

                    <div className="formError">
                        <p className="formErrorText">{error}</p>
                    </div>

                </form>
                <p className="signup_form__description singup__login">{data.signup_form.account[0]}<span className="highlight highlight_link" onClick={() =>  setPage("signin")}>{data.signup_form.account[1]}</span></p>                
            </div>
        </div>
    );
}

export default Signup;