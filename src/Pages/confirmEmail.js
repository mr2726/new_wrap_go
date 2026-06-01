import "../App.css";
import { useEffect, useState } from "react";
import { MdLockReset } from "react-icons/md";
import { getUser } from "../data/service";

function ConfirmEmail ({data, setPage, email}){
    const [resolvedEmail, setResolvedEmail] = useState(email || "");

    useEffect(() => {
        if (email) {
            setResolvedEmail(email);
            return;
        }

        const loadUserEmail = async () => {
            const { data: authData } = await getUser();
            if (authData?.user?.email) {
                setResolvedEmail(authData.user.email);
            }
        };

        loadUserEmail();
    }, [email]);

    return (
        <div className="confirm">
            <div className="get_otp">
                <div className="get_otp__content">
                    <div className="get_otp__content--icon"><MdLockReset className="icon" /></div>
                    <h3 className="get_otp__content--title">{data.title}</h3>
                    <p className="get_otp__content--description">{data.descriptionStart} <strong className="highlight">{resolvedEmail || "..."}</strong>{data.descriptionEnd}</p>
                    <div className="get_otp__content--underline"></div>
                    <p className="back_to" onClick={() => setPage("signup")}>{data.back}</p>
                </div>
            </div>
        </div>
    );
}

export default ConfirmEmail;