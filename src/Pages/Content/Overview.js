import "../../App.css";
import {
  getUser,
  getCampaignsByOwner,
  getDriverDistancesByContractIds,
  updateCampaign,
} from "../../data/service";
import OverviewInfo from "../../Components/overviewInfo";
import CampaignTable from "../../Components/CampaignTable";
import Loader from "../../Components/Loader";
import CampaignsVehicleDetailsPopup from "../../Components/CampaignsVehicleDetailsPopup";
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

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const getCampaignProgress = (campaign) => {
    const durationMs = parseDurationMs(campaign.duration);
    if (!durationMs || !campaign.created_at) return 0;
    const start = new Date(campaign.created_at).getTime() + WEEK_MS;
    const end = start + durationMs;
    const now = Date.now();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / durationMs) * 100);
};

const getCampaignDaysLeft = (campaign) => {
    const durationMs = parseDurationMs(campaign.duration);
    if (!durationMs || !campaign.created_at) return 0;
    const end = new Date(campaign.created_at).getTime() + WEEK_MS + durationMs;
    const remaining = end - Date.now();
    return Math.max(Math.ceil(remaining / (24 * 60 * 60 * 1000)), 0);
};

function Overview ({data, setPage}) {
    const [campaignData, setCampaignData] = useState([]);
    const [totalDistance, setTotalDistance] = useState(null);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [vehiclesPopup, setVehiclesPopup] = useState(false);
    const [detailsCampaign, setDetailsCampaign] = useState(null);

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
            const { data: { user } } = await getUser();
            if (!user) return;


            // campaigns
            const { data: campaigns, error: campaignsError } = await getCampaignsByOwner(user.id);

            if (campaignsError) {
                console.error(campaignsError.message);
                setLoading(false);
                return;
            }

            // drivers
            const campaignIds = (campaigns || []).map(c => c.id);

            if (!campaignIds.length) {
                setCampaignData([]);
                setTotalDistance(0);
                setLoading(false);
                return;
            }

            const { data: drivers, error: driversError } = await getDriverDistancesByContractIds(campaignIds);

            if (driversError) {
                console.error(driversError.message);
                setLoading(false);
                return;
            }

            const driverCountByCampaign = (drivers || []).reduce((acc, driver) => {
                const campaignId = driver.contractid;
                if (!campaignId) return acc;
                acc[campaignId] = (acc[campaignId] || 0) + 1;
                return acc;
            }, {});

            const campaignsWithDriverCount = (campaigns || []).map((campaign) => ({
                ...campaign,
                driverCount: driverCountByCampaign[campaign.id] || 0,
            }));

            const countUpdates = campaignsWithDriverCount
                .filter((campaign) => (campaign.driverCount || 0) !== (campaigns.find((item) => item.id === campaign.id)?.driverCount || 0))
                .map((campaign) => updateCampaign(campaign.id, { driverCount: campaign.driverCount }));

            if (countUpdates.length > 0) {
                const updateResults = await Promise.all(countUpdates);
                updateResults.forEach(({ error }) => {
                    if (error) {
                        console.warn("Driver count update error:", error.message);
                    }
                });
            }

            const total = (drivers || []).reduce((sum, t) => {
                return sum + parseFloat(t.totaldistance || 0);
            }, 0);

            setCampaignData(campaignsWithDriverCount);
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
                            <div className="budget__circle-loader">
                                <svg viewBox="0 0 100 100" className="budget__circle-svg">
                                    <circle
                                        className="budget__circle-bg"
                                        cx="50" cy="50" r="42"
                                        fill="none"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        className="budget__circle-fill"
                                        cx="50" cy="50" r="42"
                                        fill="none"
                                        strokeWidth="8"
                                        strokeDasharray="263.89"
                                        strokeDashoffset={263.89 * (1 - displayPercent / 100)}
                                        strokeLinecap="round"
                                        transform="rotate(-90 50 50)"
                                    />
                                </svg>
                                <div className="budget__circle-label">
                                    <p className="budget__left--info--procent">{displayPercent}%</p>
                                </div>
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
                    </div>
                    <CampaignTable data={campaignData} pageData={data.campaignTable} state={false} onRowClick={handleCampaignClick} selectedId={selectedCampaign?.id} setPage={setPage} detailsPopup={(item) => { setDetailsCampaign(item); setVehiclesPopup(true); }} />
                </div>
            </div>
            {vehiclesPopup && (
                <CampaignsVehicleDetailsPopup campaign={detailsCampaign} onClose={() => { setVehiclesPopup(false); setDetailsCampaign(null); }} />
            )}
        </div>
    );
}

export default Overview;