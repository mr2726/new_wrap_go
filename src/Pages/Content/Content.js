import { useState } from "react";
import "../../App.css";
import SideBar from "../../Components/SideBar";
import Overview from "./Overview";
import CampaignBuilder from "./CampaignBuilder";
import Map from "../../Components/MapBox";
import Analitics from "./Analitics";

function Content({data}) {
    const [page, setPage] = useState("analytics");

    const renderPages = () => {
        switch(page) {
            case "overview":
                return <Overview data={data.overview} setPage={setPage} />
            case "campaign-builder":
                return <CampaignBuilder data={data.campaigns} />
            case "live-map":
                return <Map />
            case "analytics":
                return <Analitics tableData={data.analitics.table} />
            case "vehicles":
                return <h1>Vehicles</h1>
            case "billing":
                return <h1>Billing</h1>
            case "settings":
                return <h1>Settings</h1>
            default:
                return <Overview data={data.overview} />
        }
    }

    return (
        <div className="content">
            <SideBar data={data.sidebar} page={page} setPage={setPage} />
            {renderPages()}
        </div>
    );
}

export default Content;
