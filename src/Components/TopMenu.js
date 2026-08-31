import "../App.css";
import Logo from "./Logo";
import { signOut } from "../data/service";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelector from "./LanguageSelector";

function TopMenu ({sendto, setFleetPage, currentPage = "dashboard"}) {
    const { data: pageData } = useLanguage();
    const menuText = pageData.fleet.topMenu;
    const menuItems = [
        { key: "dashboard", label: menuText.items.dashboard },
        { key: "contracts", label: menuText.items.contracts },
        { key: "billing", label: menuText.items.billing },
        { key: "profile", label: menuText.items.profile },
    ];

    const handleLogout = async () => {
        const { error } = await signOut();

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
            <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
                <LanguageSelector />
                <button type="button" className="logout" onClick={handleLogout}>{menuText.logout}</button>
            </div>
        </div>
    );
}

export default TopMenu;