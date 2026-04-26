import "../App.css";
import Logo from "./Logo";

function TopMenu ({sendto, setFleetPage}) {
    return (
        <div className="top-menu">
            <Logo setPage={setFleetPage} transfer={sendto} />
            <ul className="menu">
                <li onClick={() => setFleetPage("dashboard")}>Dashboard</li>
                <li onClick={() => setFleetPage("billing")}>Billing</li>
            </ul>
            <p className="logout">Logout</p>
        </div>
    );
}

export default TopMenu;