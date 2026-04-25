import "../App.css";
import Logo from "./Logo";

function TopMenu ({sendto, setFleetPage}) {
    return (
        <div className="top-menu">
            <Logo setPage={setFleetPage} transfer={sendto} />
            
            <p className="logout">Logout</p>
        </div>
    );
}

export default TopMenu;