import "../../App.css";
import { useEffect, useState } from "react";
import { supabase } from "../../data/supabase";
/* Pages */
import Active from "./Analitics/Active";
import History from "./Analitics/History";
import AnaliticsChart from "../../Components/AnaliticsChart";
import AnatiticTable from "../../Components/AnaliticsTable";

function Analitics({ tableData }) {
    const [currentPage, setCurrentPage] = useState("active");
    const [currentDate, setCurrentDate] = useState("today");
    const [campaignData, setCampaignData] = useState([]);
    const [analyticsData, setAnaliticsData] = useState([]);
    const [choosedCampaign, setChoosedCampaign] = useState(6);

    function Rendering() {
        switch (currentPage){
            case "active":
                return <Active currentDate={currentDate} setCurrentDate={setCurrentDate}/>;
            case "history":
                return <History currentDate={currentDate} setCurrentDate={setCurrentDate}/>;
            default:
                return <Active currentDate={currentDate} setCurrentDate={setCurrentDate}/>;
        }
    }

    async function fetchTableData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // campaigns
        const { data: campaigns, error: campaignsError } = await supabase
            .from("campaigns")
            .select("*")
            .eq("ownerid", user.id);

        if (campaignsError) {
            console.log(campaignsError.message);
            return;
        }

        setCampaignData(campaigns || []);
    }

    async function fetchChartData() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        console.log(user.id);
        const {data: new_analiticsData, error: _analiticsDataError} = await supabase
            .from("analitics")
            .select("*")
            .eq("owner_id", user.id)
            .eq("campaign_id", choosedCampaign)

        if (_analiticsDataError) {
            console.log(_analiticsDataError.message)
            return
        }
        console.log(new_analiticsData);
        setAnaliticsData(new_analiticsData || []);
    }

    useEffect(() => {
        fetchTableData(); // Fetching Table
    }, []);

    useEffect(() => {
        
        fetchChartData(); // Fetching Analitics Chart Data
    }, [choosedCampaign])

    return (
        <div className="analitics">
            <div className="analitics__header">
                <h1 className="analitics__header--title title">Analitics</h1>
                <p className="analitics__header--description description">Detailed campaign performance and insights</p>
            </div>
            <div className="analitics_switcher">
                <button className={"analitics_switcher--button " + (currentPage === "active" ? "analitics_switcher--button_active" : "")} onClick={() => setCurrentPage("active")}>
                    Active Campaignes
                </button>
                <button className={"analitics_switcher--button " + (currentPage === "history" ? "analitics_switcher--button_active" : "")} onClick={() => setCurrentPage("history")}>
                    Campaign History
                </button>
            </div>
            <div className="line"></div>
            <div className="analitics__content">
                <Rendering />
            </div>

            <div className="analiticsChart">
                <AnaliticsChart currentDate={currentDate} analyticsData={analyticsData[0]} />
            </div>

            <div className="analiticsTable">
                {/* <CampaignTable pageData={tableData} data={campaignData} state={true} page={currentPage} /> */}
                <AnatiticTable data={campaignData} pageData={tableData} state={true} page={currentPage} setChoosedCampaign={setChoosedCampaign} />
            </div>
        </div>
    )
}

export default Analitics;