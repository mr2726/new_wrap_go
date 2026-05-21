import "../App.css";
import { useState, useEffect } from "react";
import { supabase } from "../data/supabase";
import pageData from "../data/data.json";

function SettingsForm({title, description, data}) {
    const formText = pageData.content.settings.formCommon;
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

        // Strip protected fields that must not be updated via this form
        const { email: _email, userid: _userid, ...safeFormValues } = formValues;

        const { error } = await supabase
            .from("profiles")
            .update(safeFormValues)
            .eq("userid", user.id);

        if (error) {
            console.error(error.message);
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
                            {item.options ? (
                                <select
                                    className="settings-form__input signup_form__form--input"
                                    value={formValues[item.dbKey] ?? ""}
                                    onChange={(e) => handleChange(item.dbKey, e.target.value)}
                                >
                                    <option value="">{formText.selectPrefix} {item.title.toLowerCase()}</option>
                                    {item.options.map((option, optIndex) => (
                                        <option key={optIndex} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    className="settings-form__input signup_form__form--input"
                                    placeholder={`${formText.enterPrefix} ${item.title.toLowerCase()}`}
                                    value={formValues[item.dbKey] ?? ""}
                                    onChange={(e) => handleChange(item.dbKey, e.target.value)}
                                />
                            )}
                        </div>
                    ))
                }
                {status === "success" && <p className="settings-form__status settings-form__status--success">{formText.status.success}</p>}
                {status === "error" && <p className="settings-form__status settings-form__status--error">{formText.status.error}</p>}
                <button type="submit" className="settings-form__button overview__header--button">{formText.saveChanges}</button>
            </form>
        </div>
    );
}

export default SettingsForm;