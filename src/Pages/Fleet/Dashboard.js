import "../../App.css";
import TopMenu from "../../Components/TopMenu";
import { useState, useEffect } from "react";
import { supabase } from "../../data/supabase";

function Dashboard({ setFleetPage }) {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    useEffect(() => {
        const fetchDrivers = async () => {
            setLoading(true);
            setError("");

            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData?.user?.id) {
                setDrivers([]);
                setError("User not authenticated.");
                setLoading(false);
                return;
            }

            // const userId = authData.user.id;
            const userId = "1c1955ee-b37d-4fd9-bd9b-8b697543271d"; // Замените на реальный userId для тестирования

            const { data: driverRows, error: driverError } = await supabase
                .from("drivers")
                .select("id, name, phone, vehicle, earntoday, kmtoday, status, contractid, vehicleid")
                .eq("fleet", userId)
                .order("created_at", { ascending: false });

            if (driverError) {
                setDrivers([]);
                setError(driverError.message || "Failed to load drivers.");
                setLoading(false);
                return;
            }

            const campaignIds = [...new Set((driverRows || []).map((driver) => driver.contractid).filter(Boolean))];
            let campaignNameById = {};

            if (campaignIds.length > 0) {
                const { data: campaignRows, error: campaignError } = await supabase
                    .from("campaigns")
                    .select("id, name")
                    .in("id", campaignIds);

                if (campaignError) {
                    setError(campaignError.message || "Failed to load campaigns.");
                } else {
                    campaignNameById = (campaignRows || []).reduce((acc, campaign) => {
                        acc[campaign.id] = campaign.name;
                        return acc;
                    }, {});
                }
            }

            const normalizedDrivers = (driverRows || []).map((driver) => ({
                id: driver.vehicleid || driver.id,
                name: driver.name || "-",
                phone: driver.phone || "-",
                vehicle: driver.vehicle || "-",
                earnToday: driver.earntoday ?? 0,
                kmToday: driver.kmtoday ?? 0,
                status: driver.status || "inactive",
                contractName: campaignNameById[driver.contractid] || "-",
            }));

            setDrivers(normalizedDrivers);
            setLoading(false);
        };

        fetchDrivers();
    }, []);

    return (
        <div className="dashboard">
            <TopMenu sendto="" setFleetPage={setFleetPage} />
            <div className="dashboard__content">
                <div className="dashboard__header">
                    <div>
                        <h1 className="dashboard__title">Dashboard</h1>
                        <p className="description">Manage your fleet, track vehicles and campaign performance.</p>
                    </div>
                </div>
                <div className="dashboard__table-wrap">
                    <table className="dashboard__table">
                        <thead>
                            <tr>
                                <th>Vehicle ID</th>
                                <th>Driver Full Name</th>
                                <th>Driver Phone</th>
                                <th>Vehicle</th>
                                <th>Contract Name</th>
                                <th>Earn Today</th>
                                <th>KM Runs Today</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan="8">Loading drivers...</td>
                                </tr>
                            )}
                            {!loading && error && (
                                <tr>
                                    <td colSpan="8">{error}</td>
                                </tr>
                            )}
                            {!loading && !error && drivers.length === 0 && (
                                <tr>
                                    <td colSpan="8">No drivers found for this fleet.</td>
                                </tr>
                            )}
                            {!loading && !error && drivers.map((driver) => (
                                <tr key={driver.id}>
                                    <td><span className="dashboard__id">{driver.id}</span></td>
                                    <td>{driver.name}</td>
                                    <td>{driver.phone}</td>
                                    <td>{driver.vehicle}</td>
                                    <td>{driver.contractName}</td>
                                    <td>{driver.earnToday} AMD</td>
                                    <td>{driver.kmToday} KM</td>
                                    <td><span className={getStatusClassName(driver.status)}>{driver.status}</span></td>
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