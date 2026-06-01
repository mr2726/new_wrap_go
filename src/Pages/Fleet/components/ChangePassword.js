import "../../../App.css";
import { useEffect, useState } from "react";
import { getUser, signIn, updateUserPassword } from "../../../data/service";
import pageData from "../../../data/data.json";

function ChangePassword({ onClose }) {
    const passwordText = pageData.fleet.changePassword;
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const onEsc = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [onClose]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setIsError(false);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setIsError(true);
            setMessage(passwordText.messages.fillAll);
            return;
        }

        if (newPassword.length < 6) {
            setIsError(true);
            setMessage(passwordText.messages.minLength);
            return;
        }

        if (newPassword !== confirmPassword) {
            setIsError(true);
            setMessage(passwordText.messages.mismatch);
            return;
        }

        try {
            setSaving(true);

            // Re-authenticate user before changing password.
            const { data: authData } = await getUser();
            const user = authData?.user;
            if (!user?.email) {
                setIsError(true);
                setMessage(passwordText.messages.sessionMissing);
                return;
            }

            const { error: signInError } = await signIn(user.email, currentPassword);

            if (signInError) {
                setIsError(true);
                setMessage(passwordText.messages.wrongCurrent);
                return;
            }

            const { error: updateError } = await updateUserPassword(newPassword);

            if (updateError) {
                setIsError(true);
                setMessage(updateError.message || passwordText.messages.updateFailed);
                return;
            }

            setIsError(false);
            setMessage(passwordText.messages.success);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setIsError(true);
            setMessage(error?.message || passwordText.messages.unexpected);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="add-driver-form"
            onClick={onClose}
            style={{ zIndex: 1000 }}
        >
            <div
                className="add-driver-form___block"
                onClick={(event) => event.stopPropagation()}
                style={{ maxWidth: 460, width: "92%" }}
            >
                <div className="popup__title">
                    <h2>{passwordText.title}</h2>
                    <p onClick={onClose} style={{ cursor: "pointer" }}>{passwordText.close}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="signup_form__form--label">{passwordText.labels.current}</label>
                    <input
                        className="signup_form__form--input"
                        type="password"
                        placeholder={passwordText.placeholders.current}
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                    />

                    <label className="signup_form__form--label">{passwordText.labels.new}</label>
                    <input
                        className="signup_form__form--input"
                        type="password"
                        placeholder={passwordText.placeholders.new}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                    />

                    <label className="signup_form__form--label">{passwordText.labels.confirm}</label>
                    <input
                        className="signup_form__form--input"
                        type="password"
                        placeholder={passwordText.placeholders.confirm}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />

                    {message && (
                        <p style={{ color: isError ? "#dc2626" : "#16a34a", margin: "8px 0 0" }}>
                            {message}
                        </p>
                    )}

                    <button
                        className="signup_form__form--button"
                        type="submit"
                        disabled={saving}
                        style={{ marginTop: 16 }}
                    >
                        {saving ? passwordText.buttons.saving : passwordText.buttons.submit}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;