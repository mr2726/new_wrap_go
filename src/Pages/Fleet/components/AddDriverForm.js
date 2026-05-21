import "../../../App.css";
import { useState } from "react";
import pageData from "../../../data/data.json";
import { supabase } from "../../../data/supabase";

function AddDriverForm({ onClose, vehicles }) {
    const formText = pageData.fleet.addDriverForm;
    const hasVehicles = Array.isArray(vehicles) && vehicles.length > 0;
    const generateInviteCode = () => {
        const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";

        for (let i = 0; i < 6; i += 1) {
            code += symbols[Math.floor(Math.random() * symbols.length)];
        }

        return code;
    };
    const [inviteCode, setInviteCode] = useState(() => generateInviteCode());
    const [isCopied, setIsCopied] = useState(false);
    const [vehicleId, setVehicleId] = useState("");
    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const handleRegenerate = () => {
        setInviteCode(generateInviteCode());
        setIsCopied(false);
    };

    const handleCopyInviteCode = async () => {
        try {
            await navigator.clipboard.writeText(inviteCode);
            setIsCopied(true);
        } catch (error) {
            console.error("Failed to copy invite code:", error);
        }
    };

    const handleSendButton = async () => {
        if (!hasVehicles) {
            return;
        }
        else{
            const { error } = await supabase
                .from("vehicles")
                .update({
                    "invite_code": inviteCode,
                    "signeddriveremail" : document.getElementById("email").value
                })
                .eq("id", vehicleId)

                if(error){
                    console.error("Failed to update vehicle with invite code:", error);
                }
                else{
                    onClose();
                }
        }
    }

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
                        <select id="vehicle" name="vehicle" required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
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
                    <div className="form_group">
                        <label htmlFor="inviteCode">{formText.fields.inviteCode || "Invite Code"}</label>
                        <div className="invite_code_card">
                            <p className="generate_invite_code">{inviteCode}</p>
                            <div className="invite_code_actions">
                                <button type="button" className="add_form__ghost" onClick={handleRegenerate}>
                                    {formText.buttons.regenerate || "Regenerate"}
                                </button>
                                <button type="button" className="cta invite_code_copy" onClick={handleCopyInviteCode}>
                                    {isCopied ? (formText.buttons.copied || "Copied") : (formText.buttons.copy || "Copy")}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="add_form__actions">
                        <button type="button" className="add_form__ghost" onClick={onClose}>{formText.buttons.cancel}</button>
                        <button type="submit" className="cta" disabled={!hasVehicles} onClick={() => handleSendButton()}>{formText.buttons.submit}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddDriverForm;