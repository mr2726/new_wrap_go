import "../../App.css";
import { useEffect, useState } from "react";
import Loader from "../../Components/Loader";
// import { LuClock } from "react-icons/lu";
import { PiWarningOctagonBold } from "react-icons/pi";
// import { IoMdCard } from "react-icons/io";
// import { IoPhonePortraitOutline } from "react-icons/io5";
// import { MdCorporateFare } from "react-icons/md";
// import { BsShieldCheck } from "react-icons/bs";
import { supabase } from "../../data/supabase";
// import { LuCircleCheckBig } from "react-icons/lu";
import { IoCard } from "react-icons/io5";
import { RiBankFill } from "react-icons/ri";
import { FaCheckCircle } from "react-icons/fa";
import { SiVisa } from "react-icons/si";
import { FaRegCheckCircle } from "react-icons/fa";

function Billing() {
    const [loading, setLoading] = useState(true);
    const [currentBillingMethod, setCurrentBillingMethod] = useState("card");
    const [invoices, setInvoices] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [profileTax, setProfileTax] = useState(null);
    const [taxInput, setTaxInput] = useState("");
    // const [pendingCampaignAmount, setPendingCampaignAmount] = useState(0);
    const [isSavingTax, setIsSavingTax] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    // const [cardNumber, setCardNumber] = useState("");
    // const [cardExpiry, setCardExpiry] = useState("");
    // const [cardCvc, setCardCvc] = useState("");
    // const [cardHolder, setCardHolder] = useState("");
    const [balance, setBalance] = useState(null);
    const [addFunds, setAddFunds] = useState(false);
    const [topupAmount, setTopupAmount] = useState("");
    const [payingInvoiceId, setPayingInvoiceId] = useState(null);
    const [amountError, setAmountError] = useState("");
    const [isProcessingTopup, setIsProcessingTopup] = useState(false);
    const [topupResult, setTopupResult] = useState(null); // { success: bool, amount: number }
    const [transactionHistory, setTransactionHistory] = useState([]);

    useEffect(() => {
        const initPage = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setInvoices([]);
                    return;
                }

                setCurrentUserId(user.id);

                const { data: profileRow, error: profileError } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("userid", user.id)
                    .single();

                if (profileError) {
                    console.log("Profile fetch error:", profileError.message);
                } else {
                    const loadedTax = String(profileRow?.tax || "").trim();
                    setProfileTax(loadedTax);
                    setTaxInput(loadedTax);
                    setBalance(profileRow?.balance || 0);
                }

                // const { data: pendingCampaigns, error: pendingCampaignsError } = await supabase
                //     .from("campaigns")
                //     .select("budget")
                //     .eq("ownerid", user.id)
                //     .eq("status", "pending");

                // // if (pendingCampaignsError) {
                //     console.log("Pending campaigns fetch error:", pendingCampaignsError.message);
                //     // setPendingCampaignAmount(0);
                // } else {
                //     // const totalPendingAmount = (pendingCampaigns || []).reduce((sum, campaign) => {
                //     //     const rawBudget = campaign?.budget;
                //     //     if (rawBudget === null || rawBudget === undefined || rawBudget === "") {
                //     //         return sum;
                //     //     }

                //     //     const numericBudget = Number(
                //     //         typeof rawBudget === "number"
                //     //             ? rawBudget
                //     //             : String(rawBudget).replace(/[^0-9.-]/g, "")
                //     //     );

                //     //     return Number.isNaN(numericBudget) ? sum : sum + numericBudget;
                //     // }, 0);

                //     // setPendingCampaignAmount(totalPendingAmount);
                // }

                const { data: invoiceRows, error: invoiceError } = await supabase
                    .from("invoices")
                    .select("id, invoiceid, campaign_id, amount, status, created_at")
                    .eq("owner_id", user.id)
                    .order("created_at", { ascending: false });

                if (invoiceError) {
                    console.log("Invoice fetch error:", invoiceError.message);
                    setInvoices([]);
                    return;
                }

                const campaignIds = [...new Set((invoiceRows || []).map((row) => row.campaign_id).filter(Boolean))];
                let campaignMap = {};

                if (campaignIds.length > 0) {
                    const { data: campaignRows, error: campaignError } = await supabase
                        .from("campaigns")
                        .select("id, name, status, created_at, duration")
                        .in("id", campaignIds);

                    if (campaignError) {
                        console.log("Campaign fetch error:", campaignError.message);
                    } else {
                        campaignMap = (campaignRows || []).reduce((acc, campaign) => {
                            acc[campaign.id] = campaign;
                            return acc;
                        }, {});
                    }
                }

                const normalizedInvoices = (invoiceRows || []).map((row) => ({
                    ...row,
                    campaignName: campaignMap[row.campaign_id]?.name || "-",
                    campaignStatus: campaignMap[row.campaign_id]?.status || "-",
                    campaignCreatedAt: campaignMap[row.campaign_id]?.created_at || null,
                    campaignDuration: campaignMap[row.campaign_id]?.duration || null,
                }));

                setInvoices(normalizedInvoices);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, []);

    // const formattedPendingCampaignAmount = pendingCampaignAmount.toLocaleString("en-US");


    // const handleCardNumberChange = (e) => {
    //     const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    //     const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    //     setCardNumber(formatted);
    // };

    // const handleCardExpiryChange = (e) => {
    //     const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    //     const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
    //     setCardExpiry(formatted);
    // };

    // const handleCardCvcChange = (e) => {
    //     setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4));
    // };

    // const handleCardHolderChange = (e) => {
    //     setCardHolder(e.target.value.toUpperCase());
    // };

    // function renderBillingMethodDetails(isDrawer = false) {
    //     switch (currentBillingMethod) {
    //         case "card":
    //             if (isDrawer) {
    //                 return (
                        
    //                 );
    //             }
    //             return (
                    
    //             );
    //         case "idram":
    //             return (

    //             );
    //         case "corporate":
    //             return (

    //             );
    //         default:
    //             return null;
    //     }
    // }

    const formatInvoiceDate = (dateValue) => {
        if (!dateValue) return "-";
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return "-";
        return parsedDate.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

    const formatAmount = (amount) => {
        if (amount === null || amount === undefined || amount === "") return "-";
        const numericAmount = Number(amount);
        if (Number.isNaN(numericAmount)) return `${amount}`;
        return `${numericAmount.toLocaleString("en-US")}`;
    };

    const parseAmount = (value) => {
        if (value === null || value === undefined || value === "") return 0;

        const normalized =
            typeof value === "number"
                ? value
                : Number(String(value).replace(/[^0-9.-]/g, ""));

        return Number.isNaN(normalized) ? 0 : normalized;
    };

    const formatLongDate = (dateValue) => {
        if (!dateValue) return "-";
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return "-";
        return parsedDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getDueDate = (dateValue) => {
        if (!dateValue) return "-";
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return "-";
        parsedDate.setDate(parsedDate.getDate() + 2);
        return parsedDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getDurationMonths = (durationValue) => {
        if (!durationValue) return 1;
        const normalized = String(durationValue).toLowerCase().trim();
        const numeric = Number.parseInt(normalized.replace(/[^0-9]/g, ""), 10);
        if (!Number.isNaN(numeric) && numeric > 0) return numeric;
        if (normalized === "custom") return 1;
        return 1;
    };

    const getInvoiceDescription = (invoice) => {
        const campaignCreatedAt = invoice?.campaignCreatedAt;
        if (!campaignCreatedAt) return "-";

        const createdDate = new Date(campaignCreatedAt);
        if (Number.isNaN(createdDate.getTime())) return "-";

        const startDate = new Date(createdDate);
        startDate.setDate(startDate.getDate() + 7);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + getDurationMonths(invoice?.campaignDuration));

        const fromDate = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        const toDate = endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

        const status = String(invoice?.campaignStatus || "").toLowerCase();
        if (status === "pending") return `Scheduled: ${fromDate} - ${toDate}`;
        if (status === "live") return `Live Period: ${fromDate} - ${toDate}`;
        return `Campaign Period: ${fromDate} - ${toDate}`;
    };

    const handleOpenInvoice = (invoice) => {
        setSelectedInvoice(invoice);
    };

    const handleCloseInvoice = () => {
        setSelectedInvoice(null);
    };

    const handleTaxInputChange = (event) => {
        const value = event.target.value.replace(/\D/g, "").slice(0, 10);
        setTaxInput(value);
    };

    const handleConfirmTax = async () => {
        if (!currentUserId || !taxInput) {
            return;
        }

        setIsSavingTax(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ tax: taxInput })
                .eq("userid", currentUserId);

            if (error) {
                console.log("Tax update error:", error.message);
                return;
            }

            setProfileTax(taxInput);
        } finally {
            setIsSavingTax(false);
        }
    };

    const handleTopupAmountChange = (event) => {
        const numericValue = event.target.value.replace(/\D/g, "").slice(0, 10);
        setTopupAmount(numericValue);
        
        // Inline validation
        if (numericValue === "") {
            setAmountError("");
        } else if (Number(numericValue) < 1000) {
            setAmountError("Minimum: 1,000 ֏");
        } else {
            setAmountError("");
        }
    };

    const handleQuickAmount = (amount) => {
        setTopupAmount(String(amount));
        setAmountError("");
    };

    const handleProcessTopup = async () => {
        const amount = Number(topupAmount);
        
        if (!topupAmount || amount < 1000) {
            setAmountError("Minimum: 1,000 ֏");
            return;
        }

        setIsProcessingTopup(true);
        
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newBalance = parseAmount(balance) + amount;
            
            // Update balance in Supabase
            const { error: balanceError } = await supabase
                .from("profiles")
                .update({ balance: newBalance })
                .eq("userid", currentUserId);

            if (balanceError) {
                console.log("Balance update error:", balanceError.message);
                setTopupResult({ success: false, amount: 0 });
                return;
            }

            // Add to transaction history
            const transaction = {
                id: Date.now(),
                type: "topup",
                amount: amount,
                method: currentBillingMethod,
                timestamp: new Date().toISOString(),
                status: "completed"
            };
            
            setBalance(newBalance);
            setTransactionHistory([transaction, ...transactionHistory.slice(0, 2)]);
            setTopupResult({ success: true, amount: amount });
            setTopupAmount("");
            setAmountError("");
        } catch (error) {
            console.log("Topup error:", error.message);
            setTopupResult({ success: false, amount: 0 });
        } finally {
            setIsProcessingTopup(false);
        }
    };

    const handlePayNow = async (event, invoice) => {
        event.stopPropagation();

        if (!invoice?.id || !currentUserId) {
            return;
        }

        if (shouldShowTaxInfo) {
            alert("Tax information is required. Please fill in your Company TIN (ՀՎՀՀ) first.");
            return;
        }

        const invoiceAmount = parseAmount(invoice.amount);
        const currentBalance = parseAmount(balance);

        if (invoiceAmount <= 0) {
            alert("Invalid invoice amount.");
            return;
        }

        if (currentBalance < invoiceAmount) {
            alert("Insufficient balance. Please top up your account.");
            return;
        }

        const nextBalance = currentBalance - invoiceAmount;
        setPayingInvoiceId(invoice.id);

        try {
            const { error: balanceError } = await supabase
                .from("profiles")
                .update({ balance: nextBalance })
                .eq("userid", currentUserId);

            if (balanceError) {
                console.log("Balance update error:", balanceError.message);
                alert("Failed to update balance. Please try again.");
                return;
            }

            const { error: invoiceError } = await supabase
                .from("invoices")
                .update({ status: "paid" })
                .eq("id", invoice.id);

            if (invoiceError) {
                // Best-effort rollback if invoice status update failed.
                await supabase
                    .from("profiles")
                    .update({ balance: currentBalance })
                    .eq("userid", currentUserId);

                console.log("Invoice status update error:", invoiceError.message);
                alert("Failed to mark invoice as paid. Please try again.");
                return;
            }

            // Update campaign status if campaign_id exists
            if (invoice.campaign_id) {
                const { error: campaignError } = await supabase
                    .from("campaigns")
                    .update({ status: "live" })
                    .eq("id", invoice.campaign_id);

                if (campaignError) {
                    console.log("Campaign status update error:", campaignError.message);
                    // Don't fail the payment, just log the error
                }
            }

            setBalance(nextBalance);
            setInvoices((prev) =>
                prev.map((item) =>
                    item.id === invoice.id ? { ...item, status: "paid" } : item
                )
            );
            setSelectedInvoice((prev) =>
                prev?.id === invoice.id ? { ...prev, status: "paid" } : prev
            );
        } finally {
            setPayingInvoiceId(null);
        }
    };

    const shouldShowTaxInfo = String(profileTax || "").trim().length === 0;

    // const getBaseInvoiceDate = () => {
    //     const pendingInvoice = invoices.find((invoice) => String(invoice.status || "").toLowerCase() === "pending");
    //     const sourceDate = pendingInvoice?.created_at || invoices[0]?.created_at;

    //     if (!sourceDate) return null;

    //     const parsedDate = new Date(sourceDate);
    //     if (Number.isNaN(parsedDate.getTime())) return null;
    //     return parsedDate;
    // };

    // const getDateFromInvoicePlusDays = (daysToAdd) => {
    //     const baseDate = getBaseInvoiceDate();
    //     if (!baseDate) return "-";

    //     const resultDate = new Date(baseDate);
    //     resultDate.setDate(resultDate.getDate() + daysToAdd);
    //     return resultDate.toLocaleDateString("en-US", {
    //         month: "long",
    //         day: "numeric",
    //         year: "numeric",
    //     });
    // };

    // const nextCampaignStartDate = getDateFromInvoicePlusDays(7);
    // const paymentDeadlineDate = getDateFromInvoicePlusDays(2);
    // const campaignLaunchDate = getDateFromInvoicePlusDays(7);
    // const pendingInvoicesCount = invoices.filter((invoice) => String(invoice.status || "").toLowerCase() === "pending").length;
    // const hasPendingInvoices = pendingInvoicesCount > 0;

    const getMethodDescription = () => {
        switch (currentBillingMethod) {
            case "card":
                return { title: "Card Payment", time: "Instantly", fee: "0%" };
            case "idram":
                return { title: "IDram Wallet", time: "Through wallet", fee: "0%" };
            case "bank":
                return { title: "Account Transfer", time: "1-2 days", fee: "0%" };
            default:
                return { title: "", time: "", fee: "0%" };
        }
    };

    const renderPaymentMethod = () => {
        const methodDesc = getMethodDescription();
        const amount = Number(topupAmount) || 0;
        const totalAmount = amount; // Commission is 0%, so total = amount
        const isValidAmount = amount >= 1000;
        const isButtonDisabled = !topupAmount || !isValidAmount || isProcessingTopup || isProcessingTopup;

        switch (currentBillingMethod) {
            case "card":
            case "idram":
            case "bank":
                return (
                    <div className="payment-form">
                        {/* Current method info */}
                        <div className="payment-method-info">
                            <div className="method-info-header">
                                <p className="method-label">Selected: {methodDesc.title}</p>
                                <p className="method-time">{methodDesc.time}</p>
                            </div>
                            <p className="method-fee">Commission: {methodDesc.fee}</p>
                        </div>

                        {/* Amount input */}
                        <div className="payment-amount-section">
                            <label className="payment-label">Amount to Top Up</label>
                            <div className="amount-input-wrapper">
                                <input
                                    value={topupAmount}
                                    onChange={handleTopupAmountChange}
                                    placeholder="Enter amount"
                                    className={`signup_form__form--input amount-input ${amountError ? "input-error" : ""}`}
                                    inputMode="numeric"
                                    maxLength={10}
                                    pattern="[0-9]*"
                                    disabled={isProcessingTopup}
                                />
                                <span className="currency-symbol">֏</span>
                            </div>
                            {amountError && <p className="error-message">{amountError}</p>}
                        </div>

                        {/* Quick amounts */}
                        {!isProcessingTopup && (
                            <div className="quick-amounts">
                                <p className="quick-label">Quick select:</p>
                                <div className="quick-buttons">
                                    {[10000, 25000, 50000, 100000].map((quickAmount) => (
                                        <button
                                            key={quickAmount}
                                            className={`quick-amount-btn ${topupAmount === String(quickAmount) ? "active" : ""}`}
                                            onClick={() => handleQuickAmount(quickAmount)}
                                            disabled={isProcessingTopup}
                                        >
                                            {quickAmount.toLocaleString("en-US")} ֏
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Total summary */}
                        <div className="payment-summary">
                            <div className="summary-row">
                                <span className="summary-label">Refill amount:</span>
                                <span className="summary-value">{formatAmount(amount)} ֏</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">Commission:</span>
                                <span className="summary-value">0%</span>
                            </div>
                            <div className="summary-row summary-total">
                                <span className="summary-label">Total to debit:</span>
                                <span className="summary-value-total">{formatAmount(totalAmount)} ֏</span>
                            </div>
                        </div>

                        {/* Pay button */}
                        <button
                            className="cta payment-button"
                            onClick={handleProcessTopup}
                            disabled={isButtonDisabled}
                        >
                            {isProcessingTopup ? "Processing..." : isValidAmount ? `Pay ${formatAmount(totalAmount)} ֏` : "Enter valid amount"}
                        </button>

                        {/* Security info */}
                        <div className="security-info">
                            <p className="security-text">🔒 Secure payment - PCI DSS compliant</p>
                        </div>

                        {/* Transaction history */}
                        {transactionHistory.length > 0 && (
                            <div className="transaction-history">
                                <p className="history-title">Last transactions:</p>
                                {transactionHistory.map((tx) => {
                                    const txDate = new Date(tx.timestamp);
                                    const txDateStr = txDate.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });
                                    return (
                                        <div key={tx.id} className="history-item">
                                            <span className="history-amount">+{formatAmount(tx.amount)} ֏</span>
                                            <span className="history-date">{txDateStr}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="settings">
            {loading && <Loader />}
            <div className="settings__header">
                <h1 className="title">Billing & Payments</h1>
                <p className="description">Direct invoice payment and transaction history.</p>
            </div>
            
            <div className="billing__main_content">
                <div style={{width: "100%"}}>
                    <div className="account__balance">
                        <div>
                            <p className="label">Account balance</p>
                            <h2 className="title">{formatAmount(balance)} ֏</h2>
                            <p className="description">Available balance for campaigns</p>
                        </div>
                        <button className="cta" onClick={() => setAddFunds(!addFunds)}>+ Add Funds</button>
                    </div>

                    {shouldShowTaxInfo && (
                        <div className="tax_info">
                            <div className="tax_info__info">
                                <div className="warn"><PiWarningOctagonBold fontSize={18} className="warn__icon"/></div>
                                <div>
                                    <p className="warn__title">Tax Information Required</p>
                                    <p className="description">Please confirm your Company TIN (ՀՎՀՀ) to generate your Tax Invoice.</p>
                                </div>
                            </div>
                            <div style={{display: "flex"}}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    pattern="[0-9]*"
                                    placeholder="Company TIN (ՀՎՀՀ)"
                                    className="signup_form__form--input"
                                    style={{margin: 0}}
                                    value={taxInput}
                                    onChange={handleTaxInputChange}
                                />
                                <button
                                    className="tax__button"
                                    disabled={!taxInput || isSavingTax}
                                    onClick={handleConfirmTax}
                                    type="button"
                                >
                                    {isSavingTax ? "Saving..." : "Confirm"}
                                </button>
                            </div>
                        </div>
                    )}

                    {
                        addFunds && (
                            <div className="addfounds">
                                <div className="addfounds__header">
                                    <h2 className="title" style={{fontSize: "1.8em"}}>Add Founds to Your Account</h2>
                                    <p className="description" style={{fontSize: "1.4em"}}>Top up your balance to run campaigns without interruptions.</p>
                                </div>
                                <div className="addfounds__methods">

                                    <div className={`addfounds__method ${currentBillingMethod === "card" ? "active" : ""}`} onClick={() => setCurrentBillingMethod("card")}>
                                        {currentBillingMethod === "card" && <div className="checkbox_activeMethode"><FaCheckCircle fontSize={20} color="#39ff19" /></div>}
                                        <div style={{width: 50}}><IoCard fontSize={50} /></div>
                                        <p className="addfounds__method--title">Card Payment</p>
                                        <p className="addfounds__method--description">Visa, MasterCard, ArCa</p>
                                        <div style={{display: "flex", gap: "1.5em", alignItems: "center"}}>
                                            <div className="visaIcon"><SiVisa fontSize={30} color="blue" /></div>
                                            <div className="masterIcon"></div>
                                            <div className="arcaIcon"></div>
                                        </div>
                                    </div>

                                    <div className={`addfounds__method ${currentBillingMethod === "idram" ? "active" : ""}`} onClick={() => setCurrentBillingMethod("idram")}>
                                        {currentBillingMethod === "idram" && <div className="checkbox_activeMethode"><FaCheckCircle fontSize={20} color="#39ff19" /></div>}
                                        <div className="idramIcon"></div>
                                        <p className="addfounds__method--title">IDram</p>
                                        <p className="addfounds__method--description">Instant payment</p>
                                        <p style={{color: "#fff", fontSize: "1.4em"}}>via Idram wallet</p>
                                    </div>

                                    <div className={`addfounds__method ${currentBillingMethod === "bank" ? "active" : ""}`} onClick={() => setCurrentBillingMethod("bank")}>
                                        {currentBillingMethod === "bank" && <div className="checkbox_activeMethode"><FaCheckCircle fontSize={20} color="#39ff19" /></div>}
                                        <div><RiBankFill fontSize={50} /></div>
                                        <p className="addfounds__method--title">Account Transfer</p>
                                        <p className="addfounds__method--description">From bank account</p>
                                        <p className="addfounds__method--description--label">24-48 hours</p>
                                    </div>

                                </div>
                                <div className="addfounds__details">
                                    {renderPaymentMethod()}
                                </div>
                            </div>
                        )
                    }
                </div>


                <div className="billing__sidebar">
                    <div className="billing__sidebar--notes">
                        <p className="title" style={{fontSize: "1.5em"}}>Why top up with wrapgo</p>
                        <p className="billing__sidebar--notes-p checkwithtext"><FaRegCheckCircle color="#39ff19"/> Instant campaign activation</p>
                        <p className="billing__sidebar--notes-p checkwithtext"><FaRegCheckCircle color="#39ff19"/> 100% secure payments</p>
                        <p className="billing__sidebar--notes-p checkwithtext"><FaRegCheckCircle color="#39ff19"/> Multiple payment methods</p>
                        <p className="billing__sidebar--notes-p checkwithtext"><FaRegCheckCircle color="#39ff19"/> 24/7 customer support</p>
                    </div>
                    <div className="billing__sidebar--contact">
                        <p className="title" style={{fontSize: "1.5em"}}>Need help?</p>
                        <p className="billing__sidebar--notes-p">Contact our support team for assistance with billing and payments.</p>
                        <button className="contact__button">Contact Support</button>
                    </div>
                </div>


            </div>

            {/* Invoice History */}
            <div className="invoice-history">
                <h2 className="invoice-history__title title">Invoice History</h2>
                <div className="invoice-history__table">
                    <div className="invoice-history__head">
                        <span>Invoice ID</span>
                        <span>Campaign Name</span>
                        <span>Amount</span>
                        <span>Invoice Date</span>
                        <span>Status</span>
                        <span>Action</span>
                    </div>
                    <div className="invoice-history__body">
                        {invoices.map((invoice) => {
                            const isPaid = String(invoice.status || "").toLowerCase() === "paid";
                            const isPayingCurrent = payingInvoiceId === invoice.id;

                            return (
                                <div
                                    className="invoice-history__row invoice-history__row--clickable"
                                    key={invoice.id || invoice.invoiceid}
                                    onClick={() => handleOpenInvoice(invoice)}
                                >
                                    <span className="invoice-history__row--id">{invoice.invoiceid || "-"}</span>
                                    <span>{invoice.campaignName}</span>
                                    <span>{formatAmount(invoice.amount)}</span>
                                    <span>{formatInvoiceDate(invoice.created_at)}</span>
                                    <span>
                                        <span className={`invoice-history__badge ${isPaid ? "invoice-history__badge--paid" : "invoice-history__badge--pending"}`}>
                                            {isPaid ? "Paid" : "Pending"}
                                        </span>
                                    </span>
                                    <span>
                                        {isPaid ? (
                                            <button className="invoice-history__action--tax">↓ Tax Invoice</button>
                                        ) : (
                                            <button
                                                className="invoice-history__action--paynow"
                                                onClick={(event) => handlePayNow(event, invoice)}
                                                disabled={isPayingCurrent || shouldShowTaxInfo}
                                            >
                                                {isPayingCurrent ? "Paying..." : "Pay Now"}
                                            </button>
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                        {invoices.length === 0 && (
                            <div className="invoice-history__row">
                                <span className="invoice-history__row--id">-</span>
                                <span>No invoices yet</span>
                                <span>-</span>
                                <span>-</span>
                                <span>-</span>
                                <span>-</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedInvoice && (
                <div className="invoice-drawer__overlay" onClick={handleCloseInvoice}>
                    <aside className="invoice-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="invoice-drawer__header">
                            <h3 className="title">Invoice Details</h3>
                            <button className="invoice-drawer__close" onClick={handleCloseInvoice} type="button">×</button>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">Invoice Number</p>
                            <p className="invoice-drawer__value">{selectedInvoice.invoiceid || "-"}</p>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">Amount</p>
                            <p className="invoice-drawer__amount title">{formatAmount(selectedInvoice.amount)}</p>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">Status</p>
                            <span
                                className={`invoice-history__badge ${String(selectedInvoice.status || "").toLowerCase() === "paid" ? "invoice-history__badge--paid" : "invoice-history__badge--pending"}`}
                            >
                                {String(selectedInvoice.status || "").toLowerCase() === "paid" ? "Paid" : "Pending"}
                            </span>
                        </div>

                        <div className="invoice-drawer__separator" />

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">Campaign Name</p>
                            <div className="invoice-drawer__box">{selectedInvoice.campaignName || "-"}</div>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">Duration</p>
                            <div className="invoice-drawer__box">{getInvoiceDescription(selectedInvoice)}</div>
                        </div>

                        <div className="invoice-drawer__footer">
                            <div>
                                <p className="invoice-drawer__label">Invoice Date</p>
                                <p className="invoice-drawer__value">{formatLongDate(selectedInvoice.created_at)}</p>
                            </div>
                            <div>
                                <p className="invoice-drawer__label">Due Date</p>
                                <p className="invoice-drawer__value">{getDueDate(selectedInvoice.created_at)}</p>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Topup Result Modal */}
            {topupResult && (
                <div className="topup-result-overlay" onClick={() => setTopupResult(null)}>
                    <div className="topup-result-modal" onClick={(e) => e.stopPropagation()}>
                        {topupResult.success ? (
                            <>
                                <div className="result-success">✔</div>
                                <h2 className="result-title">Balance Replenished</h2>
                                <p className="result-amount">+{formatAmount(topupResult.amount)} ֏</p>
                                <p className="result-label">New balance:</p>
                                <p className="result-new-balance">{formatAmount(balance)} ֏</p>
                                <button
                                    className="cta result-button"
                                    onClick={() => setTopupResult(null)}
                                >
                                    Continue
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="result-error">❌</div>
                                <h2 className="result-title">Payment Failed</h2>
                                <p className="result-error-message">Unable to process your payment. Please try again.</p>
                                <button
                                    className="cta result-button"
                                    onClick={() => setTopupResult(null)}
                                >
                                    Try Again
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;