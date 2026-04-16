import "../../../App.css";
import { useState } from "react";

function Notifications(){
    const [preferences, setPreferences] = useState([
        {
            id: "email",
            title: "Email Notifications",
            description: "Receive notifications via email",
            enabled: true
        },
        {
            id: "campaign",
            title: "Campaign Updates",
            description: "Get notified about campaign performance",
            enabled: true
        },
        {
            id: "weekly",
            title: "Weekly Reports",
            description: "Receive weekly analytics summary",
            enabled: false
        },
        {
            id: "payments",
            title: "Payment Alerts",
            description: "Notifications for invoices and payments",
            enabled: true
        }
    ]);

    const handleToggle = (id) => {
        setPreferences((prev) => prev.map((item) => (
            item.id === id ? { ...item, enabled: !item.enabled } : item
        )));
    };

    return(
        <div className="settings__block">
            <div className="notification__block--wrapper">
                <h1 className="title">Notification Preferences</h1>
                <div className="notification__list">
                    {preferences.map((item) => (
                        <div className="notification__item" key={item.id}>
                            <div className="notification__item--info">
                                <h3 className="second__title">{item.title}</h3>
                                <p>{item.description}</p>
                            </div>
                            <button
                                type="button"
                                className={item.enabled ? "notification__toggle notification__toggle--active" : "notification__toggle"}
                                onClick={() => handleToggle(item.id)}
                                aria-label={item.enabled ? `Disable ${item.title}` : `Enable ${item.title}`}
                                aria-pressed={item.enabled}
                            >
                                <span className="notification__toggle--thumb"></span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Notifications;