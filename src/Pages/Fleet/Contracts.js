import "../../App.css";
import { IoLocationOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import { FaRegClock } from "react-icons/fa6";
import { FaCar } from "react-icons/fa";
import TopMenu from "../../Components/TopMenu";
import { useState, useCallback, useEffect } from "react";
import {
  getUser,
  getFleetContracts,
  updateFleet,
  getAllCampaigns,
  getProfilesByIds,
    updateCampaign,
} from "../../data/service";
import { useLanguage } from "../../context/LanguageContext";
import { getEffectiveCampaignStartDate } from "../../data/campaignDates";


function Contracts({setFleetPage}) {
    const { data: pageData } = useLanguage();
    const contractsText = pageData.fleet.contracts;
    const [contractDetails, setContractDetails] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [contractData, setContractData] = useState([]);
    const [profilesByUserId, setProfilesByUserId] = useState({});
    const [myContractIds, setMyContractIds] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);
    const [filter, setFilter] = useState("available");
    const [isBooking, setIsBooking] = useState(false);
    const [bookingStatus, setBookingStatus] = useState({ type: "", text: "" });
    const standartPayment = 30000;

    const closeDetails = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setContractDetails(false);
            setIsClosing(false);
        }, 250);
    }, []);

    // Book contract
    const bookContract = useCallback(async () => {
        setIsBooking(true);
        try {
            const { data: { user } } = await getUser();
            if (!user || !selectedContract) return;

            // Add contract ID to user's contracts array
            const { data: fleetData } = await getFleetContracts(user?.id);

            const currentContracts = fleetData?.contracts || [];
            if (!currentContracts.includes(selectedContract.id)) {
                currentContracts.push(selectedContract.id);
            }

            const { error: fleetError } = await updateFleet(user?.id, { contracts: currentContracts });

            if (fleetError) throw fleetError;

            const effectiveStart = getEffectiveCampaignStartDate(selectedContract);
            if (effectiveStart) {
                const { error: startDateError } = await updateCampaign(selectedContract.id, {
                    effective_start_at: effectiveStart.toISOString(),
                });

                if (startDateError) throw startDateError;
            }

            // Close modal and reload data
            closeDetails();
            
            // Reload contracts list
            const { data: campaigns } = await getAllCampaigns();
            setContractData(campaigns || []);

            // Update my contracts list
            const { data: updatedFleet } = await getFleetContracts(user?.id);
            setMyContractIds(updatedFleet?.contracts || []);

            setBookingStatus({ type: "success", text: contractsText.alerts.booked });
        } catch (error) {
            console.error("Error booking contract:", error);
            setBookingStatus({ type: "error", text: contractsText.alerts.bookError });
        } finally {
            setIsBooking(false);
        }
    }, [selectedContract, closeDetails, contractsText.alerts.bookError, contractsText.alerts.booked]);

    useEffect(() => {
        const fetchContracts = async () => {
            const { data: { user } } = await getUser();

            const { data: fleetData, error: fleetError } = await getFleetContracts(user?.id);

            if (!fleetError && fleetData?.contracts) {
                setMyContractIds(fleetData.contracts);
            }

            const { data: campaigns, error: contractsError } = await getAllCampaigns()
            if (contractsError) {
                console.error("Error fetching contracts:", contractsError);
                return;
            }
            else {
                setContractData(campaigns);

                const ownerIds = [...new Set((campaigns || []).map((campaign) => campaign.ownerid).filter(Boolean))];

                if (ownerIds.length > 0) {
                    const { data: profilesData, error: profilesError } = await getProfilesByIds(ownerIds);

                    if (profilesError) {
                        console.error("Error fetching profiles:", profilesError);
                    } else {
                        const profileMap = (profilesData || []).reduce((acc, profile) => {
                            acc[String(profile.userid)] = profile;
                            return acc;
                        }, {});
                        setProfilesByUserId(profileMap);
                    }
                }
            }
        }
        fetchContracts();
    }, [])
    const normalizedMyIds = myContractIds.map((id) => String(id));
    const filteredContracts = (contractData || []).filter((item) => {
        const id = String(item.id);
        if (filter === "completed") return item.status === "complited" && normalizedMyIds.includes(id);
        if (filter === "my") return item.status === "live" && normalizedMyIds.includes(id);
        // available
        return item.status === "live" && !normalizedMyIds.includes(id);
    });

    return (
        <div className="contracts">
            <TopMenu sendto="dashboard" setFleetPage={setFleetPage} currentPage="contracts" />
            <div className="contracts__header">
                <h1 className="signup_content_container__title">{contractsText.title}</h1>
                <p className="signup_content_container__description">{contractsText.description}</p>
            </div>
            <div className="contracts__content">
                    <div className="contracts_filter_btns">
                        <button className={`contracts__filter--button ${filter === "available" ? "contracts_filter_btns--active" : ""}`} onClick={() => setFilter("available")}>{contractsText.filters.available}</button>
                        <button className={`contracts__filter--button ${filter === "my" ? "contracts_filter_btns--active" : ""}`} onClick={() => setFilter("my")}>{contractsText.filters.my}</button>
                        <button className={`contracts__filter--button ${filter === "completed" ? "contracts_filter_btns--active" : ""}`} onClick={() => setFilter("completed")}>{contractsText.filters.completed}</button>
                    </div>
                    {
                        filteredContracts.map((item)=> (
                            <div className="contracts__block" key={item.id}>
                                <div style={{display: "flex"}}>
                                    <div className="contracts__block--image"><img src={item.image_link} alt="Contract" /></div>

                                    <div className="contracts__block--main">


                                        <div className="contracts__block--details--company_info">
                                            <div className="company__logo">
                                                {profilesByUserId[String(item.ownerid)]?.company_logo_url
                                                    ? <img src={profilesByUserId[String(item.ownerid)].company_logo_url} alt="Company Logo" />
                                                    : <div className="company__logo--placeholder">{(profilesByUserId[String(item.ownerid)]?.companyname || "?")[0]}</div>
                                                }
                                            </div>
                                            <div>
                                                <h2 className="company__name">{profilesByUserId[String(item.ownerid)]?.companyname || contractsText.companyFallback}</h2>
                                                <div className="contracts__tags">
                                                    <p className="company__industry company__info--details">{contractsText.details.industry} {profilesByUserId[String(item.ownerid)]?.industry || contractsText.na}</p>
                                                    <p className="company__size company__info--details">{contractsText.details.locationMeta} {profilesByUserId[String(item.ownerid)]?.city || item.city || contractsText.na}</p>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="contact__details">
                                            <div className="contract__details--block">
                                                <IoLocationOutline color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>{contractsText.details.location}</p>
                                                    <p>{item.city}</p>
                                                </div>
                                            </div>
                                            <div className="contract__details--block">
                                                <CiCalendar color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>{contractsText.details.startDate}</p>
                                                    <p>{getEffectiveCampaignStartDate(item)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || "-"}</p>
                                                </div>
                                            </div>
                                            <div className="contract__details--block">
                                                <FaRegClock color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>{contractsText.details.duration}</p>
                                                    <p>{item.duration?.replace('m', contractsText.details.monthSuffix)}</p>
                                                </div>
                                            </div>
                                            <div className="contract__details--block">
                                                <FaCar color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>{contractsText.details.vehiclesNeeded}</p>
                                                    <p>{item.economValue} {contractsText.details.vehiclesSuffix}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="contracts__block--details--actions">
                                    <div className="contracts__block--details--actions__header">
                                        <p className="contracts__block--details--actions__header--title">{contractsText.details.estimatedEarnings}</p>
                                        <div className="title__details">
                                            <p>{(Number(standartPayment)).toLocaleString('en-US')} AMD</p>
                                            <p>{contractsText.details.perVehicle}</p>
                                        </div>
                                    </div>
                                    <div className="contracts__block--details--actions__buttons">
                                        {(filter !== "completed" && filter !== "my") && <button className="contracts__block--details--actions--button cta" onClick={() => { setSelectedContract(item); setContractDetails(true); }}>{contractsText.buttons.book}</button>}
                                        <button className="contracts__block--details--actions--button secondary_cta" onClick={() => { setSelectedContract(item); setContractDetails(true); }}>{contractsText.buttons.view}</button>
                                    </div>
                                </div>
                            </div>
                        ) )
                    }
                </div>
                {
                    contractDetails && selectedContract && (
                        <div className={`contract__details--bg${isClosing ? " contract__details--bg--closing" : ""}`} onClick={closeDetails}>
                            <div className="contract__details--popup" onClick={(e) => e.stopPropagation()}>
                                <div className="contract__details--popup__content">

                                    <div style={{margin: "-2em -2em 1.6em -2em", height: "160px", overflow: "hidden", borderRadius: "0 0 0 0", flexShrink: 0}}>
                                        <img src={selectedContract.image_link} alt="Contract" style={{width: "100%", height: "100%", objectFit: "cover", display: "block"}} />
                                    </div>

                                    <div style={{display: "flex", alignItems: "center", gap: "0.8em", marginBottom: "1.2em"}}>
                                        <div className="company__logo">
                                            {profilesByUserId[String(selectedContract.ownerid)]?.company_logo_url
                                                ? <img src={profilesByUserId[String(selectedContract.ownerid)].company_logo_url} alt="Company Logo" />
                                                : <div className="company__logo--placeholder">{(profilesByUserId[String(selectedContract.ownerid)]?.companyname || "?")[0]}</div>
                                            }
                                        </div>
                                        <div>
                                            <h2 style={{fontFamily: "'LufgaBold', sans-serif", fontSize: "1.3em", color: "#fff", margin: 0}}>{profilesByUserId[String(selectedContract.ownerid)]?.companyname || selectedContract.title || contractsText.modalFallbackTitle}</h2>
                                            <p style={{fontFamily: "'LufgaRegular', sans-serif", fontSize: "1em", color: "#64748b", margin: 0}}>{profilesByUserId[String(selectedContract.ownerid)]?.city || selectedContract.city}</p>
                                        </div>
                                    </div>

                                    {selectedContract.name && (
                                        <p style={{fontFamily: "'LufgaRegular', sans-serif", fontSize: "1.05em", color: "#94A3B8", lineHeight: 1.5, marginBottom: "1.4em"}}>{selectedContract.name}</p>
                                    )}

                                    <div style={{borderTop: "1px solid rgba(72,96,127,0.3)", paddingTop: "1.2em", display: "flex", flexDirection: "column", gap: "1em", marginBottom: "1.4em"}}>
                                        <div className="contract__details--block">
                                            <CiCalendar color="#94A3B8" fontSize={20}/>
                                            <div>
                                                <p>{contractsText.details.startDate}</p>
                                                <p>{getEffectiveCampaignStartDate(selectedContract)?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || "-"}</p>
                                            </div>
                                        </div>
                                        <div className="contract__details--block">
                                            <FaRegClock color="#94A3B8" fontSize={18}/>
                                            <div>
                                                <p>{contractsText.details.duration}</p>
                                                <p>{selectedContract.duration?.replace('m', contractsText.details.monthSuffix)}</p>
                                            </div>
                                        </div>
                                        <div className="contract__details--block">
                                            <IoLocationOutline color="#94A3B8" fontSize={20}/>
                                            <div>
                                                <p>{contractsText.details.location}</p>
                                                <p>{selectedContract.city}</p>
                                            </div>
                                        </div>
                                        <div className="contract__details--block">
                                            <FaCar color="#94A3B8" fontSize={18}/>
                                            <div>
                                                <p>{contractsText.details.vehiclesNeeded}</p>
                                                <p>{selectedContract.economValue} {contractsText.details.vehiclesSuffix}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{borderTop: "1px solid rgba(72,96,127,0.3)", paddingTop: "1.2em", marginBottom: "1.6em"}}>
                                        <p style={{fontFamily: "'LufgaRegular', sans-serif", fontSize: "1em", color: "#64748b", marginBottom: "0.3em"}}>{contractsText.details.estimatedEarnings}</p>
                                        <p style={{fontFamily: "'LufgaBold', sans-serif", fontSize: "2em", color: "var(--primary-color)", lineHeight: 1.1}}>{(Number(standartPayment)).toLocaleString('en-US')} <span style={{fontSize: "0.5em", color: "#64748b", fontFamily: "'LufgaRegular', sans-serif"}}>{contractsText.details.amdPerVehicle}</span></p>
                                    </div>

                                    {bookingStatus.text && (
                                        <p className={bookingStatus.type === "success" ? "settings-form__status settings-form__status--success" : "signup_form__error"} style={{marginBottom: "0.8em"}}>
                                            {bookingStatus.text}
                                        </p>
                                    )}
                                    {(filter !== "completed" && filter !== "my") && <button className="contract__details--popup__close" onClick={bookContract} disabled={isBooking} style={{width: "100%", marginTop: "auto"}}>{isBooking ? contractsText.buttons.booking : contractsText.buttons.book}</button>}
                                    <button className="secondary_cta" onClick={closeDetails} style={{width: "100%", marginTop: filter !== "completed" ? "0.6em" : "auto"}}>{contractsText.buttons.close}</button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
    )
}

export default Contracts;