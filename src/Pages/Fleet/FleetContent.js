import FleetSignup from "./Fleet-signup";
import Dashboard from "./Dashboard";
import { useState } from "react";
function FleetContent({ setPage }) {
    const [fleetPage, setFleetPage] = useState("signup");

    const RenderFleetPage = () => {
        switch (fleetPage) {
            case "signup":
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
            case "dashboard":
                return <Dashboard setFleetPage={setFleetPage} />;
            default:
                return <FleetSignup setPage={setPage} setFleetPage={setFleetPage} />;
        }
    };
    return (
        <RenderFleetPage />
    );
}

export default FleetContent;