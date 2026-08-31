import "../../../App.css";
import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";

function Notifications(){
    const { data: pageData } = useLanguage();
    const notificationsText = pageData.content.settings.notifications;
    const [enabledMap, setEnabledMap] = useState(() => {
        const initial = {};
        notificationsText.items.forEach(item => { initial[item.id] = item.enabled; });
        return initial;
    });

    const handleToggle = (id) => {
        setEnabledMap((prev) => ({
            ...prev,
            [id]: prev[id] !== undefined ? !prev[id] : false
        }));
    };

    return(
        <div className="settings__block">
            <div className="notification__block--wrapper">
                <h1 className="title">{notificationsText.title}</h1>
                <div className="notification__list">
                    {notificationsText.items.map((item) => {
                        const isEnabled = enabledMap[item.id] !== undefined ? enabledMap[item.id] : item.enabled;
                        return (
                            <div className="notification__item" key={item.id}>
                                <div className="notification__item--info">
                                    <h3 className="second__title">{item.title}</h3>
                                    <p>{item.description}</p>
                                </div>
                                <button
                                    type="button"
                                    className={isEnabled ? "notification__toggle notification__toggle--active" : "notification__toggle"}
                                    onClick={() => handleToggle(item.id)}
                                    aria-label={isEnabled ? `${notificationsText.aria.disablePrefix} ${item.title}` : `${notificationsText.aria.enablePrefix} ${item.title}`}
                                    aria-pressed={isEnabled}
                                >
                                    <span className="notification__toggle--thumb"></span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Notifications;