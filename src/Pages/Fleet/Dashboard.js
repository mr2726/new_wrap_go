import TopMenu from '../../Components/TopMenu';
import "../../App.css";
import DashInfo from './components/DashInfo';
import TableTr from './components/table_tr';
import AddForm from './components/AddForm';
import AddDriverForm from './components/AddDriverForm';
import SignContract from './components/SignContract';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../data/supabase';

function Dashboard({ setFleetPage }) {
    const [addVehicleModal, setAddVehicleModal] = useState(false);
    const [addDriverModal, setAddDriverModal] = useState(false);
    const [signContractPopup, setSignContractPopup] = useState(false);

    // const [fleetData, setFleetData] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [earnTransactions, setEarnTransactions] = useState([]);

    const fetchDrivers = useCallback(async (inviteCodes) => {
        if (!inviteCodes || inviteCodes.length === 0) return;
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .in("carid", inviteCodes);

        if (error) {
            console.error("Error fetching drivers:", error);
        } else {
            setDrivers(data);
        }
    }, []);

    const fetchContracts = useCallback(async (contractCode) => {
        if (!contractCode || contractCode.length === 0) return;
        const {data, error} = await supabase
            .from("campaigns")
            .select("*")
            .in("id", contractCode)
        if (error) {
            console.error("Error fetching contracts:", error);
        } else {
            setContracts(data);
        }
    }, []);

    const fetchFleets = useCallback(async () => {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;
        const { data, error } = await supabase
            .from('fleets')
            .select('contracts, balance')
            .eq("userid", user.id);

        if (error) {
            console.error("Error fetching fleets:", error);
        }else{
            const contractCodes = (data || [])
                .flatMap((f) => Array.isArray(f.contracts) ? f.contracts : [f.contracts])
                .filter(Boolean);
            await fetchContracts(contractCodes);
        }
    }, [fetchContracts]);

    const fetchVehicles = useCallback(async () => {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;
        const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq("fleetownerid", user.id);

        if (error) {
            console.error("Error fetching vehicles:", error);
        } else {
            setVehicles(data);
            const inviteCodes = (data || []).map(v => v.invite_code).filter(Boolean);
            await fetchDrivers(inviteCodes);
        }
    }, [fetchDrivers]);

    const fetchTransactions = useCallback(async () => {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;
        const { data, error } = await supabase
            .from('transfers')
            .select('*')
            .eq("owner_id", user.id)
            .eq("type", "Earning")

        if (error) {
            console.error("Error fetching transactions:", error);
        } else {
            setEarnTransactions(data);
        }
    }, []);

    useEffect(() => {
        fetchVehicles();
        fetchFleets();
        fetchTransactions();
    }, [fetchVehicles, fetchFleets, fetchTransactions]);

    // Calculate total km from all drivers
    const totalKm = (Array.isArray(drivers) ? drivers : []).reduce((sum, driver) => sum + Number(driver?.kmtoday || 0), 0);
    // const fleetBalance = Array.isArray(fleetData) ? Number(fleetData[0]?.balance || 0) : Number(fleetData?.balance || 0); // Earn This Month
    const earnThisMonth = (Array.isArray(earnTransactions) ? earnTransactions : []).reduce((sum, transaction) => sum + Number(transaction?.amount || 0), 0);


    return (
        <div className="fleet-dashboard">
            <TopMenu setFleetPage={setFleetPage} currentPage="dashboard" />
            <div className='fleet__content'>
                <div className='fleet-dashboard__header'>
                    <h1 className='title'>Fleet Dashboard</h1>
                    <p className='description'>Manage your vehicles, drivers and advertising contracts.</p>
                </div>

                <div className='DashInfo'>
                    <DashInfo info={{ type: "vehicles", title: "Vehicles", value: vehicles.length, additionalInfo: "Active Vehicles" }} />
                    <DashInfo info={{ type: "drivers", title: "Drivers", value: drivers.length, additionalInfo: "Active Drivers" }} />
                    <DashInfo info={{ type: "earn", title: "Earnings", value: `AMD ${earnThisMonth.toLocaleString()}`, additionalInfo: "Earn this Month" }} />
                    <DashInfo info={{ type: "km", title: "Total Distance", value: `${totalKm.toLocaleString()} km`, additionalInfo: "All drivers combined" }} />
                </div>

                <div className='fleet__controls'>
                    <button className='cta add_driver' style={{marginRight: '1em'}} onClick={() => setAddDriverModal(true)}>Invite Driver</button>
                    <button className='cta add_vehicle' style={{marginRight: '1em'}} onClick={() => setAddVehicleModal(true)}>Add Vehicle</button>
                    <button className='cta sign_contract' style={{marginRight: '1em'}} onClick={() => setSignContractPopup(true)}>Sign Contract</button>
                </div>

                {addDriverModal && (
                    <AddDriverForm onClose={() => setAddDriverModal(false)} vehicles={vehicles}/>
                )}
                {addVehicleModal && (
                    <AddForm onClose={() => setAddVehicleModal(false)} />
                )}
                {signContractPopup && (
                    <SignContract
                        onClose={() => setSignContractPopup(false)}
                        drivers={drivers}
                        contracts={contracts}
                        onAssigned={fetchVehicles}
                    />
                )}

                <div className='fleet__table'>
                    <table>
                        <thead>
                            <tr>
                                <th>Vehicle</th>
                                <th>Contact</th>
                                <th>Driver Status</th>
                                <th>Driver</th>
                                <th>Start Date</th>
                                <th>Weekly KM</th>
                                <th>Zone Hourse</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((vehicle) => (
                                <TableTr
                                    key={vehicle.id}
                                    vehicleData={vehicle}
                                    driverData={drivers.find((driver) => String(driver.carid) === String(vehicle.invite_code))}
                                    contractData={contracts.find((contract) => {
                                        const matchedDriver = drivers.find((driver) => String(driver.carid) === String(vehicle.invite_code));
                                        return matchedDriver && String(contract.id) === String(matchedDriver.contractid);
                                    })}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

