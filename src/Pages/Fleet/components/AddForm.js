import "../../../App.css";
import pageData from "../../../data/data.json";

function AddForm({ onClose }) {
    const formData = pageData.fleet.addVehicleForm;

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div className="add_form_modal" onClick={onClose}>
            <div className="add_form" onClick={(event) => event.stopPropagation()}>
                <div className="add_form__header">
                    <h2 className="add_form_title">{formData.title}</h2>
                    <p className="add_form__subtitle">{formData.subtitle}</p>
                </div>
                <form className="add_form__grid" onSubmit={handleSubmit}>
                    <div className="form_group">
                        <label htmlFor="make">{formData.fields.make.label}</label>
                        <input type="text" id="make" name="make" placeholder={formData.fields.make.placeholder} required />
                    </div>
                    <div className="form_group">
                        <label htmlFor="model">{formData.fields.model.label}</label>
                        <input type="text" id="model" name="model" placeholder={formData.fields.model.placeholder} required />
                    </div>
                    <div className="form_group">
                        <label htmlFor="year">{formData.fields.year.label}</label>
                        <input type="number" id="year" name="year" placeholder={formData.fields.year.placeholder} min="1990" max="2099" required />
                    </div>
                    <div className="form_group">
                        <label htmlFor="plate">{formData.fields.plate.label}</label>
                        <input type="text" id="plate" name="plate" placeholder={formData.fields.plate.placeholder} required />
                    </div>
                    <div className="add_form__actions">
                        <button type="button" className="add_form__ghost" onClick={onClose}>{formData.buttons.cancel}</button>
                        <button type="submit" className="cta">{formData.buttons.submit}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddForm;