import "../../App.css";
import TopMenu from "../../Components/TopMenu";
import { useState, useEffect } from "react";
import { supabase } from "../../data/supabase";
import { HiDotsVertical } from "react-icons/hi";
import vehicle from "./vehicle.json";

function AddVehicleForm({ onClose, vehicleYears, setVehicleYears, mark, setMark, model, setModel, onSubmit, isSubmitting }) {
    return (
        <div className="add-driver-form">
            <div className="add-driver-form___block">
                <div className="popup__title">
                    <h2>Add Vehicle</h2>
                    <p onClick={onClose}>Close</p>
                </div>
                <form style={{ width: 300 }} onSubmit={onSubmit}>
                    <label className="signup_form__form--label">Vehicle Year</label>
                    <input 
                        type="number" 
                        name="vehicleYear" 
                        className="signup_form__form--input" 
                        placeholder="Enter Vehicle Year" 
                        required 
                        value={vehicleYears} 
                        onChange={(e) => setVehicleYears(e.target.value)} 
                    />
                    <select value={mark} onChange={(e) => setMark(e.target.value)}>
                        <option value="">Select Vehicle</option>
                        {vehicle.map((v, index) => (
                            <option key={index} value={v.brand}>{v.brand}</option>
                        ))}
                    </select>

                    <select value={model} onChange={(e) => setModel(e.target.value)}>
                        <option value="">Select Model</option>
                        {vehicle.map((v, index) => (
                            v.brand === mark && v.models.map((model, modelIndex) => (
                                <option key={`${index}-${modelIndex}`} value={model}>{model}</option>
                            ))
                        ))}
                    </select>
                    <button type="submit" className="signup_form__form--button" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Add Vehicle"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function AddDriverForm({ onClose, email, setEmail, onSubmit, inviteCode, isSubmitting }) {
    return (
        <div className="add-driver-form">
            <div className="add-driver-form___block">
                <div className="popup__title">
                    <h2>Add Driver</h2>
                    <p onClick={onClose}>Close</p>
                </div>
                <form style={{ width: 300 }} onSubmit={onSubmit}>
                    <label className="signup_form__form--label">Driver Email</label>
                    <input
                        type="email"
                        name="email"
                        className="signup_form__form--input"
                        placeholder="Enter Driver Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {inviteCode && (
                        <p className="description" style={{ marginTop: -8, marginBottom: 6 }}>
                            Invite code: <strong>{inviteCode}</strong>
                        </p>
                    )}
                    <button type="submit" className="signup_form__form--button" disabled={isSubmitting}>
                        {isSubmitting ? "Sending..." : "Send Invite"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Dashboard({ setFleetPage }) {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [addVehicleFormVisible, setAddVehicleFormVisible] = useState(false);
    const [addDriverFormVisible, setAddDriverFormVisible] = useState(false);
    const [activeMenuVehicleId, setActiveMenuVehicleId] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [savingVehicle, setSavingVehicle] = useState(false);
    const [invitingDriver, setInvitingDriver] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [mark, setMark] = useState("");
    const [model, setModel] = useState("");
    const [vehicleYears, setVehicleYears] = useState("");
    const [email, setEmail] = useState("");

    const getStatusClassName = (status) => {
        const normalizedStatus = String(status || "").toLowerCase();

        if (normalizedStatus === "active" || normalizedStatus === "live") {
            return "dashboard__badge dashboard__badge--active";
        }

        if (normalizedStatus === "pending") {
            return "dashboard__badge dashboard__badge--pending";
        }

        return "dashboard__badge dashboard__badge--inactive";
    };

    const getCurrentFleetUserId = async () => {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user?.id) {
            return null;
        }
        return authData.user.id;
    };

    const fetchVehicles = async () => {
        setLoading(true);
        setError("");

        const userId = await getCurrentFleetUserId();
        if (!userId) {
            setVehicles([]);
            setError("User not authenticated.");
            setLoading(false);
            return;
        }

        let vehicleRows = [];
        let vehicleError = null;

        const byFleet = await supabase
            .from("vehicles")
            .select("id, mark, model, year, created_at")
            .eq("fleet", userId)
            .order("created_at", { ascending: false });

        if (!byFleet.error) {
            vehicleRows = byFleet.data || [];
        } else {
            const byUserId = await supabase
                .from("vehicles")
                .select("id, mark, model, year, created_at")
                .eq("userid", userId)
                .order("created_at", { ascending: false });

            if (!byUserId.error) {
                vehicleRows = byUserId.data || [];
            } else {
                const noFilter = await supabase
                    .from("vehicles")
                    .select("id, mark, model, year, created_at")
                    .order("created_at", { ascending: false });

                vehicleRows = noFilter.data || [];
                vehicleError = noFilter.error;
            }
        }

        if (vehicleError) {
            setVehicles([]);
            setError(vehicleError.message || "Failed to load vehicles.");
            setLoading(false);
            return;
        }

        const vehicleIds = [...new Set((vehicleRows || []).map((row) => row.id).filter(Boolean))];
        let driverRows = [];

        if (vehicleIds.length > 0) {
            const { data } = await supabase
                .from("drivers")
                .select("id, name, phone, status, vehicleid, contractid")
                .in("vehicleid", vehicleIds.map(String));
            driverRows = data || [];
        }

        const contractIds = [...new Set((driverRows || []).map((driver) => driver.contractid).filter(Boolean))];
        let campaignNameById = {};

        if (contractIds.length > 0) {
            const { data: campaignRows } = await supabase
                .from("campaigns")
                .select("id, name")
                .in("id", contractIds);

            campaignNameById = (campaignRows || []).reduce((acc, campaign) => {
                acc[campaign.id] = campaign.name;
                return acc;
            }, {});
        }

        const driverByVehicle = (driverRows || []).reduce((acc, row) => {
            if (!row?.vehicleid) {
                return acc;
            }
            acc[String(row.vehicleid)] = row;
            return acc;
        }, {});

        const normalizedVehicles = (vehicleRows || []).map((item) => {
            const linkedDriver = driverByVehicle[String(item.id)] || null;

            return {
                id: String(item.id),
                mark: item.mark || "-",
                model: item.model || "-",
                year: item.year || "-",
                contractName: linkedDriver ? (campaignNameById[linkedDriver.contractid] || "No Contract") : "No Contract",
                driverName: linkedDriver?.name || "Not Assigned",
                driverPhone: linkedDriver?.phone || "-",
                status: linkedDriver?.status || "inactive",
                kmToday: 0,
                zoneHours: 0,
            };
        });

        setVehicles(normalizedVehicles);
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const resetVehicleForm = () => {
        setMark("");
        setModel("");
        setVehicleYears("");
    };

    const handleVehicleSubmit = async (event) => {
        event.preventDefault();

        if (!mark || !model || !vehicleYears) {
            alert("Please fill all vehicle fields.");
            return;
        }

        setSavingVehicle(true);
        setError("");

        try {
            const userId = await getCurrentFleetUserId();
            if (!userId) {
                alert("User not authenticated.");
                return;
            }

            const payload = {
                mark,
                model,
                year: String(vehicleYears),
                fleet: userId,
                userid: userId,
            };

            let { error: insertError } = await supabase.from("vehicles").insert(payload);

            if (insertError) {
                ({ error: insertError } = await supabase
                    .from("vehicles")
                    .insert({ mark, model, year: String(vehicleYears) }));
            }

            if (insertError) {
                alert(insertError.message || "Failed to add vehicle.");
                return;
            }

            setAddVehicleFormVisible(false);
            resetVehicleForm();
            await fetchVehicles();
        } finally {
            setSavingVehicle(false);
        }
    };

    const generateInviteCode = () => {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    };

    const openAddDriverModal = (vehicleItem) => {
        setSelectedVehicle(vehicleItem);
        setInviteCode("");
        setEmail("");
        setAddDriverFormVisible(true);
        setActiveMenuVehicleId(null);
    };

    const handleSendDriverInvite = async (event) => {
        event.preventDefault();

        const normalizedEmail = (email || "").trim().toLowerCase();
        if (!normalizedEmail) {
            alert("Please enter driver email.");
            return;
        }

        if (!selectedVehicle?.id) {
            alert("Please select vehicle first.");
            return;
        }

        setInvitingDriver(true);

        try {
            const userId = await getCurrentFleetUserId();
            if (!userId) {
                alert("User not authenticated.");
                return;
            }

            const newInviteCode = generateInviteCode();

            const { data: existingDriver } = await supabase
                .from("drivers")
                .select("id")
                .eq("email", normalizedEmail)
                .maybeSingle();

            const payload = {
                email: normalizedEmail,
                fleet: userId,
                vehicleid: String(selectedVehicle.id),
                status: "Pending",
                carid: newInviteCode,
            };

            let upsertError = null;

            if (existingDriver?.id) {
                const { error: updateError } = await supabase
                    .from("drivers")
                    .update(payload)
                    .eq("id", existingDriver.id);
                upsertError = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("drivers")
                    .insert({ ...payload, name: "Pending Driver", totaldistance: 0 });
                upsertError = insertError;
            }

            if (upsertError) {
                const fallbackPayload = {
                    email: normalizedEmail,
                    fleet: userId,
                    vehicleid: String(selectedVehicle.id),
                    status: "Pending",
                };

                if (existingDriver?.id) {
                    const { error: updateError } = await supabase
                        .from("drivers")
                        .update(fallbackPayload)
                        .eq("id", existingDriver.id);
                    upsertError = updateError;
                } else {
                    const { error: insertError } = await supabase
                        .from("drivers")
                        .insert({ ...fallbackPayload, name: "Pending Driver", totaldistance: 0 });
                    upsertError = insertError;
                }
            }

            if (upsertError) {
                alert(upsertError.message || "Failed to save invitation.");
                return;
            }

            setInviteCode(newInviteCode);
            alert(`Invite saved! Share this code with the driver: ${newInviteCode}`);
            await fetchVehicles();
        } finally {
            setInvitingDriver(false);
        }
    };

    return (
        <div className="dashboard">
            {addVehicleFormVisible && (
                <AddVehicleForm
                    onClose={() => setAddVehicleFormVisible(false)}
                    vehicleYears={vehicleYears}
                    setVehicleYears={setVehicleYears}
                    mark={mark}
                    setMark={setMark}
                    model={model}
                    setModel={setModel}
                    onSubmit={handleVehicleSubmit}
                    isSubmitting={savingVehicle}
                />
            )}
            {addDriverFormVisible && (
                <AddDriverForm
                    onClose={() => setAddDriverFormVisible(false)}
                    email={email}
                    setEmail={setEmail}
                    onSubmit={handleSendDriverInvite}
                    inviteCode={inviteCode}
                    isSubmitting={invitingDriver}
                />
            )}
            <TopMenu sendto="" setFleetPage={setFleetPage} />
            <div className="dashboard__content">
                <div className="dashboard__header">
                    <div>
                        <h1 className="dashboard__title">Dashboard</h1>
                        <p className="description">Manage your fleet, track vehicles and campaign performance.</p>
                    </div>
                    <button className="dashboard__button signup_form__form--button" onClick={() => setAddVehicleFormVisible(true)}>Add Vehicle</button>
                </div>
                <div className="dashboard__table-wrap">
                    <table className="dashboard__table">
                        <thead>
                            <tr>
                                <th>Vehicle</th> {/* Done */}
                                <th>Contract</th> {/* Done */}
                                <th>Current Driver</th>
                                <th>Status</th>
                                <th>Weekly KM</th>
                                <th>Zone Hours</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="7">Loading vehicles...</td>
                                </tr>
                            )}
                            {!loading && error && (
                                <tr>
                                    <td colSpan="7">{error}</td>
                                </tr>
                            )}
                            {!loading && !error && vehicles.length === 0 && (
                                <tr>
                                    <td colSpan="7">No vehicles found for this fleet.</td>
                                </tr>
                            )}
                            {!loading && !error && vehicles.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <p className="table_title">{item.mark} {item.model}</p>
                                        <span className="plateNumber table_description">ID: {item.id} · {item.year}</span>
                                    </td>
                                    <td>
                                        <p className="table_description">{item.contractName}</p>
                                        <span className="table_description">Vehicle {item.id}</span>
                                    </td>
                                    <td>
                                        <p className="table_title">{item.driverName}</p>
                                        <span className="table_description">{item.driverPhone}</span>
                                    </td>
                                    <td><span className={getStatusClassName(item.status)}>{item.status}</span></td>
                                    <td>
                                        <p className="table_description">{item.kmToday} km</p>
                                        <div className="table_loader">
                                            <div style={{ width: "0%" }}></div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="table_description">{item.zoneHours} h</p>
                                        <div className="table_loader">
                                            <div style={{ width: "0%" }}></div>
                                        </div>
                                    </td>
                                    <td style={{ position: "relative" }}>
                                        <button
                                            className="action_button"
                                            onClick={() => setActiveMenuVehicleId((prev) => (prev === item.id ? null : item.id))}
                                        >
                                            <HiDotsVertical size={20} color="#334155"/>
                                        </button>
                                        {activeMenuVehicleId === item.id && (
                                            <div style={{ position: "absolute", right: 0, top: "70%", background: "#161B22", border: "1px solid #334155", borderRadius: 8, zIndex: 20 }}>
                                                <button
                                                    className="action_button"
                                                    style={{ width: 140, textAlign: "left", padding: "10px 12px" }}
                                                    onClick={() => openAddDriverModal(item)}
                                                >
                                                    Add driver
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;