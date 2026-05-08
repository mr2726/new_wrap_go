import "../../App.css";
import { IoLocationOutline } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import { FaRegClock } from "react-icons/fa6";
import { FaCar } from "react-icons/fa";
import TopMenu from "../../Components/TopMenu";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../data/supabase";


function Contracts({setFleetPage}) {
    const [contractDetails, setContractDetails] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [contractData, setContractData] = useState([]);
    const [selectedContract, setSelectedContract] = useState(null);

    const closeDetails = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setContractDetails(false);
            setIsClosing(false);
        }, 250);
    }, []);

    useEffect(() => {
        const fetchContracts = async () => {
            const { data: contracts, error: contractsError } = await supabase
                .from("campaigns")
                .select("*")
            if (contractsError) {
                console.error("Error fetching contracts:", contractsError);
                return;
            }
            else {
                setContractData(contracts);
            }
        }
        fetchContracts();
    }, [])
    return (
        <div className="contracts">
            <TopMenu sendto="" setFleetPage={setFleetPage} />
            <div className="contracts__header">
                <h1 className="signup_content_container__title">Contracts</h1>
                <p className="signup_content_container__description">Browse advertised contracts and manage your fleet agreements.</p>
            </div>
            <div className="contracts__content">
                    {
                        (contractData || []).map((item)=> (
                            <div className="contracts__block">
                                <div style={{display: "flex"}}>
                                    <div className="contracts__block--image"><img src={item.image_link} alt="Contract" /></div>
                                
                                    <div className="contracts__block--main">


                                        <div className="contracts__block--details--company_info">
                                            <div className="company__logo"><img src="https://rshhhtxokegviwblosur.supabase.co/storage/v1/object/public/profile-images/59956ff9-7702-4ba7-b43f-001f494461c4/company-1778195849542-photo_2026-05-07_14-57-03.jpg" alt="Company Logo" /></div>
                                            <div>
                                                <h2 className="company__name">Company Name</h2>
                                                <div className="contracts__tags">
                                                    <p className="company__industry company__info--details">Industry: Transportation</p>
                                                    <p className="company__size company__info--details">Location: Yerevan, Armenia</p>
                                                </div>
                                            </div>
                                        </div>


                                        <div className="contact__details">
                                            <div className="contract__details--block">
                                                <IoLocationOutline color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>Location</p>
                                                    <p>{item.city}</p>
                                                </div>
                                            </div>
                                            <div className="contract__details--block">
                                                <CiCalendar color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>Start Date</p>
                                                    <p>{new Date(new Date(item.created_at).setDate(new Date(item.created_at).getDate() + 7)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="contract__details--block">
                                                <FaRegClock color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>Duration</p>
                                                    <p>{item.duration?.replace('m', ' Month')}</p>
                                                </div>
                                            </div>
                                            <div className="contract__details--block">
                                                <FaCar color="#94A3B8" fontSize={20}/>
                                                <div>
                                                    <p>Vehicles Needed</p>
                                                    <p>{item.economValue} Vehicles</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="contracts__block--details--actions">
                                    <div className="contracts__block--details--actions__header">
                                        <p className="contracts__block--details--actions__header--title">Estimated Earnings</p>
                                        <div className="title__details">
                                            <p>{(Number(item.budget) / item.economValue).toLocaleString('en-US')} AMD</p>
                                            <p>Per Vehicle</p>
                                        </div>
                                    </div>
                                    <div className="contracts__block--details--actions__buttons">
                                        <button className="contracts__block--details--actions--button cta">Book Contract</button>
                                        <button className="contracts__block--details--actions--button secondary_cta" onClick={() => { setSelectedContract(item); setContractDetails(true); }}>View Details</button>
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
                                            <img src="https://rshhhtxokegviwblosur.supabase.co/storage/v1/object/public/profile-images/59956ff9-7702-4ba7-b43f-001f494461c4/company-1778195849542-photo_2026-05-07_14-57-03.jpg" alt="Company Logo" />
                                        </div>
                                        <div>
                                            <h2 style={{fontFamily: "'LufgaBold', sans-serif", fontSize: "1.3em", color: "#fff", margin: 0}}>{selectedContract.title || "Contract"}</h2>
                                            <p style={{fontFamily: "'LufgaRegular', sans-serif", fontSize: "1em", color: "#64748b", margin: 0}}>{selectedContract.city}</p>
                                        </div>
                                    </div>

                                    {selectedContract.description && (
                                        <p style={{fontFamily: "'LufgaRegular', sans-serif", fontSize: "1.05em", color: "#94A3B8", lineHeight: 1.5, marginBottom: "1.4em"}}>{selectedContract.description}</p>
                                    )}

                                    <div style={{borderTop: "1px solid rgba(72,96,127,0.3)", paddingTop: "1.2em", display: "flex", flexDirection: "column", gap: "1em", marginBottom: "1.4em"}}>
                                        <div className="contract__details--block">
                                            <CiCalendar color="#94A3B8" fontSize={20}/>
                                            <div>
                                                <p>Start Date</p>
                                                <p>{new Date(new Date(selectedContract.created_at).setDate(new Date(selectedContract.created_at).getDate() + 7)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="contract__details--block">
                                            <FaRegClock color="#94A3B8" fontSize={18}/>
                                            <div>
                                                <p>Duration</p>
                                                <p>{selectedContract.duration?.replace('m', ' Month')}</p>
                                            </div>
                                        </div>
                                        <div className="contract__details--block">
                                            <IoLocationOutline color="#94A3B8" fontSize={20}/>
                                            <div>
                                                <p>Location</p>
                                                <p>{selectedContract.city}</p>
                                            </div>
                                        </div>
                                        <div className="contract__details--block">
                                            <FaCar color="#94A3B8" fontSize={18}/>
                                            <div>
                                                <p>Vehicles Needed</p>
                                                <p>{selectedContract.economValue} Vehicles</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{borderTop: "1px solid rgba(72,96,127,0.3)", paddingTop: "1.2em", marginBottom: "1.6em"}}>
                                        <p style={{fontFamily: "'LufgaRegular', sans-serif", fontSize: "1em", color: "#64748b", marginBottom: "0.3em"}}>Estimated Earnings</p>
                                        <p style={{fontFamily: "'LufgaBold', sans-serif", fontSize: "2em", color: "var(--primary-color)", lineHeight: 1.1}}>{(Number(selectedContract.budget) / selectedContract.economValue).toLocaleString('en-US')} <span style={{fontSize: "0.5em", color: "#64748b", fontFamily: "'LufgaRegular', sans-serif"}}>AMD / vehicle</span></p>
                                    </div>

                                    <button className="contract__details--popup__close" onClick={closeDetails} style={{width: "100%", marginTop: "auto"}}>Book Contract</button>
                                    <button className="secondary_cta" onClick={closeDetails} style={{width: "100%", marginTop: "0.6em"}}>Close</button>
                                </div>
                            </div>
                        </div>
                    )
                }
        </div>
    )
}

export default Contracts;