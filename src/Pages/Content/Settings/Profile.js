// import { useEffect, useState } from "react";
import "../../../App.css";
import ChangeImage from "../../../Components/ChangeImage";
import SettingsForm from "../../../Components/SettingsForm";
// import { supabase } from "../../../data/supabase";

function Profile({_profileData}) {
    

    return (
        <div className="settings__block">
            <ChangeImage title="Change Profile Picture" type="profile" />
            <SettingsForm title="Personal Information" description="Update your personal details and contact information" data={_profileData} />
        </div>
    );
}

export default Profile;