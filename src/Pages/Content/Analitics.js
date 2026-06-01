import "../../App.css";
import { useEffect, useState } from "react";
import { getUser, getCampaignsByOwner, getAnalitics } from "../../data/service";
import pageData from "../../data/data.json";
import Loader from "../../Components/Loader";
/* Pages */
import Active from "./Analitics/Active";
import History from "./Analitics/History";
import AnaliticsChart from "../../Components/AnaliticsChart";
import AnatiticTable from "../../Components/AnaliticsTable";

function Analitics({ tableData }) {
    const analyticsPageData = pageData.content.analitics.page;
    const [currentPage, setCurrentPage] = useState("active");
    const [currentDate, setCurrentDate] = useState("today");
    const [campaignData, setCampaignData] = useState([]);
    const [analyticsData, setAnaliticsData] = useState([]);
    const [choosedCampaign, setChoosedCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    const renderPage = () => {
        switch (currentPage){
            case "active":
                return <Active currentDate={currentDate} setCurrentDate={setCurrentDate}/>;
            case "history":
                return <History currentDate={currentDate} setCurrentDate={setCurrentDate}/>;
            default:
                return <Active currentDate={currentDate} setCurrentDate={setCurrentDate}/>;
        }
    };

    async function fetchTableData() {
        try {
            const { data: { user } } = await getUser();
            if (!user) return;
            const { data: campaigns, error: campaignsError } = await getCampaignsByOwner(user.id);

            if (campaignsError) {
                console.error(campaignsError.message);
                return;
            }

            setCampaignData(campaigns || []);
        } finally {
            setLoading(false);
        }
    }

    async function fetchChartData(comp) {
        if (comp === null || comp === undefined) return;
        const { data: { user } } = await getUser();
        if (!user) return;
        const { data: new_analiticsData, error: _analiticsDataError } = await getAnalitics(user.id, comp);

        if (_analiticsDataError) {
            console.error(_analiticsDataError.message);
            return;
        }
        setAnaliticsData(new_analiticsData || []);
    }

    useEffect(() => {
        fetchTableData();
    }, []);

    useEffect(() => {
        fetchChartData(choosedCampaign);
    }, [choosedCampaign]);

    return (
        <div className="analitics">
            {loading && <Loader />}
            <div className="analitics__header">
                <h1 className="analitics__header--title title">{analyticsPageData.title}</h1>
                <p className="analitics__header--description description">{analyticsPageData.description}</p>
            </div>
            <div className="analitics_switcher">
                <button className={"analitics_switcher--button " + (currentPage === "active" ? "analitics_switcher--button_active" : "")} onClick={() => setCurrentPage("active")}>
                    {analyticsPageData.tabs.active}
                </button>
                <button className={"analitics_switcher--button " + (currentPage === "history" ? "analitics_switcher--button_active" : "")} onClick={() => setCurrentPage("history")}>
                    {analyticsPageData.tabs.history}
                </button>
            </div>
            <div className="line"></div>
            <div className="analitics__content">
                {renderPage()}
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