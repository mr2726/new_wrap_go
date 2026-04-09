import "../../../App.css";
import Comp from "../../../Components/Comp";
function Active({currentDate, setCurrentDate}) {
    return (
        <div className="active">
            <Comp title="Active Campaigns" currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </div>
    )
}

export default Active;