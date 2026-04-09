import { useState } from "react";
import { supabase } from "../../data/supabase";
import Logo from "../../Components/Logo";

function ResetPassword({data, setPage}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");


    // Password validation
    const validationPassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        return regex.test(password);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();

        // Checking the input
        if (!password || !confirmPassword) {
            alert("Fill all fields");
            return;
        }

        // Validation Check
        if (!validationPassword(password)) {
            alert("Password must be 8+ chars, include uppercase, lowercase, number and symbol");
            return;
        }

        // Checking mutching
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // Update password
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            console.log(error.message);
            alert(error.message);
            return;
        }


        // Transfet to the new Page
        setPage("reset-status");
    };

    return (
        <div className="reset">
            <Logo setPage={setPage} transfer="singin"/>
            <div className="reset__content">
                <h3 className="get_otp__content--title">{data.title}</h3>
                <p className="get_otp__content--description">{data.description}</p>
                <form className="reset__content--form" onSubmit={handleUpdatePassword}>
                    {
                        data.inputs.map((input, index) => (
                            <>
                                <label htmlFor={input.id} className="signup_form__form--label">{input.lable}</label>
                                <input
                                    className="signup_form__form--input"
                                    id={input.id}
                                    name={input.id}
                                    type={input.type}
                                    placeholder={input.placeholder}
                                    value={input.id === "password" ? password : confirmPassword}
                                    onChange={input.id === "password" ? (e) => setPassword(e.target.value) : (e) => setConfirmPassword(e.target.value)}
                                    required
                                />

                            </>
                        ))
                    }
                    <button type="submit" className="signup_form__form--button">{data.btn}</button>
                </form>

                <div className="get_otp__content--underline"></div>
                <p className="back_to" onClick={() => setPage("signin")}>{data.back_to}</p>
            </div>
        </div>
    );
}

export default ResetPassword;