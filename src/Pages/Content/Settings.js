import "../../App.css";
import { useState, useEffect } from "react";
import { supabase } from "../../data/supabase";
import pageData from "../../data/data.json";
import Profile from "./Settings/Profile";
import Company from "./Settings/Company";
import Notifications from "./Settings/Notification";
import Security from "./Settings/Security";
import Loader from "../../Components/Loader";
import { FaRegUser } from "react-icons/fa";
import { BiSolidFactory } from "react-icons/bi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineShield } from "react-icons/md";

function Settings() {
    const settingsPageData = pageData.content.settings.page;
    const settingsFields = pageData.content.settings;
    const [content, setContent] = useState("profile");
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("userid", user.id)
                .single();
            if (profileError) {
                console.error(profileError.message);
                return;
            }
            setProfileData(profileData);
        } finally {
            setLoading(false);
        }
    }
    const _profileData = [
        {
            "title": settingsFields.profileFields.fullName,
            "dbKey": "name",
            "article": "",
            "value": profileData?.name || ""
        },
        {
            "title": settingsFields.profileFields.email,
            "dbKey": "email",
            "article": "",
            "value": profileData?.email || ""
        },
        {
            "title": settingsFields.profileFields.phone,
            "dbKey": "phone",
            "article": "",
            "value": profileData?.phone || ""
        }
    ]

    const _companyData = [
        {
            "title": settingsFields.companyFields.companyName,
            "dbKey": "companyname",
            "article": "",
            "value": profileData?.companyname
        },
        {
            "title": settingsFields.companyFields.industry,
            "dbKey": "industry",
            "article": "",
            "value": profileData?.industry,
            "options": settingsFields.companyFields.industryOptions
        },
        {
            "title" : settingsFields.companyFields.tax,
            "dbKey" : "tax",
            "article" : "",
            "value": profileData?.tax,
        },
        {
            "title": settingsFields.companyFields.website,
            "dbKey": "web",
            "article": "",
            "value": profileData?.web
        },
        {
            "title": settingsFields.companyFields.country,
            "dbKey": "country",
            "article": "",
            "value": profileData?.country,
            "options": settingsFields.companyFields.countryOptions
        },
        {
            "title": settingsFields.companyFields.city,
            "dbKey": "city",
            "article": "",
            "value": profileData?.city
        },
        {
            "title": settingsFields.companyFields.address,
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
                <h1 className="title">{settingsPageData.title}</h1>
                <p className="description">{settingsPageData.description}</p>
            </div>
            <div className="settings__content">
                <ul className="settings__menu">
                    <li>
                        <p className={content === "profile" ? "highlight row_center" : "row_center"} onClick={() => setContent("profile")}><FaRegUser fontSize={20} /><span style={{marginLeft: 10}}>{settingsPageData.menu.profile}</span></p>
                    </li>
                    <li>
                        <p className={content === "company" ? "highlight row_center" : "row_center"} onClick={() => setContent("company")}><BiSolidFactory fontSize={20} /><span style={{marginLeft: 10}}>{settingsPageData.menu.company}</span></p>
                    </li>
                    <li>
                        <p className={content === "notifications" ? "highlight row_center" : "row_center"} onClick={() => setContent("notifications")}><IoMdNotificationsOutline fontSize={20} /><span style={{marginLeft: 10}}>{settingsPageData.menu.notifications}</span></p>
                    </li>
                    <li>
                        <p className={content === "security" ? "highlight row_center" : "row_center"} onClick={() => setContent("security")}><MdOutlineShield fontSize={20} /><span style={{marginLeft: 10}}>{settingsPageData.menu.security}</span></p>
                    </li>
                </ul>
                <div className="settings__main">
                    {content === "profile" && <Profile _profileData={_profileData} />}
                    {content === "company" && <Company _companyData={_companyData} />}
                    {content === "notifications" && <Notifications />}
                    {content === "security" && <Security />}
                </div>
            </div>
        </div>
    );
}

export default Settings;