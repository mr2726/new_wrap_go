import "../App.css";
import Logo from "../Components/Logo";

function DriverAppNotice({ setPage }) {
  return (
    <div className="reset">
      <Logo setPage={setPage} transfer="signin" />
      <div className="reset__content">
        <h3 className="get_otp__content--title">Driver Account Detected</h3>
        <p className="get_otp__content--description">
          Your account is registered as a driver. Please use the mobile app to continue.
        </p>
        <div className="dispflexcoulumn">
          <a
            className="signup_form__form--button"
            href="https://play.google.com/store"
            target="_blank"
            rel="noreferrer"
          >
            Download on Google Play
          </a>
          <a
            className="signup_form__form--button"
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noreferrer"
          >
            Download on App Store
          </a>
          <button className="resend" onClick={() => setPage("signin")}>
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverAppNotice;
