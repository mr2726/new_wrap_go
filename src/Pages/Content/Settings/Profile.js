import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";
import { useLanguage } from "../../../context/LanguageContext";

function Profile({_profileData}) {
    const { data: pageData } = useLanguage();
    const profileText = pageData.content.settings.profilePage;

    return (
        <div className="settings__block">
            <ChangeImage title={profileText.changeImageTitle} type="profile" />
            <SettingsForm title={profileText.formTitle} description={profileText.formDescription} data={_profileData} />
        </div>
    );
}

export default Profile;