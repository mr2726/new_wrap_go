import { useEffect, useState } from "react";
import "../App.css";
import { MdCheckCircleOutline  } from "react-icons/md";
import { getSession, signUp } from "../data/service";
import Logo from "../Components/Logo";

function Signup({data, setPage, setEmail, setFleetSignupPrefill}) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");
    const [passNotValid, setPassNotValid] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        // Автоматический вход, если есть сессия
        getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                setPage && setPage("content");
            }
        });
    }, [setPage]);

    useEffect(() => {
        if (!data?.signup_form?.signup_form_inputs) return;

        const initialState = Object.fromEntries(
            data.signup_form.signup_form_inputs.map(input => [input.name, ""])
        );

        setFormData(initialState);
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

    // Input changes handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // submit Handler
    const handleSubmite = async (e) => {
        e.preventDefault();
        setError("");
        setPassNotValid(false);

        if (tab === "fleet_owner") {
            const normalizedEmail = (formData.email || "").trim().toLowerCase();

            if (!normalizedEmail) {
                setError("Email is required.");
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

        const normalizedEmail = (formData.email || "").trim().toLowerCase();

        const { error: signUpError } = await signUp(normalizedEmail, formData.password, resolveEmailRedirectTo());

        setIsSubmitting(false);

        if (signUpError) {
            setError(signUpError.message || "Signup failed.");
            return;
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
    const [tab, setTab] = useState("customer");
    const handleTabChange = (selectedTab) => {
        setTab(selectedTab);
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
                <form className="signup_form__form" onSubmit={handleSubmite}>
                    {
                        data.signup_form.signup_form_inputs.map((input, index) => (
                            <div key={index}>
                                <label htmlFor={input.name} className="signup_form__form--label">{input.lable}</label>
                                <input
                                    id={input.name}
                                    name={input.name}
                                    type={input.type}
                                    placeholder={input.placeholder}
                                    className="signup_form__form--input"
                                    value={formData[input.name] || ""}
                                    onChange={handleChange}
                                    style={(input.name === "password" || input.name === "confirmpassword" ) && passNotValid ? {border: "1px solid red"}: {}}
                                />
                            </div>
                        ))
                    }

                    <div className="signup_form__terms">
                        <input
                            type="checkbox"
                            id="terms"
                            className="signup_form__checkbox"
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