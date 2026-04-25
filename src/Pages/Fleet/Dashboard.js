import "../../App.css";
import TopMenu from "../../Components/TopMenu";

function Dashboard({ setFleetPage }) {
    return (
        <div className="dashboard">
            <TopMenu sendto="signup" setFleetPage={setFleetPage} />
            <div className="dashboard__content">
                <h1>Dashboard</h1>
            </div>
        </div>
    );
}

export default Dashboard;