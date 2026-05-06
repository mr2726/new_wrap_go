import "../../../App.css";
import { FaCar, FaUsers, FaWallet, FaRegClock } from "react-icons/fa";
import { GiPathDistance } from "react-icons/gi";


export default function DashInfo({ info }) {
    const iconRendering = () => {
        switch (info.type) {
            case "vehicles": return <FaCar />;
            case "drivers": return <FaUsers />;
            case "earn": return <FaWallet />;
            case "km": return <GiPathDistance />;
            case "activezones": return <FaRegClock />;
            default: return null;
        }
    }
    return (
        <div className="info_block">
            <div className="info_block__icons">{iconRendering()}</div>
            <div>
                <p className="info_block_title">{info.title}</p>
                <p className="info_block_value">{info.value}</p>
                <p className="additionalInfo">{info.additionalInfo}</p>
            </div>
        </div>
    )
}