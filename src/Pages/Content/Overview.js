import "../../App.css";
import { supabase } from "../../data/supabase";
import OverviewInfo from "../../Components/overviewInfo";
import CampaignTable from "../../Components/CampaignTable";
import Loader from "../../Components/Loader";
import { useEffect, useState } from "react";

// Parse duration strings like "3m", "7d", "2w"
const parseDurationMs = (duration) => {
    const match = (duration || "").match(/^(\d+)([mdhw])$/i);
    if (!match) return null;
    const val = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const msMap = { m: 30 * 24 * 60 * 60 * 1000, d: 24 * 60 * 60 * 1000, h: 60 * 60 * 1000, w: 7 * 24 * 60 * 60 * 1000 };
    return val * (msMap[unit] || 0);
};

const getCampaignProgress = (campaign) => {
    const durationMs = parseDurationMs(campaign.duration);
    if (!durationMs || !campaign.created_at) return 0;
    const elapsed = Date.now() - new Date(campaign.created_at).getTime();
    return Math.min(Math.round((elapsed / durationMs) * 100), 100);
};


const getCampaignDaysLeft = (campaign) => {
    const durationMs = parseDurationMs(campaign.duration);
    if (!durationMs || !campaign.created_at) return 0;
    const end = new Date(campaign.created_at).getTime() + durationMs;
    const remaining = end - Date.now();
    return Math.max(Math.ceil(remaining / (24 * 60 * 60 * 1000)), 0);
};

function Overview ({data, setPage}) {
    const [campaignData, setCampaignData] = useState([]);
    // const [profile, setProfile] = useState(null);
    const [totalDistance, setTotalDistance] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [loading, setLoading] = useState(true);

    // Format 
    const formatNumber = (num) => (num || 0).toLocaleString('en-US');
    // total drivers
    const activeVehicles = campaignData.reduce((total, item) => {
        return total + (item.driverCount || 0);
    }, 0);

    // total budget
    const totalBudget = campaignData.reduce((total, item) => {
        return total + (parseFloat(item.budget) || 0);
    }, 0);

    // Average progress of all live campaigns
    const liveCampaigns = campaignData.filter(c => c.status === "live");
    const avgProgress = liveCampaigns.length > 0
        ? Math.round(liveCampaigns.reduce((sum, c) => sum + getCampaignProgress(c), 0) / liveCampaigns.length)
        : 0;

    const displayPercent = selectedCampaign
        ? getCampaignProgress(selectedCampaign)
        : avgProgress;

    const handleCampaignClick = (campaign) => {
        if (campaign.status === "live") {
            setSelectedCampaign(prev => prev?.id === campaign.id ? null : campaign);
        }
    };

    //  fetch data
    useEffect(() => {
        const fetchData = async () => {
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

            // profile
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("userid", user.id)
                .single();

            if (profileError) {
                console.log(profileError.message);
                return;
            }
            console.log(profileData);
            // setProfile(profileData);

            // drivers
            const campaignIds = campaigns.map(c => c.id);

            const { data: drivers, error: driversError } = await supabase
                .from("drivers")
                .select("totaldistance")
                .in("contractid", campaignIds);
            
            if(driversError){
                console.warn(driversError.message);
                return
            }

            const total = drivers.reduce((sum, t) => {
                return sum + parseFloat(t.totaldistance || 0);
            }, 0);

            setTotalDistance(total);
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div className="overview">
            {loading && <Loader />}
            <div className="overview__header">
                <div className="overview__header--content">
                    <h1 className="content__title">{data.title}</h1>
                    <p className="content__description">{data.description}</p>
                </div>
                <button className="overview__header--button" onClick={() => setPage("campaign-builder")}>{data.btn}</button>
            </div>
            <div className="overview__content">
                <div className="overview__content_blocks">
                    {
                        data.overview_stats.map((stats, inedx) => (
                            <OverviewInfo data={stats} key={inedx} driverCount={activeVehicles} distance={totalDistance} totalBudget={totalBudget} setPage={setPage} />
                        ))
                    }
                </div>
                <div className="overview__budget">
                    <div className="budget">
                        <div className="budget__title--row">
                            <p className="budget__title">{data.budgetOverview.title}</p>
                            {selectedCampaign && (
                                <button className="budget__viewall" onClick={() => setSelectedCampaign(null)}>View All</button>
                            )}
                        </div>
                        <div className="budget__left">
                            <div className="budget__left--info">
                                <p className="budget__left--info--procent">{displayPercent}%</p>
                            </div>
                            <div className="budget__left--loader">
                                <div className="budget__left--loader--fill" style={{width: `${displayPercent}%`}}></div>
                            </div>
                        </div>
                        <p className="budget__left--info--title">{data.budgetOverview.loadbarTitle}</p>
                        <div className="budget__left__data">
                            
                            { 
                            selectedCampaign !== null ? (
                                data.budgetOverview.budgetIfon.map((budget, index) => (
                                    <div className="budget__left__data--total" key={index}>
                                        <p className="budget__left__data--total--title">{budget.title}</p>
                                        <p className="budget__left__data--total--budget">
                                            {budget.title === "Campaign Spend" && formatNumber(selectedCampaign ? parseFloat(selectedCampaign.budget) : totalBudget)}
                                            {budget.title === "Left" && selectedCampaign && getCampaignDaysLeft(selectedCampaign)}
                                        </p>
                                        <p className="budget__left__data--total--title">{budget.article}</p>
                                    </div>
                                ))
                            ) : 
                            
                                <div className="budget__left__data--total">
                                    <p className="budget__left__data--total--title">{data.budgetOverview.budgetIfon[0].title}</p>
                                    <p className="budget__left__data--total--budget">
                                        {data.budgetOverview.budgetIfon[0].title === "Campaign Spend" && formatNumber(selectedCampaign ? parseFloat(selectedCampaign.budget) : totalBudget)}
                                    </p>
                                </div>
                            }
                        </div>
                        {/* <div className="budget__days">
                            <p className="budget__days--title">{data.budgetOverview.budgetDays.title}</p>
                            <div className="budget__days--days">
                                <p>20 {data.budgetOverview.budgetDays.days}</p>
                            </div>
                        </div> */}
                    </div>
                    <CampaignTable data={campaignData} pageData={data.campaignTable} state={false} onRowClick={handleCampaignClick} selectedId={selectedCampaign?.id} setPage={setPage} />
                    {/* <OverviewChart data7={data7} data30={data30} /> */}
                </div>
            </div>
        </div>
    );
}

export default Overview;