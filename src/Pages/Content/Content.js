import { useState } from "react";
import "../../App.css";
import SideBar from "../../Components/SideBar";
import Overview from "./Overview";
import CampaignBuilder from "./CampaignBuilder";
import Map from "../../Components/MapBox";
import Analitics from "./Analitics";
import Settings from "./Settings";
import Billing from "./Billing";

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
                return <Billing />
            case "settings":
                return <Settings />
            default:
                return <Overview data={data.overview} />
        }
    }

    return (
        <div className={`content ${page === "live-map" ? "content--live-map" : ""}`}>
            <SideBar data={data.sidebar} page={page} setPage={setPage} />
            {renderPages()}
        </div>
    );
}

export default Content;
