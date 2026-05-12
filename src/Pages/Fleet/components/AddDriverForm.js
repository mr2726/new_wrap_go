import "../../../App.css";

function AddDriverForm({ onClose, vehicles }) {
    const hasVehicles = Array.isArray(vehicles) && vehicles.length > 0;

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div className="add_form_modal" onClick={onClose}>
            <div className="add_form" onClick={(event) => event.stopPropagation()}>
                <div className="add_form__header">
                    <h2 className="add_form_title">Add New Driver</h2>
                    <p className="add_form__subtitle">Fill driver details to register them in your fleet.</p>
                </div>
                <form className="add_form__grid" onSubmit={handleSubmit}>
                    <p className="add_form__note">Please share the generated invite code with your driver after submission.</p>

                    <div className="form_group">
                        <label htmlFor="vehicle">Vehicle</label>
                        <select id="vehicle" name="vehicle" required>
                            <option value="">{hasVehicles ? "Select Vehicle" : "No available vehicles"}</option>
                            {vehicles?.map((vehicle) => (
                                <option key={vehicle.id} value={vehicle.id}>{vehicle.year} {vehicle.mark} {vehicle.model}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form_group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="Enter driver's email address" required />
                    </div>
                    <div className="add_form__actions">
                        <button type="button" className="add_form__ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="cta" disabled={!hasVehicles}>Add Driver</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDriverForm;