import "../App.css";
import Logo from "./Logo";
import { supabase } from "../data/supabase";
import pageData from "../data/data.json";

function TopMenu ({sendto, setFleetPage, currentPage = "dashboard"}) {
    const menuText = pageData.fleet.topMenu;
    const menuItems = [
        { key: "dashboard", label: menuText.items.dashboard },
        { key: "contracts", label: menuText.items.contracts },
        { key: "billing", label: menuText.items.billing },
        { key: "profile", label: menuText.items.profile },
    ];

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            console.error(error.message);
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
            <button type="button" className="logout" onClick={handleLogout}>{menuText.logout}</button>
        </div>
    );
}

export default TopMenu;