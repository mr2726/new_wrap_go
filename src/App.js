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

function App() {
  const [page, setPage] = useState("signup");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const hash = window.location.hash;
    const href = window.location.href;
    console.log(href);

    if (hash.includes("type=recovery")) {
      setPage("reset");
    } else if (href.includes("confirm-email")) {
      setPage("company-info");
    } else {
      // Проверяем существующую сессию при загрузке
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email_confirmed_at) {
          setUser(session.user);
          setEmail(session.user.email ?? "");
          setPage("content");
        }
        setLoading(false);
      });
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        if (
          event === "SIGNED_IN" &&
          session?.user &&
          session.user.email_confirmed_at
        ) {
          setEmail(session.user.email ?? "");
          setPage("content");
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
      case "otplink":
        return <ResetOTP data={data.resetPass.otpLink} setPage={setPage} setSender={setEmail}/>
      case "reset":
        return <ResetPassword data={data.resetPass.resetPasswordForm} setPage={setPage} />
      case "reset-status": 
        return <ResetPasswordStatus data={data.resetPass.resetPasswordStatus} setPage={setPage} />
      case "check-email":
        return <ResetPasswordEmail data={data.resetPass.resetPasswordEmail} setPage={setPage} email={email}/>
      case "confirm-email":
        return <ConfirmEmail setPage={setPage} email={email} />
      case "company-info":
        return <CompanyInfo setPage={setPage} setEmail={setEmail} credentials={credentials} />
      case "content":
        return <Content data={data.content} />
      default:
        return <Signup data={data.signup} setPage={setPage} />
    }
  }
  return (
    <div className="App">
      {loading ? <Loader /> : renderPage()}
    </div>
  );
}

export default App;
