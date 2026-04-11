import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";

function Company({_companyData}) {
    return (
        <div className="settings__block">
            <ChangeImage title="Change Company Logo" type="company" />
            <SettingsForm title="Company Information" description="Update your company details and contact information" data={_companyData} />
        </div>
    );
}

export default Company;