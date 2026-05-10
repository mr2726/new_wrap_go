import "../App.css";
import Logo from "./Logo";
import { supabase } from "../data/supabase";

function TopMenu ({sendto, setFleetPage}) {
    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.log(error.message);
        }
    };

    return (
        <div className="top-menu">
            <Logo setPage={setFleetPage} transfer={sendto} />
            <ul className="menu">
                <li onClick={() => setFleetPage("dashboard")}>Dashboard</li>
                <li onClick={() => setFleetPage("contracts")}>Contracts</li>
                <li onClick={() => setFleetPage("billing")}>Billing</li>
                <li onClick={() => setFleetPage("profile")}>Settings</li>
            </ul>
            <p className="logout" onClick={handleLogout}>Logout</p>
        </div>
    );
}

export default TopMenu;