import "../../../App.css";
import Comp from "../../../Components/Comp";

function History({currentDate, setCurrentDate}) {
    return (
        <div className="history">
            <Comp title="Campaign History" currentDate={currentDate} setCurrentDate={setCurrentDate}/>
        </div>
    )
}

export default History;