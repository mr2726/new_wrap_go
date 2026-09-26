import "../../App.css";
import { useCallback, useEffect, useState } from "react";
import TopMenu from "../../Components/TopMenu";
import { FaRegUser, FaPhoneAlt } from "react-icons/fa";
import { MdAlternateEmail , MdOutlineSecurity} from "react-icons/md";
import { RiBankFill } from "react-icons/ri";
import { TbLockPassword } from "react-icons/tb";
import { IoKeyOutline } from "react-icons/io5";

// import { MdOutlineSecurity } from "react-icons/md";

import {
  getUser,
  mfaListFactors,
  getFleet,
  updateFleet,
  mfaUnenroll,
  signIn,
  updateUserEmailImmediate,
} from "../../data/service";
import Loader from "../../Components/Loader";
import ChangePassword from "./components/ChangePassword";
import TwoFactorAuth from "./components/2FA";
import { useLanguage } from "../../context/LanguageContext";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE, formatPhoneNumber, normalizeLocalPhoneDigits, splitPhoneNumber } from "../../data/phone";

function Profile({ setFleetPage }) {
    const { data: pageData } = useLanguage();
    const profileText = pageData.fleet.profile;
    const fallbackEmailRequired = "Email is required";
    const fallbackEmailInvalid = "Please enter a valid email address";
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
    const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
    const [phoneNumber, setPhoneNumber] = useState("");

    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [confirming, setConfirming] = useState(false);

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

        return "";
    }, [
        profileText.messages.emailRequired,
        profileText.messages.emailInvalid,
        fallbackEmailRequired,
        fallbackEmailInvalid,
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
        const { data: factorsData, error } = await withAuthLockRetry(() => mfaListFactors());
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
                const { data: { user } } = await getUser();
                if (user) {
                    const { data, error } = await getFleet(user.id);
                    if (error) {
                        console.error("Error fetching profile:", error);
                        setMessage(`${profileText.messages.loadErrorPrefix} ${error.message}`);
                    } else {
                        const savedPhone = splitPhoneNumber(data.phone);
                        setFormData({
                            contactpersone: data.contactpersone || "",
                            fleetname: data.fleetname || "",
                            email: data.email || "",
                            phone: formatPhoneNumber(savedPhone.countryCode, savedPhone.localNumber)
                        });
                        setCountryCode(savedPhone.countryCode);
                        setPhoneNumber(savedPhone.localNumber);
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

        if (name === "phone") {
            const localNumber = normalizeLocalPhoneDigits(countryCode, value);
            setPhoneNumber(localNumber);
            setFormData(prev => ({ ...prev, phone: formatPhoneNumber(countryCode, localNumber) }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveClick = () => {
        const normalizedEmail = (formData.email || "").trim().toLowerCase();
        const validationError = getEmailValidationError(normalizedEmail);
        if (validationError) {
            setEmailError(validationError);
            setMessage(validationError);
            return;
        }
        setEmailError("");
        setMessage("");
        setConfirmPasswordValue("");
        setConfirmPasswordError("");
        setConfirmPasswordVisible(true);
    };

    const handleConfirmPasswordSave = async () => {
        if (!confirmPasswordValue) {
            setConfirmPasswordError(profileText.confirmPassword.errors.required);
            return;
        }

        try {
            setConfirming(true);
            setConfirmPasswordError("");

            const { data: { user } } = await getUser();
            if (!user) {
                setConfirmPasswordError(profileText.messages.userNotAuthenticated);
                return;
            }

            const { error: signInError } = await signIn(user.email, confirmPasswordValue);
            if (signInError) {
                setConfirmPasswordError(profileText.confirmPassword.errors.wrong);
                return;
            }

            setConfirmPasswordVisible(false);
            await handleSave();
        } finally {
            setConfirming(false);
        }
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
            
            const { data: { user } } = await getUser();
            if (!user) {
                setMessage(profileText.messages.userNotAuthenticated);
                return;
            }

            // Keep Supabase Auth in sync when the fleet email changes.
            if (normalizedEmail !== (user.email || "").trim().toLowerCase()) {
                const { error: authError } = await updateUserEmailImmediate(normalizedEmail);
                if (authError) {
                    setMessage(`${profileText.messages.saveErrorPrefix} ${authError.message}`);
                    return;
                }
            }

            const { error } = await updateFleet(user.id, {
                    contactpersone: formData.contactpersone,
                    fleetname: formData.fleetname,
                    email: normalizedEmail,
                    phone: formData.phone
                });

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

            const { data: factorsData, error: factorsError } = await withAuthLockRetry(() => mfaListFactors());
            if (factorsError) {
                setMessage(`${profileText.messages.disable2faErrorPrefix} ${factorsError.message}`);
                return;
            }

            const totpFactors = factorsData?.totp || [];
            for (const factor of totpFactors) {
                const { error } = await mfaUnenroll(factor.id);
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

    // return (
    //     <div className="Profile">
    //         <TopMenu sendto="dashboard" setFleetPage={setFleetPage} currentPage="profile" />

    //         <h1 className="title">{profileText.title}</h1>
    //         <p className="description">{profileText.description}</p>
            
    //         {loading && <Loader />}
    //         {message && <p style={{color: message.includes("successfully") ? "green" : "red", padding: "1em"}}>{message}</p>}
            
    //         {!loading && (
    //         <div className="profile_content">
    //             <div className="profile__block">
    //                 <div className="profile__block--item">
    //                     <div style={{display: "flex", gap: "1em"}}>
    //                         <FaRegUser size={15} color="#94A3B8"/>
    //                         <p>{profileText.fields.fullName}</p>
    //                     </div>
    //                     <input 
    //                         type="text" 
    //                         name="contactpersone"
    //                         value={formData.contactpersone} 
    //                         className="editable_input" 
    //                         onChange={handleInputChange}
    //                     />
    //                 </div>
    //                 <div className="profile__block--item">
    //                     <div style={{display: "flex", gap: "1em"}}>
    //                         <RiBankFill size={15} color="#94A3B8"/>
    //                         <p>{profileText.fields.companyName}</p>
    //                     </div>
    //                     <input 
    //                         type="text" 
    //                         name="fleetname"
    //                         value={formData.fleetname} 
    //                         className="editable_input" 
    //                         onChange={handleInputChange}
    //                     />
    //                 </div>
    //                 <div className="profile__block--item">
    //                     <div style={{display: "flex", gap: "1em"}}>
    //                         <MdAlternateEmail size={15} color="#94A3B8"/>
    //                         <p>{profileText.fields.email}</p>
    //                     </div>
    //                     <div style={{display: "flex", flexDirection: "column", width: "60%"}}>
    //                         <input
    //                             type="email" 
    //                             name="email"
    //                             value={formData.email} 
    //                             className="editable_input"
    //                             onChange={handleInputChange}
    //                             aria-invalid={Boolean(emailError)}
    //                             required
    //                             style={{width: "100%"}}
    //                         />
    //                         <br />
    //                         {emailError && <p className="signup_form__error">{emailError}</p>}
    //                     </div>
    //                 </div>

    //                 <div className="profile__block--item">
    //                     <div style={{display: "flex", gap: "1em"}}>
    //                         <FaPhoneAlt size={15} color="#94A3B8"/>
    //                         <p>{profileText.fields.phone}</p>
    //                     </div>
    //                     <div className="phone-control profile-phone-control">
    //                         <select
    //                             className="country-code"
    //                             aria-label={profileText.fields.phone}
    //                             value={countryCode}
    //                             onChange={(event) => {
    //                                 const nextCountryCode = event.target.value;
    //                                 setCountryCode(nextCountryCode);
    //                                 setFormData(prev => ({ ...prev, phone: formatPhoneNumber(nextCountryCode, phoneNumber) }));
    //                             }}
    //                         >
    //                             {COUNTRY_CODES.map((code) => <option key={code} value={code}>{code}</option>)}
    //                         </select>
    //                         <input
    //                             type="tel"
    //                             name="phone"
    //                             value={phoneNumber}
    //                             className="editable_input"
    //                             onChange={handleInputChange}
    //                             inputMode="numeric"
    //                             pattern="[0-9]*"
    //                             placeholder="XX XXXXXX"
    //                         />
    //                     </div>
    //                 </div>
    //                 <button 
    //                     className="save_btn cta" 
    //                     onClick={handleSaveClick}
    //                     disabled={saving}
    //                 >
    //                     {saving ? profileText.buttons.saving : profileText.buttons.save}
    //                 </button>
    //             </div>
    //             <div className="profile__block">
    //                 <h2 className="profile__block--title">{profileText.accountSettings.title}</h2>
    //                 <div className="profile__block--item">
    //                     <p>{profileText.accountSettings.changePassword}</p>
    //                     <button className="change_password_btn cta" onClick={() => setChangePasswordVisible(true)}>{profileText.buttons.change}</button>
    //                 </div>
    //                 <div className="profile__block--item">
    //                     <p>{profileText.accountSettings.twoFactor}</p>
    //                     <button className="change_password_btn cta" onClick={handleTwoFactorAction} disabled={is2FALoading}>
    //                         {is2FALoading ? profileText.buttons.processing : is2FAEnabled ? profileText.buttons.cancel : profileText.buttons.enable}
    //                     </button>
    //                 </div>
    //             </div>
    //         </div>
    //         )}
    //         {changePasswordVisible && (
    //             <ChangePassword onClose={() => setChangePasswordVisible(false)} />
    //         )}
    //         {twoFactorVisible && (
    //             <TwoFactorAuth
    //                 onClose={() => setTwoFactorVisible(false)}
    //                 onEnabled={async () => {
    //                     await refresh2FAState();
    //                     setTwoFactorVisible(false);
    //                 }}
    //             />
    //         )}
    //         {confirmPasswordVisible && (
    //             <div className="add-driver-form" onClick={() => setConfirmPasswordVisible(false)} style={{ zIndex: 1000 }}>
    //                 <div
    //                     className="add-driver-form___block"
    //                     onClick={(event) => event.stopPropagation()}
    //                     style={{ maxWidth: 420, width: "92%" }}
    //                 >
    //                     <div className="popup__title">
    //                         <h2>{profileText.confirmPassword.title}</h2>
    //                         <p onClick={() => setConfirmPasswordVisible(false)} style={{ cursor: "pointer" }}>{profileText.confirmPassword.close}</p>
    //                     </div>

    //                     <p className="get_otp__content--description">{profileText.confirmPassword.description}</p>

    //                     <label className="signup_form__form--label">{profileText.confirmPassword.label}</label>
    //                     <input
    //                         className="signup_form__form--input"
    //                         type="password"
    //                         placeholder={profileText.confirmPassword.placeholder}
    //                         value={confirmPasswordValue}
    //                         onChange={(event) => setConfirmPasswordValue(event.target.value)}
    //                         autoFocus
    //                     />

    //                     {confirmPasswordError && (
    //                         <p style={{ color: "#dc2626", margin: "8px 0 0" }}>{confirmPasswordError}</p>
    //                     )}

    //                     <button
    //                         className="signup_form__form--button"
    //                         type="button"
    //                         disabled={confirming}
    //                         onClick={handleConfirmPasswordSave}
    //                         style={{ marginTop: 16 }}
    //                     >
    //                         {confirming ? profileText.confirmPassword.confirming : profileText.confirmPassword.confirm}
    //                     </button>
    //                 </div>
    //             </div>
    //         )}
    //     </div>
    // );
    return (
        <div className="Profile">
            <TopMenu
                sendto="dashboard"
                setFleetPage={setFleetPage}
                currentPage="profile"
            />

            <main className="profile-page__content">

                <header className="profile-header">
                    <h1 className="profile-header__title">
                        {profileText.title}
                    </h1>

                    <p className="profile-header__description">
                        {profileText.description}
                    </p>
                </header>

                {loading && <Loader />}

                {message && (
                    <p
                        className={`profile-message ${
                            message.includes("successfully")
                                ? "profile-message--success"
                                : "profile-message--error"
                        }`}
                    >
                        {message}
                    </p>
                )}

                {!loading && (
                    <div className="profile-layout">

                        {/* LEFT COLUMN */}
                        <div className="profile-column">

                            <section className="profile-card profile-details-card">

                                <div className="profile-card__header">
                                    <h2 className="profile-card__title">
                                        {profileText.additionaldetails.profileDetails}
                                    </h2>

                                    <button
                                        className="profile-outline-button"
                                        onClick={handleSaveClick}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? profileText.buttons.saving
                                            : profileText.buttons.save}
                                    </button>
                                </div>

                                <div className="profile-fields">

                                    {/* FULL NAME */}
                                    <div className="profile-field">
                                        <div className="profile-field__label">
                                            <FaRegUser
                                                size={15}
                                                color="#94A3B8"
                                            />
                                            <span>
                                                {profileText.fields.fullName}
                                            </span>
                                        </div>

                                        <input
                                            type="text"
                                            name="contactpersone"
                                            value={formData.contactpersone}
                                            className="profile-input"
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* COMPANY */}
                                    <div className="profile-field">
                                        <div className="profile-field__label">
                                            <RiBankFill
                                                size={15}
                                                color="#94A3B8"
                                            />
                                            <span>
                                                {profileText.fields.companyName}
                                            </span>
                                        </div>

                                        <input
                                            type="text"
                                            name="fleetname"
                                            value={formData.fleetname}
                                            className="profile-input"
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    {/* EMAIL */}
                                    <div className="profile-field">
                                        <div className="profile-field__label">
                                            <MdAlternateEmail
                                                size={15}
                                                color="#94A3B8"
                                            />
                                            <span>
                                                {profileText.fields.email}
                                            </span>
                                        </div>

                                        <div className="profile-email-wrapper">
                                            <div className="profile-email-input-wrapper">
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    className="profile-input"
                                                    onChange={handleInputChange}
                                                    aria-invalid={Boolean(emailError)}
                                                    required
                                                />

                                                {!emailError && formData.email && (
                                                    <span className="profile-email-status">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>

                                            {emailError && (
                                                <p className="profile-error">
                                                    {emailError}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* PHONE */}
                                    <div className="profile-field">
                                        <div className="profile-field__label">
                                            <FaPhoneAlt
                                                size={15}
                                                color="#94A3B8"
                                            />
                                            <span>
                                                {profileText.fields.phone}
                                            </span>
                                        </div>

                                        <div className="profile-phone">
                                            <select
                                                className="profile-country-code"
                                                aria-label={profileText.fields.phone}
                                                value={countryCode}
                                                onChange={(event) => {
                                                    const nextCountryCode = event.target.value;

                                                    setCountryCode(nextCountryCode);

                                                    setFormData(prev => ({
                                                        ...prev,
                                                        phone: formatPhoneNumber(
                                                            nextCountryCode,
                                                            phoneNumber
                                                        )
                                                    }));
                                                }}
                                            >
                                                {COUNTRY_CODES.map((code) => (
                                                    <option key={code} value={code}>
                                                        {code}
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={phoneNumber}
                                                className="profile-phone__input"
                                                onChange={handleInputChange}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                placeholder="XX XXXXXX"
                                            />
                                        </div>
                                    </div>

                                </div>

                            </section>

                            {/* PREFERENCES */}
                            {/* <section className="profile-card profile-preferences">

                                <h2 className="profile-card__title">
                                    {profileText.additionaldetails.preferences}
                                </h2>

                                <div className="profile-preference">

                                    <label className="profile-preference__label">
                                        {profileText.additionaldetails.language}
                                    </label>

                                    <select className="profile-select">
                                        <option>English</option>
                                        <option>Русский</option>
                                        <option>Հայերեն</option>
                                    </select>

                                    <p className="profile-preference__hint">
                                        Հայերեն · Русский also available
                                    </p>

                                </div>

                            </section> */}

                        </div>


                        {/* RIGHT COLUMN */}
                        <div className="profile-column">

                            {/* ACCOUNT SECURITY */}
                            <section className="profile-card security-card">

                                <div className="security-card__intro">
                                    <MdOutlineSecurity color="#e2e8f0" size={25}/>

                                    {/* <div className="security-icon">
                                        <span>✓</span>
                                    </div> */}

                                    <div className="security-card__content">

                                        <div className="security-card__heading">
                                            <h2 className="profile-card__title">
                                                {profileText.additionaldetails.strengthenAccount}
                                            </h2>

                                            <span className="security-badge">
                                                <span>!</span>
                                                {profileText.additionaldetails.actionNeeded}
                                            </span>
                                        </div>

                                        <p className="security-description">
                                            {profileText.additionaldetails["two-factor"]}
                                        </p>

                                        <button
                                            className="security-primary-button"
                                            onClick={handleTwoFactorAction}
                                            disabled={is2FALoading}
                                        >
                                            {is2FALoading
                                                ? profileText.buttons.processing
                                                : is2FAEnabled
                                                    ? profileText.buttons.cancel
                                                    : profileText.buttons.enable}
                                        </button>

                                    </div>

                                </div>


                                {/* PASSWORD */}
                                <div className="security-row">
                                    <TbLockPassword color="#e2e8f0" size={25}/>
                                    {/* <div className="security-row__icon">
                                        <span>⚿</span>
                                    </div> */}

                                    <div className="security-row__content">
                                        <h3>{profileText.additionaldetails.password}</h3>

                                        <p>
                                            {profileText.additionaldetails.passwordDescription}
                                        </p>
                                    </div>

                                    <button
                                        className="profile-outline-button"
                                        onClick={() =>
                                            setChangePasswordVisible(true)
                                        }
                                    >
                                        {profileText.buttons.change}
                                    </button>

                                </div>


                                {/* RECOVERY CODES */}
                                <div className="security-row security-row--last">
                                    <IoKeyOutline color="#e2e8f0" size={25}/>
                                    {/* <div className="security-row__icon">
                                        <span>♙</span>
                                    </div> */}

                                    <div className="security-row__content">
                                        <h3>{profileText.additionaldetails.recoveryCodes}</h3>

                                        <p>
                                            {profileText.additionaldetails.availableAfterTwoFactorSetup}
                                        </p>
                                    </div>

                                </div>

                            </section>


                            {/* ACTIVE SESSIONS PLACEHOLDER */}
                            {/* <section className="profile-card sessions-card">

                                <div className="sessions-card__header">
                                    <h2 className="profile-card__title">
                                        Active sessions
                                    </h2>

                                    <p>
                                        Review devices signed in to your account.
                                    </p>
                                </div>

                                <div className="session-item">

                                    <div className="session-icon">
                                        ◻
                                    </div>

                                    <div className="session-info">
                                        <h3>Current session</h3>
                                        <p>
                                            Your active browser session
                                        </p>
                                    </div>

                                    <span className="session-badge">
                                        Active now
                                    </span>

                                </div>

                            </section> */}

                        </div>

                    </div>
                )}

            </main>


            {/* CHANGE PASSWORD */}
            {changePasswordVisible && (
                <ChangePassword
                    onClose={() => setChangePasswordVisible(false)}
                />
            )}


            {/* TWO FACTOR */}
            {twoFactorVisible && (
                <TwoFactorAuth
                    onClose={() => setTwoFactorVisible(false)}
                    onEnabled={async () => {
                        await refresh2FAState();
                        setTwoFactorVisible(false);
                    }}
                />
            )}


            {/* CONFIRM PASSWORD */}
            {confirmPasswordVisible && (
                <div
                    className="profile-modal"
                    onClick={() => setConfirmPasswordVisible(false)}
                    style={{ zIndex: 1000 }}
                >
                    <div
                        className="profile-modal__content"
                        onClick={(event) => event.stopPropagation()}
                        style={{ maxWidth: 420, width: "92%" }}
                    >

                        <div className="profile-modal__header">

                            <h2>
                                {profileText.confirmPassword.title}
                            </h2>

                            <p
                                onClick={() =>
                                    setConfirmPasswordVisible(false)
                                }
                                className="profile-modal__close"
                            >
                                {profileText.confirmPassword.close}
                            </p>

                        </div>

                        <p className="profile-modal__description">
                            {profileText.confirmPassword.description}
                        </p>

                        <label className="profile-modal__label">
                            {profileText.confirmPassword.label}
                        </label>

                        <input
                            className="profile-modal__input"
                            type="password"
                            placeholder={
                                profileText.confirmPassword.placeholder
                            }
                            value={confirmPasswordValue}
                            onChange={(event) =>
                                setConfirmPasswordValue(event.target.value)
                            }
                            autoFocus
                        />

                        {confirmPasswordError && (
                            <p className="profile-modal__error">
                                {confirmPasswordError}
                            </p>
                        )}

                        <button
                            className="profile-modal__button"
                            type="button"
                            disabled={confirming}
                            onClick={handleConfirmPasswordSave}
                        >
                            {confirming
                                ? profileText.confirmPassword.confirming
                                : profileText.confirmPassword.confirm}
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;