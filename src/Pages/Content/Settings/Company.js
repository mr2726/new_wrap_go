import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";

function Company() {
    return (
        <div className="settings__block">
            <ChangeImage title="Change Company Logo" type="company" />
            <SettingsForm title="Company Information" description="Update your company details and contact information" />
        </div>
    );
}

export default Company;