import "../../../App.css";
import { useMemo, useState } from "react";
import CustomSelect from "./CustomSelect";
import { supabase } from "../../../data/supabase";
import pageData from "../../../data/data.json";

function SignContract({ onClose, drivers = [], contracts = [], onAssigned }) {
  const signText = pageData.fleet.signContract;
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedContractId, setSelectedContractId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const driverOptions = useMemo(
    () =>
      (drivers || [])
        .filter((driver) => driver.contractid == null)
        .map((driver) => ({
          value: String(driver.id),
          label: driver.name || `${signText.driverFallback} ${driver.id}`,
          logo: "",
        })),
    [drivers, signText.driverFallback]
  );

  const contractOptions = useMemo(
    () =>
      (contracts || []).map((contract) => {
        if (contract.status === "complited") return null;
        else{
            return {
            value: String(contract.id),
            label: contract.name || `${signText.contractFallback} ${contract.id}`,
            logo: (
                <img
                src={contract.image_link || "https://placehold.co/50x50.png"}
                alt={contract.name || signText.contractFallback}
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
    [contracts, signText.contractFallback]
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
      alert(signText.alerts.assignFailed);
      return;
    }

    if (onAssigned) {
      await onAssigned();
    }

    alert(signText.alerts.assigned);
    onClose();
  };

  return (
    <div className="add_form_modal" style={{alignItems: 'self-start', justifyContent: 'end'}} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content__header">
            <h2>{signText.title}</h2>
            <button type="button" className="add_form__ghost" style={{border: "none"}} onClick={onClose}>{signText.close}</button>
        </div>
        <div className="modal-content__body">
            <CustomSelect
              label={signText.selectDriver}
              options={driverOptions}
              value={selectedDriverId}
              onChange={setSelectedDriverId}
            />

            <CustomSelect
              label={signText.selectContract}
              options={contractOptions}
              value={selectedContractId}
              onChange={setSelectedContractId}
            />
        </div>
        <div className="add_form__actions" style={{marginTop: '1em'}}>
            <button className="cta" style={{width: '100%'}} onClick={handleAssignContract} disabled={!canAssign}>
              {isSubmitting ? signText.submitting : signText.submit}
            </button>
        </div>
      </div>
    </div>
  );
}

export default SignContract;