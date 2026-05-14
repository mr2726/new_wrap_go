import "../../../App.css";
import pageData from "../../../data/data.json";

function AddDriverForm({ onClose, vehicles }) {
    const formText = pageData.fleet.addDriverForm;
    const hasVehicles = Array.isArray(vehicles) && vehicles.length > 0;

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div className="add_form_modal" onClick={onClose}>
            <div className="add_form" onClick={(event) => event.stopPropagation()}>
                <div className="add_form__header">
                    <h2 className="add_form_title">{formText.title}</h2>
                    <p className="add_form__subtitle">{formText.subtitle}</p>
                </div>
                <form className="add_form__grid" onSubmit={handleSubmit}>
                    <p className="add_form__note">{formText.note}</p>

                    <div className="form_group">
                        <label htmlFor="vehicle">{formText.fields.vehicle}</label>
                        <select id="vehicle" name="vehicle" required>
                            <option value="">{hasVehicles ? formText.fields.vehiclePlaceholder : formText.fields.vehicleEmpty}</option>
                            {vehicles?.map((vehicle) => (
                                <option key={vehicle.id} value={vehicle.id}>{vehicle.year} {vehicle.mark} {vehicle.model}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form_group">
                        <label htmlFor="email">{formText.fields.email}</label>
                        <input type="email" id="email" name="email" placeholder={formText.fields.emailPlaceholder} required />
                    </div>
                    <div className="add_form__actions">
                        <button type="button" className="add_form__ghost" onClick={onClose}>{formText.buttons.cancel}</button>
                        <button type="submit" className="cta" disabled={!hasVehicles}>{formText.buttons.submit}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDriverForm;