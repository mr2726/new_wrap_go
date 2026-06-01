import FleetSignup from "./Fleet-signup";
import Dashboard from "./Dashboard";
import Contracts from "./Contracts";
import Billing from "./Billing";
import Profile from "./Profile";
import { useCallback, useEffect, useState } from "react";
import {
  getUser,
  checkFleetByUserId,
  mfaGetAssuranceLevel,
  mfaListFactors,
  mfaChallenge,
  mfaVerify,
  signOut,
} from "../../data/service";
import Loader from "../../Components/Loader";
import pageData from "../../data/data.json";

function FleetContent({ setPage }) {
    const gateText = pageData.fleet.fleetContent2fa;
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

            const { data: authData, error: authError } = await withAuthLockRetry(() => getUser());
            if (!isMounted) return;

            if (authError || !authData?.user) {
                setIsChecking2FA(false);
                return;
            }

            const { data: fleet, error: fleetError } = await checkFleetByUserId(authData.user.id);

            if (!isMounted) return;

            if (fleetError || !fleet) {
                setIsChecking2FA(false);
                return;
            }

            const { data: assuranceData } = await withAuthLockRetry(() => mfaGetAssuranceLevel());
            if (!isMounted) return;

            // If this session already has aal2, no extra prompt is needed.
            if (assuranceData?.currentLevel === "aal2") {
                setIsChecking2FA(false);
                return;
            }

            const { data: factorsData, error: factorsError } = await withAuthLockRetry(() => mfaListFactors());
            if (!isMounted) return;

            if (factorsError) {
                setTwoFactorError(factorsError.message || gateText.errors.loadFactors);
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

            const { data: challengeData, error: challengeError } = await withAuthLockRetry(() => mfaChallenge(verifiedFactor.id));

            if (!isMounted) return;

            if (challengeError || !challengeData?.id) {
                setTwoFactorError(challengeError?.message || gateText.errors.createChallenge);
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
    }, [withAuthLockRetry, gateText.errors.createChallenge, gateText.errors.loadFactors]);

    const handleVerify2FA = async (event) => {
        event.preventDefault();
        setTwoFactorError("");

        if (!factorId || !challengeId) {
            setTwoFactorError(gateText.errors.missingChallenge);
            return;
        }

        if (totpCode.length !== 6) {
            setTwoFactorError(gateText.errors.invalidCode);
            return;
        }

        setIsVerifying2FA(true);
        const { error } = await withAuthLockRetry(() => mfaVerify(factorId, challengeId, totpCode));

        if (error) {
            setTwoFactorError(error.message || gateText.errors.invalidCodeVerify);
            setIsVerifying2FA(false);
            return;
        }

        setTotpCode("");
        setRequires2FA(false);
        setIsVerifying2FA(false);
    };

    const handleSignOutFrom2FA = async () => {
        await signOut();
        setPage("signin");
    };

    const handleRetryChallenge = async () => {
        if (!factorId) {
            setTwoFactorError(gateText.errors.invalidFactor);
            return;
        }

        setIsVerifying2FA(true);
        setTwoFactorError("");

        const { data: challengeData, error } = await withAuthLockRetry(() => mfaChallenge(factorId));

        if (error || !challengeData?.id) {
            setTwoFactorError(error?.message || gateText.errors.createChallenge);
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
                    <h2 className="modal__title">{gateText.title}</h2>
                    <p className="modal__text">{gateText.description}</p>

                    <form className="security-modal__form" onSubmit={handleVerify2FA}>
                        <div className="security-modal__group">
                            <label className="signup_form__form--label" htmlFor="fleetSignInTotp">{gateText.codeLabel}</label>
                            <br />
                            <input
                                id="fleetSignInTotp"
                                type="text"
                                inputMode="numeric"
                                className="signup_form__form--input"
                                placeholder={gateText.placeholder}
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
                                {gateText.signOut}
                            </button>
                            {!challengeId && (
                                <button
                                    type="button"
                                    className="security-modal__button security-modal__button--ghost"
                                    onClick={handleRetryChallenge}
                                    disabled={isVerifying2FA}
                                >
                                    {gateText.retryChallenge}
                                </button>
                            )}
                            <button
                                type="submit"
                                className="security-modal__button signup_form__form--button"
                                disabled={isVerifying2FA || !challengeId}
                                style={{ padding: "0.5em 1.5em" }}
                            >
                                {isVerifying2FA ? gateText.verifying : gateText.verify}
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