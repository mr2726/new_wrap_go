import FleetSignup from "./Fleet-signup";
import Dashboard from "./Dashboard";
import Contracts from "./Contracts";
import Billing from "./Billing";
import Profile from "./Profile";
import { useState } from "react";
function FleetContent({ setPage }) {
    const [fleetPage, setFleetPage] = useState("dashboard");

    const RenderFleetPage = () => {
        switch (fleetPage) {
            case "signup":
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
            case "dashboard":
                return <Dashboard setFleetPage={setFleetPage} />;
            case "billing":
                return <Billing setFleetPage={setFleetPage} />;
            case "contracts":
                return <Contracts setFleetPage={setFleetPage} />;
            case "profile":
                return <Profile setFleetPage={setFleetPage} />;
            default:
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
        }
    };
    return (
        <RenderFleetPage />
    );
}

export default FleetContent;