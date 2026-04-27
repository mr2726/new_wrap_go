import "../../App.css";
import "./fleetResize.css";
import Logo from "../../Components/Logo";
import { useState, useEffect } from "react";
import { supabase } from "../../data/supabase";

function FleetSignup({ setPage, setFleetPage }) {
    const [userData, setUserData] = useState({
        fleetName: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        fleetSize: "",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fromOtp, setFromOtp] = useState(false);

    useEffect(() => {
        const checkExistingSession = async () => {
            const { data: authData } = await supabase.auth.getUser();
            if (authData?.user?.email) {
                setFromOtp(true);
                setUserData(prev => ({ ...prev, contactEmail: authData.user.email }));
            }
        };
        checkExistingSession();
    }, []);

    const isPasswordValid = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        return regex.test(password);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            let userId;
            let userEmail;

            if (fromOtp) {
                // User came via magic link — already authenticated
                const { data: authData, error: authError } = await supabase.auth.getUser();
                if (authError || !authData?.user?.id) {
                    setError("Session expired. Please request a new registration link.");
                    setIsSubmitting(false);
                    return;
                }
                userId = authData.user.id;
                userEmail = authData.user.email;
            } else {
                // Manual signup — validate passwords first
                if (userData.password !== userData.confirmPassword) {
                    setError("Passwords do not match.");
                    setIsSubmitting(false);
                    return;
                }
                if (!isPasswordValid(userData.password)) {
                    setError("Password must contain uppercase, lowercase, number, symbol and be at least 8 characters.");
                    setIsSubmitting(false);
                    return;
                }

                // Check if email already in fleets
                const { data: existingFleet, error: checkError } = await supabase
                    .from("fleets")
                    .select("email")
                    .eq("email", userData.contactEmail.toLowerCase())
                    .maybeSingle();

                if (checkError && checkError.code !== "PGRST116") throw checkError;

                if (existingFleet) {
                    setError("This email is already registered as a fleet.");
                    setIsSubmitting(false);
                    return;
                }

                const { data, error: signupError } = await supabase.auth.signUp({
                    email: userData.contactEmail,
                    password: userData.password,
                });

                if (signupError) {
                    setError(signupError.message || "Signup failed. Please try again.");
                    setIsSubmitting(false);
                    return;
                }

                userId = data?.user?.id;
                userEmail = userData.contactEmail.toLowerCase();
            }

            if (!userId) {
                setError("Failed to get user account. Please try again.");
                setIsSubmitting(false);
                return;
            }

            // Check if fleet record already exists for this user
            const { data: existingRecord } = await supabase
                .from("fleets")
                .select("userid")
                .eq("userid", userId)
                .maybeSingle();

            if (existingRecord) {
                if (setFleetPage) setFleetPage("dashboard");
                return;
            }

            const { error: insertError } = await supabase.from("fleets").insert([
                {
                    userid: userId,
                    email: (userEmail || "").toLowerCase(),
                    phone: userData.contactPhone,
                    fleetname: userData.fleetName,
                    contactpersone: userData.contactPerson,
                    fleetsize: parseInt(userData.fleetSize) || 0,
                }
            ]);

            if (insertError) {
                setError("Failed to save fleet info: " + insertError.message);
                setIsSubmitting(false);
                return;
            }

            setSuccess("Registration successful!");
            if (setFleetPage) {
                setTimeout(() => setFleetPage("dashboard"), 1500);
            }

        } catch (err) {
            setError(err.message || "An error occurred during signup.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fleet-signup">
            <div className="fleet-signup__content">
                <div className="fleet-signup__logo">
                    <Logo setPage={setPage} transfer="fleet-signup" />
                </div>
                <h1 className="fleet-signup__title">Fleet Signup</h1>
                <form className="fleet-signup__form" onSubmit={handleSubmit}>
                    <div className="fleet-signup__grid">
                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="fleet-name">Fleet Name</label>
                            <input 
                                className="signup_form__form--input" 
                                id="fleet-name" 
                                name="fleetName"
                                type="text" 
                                placeholder="Enter your fleet name" 
                                value={userData.fleetName}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="contact-person">Contact Person</label>
                            <input 
                                className="signup_form__form--input" 
                                id="contact-person" 
                                name="contactPerson"
                                type="text" 
                                placeholder="Enter the name of the contact person" 
                                value={userData.contactPerson}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="contact-email">Contact Email</label>
                            <input 
                                className="signup_form__form--input" 
                                id="contact-email" 
                                name="contactEmail"
                                type="email" 
                                placeholder="Enter the contact email address" 
                                value={userData.contactEmail}
                                onChange={handleChange}
                                disabled={fromOtp}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field">
                            <label className="signup_form__form--label" htmlFor="contact-phone">Contact Phone Number</label>
                            <input 
                                className="signup_form__form--input" 
                                id="contact-phone" 
                                name="contactPhone"
                                type="tel" 
                                inputMode="tel" 
                                placeholder="Enter the contact phone number" 
                                value={userData.contactPhone}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        <div className="fleet-signup__field fleet-signup__field--full">
                            <label className="signup_form__form--label" htmlFor="fleet-size">Fleet Size</label>
                            <input 
                                className="signup_form__form--input" 
                                id="fleet-size" 
                                name="fleetSize"
                                type="number" 
                                min="1" 
                                placeholder="Enter the number of vehicles in your fleet" 
                                value={userData.fleetSize}
                                onChange={handleChange}
                                required 
                            />
                        </div>

                        {!fromOtp && (
                            <>
                                <div className="fleet-signup__field">
                                    <label className="signup_form__form--label" htmlFor="password">Set Password</label>
                                    <input 
                                        className="signup_form__form--input" 
                                        id="password" 
                                        name="password"
                                        type="password" 
                                        placeholder="Create a password for your account" 
                                        value={userData.password}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>

                                <div className="fleet-signup__field">
                                    <label className="signup_form__form--label" htmlFor="confirm-password">Confirm Password</label>
                                    <input 
                                        className="signup_form__form--input" 
                                        id="confirm-password" 
                                        name="confirmPassword"
                                        type="password" 
                                        placeholder="Confirm your password" 
                                        value={userData.confirmPassword}
                                        onChange={handleChange}
                                        required 
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {error && <p className="signup_form__error fleet-signup__status">{error}</p>}
                    {success && <p className="fleet-signup__status fleet-signup__status--success">{success}</p>}
                    <button className="signup_form__form--button fleet-signup__submit" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default FleetSignup;