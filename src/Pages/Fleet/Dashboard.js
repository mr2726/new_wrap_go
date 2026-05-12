import TopMenu from '../../Components/TopMenu';
import "../../App.css";
import DashInfo from './components/DashInfo';
import TableTr from './components/table_tr';
import AddForm from './components/AddForm';
import AddDriverForm from './components/AddDriverForm';
import { useEffect, useState } from 'react';
import { supabase } from '../../data/supabase';

function Dashboard({ setFleetPage }) {
    const [addVehicleModal, setAddVehicleModal] = useState(false);
    const [addDriverModal, setAddDriverModal] = useState(true);

    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [contracts, setContracts] = useState([]);

    const fetchDrivers = async (inviteCodes) => {
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
    }

    const fetchContracts = async (contractCode) => {
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
    }

    const fetchFleets = async () => {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;
        if (!user) return;
        const { data, error } = await supabase
            .from('fleets')
            .select('contracts')
            .eq("userid", user.id);

        if (error) {
            console.error("Error fetching fleets:", error);
        }else{
            const contractCodes = (data || [])
                .flatMap((f) => Array.isArray(f.contracts) ? f.contracts : [f.contracts])
                .filter(Boolean);
            await fetchContracts(contractCodes);
        }
    }

    const fetchVehicles = async () => {
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
    }

    useEffect(() => {
        fetchVehicles();
        fetchFleets();
    }, [])


    return (
        <div className="fleet-dashboard">
            <TopMenu setFleetPage={setFleetPage} />
            <div className='fleet__content'>
                <div className='fleet-dashboard__header'>
                    <h1 className='title'>Fleet Dashboard</h1>
                    <p className='description'>Manage your vehicles, drivers and advertising contracts.</p>
                </div>

                <div className='DashInfo'>
                    <DashInfo info={{ type: "vehicles", title: "Vehicles", value: 12, additionalInfo: "3 new this month" }} />
                    <DashInfo info={{ type: "drivers", title: "Drivers", value: 8, additionalInfo: "2 new this month" }} />
                    <DashInfo info={{ type: "earn", title: "Earnings", value: "$5,000", additionalInfo: "20% increase from last month" }} />
                    <DashInfo info={{ type: "km", title: "Total Distance", value: "15,000 km", additionalInfo: "10% increase from last month" }} />
                </div>

                <div className='fleet__controls'>
                    <button className='cta add_driver' style={{marginRight: '1em'}} onClick={() => setAddDriverModal(true)}>Add Driver</button>
                    <button className='cta add_vehicle' onClick={() => setAddVehicleModal(true)}>Add Vehicle</button>
                </div>

                {addDriverModal && (
                    <AddDriverForm onClose={() => setAddDriverModal(false)} vehicles={vehicles}/>
                )}
                {addVehicleModal && (
                    <AddForm onClose={() => setAddVehicleModal(false)} />
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