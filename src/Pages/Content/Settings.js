import "../../App.css";
import { useState, useEffect } from "react";
import { supabase } from "../../data/supabase";
import Profile from "./Settings/Profile";
import Company from "./Settings/Company";
import Loader from "../../Components/Loader";

function Settings() {
    const [content, setContent] = useState("profile");
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("userid", user.id)
            .single();
        if (profileError) {
            console.log(profileError.message);
            return;
        }
        setProfileData(profileData);
        setLoading(false);
    }
    const _profileData = [
        {
            "title": "Full Name",
            "dbKey": "name",
            "article": "",
            "value": profileData?.name || ""
        },
        {
            "title": "Email",
            "dbKey": "email",
            "article": "",
            "value": profileData?.email || ""
        },
        {
            "title": "Phone Number",
            "dbKey": "phone",
            "article": "",
            "value": profileData?.phone || ""
        }
    ]

    const _companyData = [
        {
            "title": "Company Name",
            "dbKey": "companyname",
            "article": "",
            "value": profileData?.companyname
        },
        {
            "title": "Industry",
            "dbKey": "industry",
            "article": "",
            "value": profileData?.industry
        },
        {
            "title": "Website (optional)",
            "dbKey": "web",
            "article": "",
            "value": profileData?.web
        },
        {
            "title": "Country",
            "dbKey": "country",
            "article": "",
            "value": profileData?.country
        },
        {
            "title": "City",
            "dbKey": "city",
            "article": "",
            "value": profileData?.city
        },
        {
            "title": "Address",
            "dbKey": "street",
            "article": "",
            "value": profileData?.street
        }
    ]

    useEffect(() => {
        fetchData();
    }, []);


    return (
        <div className="settings">
            {loading && <Loader />}
            <div className="settings__header">
                <h1 className="title">Settings</h1>
                <p className="description">Manage your account and preferences</p>
            </div>
            <div className="settings__content">
                <ul className="settings__menu">
                    <li>
                        <p className={content === "profile" ? "highlight" : ""} onClick={() => setContent("profile")}>Profile</p>
                    </li>
                    <li>
                        <p className={content === "company" ? "highlight" : ""} onClick={() => setContent("company")}>Company</p>
                    </li>
                    {/* <li>
                        <p className={content === "notifications" ? "highlight" : ""} onClick={() => setContent("notifications")}>Notifications</p>
                    </li>
                    <li>
                        <p className={content === "security" ? "highlight" : ""} onClick={() => setContent("security")}>Security</p>
                    </li> */}
                </ul>
                <div className="settings__main">
                    {content === "profile" && <Profile _profileData={_profileData} />}
                    {content === "company" && <Company _companyData={_companyData} />}
                    {content === "notifications" && <p>Notifications Content</p>}
                    {content === "security" && <p>Security Content</p>}

                </div>
            </div>
        </div>
    );
}

export default Settings;