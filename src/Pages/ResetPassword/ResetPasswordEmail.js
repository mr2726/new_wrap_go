import "../../App.css";
import { MdMarkEmailRead } from "react-icons/md";
import { supabase } from "../../data/supabase";


function ResetPasswordEmail ({data, setPage, email}) {

    const resendEmail = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: "http://localhost:3000/reset-password" // ← Rederect link 
            }
        );

        if (error) {
            console.log(error.message);
            alert(error.message);
            return;
        }
    }

    return(
        <div className="reset">
            <div className="reset__content">
                <div className="get_otp__content--icon"><MdMarkEmailRead className="icon" /></div>
                <h3 className="get_otp__content--title">{data.title}</h3>
                <p className="get_otp__content--description">{data.description}</p>
                <div className="dispflexcoulumn">
                    <button className="signup_form__form--button" onClick={() => setPage("signin")}>{data.btn1}</button>
                    <button className="resend" onClick={() => resendEmail()}>{data.btn2}</button>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordEmail;