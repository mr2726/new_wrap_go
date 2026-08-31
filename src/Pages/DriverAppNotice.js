import "../App.css";
import Logo from "../Components/Logo";
import { useLanguage } from "../context/LanguageContext";

function DriverAppNotice({ setPage }) {
  const { data: pageData } = useLanguage();
  const driverPageData = pageData.driverAppNotice;

  return (
    <div className="reset">
      <Logo setPage={setPage} transfer="signin" />
      <div className="reset__content">
        <h3 className="get_otp__content--title">{driverPageData.title}</h3>
        <p className="get_otp__content--description">
          {driverPageData.description}
        </p>
        <div className="dispflexcoulumn">
          <a
            className="signup_form__form--button"
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
          >
            {driverPageData.googlePlay}
          </a>
          <a
            className="signup_form__form--button"
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noreferrer"
          >
            {driverPageData.appStore}
          </a>
          <button className="resend" onClick={() => setPage("signin")}>
            {driverPageData.back}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverAppNotice;
