import "../../App.css";
import { supabase } from "../../data/supabase";
import OverviewInfo from "../../Components/overviewInfo";
import CampaignTable from "../../Components/CampaignTable";
import { useEffect, useState } from "react";

function Overview ({data, setPage}) {
    const [campaignData, setCampaignData] = useState([]);
    const [profile, setProfile] = useState(null);
    const [totalDistance, setTotalDistance] = useState(null);

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

    // percent used (если есть left в profile)
    const percentUsed =
        totalBudget > 0
            ? Math.min(Math.round((parseFloat(profile?.balance || 0) / parseFloat(totalBudget)) * 100), 100)
            : 0;

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
                .eq("userId", user.id)
                .single();

            if (profileError) {
                console.log(profileError.message);
                return;
            }
            setProfile(profileData);

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
        };

        fetchData();
    }, []);

    return (
        <div className="overview">
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
                            <OverviewInfo data={stats} key={inedx} driverCount={activeVehicles} distance={totalDistance} totalBudget={totalBudget} />
                        ))
                    }
                </div>
                <div className="overview__budget">
                    <div className="budget">
                        <p className="budget__title">{data.budgetOverview.title}</p>
                        <div className="budget__left">
                            <div className="budget__left--info">
                                <p className="budget__left--info--title">{data.budgetOverview.loadbarTitle}</p>
                                <p className="budget__left--info--procent">{percentUsed}%</p>
                            </div>
                            <div className="budget__left--loader">
                                <div className="budget__left--loader--fill" style={{width: `${percentUsed}%`}}></div>
                            </div>
                        </div>
                        <div className="budget__left__data">
                            {
                                data.budgetOverview.budgetIfon.map((budget, index) => (
                                    <div className="budget__left__data--total" key={index}>
                                        <p className="budget__left__data--total--title">{budget.title}</p>
                                        <p className="budget__left__data--total--budget">
                                            {budget.title === "Total" && formatNumber(totalBudget) }
                                            {budget.title === "Left" && formatNumber(parseFloat(profile?.balance))}    
                                        </p>
                                        <p className="budget__left__data--total--title">{budget.article}</p>
                                    </div>
                                ))
                            }
                        </div>
                        {/* <div className="budget__days">
                            <p className="budget__days--title">{data.budgetOverview.budgetDays.title}</p>
                            <div className="budget__days--days">
                                <p>20 {data.budgetOverview.budgetDays.days}</p>
                            </div>
                        </div> */}
                    </div>
                    <CampaignTable data={campaignData} pageData={data.campaignTable} state={false} />
                    {/* <OverviewChart data7={data7} data30={data30} /> */}
                </div>
            </div>
        </div>
    );
}

export default Overview;