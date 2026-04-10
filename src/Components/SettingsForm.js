import "../App.css";

function SettingsForm({title, description}) {
    return (
        <div className="settings-form">
            <h2 className="settings-form__title title">{title}</h2>
            <p className="settings-form__description description">{description}</p>
            <form className="settings-form__form">
                <div className="settings-form__group">
                    <label className="settings-form__label">First Name</label>
                    <input type="text" className="settings-form__input" placeholder="Enter your first name" />
                </div>
                <div className="settings-form__group">
                    <label className="settings-form__label">Last Name</label>
                    <input type="text" className="settings-form__input" placeholder="Enter your last name" />
                </div>
                <div className="settings-form__group">
                    <label className="settings-form__label">Email</label>
                    <input type="email" className="settings-form__input" placeholder="Enter your email" />
                </div>
                <button type="submit" className="settings-form__button">Save Changes</button>
            </form>
        </div>
    );
}

export default SettingsForm;