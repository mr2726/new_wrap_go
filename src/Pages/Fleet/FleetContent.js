import FleetSignup from "./Fleet-signup";
import Dashboard from "./Dashboard";
import Contracts from "./Contracts";
import Billing from "./Billing";
import Profile from "./Profile";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../data/supabase";
import Loader from "../../Components/Loader";

function FleetContent({ setPage }) {
    const [fleetPage, setFleetPage] = useState("dashboard");
    const [isChecking2FA, setIsChecking2FA] = useState(true);
    const [requires2FA, setRequires2FA] = useState(false);
    const [factorId, setFactorId] = useState("");
    const [challengeId, setChallengeId] = useState("");
    const [totpCode, setTotpCode] = useState("");
    const [twoFactorError, setTwoFactorError] = useState("");
    const [isVerifying2FA, setIsVerifying2FA] = useState(false);

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

    useEffect(() => {
        let isMounted = true;

        const enforceFleet2FA = async () => {
            setIsChecking2FA(true);
            setTwoFactorError("");

            const { data: authData, error: authError } = await withAuthLockRetry(() => supabase.auth.getUser());
            if (!isMounted) return;

            if (authError || !authData?.user) {
                setIsChecking2FA(false);
                return;
            }

            const { data: fleet, error: fleetError } = await supabase
                .from("fleets")
                .select("userid")
                .eq("userid", authData.user.id)
                .maybeSingle();

            if (!isMounted) return;

            if (fleetError || !fleet) {
                setIsChecking2FA(false);
                return;
            }

            const { data: assuranceData } = await withAuthLockRetry(() => supabase.auth.mfa.getAuthenticatorAssuranceLevel());
            if (!isMounted) return;

            // If this session already has aal2, no extra prompt is needed.
            if (assuranceData?.currentLevel === "aal2") {
                setIsChecking2FA(false);
                return;
            }

            const { data: factorsData, error: factorsError } = await withAuthLockRetry(() => supabase.auth.mfa.listFactors());
            if (!isMounted) return;

            if (factorsError) {
                setTwoFactorError(factorsError.message || "Failed to load 2FA factors.");
                setIsChecking2FA(false);
                return;
            }

            const verifiedFactor = (factorsData?.totp || []).find((factor) => factor.status === "verified");

            // 2FA is not enabled for this account.
            if (!verifiedFactor) {
                setIsChecking2FA(false);
                return;
            }

            // Lock Fleet UI until MFA challenge is verified.
            setRequires2FA(true);
            setFactorId(verifiedFactor.id);

            const { data: challengeData, error: challengeError } = await withAuthLockRetry(() => supabase.auth.mfa.challenge({
                factorId: verifiedFactor.id,
            }));

            if (!isMounted) return;

            if (challengeError || !challengeData?.id) {
                setTwoFactorError(challengeError?.message || "Failed to create 2FA challenge.");
                setChallengeId("");
                setIsChecking2FA(false);
                return;
            }

            setChallengeId(challengeData.id);
            setIsChecking2FA(false);
        };

        enforceFleet2FA();

        return () => {
            isMounted = false;
        };
    }, [withAuthLockRetry]);

    const handleVerify2FA = async (event) => {
        event.preventDefault();
        setTwoFactorError("");

        if (!factorId || !challengeId) {
            setTwoFactorError("2FA challenge is missing. Please sign in again.");
            return;
        }

        if (totpCode.length !== 6) {
            setTwoFactorError("Enter a valid 6-digit code.");
            return;
        }

        setIsVerifying2FA(true);
        const { error } = await withAuthLockRetry(() => supabase.auth.mfa.verify({
            factorId,
            challengeId,
            code: totpCode,
        }));

        if (error) {
            setTwoFactorError(error.message || "Invalid authenticator code.");
            setIsVerifying2FA(false);
            return;
        }

        setTotpCode("");
        setRequires2FA(false);
        setIsVerifying2FA(false);
    };

    const handleSignOutFrom2FA = async () => {
        await supabase.auth.signOut();
        setPage("signin");
    };

    const handleRetryChallenge = async () => {
        if (!factorId) {
            setTwoFactorError("2FA factor is missing. Please sign in again.");
            return;
        }

        setIsVerifying2FA(true);
        setTwoFactorError("");

        const { data: challengeData, error } = await withAuthLockRetry(() => supabase.auth.mfa.challenge({
            factorId,
        }));

        if (error || !challengeData?.id) {
            setTwoFactorError(error?.message || "Failed to create 2FA challenge.");
            setIsVerifying2FA(false);
            return;
        }

        setChallengeId(challengeData.id);
        setIsVerifying2FA(false);
    };

    const RenderFleetPage = () => {
        switch (fleetPage) {
            case "signup":
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
            case "dashboard":
                return <Dashboard setFleetPage={setFleetPage} />;
            case "billing":
                return <Billing setFleetPage={setFleetPage} />;
            case "contracts":
                return <Contracts setFleetPage={setFleetPage} />;
            case "profile":
                return <Profile setFleetPage={setFleetPage} />;
            default:
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
        }
    };
    if (isChecking2FA) {
        return <Loader />;
    }

    if (requires2FA) {
        return (
            <div className="modal">
                <div className="modal__content security-modal" onClick={(event) => event.stopPropagation()}>
                    <h2 className="modal__title">Two-Factor Authentication</h2>
                    <p className="modal__text">Enter the 6-digit code from Google Authenticator to continue.</p>

                    <form className="security-modal__form" onSubmit={handleVerify2FA}>
                        <div className="security-modal__group">
                            <label className="signup_form__form--label" htmlFor="fleetSignInTotp">Authenticator Code</label>
                            <br />
                            <input
                                id="fleetSignInTotp"
                                type="text"
                                inputMode="numeric"
                                className="signup_form__form--input"
                                placeholder="123456"
                                value={totpCode}
                                style={{ width: "100%" }}
                                onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                                required
                            />
                        </div>

                        {twoFactorError && <p className="signup_form__error">{twoFactorError}</p>}

                        <div className="security-modal__actions">
                            <button
                                type="button"
                                className="security-modal__button security-modal__button--ghost"
                                onClick={handleSignOutFrom2FA}
                                disabled={isVerifying2FA}
                            >
                                Sign out
                            </button>
                            {!challengeId && (
                                <button
                                    type="button"
                                    className="security-modal__button security-modal__button--ghost"
                                    onClick={handleRetryChallenge}
                                    disabled={isVerifying2FA}
                                >
                                    Retry challenge
                                </button>
                            )}
                            <button
                                type="submit"
                                className="security-modal__button signup_form__form--button"
                                disabled={isVerifying2FA || !challengeId}
                                style={{ padding: "0.5em 1.5em" }}
                            >
                                {isVerifying2FA ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return <RenderFleetPage />;
}

export default FleetContent;