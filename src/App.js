import { useState, useEffect } from 'react';
import './App.css';
import data from "./data/data.json";
import { supabase } from './data/supabase';
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
  useEffect(() => {
    const hash = window.location.hash;
    console.log(window.location.href)

    if (hash.includes("type=recovery")) {
      setPage("reset");
    }

    if (window.location.href.includes("confirm-email")) {
      setPage("company-info");
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);

        if (
          event === "SIGNED_IN" &&
          session?.user &&
          session.user.email_confirmed_at
        ) {
          // setPage("company-info");
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
        return <Signup data={data.signup} setPage={setPage} setEmail={setEmail} />
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
        return <CompanyInfo setPage={setPage} email={email} />
      case "content":
        return <Content data={data.content} />
      default:
        return <Signup data={data.signup} setPage={setPage} />
    }
  }
  return (
    <div className="App">
      {/* {user ? <Content data={data.content} /> : renderPage()} */}
      {renderPage()}
    </div>
  );
}

export default App;
