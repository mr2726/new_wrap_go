import "../../App.css";
import { useCallback, useEffect, useState } from "react";
import TopMenu from "../../Components/TopMenu";
import { FaRegUser, FaPhoneAlt } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import { RiBankFill } from "react-icons/ri";
import { supabase } from "../../data/supabase";
import Loader from "../../Components/Loader";
import ChangePassword from "./components/ChangePassword";
import TwoFactorAuth from "./components/2FA";
import pageData from "../../data/data.json";


function Profile({ setFleetPage }) {
    const profileText = pageData.fleet.profile;
    const fallbackEmailRequired = "Email is required";
    const fallbackEmailInvalid = "Please enter a valid email address";
    const fallbackEmailDomain = "Email must end with .ru or .com";
    const fallbackGmailDomain = "Gmail addresses must end with .com";
    const [formData, setFormData] = useState({
        contactpersone: "",
        fleetname: "",
        email: "",
        phone: ""
    });
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [twoFactorVisible, setTwoFactorVisible] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [is2FALoading, setIs2FALoading] = useState(false);

    const getEmailValidationError = useCallback((value) => {
        const normalizedValue = (value || "").trim().toLowerCase();

        if (!normalizedValue) {
            return profileText.messages.emailRequired || fallbackEmailRequired;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(normalizedValue)) {
            return profileText.messages.emailInvalid || fallbackEmailInvalid;
        }

        if (!normalizedValue.endsWith(".ru") && !normalizedValue.endsWith(".com")) {
            return profileText.messages.emailDomainInvalid || fallbackEmailDomain;
        }

        const domainPart = normalizedValue.split("@")[1] || "";
        if (domainPart.startsWith("gmail.") && !domainPart.endsWith(".com")) {
            return profileText.messages.gmailDomainInvalid || fallbackGmailDomain;
        }

        return "";
    }, [
        profileText.messages.emailRequired,
        profileText.messages.emailInvalid,
        profileText.messages.emailDomainInvalid,
        profileText.messages.gmailDomainInvalid,
        fallbackEmailRequired,
        fallbackEmailInvalid,
        fallbackEmailDomain,
        fallbackGmailDomain,
    ]);

    const withAuthLockRetry = useCallback(async (callback, retries = 1) => {
        try {
            return await callback();
        } catch (error) {
            const isLockAbort =
                error?.name === "AbortError" ||
                String(error?.message || "").includes("Lock broken by another request");

            if (!isLockAbort || retries <= 0) {
                throw error;
            }

            await new Promise((resolve) => setTimeout(resolve, 200));
            return withAuthLockRetry(callback, retries - 1);
        }
    }, []);

    const refresh2FAState = useCallback(async () => {
        const { data: factorsData, error } = await withAuthLockRetry(() => supabase.auth.mfa.listFactors());
        if (error) {
            console.error("Error loading 2FA factors:", error);
            return;
        }

        const verifiedFactor = (factorsData?.totp || []).find((factor) => factor.status === "verified");
        setIs2FAEnabled(Boolean(verifiedFactor));
    }, [withAuthLockRetry]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data, error } = await supabase
                        .from("fleets")
                        .select("*")
                        .eq("userid", user.id)
                        .single();
                    if (error) {
                        console.error("Error fetching profile:", error);
                        setMessage(`${profileText.messages.loadErrorPrefix} ${error.message}`);
                    } else {
                        console.log("Profile data:", data);
                        setFormData({
                            contactpersone: data.contactpersone || "",
                            fleetname: data.fleetname || "",
                            email: data.email || "",
                            phone: data.phone || ""
                        });
                        setEmailError(getEmailValidationError(data.email || ""));
                    }
                }
                await refresh2FAState();
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [refresh2FAState, profileText.messages.loadErrorPrefix, getEmailValidationError]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "email") {
            setEmailError(getEmailValidationError(value));
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage("");

            const normalizedEmail = (formData.email || "").trim().toLowerCase();
            const validationError = getEmailValidationError(normalizedEmail);
            if (validationError) {
                setEmailError(validationError);
                setMessage(validationError);
                return;
            }
            setEmailError("");
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMessage(profileText.messages.userNotAuthenticated);
                return;
            }

            const { error } = await supabase
                .from("fleets")
                .update({
                    contactpersone: formData.contactpersone,
                    fleetname: formData.fleetname,
                    email: normalizedEmail,
                    phone: formData.phone
                })
                .eq("userid", user.id);

            if (error) {
                console.error("Error saving profile:", error);
                setMessage(`${profileText.messages.saveErrorPrefix} ${error.message}`);
            } else {
                setMessage(profileText.messages.saveSuccess);
                setTimeout(() => setMessage(""), 3000);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setMessage(`${profileText.messages.unexpectedPrefix} ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleTwoFactorAction = async () => {
        if (!is2FAEnabled) {
            setTwoFactorVisible(true);
            return;
        }

        try {
            setIs2FALoading(true);
            setMessage("");

            const { data: factorsData, error: factorsError } = await withAuthLockRetry(() => supabase.auth.mfa.listFactors());
            if (factorsError) {
                setMessage(`${profileText.messages.disable2faErrorPrefix} ${factorsError.message}`);
                return;
            }

            const totpFactors = factorsData?.totp || [];
            for (const factor of totpFactors) {
                const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
                if (error) {
                    setMessage(`${profileText.messages.disable2faErrorPrefix} ${error.message}`);
                    return;
                }
            }

            setIs2FAEnabled(false);
            setMessage(profileText.messages.disable2faSuccess);
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            setMessage(`${profileText.messages.unexpectedPrefix} ${error.message}`);
        } finally {
            setIs2FALoading(false);
        }
    };

    return (
        <div className="Profile">
            <TopMenu sendto="dashboard" setFleetPage={setFleetPage} currentPage="profile" />

            <h1 className="title">{profileText.title}</h1>
            <p className="description">{profileText.description}</p>
            
            {loading && <Loader />}
            {message && <p style={{color: message.includes("successfully") ? "green" : "red", padding: "1em"}}>{message}</p>}
            
            {!loading && (
            <div className="profile_content">
                <div className="profile__block">
                    <div className="profile__block--item">
                        <div style={{display: "flex", gap: "1em"}}>
                            <FaRegUser size={15} color="#94A3B8"/>
                            <p>{profileText.fields.fullName}</p>
                        </div>
                        <input 
                            type="text" 
                            name="contactpersone"
                            value={formData.contactpersone} 
                            className="editable_input" 
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="profile__block--item">
                        <div style={{display: "flex", gap: "1em"}}>
                            <RiBankFill size={15} color="#94A3B8"/>
                            <p>{profileText.fields.companyName}</p>
                        </div>
                        <input 
                            type="text" 
                            name="fleetname"
                            value={formData.fleetname} 
                            className="editable_input" 
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="profile__block--item">
                        <div style={{display: "flex", gap: "1em"}}>
                            <MdAlternateEmail size={15} color="#94A3B8"/>
                            <p>{profileText.fields.email}</p>
                        </div>
                        <div style={{display: "flex", flexDirection: "column", width: "60%"}}>
                            <input 
                                type="email" 
                                name="email"
                                value={formData.email} 
                                className="editable_input" 
                                onChange={handleInputChange}
                                aria-invalid={Boolean(emailError)}
                                required
                                style={{width: "100%"}}
                            />
                            <br />
                            {emailError && <p className="signup_form__error">{emailError}</p>}
                        </div>
                    </div>

                    <div className="profile__block--item">
                        <div style={{display: "flex", gap: "1em"}}>
                            <FaPhoneAlt size={15} color="#94A3B8"/>
                            <p>{profileText.fields.phone}</p>
                        </div>
                        <input 
                            type="text" 
                            name="phone"
                            value={formData.phone} 
                            className="editable_input" 
                            onChange={handleInputChange}
                        />
                    </div>
                    <button 
                        className="save_btn cta" 
                        onClick={handleSave}
                        disabled={saving || Boolean(emailError)}
                    >
                        {saving ? profileText.buttons.saving : profileText.buttons.save}
                    </button>
                </div>
                <div className="profile__block">
                    <h2 className="profile__block--title">{profileText.accountSettings.title}</h2>
                    <div className="profile__block--item">
                        <p>{profileText.accountSettings.changePassword}</p>
                        <button className="change_password_btn cta" onClick={() => setChangePasswordVisible(true)}>{profileText.buttons.change}</button>
                    </div>
                    <div className="profile__block--item">
                        <p>{profileText.accountSettings.twoFactor}</p>
                        <button className="change_password_btn cta" onClick={handleTwoFactorAction} disabled={is2FALoading}>
                            {is2FALoading ? profileText.buttons.processing : is2FAEnabled ? profileText.buttons.cancel : profileText.buttons.enable}
                        </button>
                    </div>
                </div>
            </div>
            )}
            {changePasswordVisible && (
                <ChangePassword onClose={() => setChangePasswordVisible(false)} />
            )}
            {twoFactorVisible && (
                <TwoFactorAuth
                    onClose={() => setTwoFactorVisible(false)}
                    onEnabled={async () => {
                        await refresh2FAState();
                        setTwoFactorVisible(false);
                    }}
                />
            )}
        </div>
    );
}

export default Profile;