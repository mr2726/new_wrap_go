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


/* ========================================================================== */
import FleetContent from './Pages/Fleet/FleetContent';

/**
 * DashboardApp компонент
 * Основное приложение с аутентификацией и навигацией
 * Используется внутри /app маршрута
 */
function DashboardApp() {
  const [page, setPage] = useState("landing");
  const [email, setEmail] = useState("");
  // const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(true);

  const resolveAuthPage = async (session) => {
    if (!session?.user?.email_confirmed_at) {
      return "signin";
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("auntufication")
      .eq("userid", session.user.id)
      .maybeSingle();

    if (profileError) {
      return "signin";
    }

    if (!profile?.auntufication) {
      return "content";
    }

    return "signin";
  };

  const resolvePageFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const view = (params.get("view") || "").toLowerCase();

    const map = {
      signin: "signin",
      signup: "signup",
      terms: "terms",
      privacy: "privacy",
    };

    return map[view] || null;
  };

  const resolvePageFromPath = () => {
    const path = (window.location.pathname || "").toLowerCase();

    if (path === "/fleet/sigup" || path === "/fleet/signup") {
      return "fleet-content";
    }

    return null;
  };

  useEffect(() => {
    const hash = window.location.hash;
    const href = window.location.href;
    const pageFromQuery = resolvePageFromQuery();
    const pageFromPath = resolvePageFromPath();
    console.log(href);

    if (hash.includes("type=recovery")) {
      setPage("reset");
      setLoading(false);
    } else if (href.includes("confirm-email")) {
      setPage("company-info");
      setLoading(false);
    } else if (pageFromPath) {
      setPage(pageFromPath);
      setLoading(false);
    } else if (pageFromQuery) {
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
        return <Signup data={data.signup} setPage={setPage} setCredentials={setCredentials} />
      case "signin":
        return <Singin data={data.signin} setPage={setPage} />
      case "terms":
        return <Terms data={data.terms} setPage={setPage}/>
      case "privacy":
        return <PrivacyPolicy data={data.privacy} setPage={setPage}/>
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
        return <CompanyInfo data={data.companyInfo} setPage={setPage} setEmail={setEmail} credentials={credentials} />
      case "content":
        return <Content data={data.content} />
      default:
        return <Signup data={data.signup} setPage={setPage} setCredentials={setCredentials} />
    }
  }
  return (
    <div className="App">
      {loading ? <Loader /> : renderPage()}
    </div>
  );
}

export default DashboardApp;
