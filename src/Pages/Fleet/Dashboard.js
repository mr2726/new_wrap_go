import "../../App.css";
import TopMenu from "../../Components/TopMenu";
import { useState, useEffect } from "react";
import { supabase } from "../../data/supabase";
import { HiDotsVertical } from "react-icons/hi";
import vehicle from "./vehicle.json";
import DashInfo from "./components/DashInfo";

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

function AddDriverForm({ onClose, onDone, email, setEmail, onSubmit, inviteCode, isSubmitting }) {
    return (
        <div className="add-driver-form">
            <div className="add-driver-form___block">
                <div className="popup__title">
                    <h2>Add Driver</h2>
                    <p onClick={onClose}>Close</p>
                </div>
                <div style={{ width: 300 }}>
                    {inviteCode ? (
                        <>
                            <p className="signup_form__form--label">Share this code with the driver:</p>
                            <p style={{ fontSize: 32, fontWeight: 700, letterSpacing: 4, margin: "16px 0", textAlign: "center" }}>{inviteCode}</p>
                            <p className="description" style={{ textAlign: "center" }}>The driver enters this code in the app after registration</p>
                            <input 
                                type="email" 
                                name="driverEmail" 
                                className="signup_form__form--input" 
                                placeholder="Enter Driver Email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                            <button className="signup_form__form--button" onClick={onDone} style={{ marginTop: 20, width: "100%" }}>Done</button>
                        </>
                    ) : (
                        <>
                            <p className="description">Generate an invite code for this vehicle. Share it with the driver — they will enter it in the app after registering.</p>
                            <button className="signup_form__form--button" onClick={onSubmit} disabled={isSubmitting} style={{ marginTop: 20, width: "100%" }}>
                                {isSubmitting ? "Generating..." : "Generate Code"}
                            </button>
                        </>
                    )}
                </div>
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
    const [actionModalVehicle, setActionModalVehicle] = useState(null);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [savingVehicle, setSavingVehicle] = useState(false);
    const [invitingDriver, setInvitingDriver] = useState(false);
    const [inviteCode, setInviteCode] = useState("");
    const [mark, setMark] = useState("");
    const [model, setModel] = useState("");
    const [vehicleYears, setVehicleYears] = useState("");
    const [email, setEmail] = useState("");
    const [drivers, setDrivers] = useState([]);
    const [targetData, setTargetData] = useState({
        km: 100,
        zoneHours: 100,
    });

    const getStatusClassName = (status) => {
        const normalizedStatus = String(status || "").toLowerCase();

        if (normalizedStatus === "active" || normalizedStatus === "live") {
            return "dashboard__badge dashboard__badge--active";
        }

        if (normalizedStatus === "pending" || normalizedStatus === "in process") {
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
            .select("id, mark, model, year, status, invite_code, created_at")
            .eq("fleet", userId)
            .order("created_at", { ascending: false });

        if (!byFleet.error) {
            vehicleRows = byFleet.data || [];
        } else {
            const byUserId = await supabase
                .from("vehicles")
                .select("id, mark, model, year, status, invite_code, created_at")
                .eq("userid", userId)
                .order("created_at", { ascending: false });

            if (!byUserId.error) {
                vehicleRows = byUserId.data || [];
            } else {
                const noFilter = await supabase
                    .from("vehicles")
                    .select("id, mark, model, year, status, invite_code, created_at")
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

        const { data: fleetDrivers, error: fleetDriverError } = await supabase
            .from("drivers")
            .select("*")
            .eq("fleet", userId);

        const driverRows = fleetDrivers || [];

        if (fleetDriverError) {
            setError(fleetDriverError.message || "Failed to load drivers.");
        } else {
            setDrivers(driverRows);
        }

        const contractIds = [...new Set(driverRows.map((driver) => driver.contractid).filter(Boolean))];
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

        // Match driver to vehicle by driver.carid === vehicle.invite_code
        const driverByInviteCode = driverRows.reduce((acc, row) => {
            if (!row?.carid) return acc;
            acc[String(row.carid)] = row;
            return acc;
        }, {});

        const normalizedVehicles = (vehicleRows || []).map((item) => {
            const linkedDriver = item.invite_code
                ? (driverByInviteCode[String(item.invite_code)] || null)
                : null;

            return {
                id: String(item.id),
                mark: item.mark || "-",
                model: item.model || "-",
                year: item.year || "-",
                contractName: linkedDriver ? (campaignNameById[linkedDriver.contractid] || "No Contract") : "No Contract",
                driverName: linkedDriver?.name || "Not Assigned",
                driverPhone: linkedDriver?.phone || "-",
                status: item.status || linkedDriver?.status || "inactive",
                kmToday: linkedDriver?.kmtoday || 0,
                zoneHours: linkedDriver?.zonehourse || 0,
            };
        });

        setVehicles(normalizedVehicles);
        setLoading(false);
    };

    useEffect(() => {
        fetchVehicles();
        
        console.log("Fetched vehicles:", vehicles);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                    .insert({ mark, model, year: String(vehicleYears), fleetownerid: userId }))
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
        setActionModalVehicle(null);
    };

    const handleSendDriverInvite = async () => {
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

            const { error: updateError } = await supabase
                .from("vehicles")
                .update({ invite_code: newInviteCode, status: "in process" })
                .eq("id", selectedVehicle.id);

            if (updateError) {
                alert(updateError.message || "Failed to save invite code.");
                return;
            }

            setInviteCode(newInviteCode);
            await fetchVehicles();
        } finally {
            setInvitingDriver(false);
        }
    };

    const doneButton = async () => {
        if (email && selectedVehicle?.id) {
            await supabase
                .from("vehicles")
                .update({ "signeddriveremail" : email })
                .eq("id", selectedVehicle.id);
        }
        setAddDriverFormVisible(false);
    }

    function formatArmenianPhone(phone) {
        const digits = phone.replace(/\D/g, "");

        // Убираем код страны если уже есть
        const normalized = digits.startsWith("374")
            ? digits.slice(3)
            : digits;

        if (normalized.length !== 8) return phone;

        return `+374 ${normalized.slice(0, 2)} ${normalized.slice(2, 5)} ${normalized.slice(5)}`;
    }


    return (
        <div className="dashboard">
            {actionModalVehicle && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 9999,
                        background: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 20,
                    }}
                    onClick={() => setActionModalVehicle(null)}
                >
                    <div
                        className="add-driver-form___block"
                        style={{ width: 360, maxWidth: "100%" }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="popup__title">
                            <h2>Vehicle Actions</h2>
                            <p onClick={() => setActionModalVehicle(null)}>Close</p>
                        </div>
                        <p className="description" style={{ marginBottom: 16 }}>
                            {actionModalVehicle.mark} {actionModalVehicle.model} ({actionModalVehicle.year})
                        </p>
                        <button
                            className="signup_form__form--button"
                            style={{ width: "100%" }}
                            onClick={() => openAddDriverModal(actionModalVehicle)}
                        >
                            Add driver
                        </button>
                    </div>
                </div>
            )}
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
                    onDone={doneButton}
                    email={email}
                    setEmail={setEmail}
                    onSubmit={handleSendDriverInvite}
                    inviteCode={inviteCode}
                    isSubmitting={invitingDriver}
                />
            )}
            <TopMenu sendto="" setFleetPage={setFleetPage} />
            <div className="dashboard__content">
                <div className="dashboard_info">
                    <DashInfo info={{ type: "vehicles", title: "Total Vehicles", value: vehicles.length, additionalInfo: "All registered Vehicles" }} />
                    <DashInfo info={{ type: "drivers", title: "Total Drivers", value: drivers.length, additionalInfo: "All registered Drivers" }} />
                    <DashInfo info={{ type: "earn", title: "Total Earnings", value: drivers.reduce((sum, d) => sum + (Number(d.earntoday) || 0), 0), additionalInfo: "All time earnings" }} />
                    <DashInfo info={{ type: "km", title: "Total KM", value: vehicles.reduce((sum, v) => sum + (Number(v.kmToday) || 0), 0), additionalInfo: "All vehicles combined" }} />
                    <DashInfo info={{ type: "activezones", title: "Active Zones", value: vehicles.reduce((sum, v) => sum + (Number(v.zoneHours) || 0), 0), additionalInfo: "Currently active zones" }} />
                </div>
                <div className="dashboard__header">
                    <div>
                        <h1 className="dashboard__title">Dashboard</h1>
                        <p className="description">Manage your fleet, track vehicles and campaign performance.</p>
                    </div>
                    <button className="dashboard__button signup_form__form--button" onClick={() => setAddVehicleFormVisible(true)}>Add Vehicle</button>
                </div>
                <div className="content_wrap">
                    <div className="dashboard__table-wrap">
                        <div className="dashboard__table-scroll">
                            <table className="dashboard__table">
                                <thead>
                                    <tr>
                                        <th>Vehicle</th> 
                                        <th>Contract</th>
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
                                                <span className="plateNumber table_description">{item.year}</span>
                                            </td>
                                            <td>
                                                <p className="table_description">{item.contractName}</p>
                                                {/* <span className="table_description"></span> */}
                                            </td>
                                            <td>
                                                <p className="table_title">{item.driverName}{console.log(item)}</p>
                                                <span className="table_description">{formatArmenianPhone(item.driverPhone)}</span>
                                            </td>
                                            <td><span className={getStatusClassName(item.status)}>{item.status}</span></td>
                                            <td>
                                                <p className="table_description">{item.kmToday} km / {targetData.km}</p>
                                                <div className="table_loader">
                                                    <div style={{ width: `${item.kmToday >= targetData.km ? "100%" : (item.kmToday / targetData.km) * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="table_description">{item.zoneHours} h / {targetData.zoneHours}</p>
                                                <div className="table_loader">
                                                    <div style={{ width: `${item.zoneHours >= targetData.zoneHours ? "100%" : (item.zoneHours / targetData.zoneHours) * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td style={{ position: "relative" }}>
                                                <button
                                                    className="action_button"
                                                    onClick={() => setActionModalVehicle(item)}
                                                >
                                                    <HiDotsVertical size={20} color="#334155"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="allDrivers">
                        <h2 className="dashboard__subtitle">All Drivers</h2>
                        <div className="drivers_list">
                            {drivers.map((driver) => (
                                <div key={driver.id} className="driver_card">
                                    <div>
                                        <p className="table_title">{driver.name}</p>
                                        <span className="table_description">{formatArmenianPhone(driver.phone)}</span>
                                    </div>
                                    <div>
                                        <p className="table_description">KM Today</p>
                                        <p className="table_description">{driver.kmtoday} km</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;