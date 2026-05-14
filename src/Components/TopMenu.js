import "../App.css";
import Logo from "./Logo";
import { supabase } from "../data/supabase";

function TopMenu ({sendto, setFleetPage, currentPage = "dashboard"}) {
    const menuItems = [
        { key: "dashboard", label: "Dashboard" },
        { key: "contracts", label: "Contracts" },
        { key: "billing", label: "Billing" },
        { key: "profile", label: "Settings" },
    ];

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
                {menuItems.map((item) => (
                    <li key={item.key}>
                        <button
                            type="button"
                            className={`menu__item ${currentPage === item.key ? "menu__item--active" : ""}`}
                            aria-current={currentPage === item.key ? "page" : undefined}
                            onClick={() => setFleetPage(item.key)}
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
            <button type="button" className="logout" onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default TopMenu;