import "../../App.css";
import { MdCheckCircle } from "react-icons/md";


function ResetPasswordStatus ({data, setPage}) {
    return (
        <div className="reset">
            <div className="reset__content">
                <div className="get_otp__content--icon"><MdCheckCircle className="icon" /></div>
                <h3 className="get_otp__content--title">{data.title}</h3>
                <p className="get_otp__content--description">{data.description}</p>
                <div className="dispflexcoulumn">
                    <button className="signup_form__form--button" onClick={() => setPage("signin")}>{data.btn}</button>
                    <p className="secure">{data.security}</p>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordStatus;