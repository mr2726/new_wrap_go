import "../../../App.css";
import { useState } from "react";
import pageData from "../../../data/data.json";

function Notifications(){
    const notificationsText = pageData.content.settings.notifications;
    const [preferences, setPreferences] = useState(notificationsText.items);

    const handleToggle = (id) => {
        setPreferences((prev) => prev.map((item) => (
            item.id === id ? { ...item, enabled: !item.enabled } : item
        )));
    };

    return(
        <div className="settings__block">
            <div className="notification__block--wrapper">
                <h1 className="title">{notificationsText.title}</h1>
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
                                aria-label={item.enabled ? `${notificationsText.aria.disablePrefix} ${item.title}` : `${notificationsText.aria.enablePrefix} ${item.title}`}
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