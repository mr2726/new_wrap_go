import "../../../App.css";
import { useState } from "react";
import { supabase } from "../../../data/supabase";

function Security() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState({ type: "", text: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetModalState = () => {
        setNewPassword("");
        setConfirmPassword("");
        setStatus({ type: "", text: "" });
        setIsSubmitting(false);
    };

    const openModal = () => {
        resetModalState();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetModalState();
    };

    const handleChangePassword = async (event) => {
        event.preventDefault();
        setStatus({ type: "", text: "" });

        if (newPassword.length < 8) {
            setStatus({ type: "error", text: "Password must be at least 8 characters long." });
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one uppercase letter." });
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one lowercase letter." });
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one digit." });
            return;
        }

        if (!/[^A-Za-z0-9]/.test(newPassword)) {
            setStatus({ type: "error", text: "Password must include at least one special symbol." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: "error", text: "Passwords do not match." });
            return;
        }

        setIsSubmitting(true);

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setStatus({ type: "error", text: error.message || "Failed to update password." });
            setIsSubmitting(false);
            return;
        }

        setStatus({ type: "success", text: "Password changed successfully." });
        setIsSubmitting(false);
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="settings__block">
            <div className="notification__block--wrapper">
                <h1 className="title">Security Settings</h1>

                <div className="changePassword">
                    <div className="changePassword__content">
                        <h2 className="second__title">Change Password</h2>
                        <p className="description">Update your password regularly to keep your account secure.</p>
                    </div>
                    <button className="signup_form__form--button changePassword__button" onClick={openModal}>Change Password</button>
                </div>
            </div>

            {isModalOpen && (
                <div className="modal" onClick={closeModal}>
                    <div className="modal__content security-modal" onClick={(event) => event.stopPropagation()}>
                        <h2 className="modal__title">Change Password</h2>
                        <p className="modal__text">Enter your new password and confirm it to update your account credentials.</p>

                        <form className="security-modal__form" onSubmit={handleChangePassword}>
                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="newPassword">New Password</label>
                                <br />
                                <input
                                    id="newPassword"
                                    type="password"
                                    className="signup_form__form--input"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    style={{
                                        width: "100%"
                                    }}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    required
                                />
                            </div>

                            <div className="security-modal__group">
                                <label className="signup_form__form--label" htmlFor="confirmPassword">Confirm New Password</label>
                                <br />
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    className="signup_form__form--input"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    style={{
                                        width: "100%"
                                    }}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    required
                                />
                            </div>

                            {status.type === "success" && <p className="settings-form__status settings-form__status--success">{status.text}</p>}
                            {status.type === "error" && <p className="settings-form__status settings-form__status--error">{status.text}</p>}

                            <div className="security-modal__actions">
                                <button
                                    type="button"
                                    className="security-modal__button security-modal__button--ghost"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="security-modal__button signup_form__form--button"
                                    disabled={isSubmitting}
                                    style={{ padding: "0.5em 1.5em" }}
                                >
                                    {isSubmitting ? "Changing..." : "Change Password"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Security;