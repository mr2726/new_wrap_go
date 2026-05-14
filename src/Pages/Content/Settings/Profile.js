// import { useEffect, useState } from "react";
import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";
import pageData from "../../../data/data.json";
// import { supabase } from "../../../data/supabase";

function Profile({_profileData}) {
    const profileText = pageData.content.settings.profilePage;

    return (
        <div className="settings__block">
            <ChangeImage title={profileText.changeImageTitle} type="profile" />
            <SettingsForm title={profileText.formTitle} description={profileText.formDescription} data={_profileData} />
        </div>
    );
}

export default Profile;