import "../App.css";
import { useState, useEffect } from "react";
import { supabase } from "../data/supabase";

function SettingsForm({title, description, data}) {
    const [formValues, setFormValues] = useState({});
    const [status, setStatus] = useState(null); // "success" | "error" | null

    useEffect(() => {
        const initial = {};
        data.forEach(item => { initial[item.dbKey] = item.value || ""; });
        setFormValues(initial);
    }, [data]);

    const handleChange = (dbKey, value) => {
        setFormValues(prev => ({ ...prev, [dbKey]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .update(formValues)
            .eq("userid", user.id);

        if (error) {
            console.log(error.message);
            setStatus("error");
            return;
        }
        setStatus("success");
    };

    return (
        <div className="settings-form">
            <h2 className="settings-form__title title">{title}</h2>
            <p className="settings-form__description description">{description}</p>
            <form className="settings-form__form" onSubmit={handleSubmit}>
                {
                    data.map((item, index) => (
                        <div className="settings-form__group" key={index}>
                            <label className="settings-form__label signup_form__form--label">{item.title}</label>
                            <input
                                type="text"
                                className="settings-form__input signup_form__form--input"
                                placeholder={`Enter your ${item.title.toLowerCase()}`}
                                value={formValues[item.dbKey] ?? ""}
                                onChange={(e) => handleChange(item.dbKey, e.target.value)}
                            />
                        </div>
                    ))
                }
                {status === "success" && <p className="settings-form__status settings-form__status--success">Changes saved successfully.</p>}
                {status === "error" && <p className="settings-form__status settings-form__status--error">Failed to save changes.</p>}
                <button type="submit" className="settings-form__button overview__header--button">Save Changes</button>
            </form>
        </div>
    );
}

export default SettingsForm;