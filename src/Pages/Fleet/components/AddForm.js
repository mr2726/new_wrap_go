import "../../../App.css";

function AddForm({ onClose }) {
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <div className="add_form_modal" onClick={onClose}>
            <div className="add_form" onClick={(event) => event.stopPropagation()}>
                <div className="add_form__header">
                    <h2 className="add_form_title">Add New Vehicle</h2>
                    <p className="add_form__subtitle">Fill vehicle details to register it in your fleet.</p>
                </div>
                <form className="add_form__grid" onSubmit={handleSubmit}>
                    <div className="form_group">
                        <label htmlFor="make">Make</label>
                        <input type="text" id="make" name="make" placeholder="Enter vehicle make" required />
                    </div>
                    <div className="form_group">
                        <label htmlFor="model">Model</label>
                        <input type="text" id="model" name="model" placeholder="Enter vehicle model" required />
                    </div>
                    <div className="form_group">
                        <label htmlFor="year">Year</label>
                        <input type="number" id="year" name="year" placeholder="Enter vehicle year" min="1990" max="2099" required />
                    </div>
                    <div className="form_group">
                        <label htmlFor="plate">License Plate</label>
                        <input type="text" id="plate" name="plate" placeholder="Enter license plate number" required />
                    </div>
                    <div className="add_form__actions">
                        <button type="button" className="add_form__ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="cta">Add Vehicle</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddForm;