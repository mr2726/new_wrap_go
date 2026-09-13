import "../../../App.css";
import { useMemo, useState } from "react";
import CustomSelect from "./CustomSelect";
import { getUser, insertFleetSignedContract, updateDriverContract } from "../../../data/service";
import { useLanguage } from "../../../context/LanguageContext";

function SignContract({ onClose, drivers = [], vehicles = [], contracts = [], onAssigned }) {
  const { data: pageData } = useLanguage();
  const signText = pageData.fleet.signContract;
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedContractId, setSelectedContractId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignStatus, setAssignStatus] = useState({ type: "", text: "" });

  const vehicleOptions = useMemo(
    () =>
      (vehicles || [])
        .map((vehicle) => {
          const driver = (drivers || []).find(
            (d) => String(d.carid) === String(vehicle.invite_code)
          );
          // Only exclude vehicles whose driver is already tied to a contract.
          if (driver && driver.contractid != null) return null;

          const label = [vehicle.mark, vehicle.model, vehicle.year].filter(Boolean).join(" ")
            || `${signText.vehicleFallback} ${vehicle.id}`;

          return {
            value: String(vehicle.id),
            label: vehicle.plate ? `${label} - ${vehicle.plate}` : label,
            logo: "",
          };
        })
        .filter(Boolean),
    [vehicles, drivers, signText.vehicleFallback]
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

  const canAssign = Boolean(selectedVehicleId && selectedContractId && !isSubmitting);

  const handleAssignContract = async () => {
    if (!canAssign) return;
    setAssignStatus({ type: "", text: "" });

    const selectedVehicle = (vehicles || []).find(
      (vehicle) => String(vehicle.id) === String(selectedVehicleId)
    );
    const selectedDriver = (drivers || []).find(
      (driver) => String(driver.carid) === String(selectedVehicle?.invite_code)
    );
    const driverEmail = (selectedDriver?.email || "").trim().toLowerCase();

    setIsSubmitting(true);

    let error = null;
    if (selectedDriver) {
      ({ error } = await updateDriverContract(selectedDriver.id, selectedContractId));
    }

    if (!error) {
      const { data: authData, error: authError } = await getUser();
      const fleetId = authData?.user?.id;

      if (authError || !fleetId) {
        console.error("Error resolving fleet user:", authError);
        setIsSubmitting(false);
        setAssignStatus({ type: "error", text: signText.alerts.assignFailed });
        return;
      }

      const { error: signedContractError } = await insertFleetSignedContract({
        contract_id: Number(selectedContractId),
        fleet_id: fleetId,
        driver_email: driverEmail,
        signed_at: new Date().toISOString(),
        status: "in progress",
      });

      if (signedContractError) {
        console.error("Error saving fleet signed contract:", signedContractError);
        setIsSubmitting(false);
        setAssignStatus({ type: "error", text: signText.alerts.assignFailed });
        return;
      }
    }

    setIsSubmitting(false);

    if (error) {
      console.error("Error assigning contract:", error);
      setAssignStatus({ type: "error", text: signText.alerts.assignFailed });
      return;
    }

    if (onAssigned) {
      await onAssigned();
    }

    setAssignStatus({ type: "success", text: signText.alerts.assigned });
    setTimeout(() => onClose(), 1200);
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
              options={vehicleOptions}
              value={selectedVehicleId}
              onChange={setSelectedVehicleId}
              isVehicle
            />

            <CustomSelect
              label={signText.selectContract}
              options={contractOptions}
              value={selectedContractId}
              onChange={setSelectedContractId}
            />
        </div>
        {assignStatus.text && (
            <p className={assignStatus.type === "success" ? "settings-form__status settings-form__status--success" : "signup_form__error"} style={{marginTop: "0.5em"}}>
                {assignStatus.text}
            </p>
        )}
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