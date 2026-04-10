import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";

function Profile() {
    return (
        <div className="settings__block">
            <ChangeImage title="Change Profile Picture" type="profile" />
            <SettingsForm title="Personal Information" description="Update your personal details and contact information" />
        </div>
    );
}

export default Profile;