import { useState, useEffect } from 'react';
import './App.css';
import data from "./data/data.json";
import { supabase } from './data/supabase';
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

const isMissingColumnError = (error) => {
  const message = (error?.message || "").toLowerCase();
  return message.includes("column") || message.includes("does not exist");
};

const getAccountDestination = async (user) => {
  // Fleet-owner magic link fallback: user_metadata.role set in Landing OTP call
  if (user.user_metadata?.role === "fleet-owner") {
    const { data: existingFleet } = await supabase
      .from("fleets")
      .select("userid")
      .eq("userid", user.id)
      .maybeSingle();
    return existingFleet ? "fleet-content" : "fleet-signup";
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("auntufication")
    .eq("userid", user.id)
    .maybeSingle();

  if (!profileError && profile) {
    return "content";
  }

  const { data: fleet, error: fleetError } = await supabase
    .from("fleets")
    .select("userid")
    .eq("userid", user.id)
    .maybeSingle();

  if (!fleetError && fleet) {
    return "fleet-content";
  }

  const { data: driverByUserId, error: driverByUserIdError } = await supabase
    .from("drivers")
    .select("id")
    .eq("userid", user.id)
    .maybeSingle();

  if (!driverByUserIdError && driverByUserId) {
    return "drivers-download";
  }

  if (driverByUserIdError && !isMissingColumnError(driverByUserIdError)) {
    return "signin";
  }

  const { data: driverByEmail, error: driverByEmailError } = await supabase
    .from("drivers")
    .select("id")
    .eq("email", (user.email || "").toLowerCase())
    .maybeSingle();

  if (!driverByEmailError && driverByEmail) {
    return "drivers-download";
  }

  if (driverByEmailError && !isMissingColumnError(driverByEmailError)) {
    return "signin";
  }

  return "company-info";
};

const resolveAuthPage = async (session) => {
  if (!session?.user) {
    return "signin";
  }

  if (!session.user.email_confirmed_at) {
    return "confirm-email";
  }

  return getAccountDestination(session.user);
};

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
  const [page, setPage] = useState("landing");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (page === "signin" || page === "signup") {
      localStorage.clear();
    }
  }, [page]);

  useEffect(() => {
    const syncEmailFromSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          setEmail(session.user.email ?? "");
          const nextPage = await resolveAuthPage(session);
          setPage(nextPage);
        } else {
          setPage("signup");
        }
        setLoading(false);
      });
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
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
        return <Signup data={data.signup} setPage={setPage} setEmail={setEmail} />
      case "signin":
        return <Singin data={data.signin} setPage={setPage} />
      case "terms":
        return <Terms data={data.terms} setPage={setPage}/>
      case "privacy":
        return <PrivacyPolicy data={data.privacy} setPage={setPage}/>
      case "fleet-signup":
        return <FleetSignup setPage={setPage} setFleetPage={() => setPage("fleet-content")} />
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
        return <Signup data={data.signup} setPage={setPage} setEmail={setEmail} />
    }
  }
  return (
    <div className="App">
      {loading ? <Loader /> : renderPage()}
    </div>
  );
}

export default DashboardApp;
