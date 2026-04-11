import { useState, useEffect } from "react";
import "../App.css";
import { supabase } from "../data/supabase";
import Logo from "../Components/Logo";

function Singin({data, setPage}) {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState("");

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

        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
        });

        if (error) {
            setError(error.message);
            return;
        }
        setError("");

        if (authData?.user) {
            console.log("Logined");
            setPage("content"); // или нужная страница
        }
    };
            
    return(
        <div className="singin">
            <div className="signin__content">
                <Logo setPage={setPage} transfer="signup"/>
                <h2 className="signup_form__title">{data.title}</h2>
                <p className="signup_form__description">{data.description}</p>
                <form className="signin__form" onSubmit={handleSubmit}>
                    {
                        data.inputs.map((input, index) => (
                            <>
                                <lable htmlFor={input.name} className="signup_form__form--label">
                                    {input.lable}
                                </lable>
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
                            </>
                        ))
                    }
                    {error && <p className="signup_form__error">{error}</p>}
                    <p className="highlight forgot_pass" onClick={() => setPage("otplink")}>{data.forgot}</p>
                    <button type="submit" className="signup_form__form--button signin__button">
                        {data.button}
                    </button>
                    <p className="signup_form__description signin__createAccount">{data.accoutn[0]}<span className="highlight highlight_link" onClick={() =>  setPage("signup")}>{data.accoutn[1]}</span></p>
                </form>
                <div className="terms__block">
                    <p className="terms" onClick={() => setPage("privacy")}>{data.terms[0]}</p>
                    <p className="terms" onClick={() => setPage("terms")}>{data.terms[1]}</p>
                </div>
            </div>
        </div>
    );
}

export default Singin;