import FleetSignup from "./Fleet-signup";
import Dashboard from "./Dashboard";
import Billing from "./Billing";
import { useState } from "react";
function FleetContent({ setPage }) {
    const [fleetPage, setFleetPage] = useState("billing");

    const RenderFleetPage = () => {
        switch (fleetPage) {
            case "signup":
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
            case "dashboard":
                return <Dashboard setFleetPage={setFleetPage} />;
            case "billing":
                return <Billing setFleetPage={setFleetPage} />;
            default:
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
        }
    };
    return (
        <RenderFleetPage />
    );
}

export default FleetContent;