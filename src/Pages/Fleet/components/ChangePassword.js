import "../../../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../../../data/supabase";

function ChangePassword({ onClose }) {
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
            setMessage("Please fill in all fields.");
            return;
        }

        if (newPassword.length < 6) {
            setIsError(true);
            setMessage("New password must be at least 6 characters.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setIsError(true);
            setMessage("New password and confirmation do not match.");
            return;
        }

        try {
            setSaving(true);

            // Re-authenticate user before changing password.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) {
                setIsError(true);
                setMessage("User session not found. Please sign in again.");
                return;
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });

            if (signInError) {
                setIsError(true);
                setMessage("Current password is incorrect.");
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                setIsError(true);
                setMessage(updateError.message || "Failed to update password.");
                return;
            }

            setIsError(false);
            setMessage("Password updated successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setIsError(true);
            setMessage(error?.message || "Unexpected error.");
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
                    <h2>Change Password</h2>
                    <p onClick={onClose} style={{ cursor: "pointer" }}>Close</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <label className="signup_form__form--label">Current password</label>
                    <input
                        className="signup_form__form--input"
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                    />

                    <label className="signup_form__form--label">New password</label>
                    <input
                        className="signup_form__form--input"
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                    />

                    <label className="signup_form__form--label">Confirm new password</label>
                    <input
                        className="signup_form__form--input"
                        type="password"
                        placeholder="Confirm new password"
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
                        {saving ? "Saving..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;