import "../../../App.css";
import pageData from "../../../data/data.json";
import { useState } from "react";
import { supabase } from "../../../data/supabase";

function AddForm({ onClose }) {
    const formData = pageData.fleet.addVehicleForm;
    const [createVehicleData, setCreateVehicleData] = useState({
        "mark" : "",
        "model" : "",
        "year" : "",
        "plate" : ""
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        if(createVehicleData.mark === "" || createVehicleData.model === "" || createVehicleData.year === "" || createVehicleData.plate === ""){
             alert("Please fill in all fields.");
             return;
         }
        else{
            hendelAddVehicle();

        }
    };

    const hendelAddVehicle = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
            .from("vehicles")
            .insert({
                "mark" : createVehicleData.mark,
                "model" : createVehicleData.model,
                "year" : createVehicleData.year,
                "plate" : createVehicleData.plate,
                "status" : "available",
                "fleetownerid" : user.id
            })
            if(error){
                console.error("Failed to update vehicle with invite code:", error);
            }else{  
                console.log("Vehicle added successfully:", data);
                onClose();
            }
    }
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
                        <input type="text" id="make" name="make" placeholder={formData.fields.make.placeholder} required value={createVehicleData.mark} onChange={(e) => setCreateVehicleData({ ...createVehicleData, mark: e.target.value })}/>
                    </div>
                    <div className="form_group">
                        <label htmlFor="model">{formData.fields.model.label}</label>
                        <input type="text" id="model" name="model" placeholder={formData.fields.model.placeholder} required value={createVehicleData.model} onChange={(e) => setCreateVehicleData({ ...createVehicleData, model: e.target.value })}/>
                    </div>
                    <div className="form_group">
                        <label htmlFor="year">{formData.fields.year.label}</label>
                        <input type="number" id="year" name="year" placeholder={formData.fields.year.placeholder} min="1990" max="2099" required value={createVehicleData.year} onChange={(e) => setCreateVehicleData({ ...createVehicleData, year: e.target.value })}/>
                    </div>
                    <div className="form_group">
                        <label htmlFor="plate">{formData.fields.plate.label}</label>
                        <input type="text" id="plate" name="plate" placeholder={formData.fields.plate.placeholder} required value={createVehicleData.plate} onChange={(e) => setCreateVehicleData({ ...createVehicleData, plate: e.target.value })}/>
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