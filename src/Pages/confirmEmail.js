import "../App.css";
import { MdLockReset } from "react-icons/md";

function ConfirmEmail ({setPage, email}){
    return (
        <div className="confirm">
            <div className="get_otp">
                <div className="get_otp__content">
                    <div className="get_otp__content--icon"><MdLockReset className="icon" /></div>
                    <h3 className="get_otp__content--title">Confirm Email</h3>
                    <p className="get_otp__content--description">We’ve sent a confirmation email to <strong className="highlight">{email}</strong> .Please check your inbox and follow the link to verify your email address.</p>
                    <div className="get_otp__content--underline"></div>
                    <p className="back_to" onClick={() => setPage("signup")}>go back</p>
                </div>
            </div>
        </div>
    );
}

export default ConfirmEmail;