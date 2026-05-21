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
import pageData from "../../data/data.json";

function Billing({setPage}) {
    const billingText = pageData.content.billing;
    const [loading, setLoading] = useState(true);
    const [currentBillingMethod, setCurrentBillingMethod] = useState("idram");
    const [invoices, setInvoices] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [profileTax, setProfileTax] = useState(null);
    const [taxInput, setTaxInput] = useState("");
    const [isSavingTax, setIsSavingTax] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [balance, setBalance] = useState(null);
    const [addFunds, setAddFunds] = useState(false);
    const [topupAmount, setTopupAmount] = useState("");
    const [payingInvoiceId, setPayingInvoiceId] = useState(null);
    const [amountError, setAmountError] = useState("");
    const [isProcessingTopup, setIsProcessingTopup] = useState(false);
    const [topupResult, setTopupResult] = useState(null); // { success: bool, amount: number }
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
    const [payError, setPayError] = useState("");

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
                    console.error("Profile fetch error:", profileError.message);
                } else {
                    const loadedTax = String(profileRow?.tax || "").trim();
                    setProfileTax(loadedTax);
                    setTaxInput(loadedTax);
                    setBalance(profileRow?.balance || 0);
                }

                const { data: invoiceRows, error: invoiceError } = await supabase
                    .from("invoices")
                    .select("id, invoiceid, campaign_id, amount, status, created_at")
                    .eq("owner_id", user.id)
                    .order("created_at", { ascending: false });

                if (invoiceError) {
                    console.error("Invoice fetch error:", invoiceError.message);
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
                        console.error("Campaign fetch error:", campaignError.message);
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
        if (status === "pending") return `${billingText.invoiceDrawer.scheduledPrefix} ${fromDate} - ${toDate}`;
        if (status === "live") return `${billingText.invoiceDrawer.livePrefix} ${fromDate} - ${toDate}`;
        return `${billingText.invoiceDrawer.periodPrefix} ${fromDate} - ${toDate}`;
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
                console.error("Tax update error:", error.message);
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
            setAmountError(billingText.addFunds.minAmount);
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

        // const TopupIdramFunction = async () => {
        //     // Placeholder for actual Idram integration logic
        //     return(
                
        //     );
        // }
        
        if (!topupAmount || amount < 1000) {
            setAmountError(billingText.addFunds.minAmount);
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
                console.error("Balance update error:", balanceError.message);
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
            console.error("Topup error:", error.message);
            setTopupResult({ success: false, amount: 0 });
        } finally {
            setIsProcessingTopup(false);
        }
    };

    const handlePayNow = async (event, invoice) => {
        event.stopPropagation();
        setPayError("");

        if (!invoice?.id || !currentUserId) {
            return;
        }

        if (shouldShowTaxInfo) {
            setPayError(billingText.alerts.taxRequired);
            return;
        }

        const invoiceAmount = parseAmount(invoice.amount);
        const currentBalance = parseAmount(balance);

        if (invoiceAmount <= 0) {
            setPayError(billingText.alerts.invalidInvoiceAmount);
            return;
        }

        if (currentBalance < invoiceAmount) {
            setPayError(billingText.alerts.insufficientBalance);
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
                console.error("Balance update error:", balanceError.message);
                setPayError(billingText.alerts.balanceUpdateFailed);
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

                console.error("Invoice status update error:", invoiceError.message);
                setPayError(billingText.alerts.invoicePaidFailed);
                return;
            }

            // Update campaign status if campaign_id exists
            if (invoice.campaign_id) {
                const { error: campaignError } = await supabase
                    .from("campaigns")
                    .update({ status: "in process" })
                    .eq("id", invoice.campaign_id);

                if (campaignError) {
                    console.error("Campaign status update error:", campaignError.message);
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

    const handleDownloadInvoice = async (event, invoice) => {
        event.stopPropagation();
        setDownloadingInvoiceId(invoice.id);
        try {
            // TODO: Replace "" with the real invoice PDF API endpoint when available
            // e.g. const response = await fetch(`https://api.yourprovider.com/invoices/${invoice.invoiceid}/pdf`, { ... });
            const INVOICE_API_URL = "";
            if (!INVOICE_API_URL) {
                // Placeholder: API not yet integrated — show inline message
                setPayError(`Invoice download not yet available. Invoice: ${invoice.invoiceid}`);
                return;
            }
            const response = await fetch(`${INVOICE_API_URL}/${invoice.invoiceid}`);
            if (!response.ok) throw new Error("Download failed");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `invoice-${invoice.invoiceid}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Invoice download error:", err.message);
        } finally {
            setDownloadingInvoiceId(null);
        }
    };

    const shouldShowTaxInfo = String(profileTax || "").trim().length === 0;

    const getMethodDescription = () => {
        switch (currentBillingMethod) {
            case "card":
                return { title: billingText.addFunds.methods.card.title, time: billingText.addFunds.methods.card.time, fee: "0%" };
            case "idram":
                return { title: billingText.addFunds.methods.idram.title, time: billingText.addFunds.methods.idram.time, fee: "0%" };
            case "bank":
                return { title: billingText.addFunds.methods.bank.title, time: billingText.addFunds.methods.bank.time, fee: "0%" };
            default:
                return { title: "", time: "", fee: "0%" };
        }
    };


    const renderPaymentMethod = () => {
        const methodDesc = getMethodDescription();
        const amount = Number(topupAmount) || 0;
        const totalAmount = amount; // Commission is 0%, so total = amount
        const isValidAmount = amount >= 1000;
        const isButtonDisabled = !topupAmount || !isValidAmount || isProcessingTopup;

        switch (currentBillingMethod) {
            case "card":
                 return (
                    <div className="payment-form">
                        {/* Current method info */}
                        <div className="payment-method-info">
                            <div className="method-info-header">
                                <p className="method-label">{billingText.addFunds.selectedPrefix} {methodDesc.title}</p>
                                <p className="method-time">{methodDesc.time}</p>
                            </div>
                            <p className="method-fee">{billingText.addFunds.commission} {methodDesc.fee}</p>
                        </div>

                        {/* Amount input */}
                        <div className="payment-amount-section">
                            <label className="payment-label">{billingText.addFunds.amountLabel}</label>
                            <div className="amount-input-wrapper">
                                <input
                                    value={topupAmount}
                                    onChange={handleTopupAmountChange}
                                    placeholder={billingText.addFunds.amountPlaceholder}
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
                                <p className="quick-label">{billingText.addFunds.quickSelect}</p>
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
                                <span className="summary-label">{billingText.addFunds.refillAmount}</span>
                                <span className="summary-value">{formatAmount(amount)} ֏</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">{billingText.addFunds.commission}</span>
                                <span className="summary-value">0%</span>
                            </div>
                            <div className="summary-row summary-total">
                                <span className="summary-label">{billingText.addFunds.totalDebit}</span>
                                <span className="summary-value-total">{formatAmount(totalAmount)} ֏</span>
                            </div>
                        </div>

                        {/* Pay button */}
                        <button
                            className="cta payment-button"
                            onClick={handleProcessTopup}
                            disabled={isButtonDisabled}
                        >
                            {isProcessingTopup ? billingText.addFunds.processing : isValidAmount ? `${billingText.addFunds.payPrefix} ${formatAmount(totalAmount)} ֏` : billingText.addFunds.enterValid}
                        </button>

                        {/* Security info */}
                        <div className="security-info">
                            <p className="security-text">{billingText.addFunds.securityText}</p>
                        </div>

                        {/* Transaction history */}
                        {transactionHistory.length > 0 && (
                            <div className="transaction-history">
                                <p className="history-title">{billingText.addFunds.transactionsTitle}</p>
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
            case "idram":
                return(
                    <div className="payment-amount-section">
                        <label className="payment-label">{billingText.addFunds.amountLabel}</label>
                        <div className="amount-input-wrapper">
                            <input
                                value={topupAmount}
                                onChange={handleTopupAmountChange}
                                placeholder={billingText.addFunds.amountPlaceholder}
                                className={`signup_form__form--input amount-input ${amountError ? "input-error" : ""}`}
                                inputMode="numeric"
                                maxLength={10}
                                pattern="[0-9]*"
                                disabled={isProcessingTopup}
                            />
                            <span className="currency-symbol">֏</span>
                        </div>
                        {amountError && <p className="error-message">{amountError}</p>}
                        <div>
                            <form action="https://banking.idram.am/Payment/GetPayment" method="POST">
                                <input type="hidden" name="EDP_LANGUAGE" value="EN"/>
                                <input type="hidden" name="EDP_REC_ACCOUNT" value={process.env.REACT_APP_IDRAM_REC_ACCOUNT}/>
                                <input type="hidden" name="EDP_DESCRIPTION" value={`WrapGo balance top-up for ${currentUserId}`}/>
                                <input type="hidden" name="EDP_AMOUNT" value={topupAmount || "0"}/>
                                <input type="hidden" name="EDP_BILL_NO" value={`${currentUserId}-${Date.now()}`}/>
                                <input
                                    type="submit"
                                    value={billingText.addFunds.payPrefix + " " + (topupAmount || "0") + " ֏"}
                                    className="cta payment-button"
                                    disabled={!topupAmount || Number(topupAmount) < 1000}
                                />
                            </form>
                        </div>
                    </div>
                );
            case "bank":
                return (
                    <div className="payment-form">
                        {/* Current method info */}
                        <div className="payment-method-info">
                            <div className="method-info-header">
                                <p className="method-label">{billingText.addFunds.selectedPrefix} {methodDesc.title}</p>
                                <p className="method-time">{methodDesc.time}</p>
                            </div>
                            <p className="method-fee">{billingText.addFunds.commission} {methodDesc.fee}</p>
                        </div>

                        {/* Amount input */}
                        <div className="payment-amount-section">
                            <label className="payment-label">{billingText.addFunds.amountLabel}</label>
                            <div className="amount-input-wrapper">
                                <input
                                    value={topupAmount}
                                    onChange={handleTopupAmountChange}
                                    placeholder={billingText.addFunds.amountPlaceholder}
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
                                <p className="quick-label">{billingText.addFunds.quickSelect}</p>
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
                                <span className="summary-label">{billingText.addFunds.refillAmount}</span>
                                <span className="summary-value">{formatAmount(amount)} ֏</span>
                            </div>
                            <div className="summary-row">
                                <span className="summary-label">{billingText.addFunds.commission}</span>
                                <span className="summary-value">0%</span>
                            </div>
                            <div className="summary-row summary-total">
                                <span className="summary-label">{billingText.addFunds.totalDebit}</span>
                                <span className="summary-value-total">{formatAmount(totalAmount)} ֏</span>
                            </div>
                        </div>

                        {/* Pay button */}
                        <button
                            className="cta payment-button"
                            onClick={handleProcessTopup}
                            disabled={isButtonDisabled}
                        >
                            {isProcessingTopup ? billingText.addFunds.processing : isValidAmount ? `${billingText.addFunds.payPrefix} ${formatAmount(totalAmount)} ֏` : billingText.addFunds.enterValid}
                        </button>

                        {/* Security info */}
                        <div className="security-info">
                            <p className="security-text">{billingText.addFunds.securityText}</p>
                        </div>

                        {/* Transaction history */}
                        {transactionHistory.length > 0 && (
                            <div className="transaction-history">
                                <p className="history-title">{billingText.addFunds.transactionsTitle}</p>
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
                <h1 className="title">{billingText.page.title}</h1>
                <p className="description">{billingText.page.description}</p>
            </div>
            
            <div className="billing__main_content">
                <div style={{width: "100%"}}>
                    <div className="account__balance">
                        <div>
                            <p className="label">{billingText.page.accountBalance}</p>
                            <h2 className="title">{formatAmount(balance)} ֏</h2>
                            <p className="description">{billingText.page.availableBalance}</p>
                        </div>
                        <button className="cta" onClick={() => setAddFunds(!addFunds)}>{billingText.page.addFunds}</button>
                    </div>

                    {shouldShowTaxInfo && (
                        <div className="tax_info">
                            <div className="tax_info__info">
                                <div className="warn"><PiWarningOctagonBold fontSize={18} className="warn__icon"/></div>
                                <div>
                                    <p className="warn__title">{billingText.tax.requiredTitle}</p>
                                    <p className="description">{billingText.tax.requiredDescription}</p>
                                </div>
                            </div>
                            <div style={{display: "flex"}}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={10}
                                    pattern="[0-9]*"
                                    placeholder={billingText.tax.placeholder}
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
                                    {isSavingTax ? billingText.tax.save : billingText.tax.confirm}
                                </button>
                            </div>
                        </div>
                    )}

                    {
                        addFunds && (
                            <div className="addfounds">
                                <div className="addfounds__header">
                                    <h2 className="title" style={{fontSize: "1.8em"}}>{billingText.addFunds.title}</h2>
                                    <p className="description" style={{fontSize: "1.4em"}}>{billingText.addFunds.description}</p>
                                </div>
                                <div className="addfounds__methods">
                                    {/* Card Payment Method */}
                                    <div className={`addfounds__method ${currentBillingMethod === "card" ? "active" : ""}`} onClick={() => setCurrentBillingMethod("card")}>
                                        {currentBillingMethod === "card" && <div className="checkbox_activeMethode"><FaCheckCircle fontSize={20} color="#39ff19" /></div>}
                                        <div style={{width: 50}}><IoCard fontSize={50} /></div>
                                        <p className="addfounds__method--title">{billingText.addFunds.methods.card.title}</p>
                                        <p className="addfounds__method--description">{billingText.addFunds.methods.card.description}</p>
                                        <div style={{display: "flex", gap: "1.5em", alignItems: "center"}}>
                                            <div className="visaIcon"><SiVisa fontSize={30} color="blue" /></div>
                                            <div className="masterIcon"></div>
                                            <div className="arcaIcon"></div>
                                        </div>
                                    </div>
                                    {/* Idram and IDbank */}
                                    <div className={`addfounds__method ${currentBillingMethod === "idram" ? "active" : ""}`} onClick={() => setCurrentBillingMethod("idram")}>
                                        {currentBillingMethod === "idram" && <div className="checkbox_activeMethode"><FaCheckCircle fontSize={20} color="#39ff19" /></div>}
                                        <div className="idramIcon"></div>
                                        <p className="addfounds__method--title">{billingText.addFunds.methods.idram.title}</p>
                                        <p className="addfounds__method--description">{billingText.addFunds.methods.idram.description}</p>
                                        <p style={{color: "#fff", fontSize: "1.4em"}}>{billingText.addFunds.methods.idram.extra}</p>
                                    </div>
                                    {/* Direct deposit */}
                                    <div className={`addfounds__method ${currentBillingMethod === "bank" ? "active" : ""}`} onClick={() => setCurrentBillingMethod("bank")}>
                                        {currentBillingMethod === "bank" && <div className="checkbox_activeMethode"><FaCheckCircle fontSize={20} color="#39ff19" /></div>}
                                        <div><RiBankFill fontSize={50} /></div>
                                        <p className="addfounds__method--title">{billingText.addFunds.methods.bank.title}</p>
                                        <p className="addfounds__method--description">{billingText.addFunds.methods.bank.description}</p>
                                        <p className="addfounds__method--description--label">{billingText.addFunds.methods.bank.eta}</p>
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
                        <p className="title" style={{fontSize: "1.5em"}}>{billingText.sidebar.benefitsTitle}</p>
                        {billingText.sidebar.benefits.map((benefit) => (
                            <p key={benefit} className="billing__sidebar--notes-p checkwithtext"><FaRegCheckCircle color="#39ff19"/> {benefit}</p>
                        ))}
                    </div>
                    <div className="billing__sidebar--contact">
                        <p className="title" style={{fontSize: "1.5em"}}>{billingText.sidebar.helpTitle}</p>
                        <p className="billing__sidebar--notes-p">{billingText.sidebar.helpDescription}</p>
                        <button className="contact__button" onClick={() => setPage("contacts")}>{billingText.sidebar.contactSupport}</button>
                    </div>
                </div>


            </div>

            {payError && (
                <p className="signup_form__error" style={{marginBottom: "1em"}}>{payError}</p>
            )}
            {/* Invoice History */}
            <div className="invoice-history">
                <h2 className="invoice-history__title title">{billingText.invoiceHistory.title}</h2>
                <div className="invoice-history__table">
                    <div className="invoice-history__head">
                        {billingText.invoiceHistory.columns.map((column) => (
                            <span key={column}>{column}</span>
                        ))}
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
                                            {isPaid ? billingText.invoiceHistory.statusPaid : billingText.invoiceHistory.statusPending}
                                        </span>
                                    </span>
                                    <span>
                                        {isPaid ? (
                                            <button
                                                className="invoice-history__action--tax"
                                                onClick={(event) => handleDownloadInvoice(event, invoice)}
                                                disabled={downloadingInvoiceId === invoice.id}
                                            >
                                                {downloadingInvoiceId === invoice.id ? "Downloading..." : billingText.invoiceHistory.taxInvoice}
                                            </button>
                                        ) : (
                                            <button
                                                className="invoice-history__action--paynow"
                                                onClick={(event) => handlePayNow(event, invoice)}
                                                disabled={isPayingCurrent || shouldShowTaxInfo}
                                            >
                                                {isPayingCurrent ? billingText.invoiceHistory.paying : billingText.invoiceHistory.payNow}
                                            </button>
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                        {invoices.length === 0 && (
                            <div className="invoice-history__row">
                                <span className="invoice-history__row--id">-</span>
                                <span style={{textTransform: "capitalize"}}>{billingText.invoiceHistory.empty}</span>
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
                            <h3 className="title">{billingText.invoiceDrawer.title}</h3>
                            <button className="invoice-drawer__close" onClick={handleCloseInvoice} type="button">×</button>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">{billingText.invoiceDrawer.invoiceNumber}</p>
                            <p className="invoice-drawer__value">{selectedInvoice.invoiceid || "-"}</p>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">{billingText.invoiceDrawer.amount}</p>
                            <p className="invoice-drawer__amount title">{formatAmount(selectedInvoice.amount)}</p>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">{billingText.invoiceDrawer.status}</p>
                            <span
                                className={`invoice-history__badge ${String(selectedInvoice.status || "").toLowerCase() === "paid" ? "invoice-history__badge--paid" : "invoice-history__badge--pending"}`}
                            >
                                {String(selectedInvoice.status || "").toLowerCase() === "paid" ? billingText.invoiceHistory.statusPaid : billingText.invoiceHistory.statusPending}
                            </span>
                        </div>

                        <div className="invoice-drawer__separator" />

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">{billingText.invoiceDrawer.campaignName}</p>
                            <div className="invoice-drawer__box">{selectedInvoice.campaignName || "-"}</div>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">{billingText.invoiceDrawer.duration}</p>
                            <div className="invoice-drawer__box">{getInvoiceDescription(selectedInvoice)}</div>
                        </div>

                        <div className="invoice-drawer__footer">
                            <div>
                                <p className="invoice-drawer__label">{billingText.invoiceDrawer.invoiceDate}</p>
                                <p className="invoice-drawer__value">{formatLongDate(selectedInvoice.created_at)}</p>
                            </div>
                            <div>
                                <p className="invoice-drawer__label">{billingText.invoiceDrawer.dueDate}</p>
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
                                <h2 className="result-title">{billingText.topupModal.successTitle}</h2>
                                <p className="result-amount">+{formatAmount(topupResult.amount)} ֏</p>
                                <p className="result-label">{billingText.topupModal.newBalanceLabel}</p>
                                <p className="result-new-balance">{formatAmount(balance)} ֏</p>
                                <button
                                    className="cta result-button"
                                    onClick={() => setTopupResult(null)}
                                >
                                    {billingText.topupModal.continue}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="result-error">❌</div>
                                <h2 className="result-title">{billingText.topupModal.failedTitle}</h2>
                                <p className="result-error-message">{billingText.topupModal.failedMessage}</p>
                                <button
                                    className="cta result-button"
                                    onClick={() => setTopupResult(null)}
                                >
                                    {billingText.topupModal.tryAgain}
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