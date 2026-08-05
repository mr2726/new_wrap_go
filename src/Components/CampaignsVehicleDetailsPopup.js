import { useEffect, useState } from "react";
import {
    getActiveFleetSignedContractsByContractIds,
    getDriverCarIdsByContractId,
    getVehiclesByInviteCodes,
} from "../data/service";
import "../App.css";

const parseDurationMs = (duration) => {
    const match = (duration || "").match(/^(\d+)([mdhw])$/i);
    if (!match) return 0;
    const val = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const msMap = { m: 30 * 24 * 60 * 60 * 1000, d: 24 * 60 * 60 * 1000, h: 60 * 60 * 1000, w: 7 * 24 * 60 * 60 * 1000 };
    return val * (msMap[unit] || 0);
};

const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const getCampaignDates = (campaign) => {
    if (!campaign?.created_at) return { start: "—", end: "—" };
    const startMs = new Date(campaign.created_at).getTime() + 7 * 24 * 60 * 60 * 1000;
    const endMs = startMs + parseDurationMs(campaign.duration);
    return { start: formatDate(startMs), end: formatDate(endMs) };
};

function CampaignsVehicleDetailsPopup({ campaign, onClose }) {
    const [filledSlots, setFilledSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!campaign?.id) return;

        const fetchData = async () => {
            setLoading(true);

            const { data: signedContracts, error: signedContractsError } =
                await getActiveFleetSignedContractsByContractIds([campaign.id]);

            if (signedContractsError || !signedContracts?.length) {
                setFilledSlots([]);
                setLoading(false);
                return;
            }

            // Step 1: get drivers assigned to this campaign (optional for vehicle details)
            const { data: drivers, error: driversError } = await getDriverCarIdsByContractId(campaign.id);

            if (driversError || !drivers?.length) {
                setFilledSlots(
                    (signedContracts || []).map((item) => ({
                        driverEmail: (item?.driver_email || "").trim().toLowerCase(),
                        vehicle: null,
                    }))
                );
                setLoading(false);
                return;
            }

            // Step 2: get vehicle info by invite_code = driver.carid
            const carIds = drivers.map((d) => d.carid).filter(Boolean);

            const { data: vehicles } = await getVehiclesByInviteCodes(carIds);

            // Step 3: map invite_code → vehicle
            const vehicleMap = {};
            (vehicles || []).forEach((v) => {
                vehicleMap[v.invite_code] = v;
            });

            const resolvedVehicles = drivers.map((d) => vehicleMap[d.carid] || null);

            // Step 4: each active signed slot is filled, vehicle details are best-effort
            setFilledSlots(
                (signedContracts || []).map((item, index) => ({
                    driverEmail: (item?.driver_email || "").trim().toLowerCase(),
                    vehicle: resolvedVehicles[index] || null,
                }))
            );
            setLoading(false);
        };

        fetchData();
    }, [campaign?.id]);

    const total = campaign?.economValue || 0;
    const budgetPerVehicle = total > 0
        ? Math.round((parseFloat(campaign?.budget) || 0) / total)
        : 0;
    const { start, end } = getCampaignDates(campaign);

    // filled driver slots + empty slots to reach economValue total
    const allSlots = [
        ...filledSlots,
        ...Array.from({ length: Math.max(0, total - filledSlots.length) }, () => null),
    ];

    return (
        <div className="modal" onClick={onClose}>
            <div className="vdp-modal" onClick={(e) => e.stopPropagation()}>

                <div className="vdp-modal__header">
                    <div className="vdp-modal__header-left">
                        <p className="vdp-modal__eyebrow">Campaign Details</p>
                        <h2 className="vdp-modal__title">{campaign?.name || "—"}</h2>
                    </div>
                    <button className="vdp-modal__close" onClick={onClose}>✕</button>
                </div>

                <div className="vdp-modal__stats">
                    <div className="vdp-modal__stat">
                        <p className="vdp-modal__stat-label">City</p>
                        <p className="vdp-modal__stat-value">{campaign?.city || "—"}</p>
                    </div>
                    <div className="vdp-modal__stat-divider" />
                    <div className="vdp-modal__stat">
                        <p className="vdp-modal__stat-label">Vehicles</p>
                        <p className="vdp-modal__stat-value">
                            {filledSlots.length}
                            <span className="vdp-modal__stat-secondary"> / {total}</span>
                        </p>
                    </div>
                    <div className="vdp-modal__stat-divider" />
                    <div className="vdp-modal__stat">
                        <p className="vdp-modal__stat-label">Per vehicle</p>
                        <p className="vdp-modal__stat-value">
                            {budgetPerVehicle.toLocaleString("en-US")}
                            <span className="vdp-modal__stat-secondary"> AMD</span>
                        </p>
                    </div>
                </div>

                <div className="vdp-modal__list-header">
                    <p className="vdp-modal__list-title">Vehicle slots</p>
                    {!loading && (
                        <span className="vdp-modal__list-badge">
                            {filledSlots.length} / {total} filled
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="vdp-modal__state">
                        <div className="vdp-modal__spinner" />
                        <p>Loading…</p>
                    </div>
                ) : (
                    <div className="vdp-modal__list">
                        <div className="vdp-table__head">
                            <span>Vehicle</span>
                            <span>City</span>
                            <span>Dates</span>
                            <span>Budget</span>
                            <span>Status</span>
                        </div>
                        {allSlots.map((slot, index) => {
                            const hasActiveDriver = !!slot?.driverEmail;
                            const hasVehicle = !!slot?.vehicle;
                            const vehicleLabel = hasVehicle
                                ? [slot.vehicle.year, slot.vehicle.mark, slot.vehicle.model].filter(Boolean).join(" ")
                                : hasActiveDriver
                                    ? `Driver: ${slot.driverEmail}`
                                    : null;
                            const status = hasActiveDriver ? "live" : "in process";

                            return (
                                <div
                                    key={index}
                                    className={`vdp-table__row${hasActiveDriver ? "" : " vdp-table__row--empty"}`}
                                >
                                    <span className="vdp-table__vehicle">
                                        {vehicleLabel || (
                                            <span className="vdp-table__no-vehicle">There is no vehicles</span>
                                        )}
                                    </span>
                                    <span className="vdp-table__city">{campaign?.city || "—"}</span>
                                    <span className="vdp-table__dates">{start} — {end}</span>
                                    <span className="vdp-table__budget">
                                        {budgetPerVehicle.toLocaleString("en-US")}
                                        <span className="vdp-table__currency"> AMD</span>
                                    </span>
                                    <span className="vdp-table__status">
                                        <span className={`status status--${status.replace(/\s+/g, "-")}`}>
                                            {status}
                                        </span>
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CampaignsVehicleDetailsPopup;
