import "../../../App.css";
import { useMemo, useState } from "react";
import CustomSelect from "./CustomSelect";
import { supabase } from "../../../data/supabase";

function SignContract({ onClose, drivers = [], contracts = [], onAssigned }) {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedContractId, setSelectedContractId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const driverOptions = useMemo(
    () =>
      (drivers || [])
        .filter((driver) => driver.contractid == null)
        .map((driver) => ({
          value: String(driver.id),
          label: driver.name || `Driver ${driver.id}`,
          logo: "",
        })),
    [drivers]
  );

  const contractOptions = useMemo(
    () =>
      (contracts || []).map((contract) => {
        if (contract.status === "complited") return null;
        else{
            return {
            value: String(contract.id),
            label: contract.name || `Contract ${contract.id}`,
            logo: (
                <img
                src={contract.image_link || "https://placehold.co/50x50.png"}
                alt={contract.name || "Contract"}
                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }}
                />
            ),
            date: contract.created_at
                ? new Date(contract.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                })
                : "",
            }
        };
      }).filter(Boolean),
    [contracts]
  );

  const canAssign = Boolean(selectedDriverId && selectedContractId && !isSubmitting);

  const handleAssignContract = async () => {
    if (!canAssign) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from("drivers")
      .update({ contractid: selectedContractId })
      .eq("id", selectedDriverId);

    setIsSubmitting(false);

    if (error) {
      console.error("Error assigning contract:", error);
      alert("Failed to assign contract. Please try again.");
      return;
    }

    if (onAssigned) {
      await onAssigned();
    }

    alert("Contract assigned successfully!");
    onClose();
  };

  return (
    <div className="add_form_modal" style={{alignItems: 'self-start', justifyContent: 'end'}} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content__header">
            <h2>Assign Contract</h2>
            <button type="button" className="add_form__ghost" style={{border: "none"}} onClick={onClose}>X</button>
        </div>
        <div className="modal-content__body">
            <CustomSelect
              label="Select Driver"
              options={driverOptions}
              value={selectedDriverId}
              onChange={setSelectedDriverId}
            />

            <CustomSelect
              label="Select Contract"
              options={contractOptions}
              value={selectedContractId}
              onChange={setSelectedContractId}
            />
        </div>
        <div className="add_form__actions" style={{marginTop: '1em'}}>
            <button className="cta" style={{width: '100%'}} onClick={handleAssignContract} disabled={!canAssign}>
              {isSubmitting ? "Assigning..." : "Assign Contract"}
            </button>
        </div>
      </div>
    </div>
  );
}

export default SignContract;