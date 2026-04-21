import "../App.css";
import { MdLockReset } from "react-icons/md";

function ConfirmEmail ({data, setPage, email}){
    return (
        <div className="confirm">
            <div className="get_otp">
                <div className="get_otp__content">
                    <div className="get_otp__content--icon"><MdLockReset className="icon" /></div>
                    <h3 className="get_otp__content--title">{data.title}</h3>
                    <p className="get_otp__content--description">{data.descriptionStart} <strong className="highlight">{email}</strong>{data.descriptionEnd}</p>
                    <div className="get_otp__content--underline"></div>
                    <p className="back_to" onClick={() => setPage("signup")}>{data.back}</p>
                </div>
            </div>
        </div>
    );
}

export default ConfirmEmail;