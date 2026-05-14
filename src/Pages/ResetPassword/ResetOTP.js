import { useState } from "react";
import "../../App.css";
import { MdLockReset } from "react-icons/md";
import { supabase } from "../../data/supabase";


function ResetOTP({data, setPage, setSender}) {
    const [email, setEmail] = useState("");

    const resolveRedirectTo = () => {
        const envBaseUrl = (process.env.REACT_APP_WEB_URL || "").trim();

        if (envBaseUrl) {
            return `${envBaseUrl.replace(/\/$/, "")}/app?view=reset-password`;
        }

        return `${window.location.origin}/app?view=reset-password`;
    };

    /* Handler form submit */
    const handleSubmit = (e) => {
        e.preventDefault();
        handleForgotPassword();
    }    

    // send link to the user email 

    const handleForgotPassword = async () => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            alert(data.enterEmailAlert);
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(
            normalizedEmail,
            {
                redirectTo: resolveRedirectTo()
            }
        );

        if (error) {
            console.log(error.message);
            alert(error.message);
            return;
        }

        setSender(normalizedEmail);
        setPage("check-email");
    };

    return (
        <div className="get_otp">
            <div className="get_otp__content">
                <div className="get_otp__content--icon"><MdLockReset className="icon" /></div>
                <h3 className="get_otp__content--title">{data.title}</h3>
                <p className="get_otp__content--description">{data.description}</p>
                <form className="get_otp_content--form" onSubmit={handleSubmit}>
                    <label htmlFor={data.input.id} className="signup_form__form--label">{data.input.lable}</label>
                    <input
                        id={data.input.id}
                        name={data.input.id}
                        type={data.input.type}
                        placeholder={data.input.placeholder}
                        className="signup_form__form--input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button className="signup_form__form--button">{data.btn}</button>
                </form>

                <div className="get_otp__content--underline"></div>
                <p className="back_to" onClick={() => setPage("signin")}>{data.back_to}</p>
            </div>
        </div>
    );
}

export default ResetOTP;