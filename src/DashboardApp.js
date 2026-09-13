import { useState, useEffect } from 'react';
import './App.css';
import { useLanguage } from './context/LanguageContext';
import LanguageSelector from './Components/LanguageSelector';
import {
  getSession,
  onAuthStateChange,
} from './data/service';
import { resolveAuthPage } from './data/accountRouting';
import Loader from './Components/Loader';
import Signup from './Pages/Singup';
import Singin from './Pages/Singin';
import Terms from './Pages/Terms';
import PrivacyPolicy from './Pages/PrivacyPolicy';
import ResetOTP from './Pages/ResetPassword/ResetOTP';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import ResetPasswordStatus from './Pages/ResetPassword/ResetPasswordStatus';
import ResetPasswordEmail from './Pages/ResetPassword/ResetPasswordEmail';
import ConfirmEmail from './Pages/confirmEmail';
import CompanyInfo from './Pages/CompanyInfoForm';
import Content from './Pages/Content/Content';
import DriverAppNotice from './Pages/DriverAppNotice';

/* ========================================================================== */
import FleetContent from './Pages/Fleet/FleetContent';
import FleetSignup from './Pages/Fleet/Fleet-signup';

const resolvePageFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const view = (params.get("view") || "").toLowerCase();

  const map = {
    signin: "signin",
    signup: "signup",
    terms: "terms",
    privacy: "privacy",
    "reset-password": "reset",
    "company-info": "company-info",
    "confirm-email": "confirm-email",
    fleet: "fleet-content",
    "fleet-content": "fleet-content",
    "drivers-download": "drivers-download",
  };

  return map[view] || null;
};

const resolvePageFromPath = () => {
  const path = (window.location.pathname || "").toLowerCase();

  if (path === "/fleet/sigup" || path === "/fleet/signup" || path === "/fleet/singup") {
    return "fleet-signup";
  }

  return null;
};

/**
 * DashboardApp компонент
 * Основное приложение с аутентификацией и навигацией
 * Используется внутри /app маршрута
 */
function DashboardApp() {
  const { data } = useLanguage();
  const [page, setPage] = useState("landing");
  const [email, setEmail] = useState("");
  const [fleetSignupPrefill, setFleetSignupPrefill] = useState({ email: "", password: "" });
  const [signupDraft, setSignupDraft] = useState({ formData: {}, tab: "customer", termsAccepted: false });
  const [legalReturnPage, setLegalReturnPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAppPage = (nextPage) => {
    if (nextPage === "terms" || nextPage === "privacy") {
      window.history.replaceState({ dashboardPage: page }, "", window.location.href);
      window.history.pushState(
        { dashboardPage: nextPage, returnPage: page },
        "",
        window.location.href
      );
      setLegalReturnPage(page);
    }

    setPage(nextPage);
  };

  const handleLegalBack = () => {
    if (window.history.state?.dashboardPage === page && legalReturnPage) {
      window.history.back();
      return;
    }

    setPage(legalReturnPage || "signin");
  };

  useEffect(() => {
    if (page === "signin" || page === "signup") {
      const savedLang = localStorage.getItem("wrapgo_lang");
      localStorage.clear();
      if (savedLang) {
        localStorage.setItem("wrapgo_lang", savedLang);
      }
    }
  }, [page]);

  useEffect(() => {
    if (page !== "fleet-signup" && fleetSignupPrefill.password) {
      setFleetSignupPrefill((prev) => ({ ...prev, password: "" }));
    }
  }, [page, fleetSignupPrefill.password]);

  useEffect(() => {
    const handlePopState = (event) => {
      const historyPage = event.state?.dashboardPage;

      if (historyPage) {
        setPage(historyPage);
        setLegalReturnPage(event.state?.returnPage || null);
      } else if (legalReturnPage) {
        setPage(legalReturnPage);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [legalReturnPage]);

  useEffect(() => {
    const syncEmailFromSession = async () => {
      const { data: { session } } = await getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };

    const hash = window.location.hash;
    const pageFromQuery = resolvePageFromQuery();
    const pageFromPath = resolvePageFromPath();

    if (hash.includes("type=recovery")) {
      syncEmailFromSession();
      setPage("reset");
      setLoading(false);
    } else if (pageFromPath) {
      syncEmailFromSession();
      setPage(pageFromPath);
      setLoading(false);
    } else if (pageFromQuery) {
      syncEmailFromSession();
      setPage(pageFromQuery);
      setLoading(false);
    } else {
      // Проверяем существующую сессию при загрузке
      getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setEmail(session.user.email ?? "");
          const nextPage = await resolveAuthPage(session);
          setPage(nextPage);
        } else {
          setPage("signin");
        }
        setLoading(false);
      });
    }

    const { data: listener } = onAuthStateChange(
      (event, session) => {
        // setUser(session?.user ?? null);

        if (event === "SIGNED_OUT") {
          setPage("signin");
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          setEmail(session.user.email ?? "");
          resolveAuthPage(session).then((nextPage) => setPage(nextPage));
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const renderPage = () => {
    switch(page){
      case "signup":
        return <Signup data={data.signup} setPage={setAppPage} setEmail={setEmail} setFleetSignupPrefill={setFleetSignupPrefill} signupDraft={signupDraft} setSignupDraft={setSignupDraft} />
      case "signin":
        return <Singin data={data.signin} setPage={setAppPage} />
      case "terms":
        return <Terms data={data.terms} onBack={handleLegalBack}/>
      case "privacy":
        return <PrivacyPolicy data={data.privacy} onBack={handleLegalBack}/>
      case "fleet-signup":
        return (
          <FleetSignup
            setPage={setPage}
            setFleetPage={() => setPage("fleet-content")}
            prefillEmail={fleetSignupPrefill.email || email}
            prefillPassword={fleetSignupPrefill.password}
          />
        )
      case "fleet-content":
        return <FleetContent setPage={setPage} />
      case "otplink":
        return <ResetOTP data={data.resetPass.otpLink} setPage={setPage} setSender={setEmail}/>
      case "reset":
        return <ResetPassword data={data.resetPass.resetPasswordForm} setPage={setPage} />
      case "reset-status": 
        return <ResetPasswordStatus data={data.resetPass.resetPasswordStatus} setPage={setPage} />
      case "check-email":
        return <ResetPasswordEmail data={data.resetPass.resetPasswordEmail} setPage={setPage} email={email}/>
      case "confirm-email":
        return <ConfirmEmail data={data.confirmEmail} setPage={setPage} email={email} />
      case "company-info":
        return <CompanyInfo data={data.companyInfo} setPage={setPage} email={email} />
      case "drivers-download":
        return <DriverAppNotice setPage={setPage} />
      case "content":
        return <Content data={data.content} />
      default:
        return <Signup data={data.signup} setPage={setPage} setEmail={setEmail} setFleetSignupPrefill={setFleetSignupPrefill} />
    }
  }
  const showFloatingLangSelector = [
    "signin",
    "signup",
    "terms",
    "privacy",
    "otplink",
    "reset",
    "reset-status",
    "check-email",
    "confirm-email",
    "company-info",
    "drivers-download",
    "fleet-signup",
  ].includes(page);

  return (
    <div className="App">
      {showFloatingLangSelector && <LanguageSelector variant="floating" />}
      {loading ? <Loader /> : renderPage()}
    </div>
  );
}

export default DashboardApp;
