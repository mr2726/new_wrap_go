import "../../App.css";
import { useState } from "react";

import Profile from "./Settings/Profile";
import Company from "./Settings/Company";

function Settings() {
    const [content, setContent] = useState("profile");
    return (
        <div className="settings">
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
                    {content === "profile" && <Profile />}
                    {content === "company" && <Company />}
                    {content === "notifications" && <p>Notifications Content</p>}
                    {content === "security" && <p>Security Content</p>}

                </div>
            </div>
        </div>
    );
}

export default Settings;