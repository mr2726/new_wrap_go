import "../../App.css";
import { useEffect, useState } from "react";
import Loader from "../../Components/Loader";
import { LuClock } from "react-icons/lu";
import { PiWarningOctagonBold } from "react-icons/pi";
import { IoMdCard } from "react-icons/io";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { MdCorporateFare } from "react-icons/md";
import { BsShieldCheck } from "react-icons/bs";
import { supabase } from "../../data/supabase";

function Billing() {
    const [loading, setLoading] = useState(true);
    const [currentBillingMethod, setCurrentBillingMethod] = useState("card");
    const [invoices, setInvoices] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [profileTax, setProfileTax] = useState(null);
    const [taxInput, setTaxInput] = useState("");
    const [pendingCampaignAmount, setPendingCampaignAmount] = useState(0);
    const [isSavingTax, setIsSavingTax] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

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
                    .select("tax")
                    .eq("userid", user.id)
                    .single();

                if (profileError) {
                    console.log("Profile fetch error:", profileError.message);
                } else {
                    const loadedTax = profileRow?.tax || "";
                    setProfileTax(loadedTax);
                    setTaxInput(loadedTax);
                }

                const { data: pendingCampaigns, error: pendingCampaignsError } = await supabase
                    .from("campaigns")
                    .select("budget")
                    .eq("ownerid", user.id)
                    .eq("status", "pending");

                if (pendingCampaignsError) {
                    console.log("Pending campaigns fetch error:", pendingCampaignsError.message);
                    setPendingCampaignAmount(0);
                } else {
                    const totalPendingAmount = (pendingCampaigns || []).reduce((sum, campaign) => {
                        const rawBudget = campaign?.budget;
                        if (rawBudget === null || rawBudget === undefined || rawBudget === "") {
                            return sum;
                        }

                        const numericBudget = Number(
                            typeof rawBudget === "number"
                                ? rawBudget
                                : String(rawBudget).replace(/[^0-9.-]/g, "")
                        );

                        return Number.isNaN(numericBudget) ? sum : sum + numericBudget;
                    }, 0);

                    setPendingCampaignAmount(totalPendingAmount);
                }

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
                        .select("id, name")
                        .in("id", campaignIds);

                    if (campaignError) {
                        console.log("Campaign fetch error:", campaignError.message);
                    } else {
                        campaignMap = (campaignRows || []).reduce((acc, campaign) => {
                            acc[campaign.id] = campaign.name;
                            return acc;
                        }, {});
                    }
                }

                const normalizedInvoices = (invoiceRows || []).map((row) => ({
                    ...row,
                    campaignName: campaignMap[row.campaign_id] || "-",
                }));

                setInvoices(normalizedInvoices);
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, []);

    const formattedPendingCampaignAmount = pendingCampaignAmount.toLocaleString("en-US");


    function renderBillingMethodDetails() {
        switch (currentBillingMethod) {
            case "card":
                return (
                    <div className="billing_method__details">
                        <div className="billing__wrapper">
                            <div className="billing_method__details--content">
                                <h2 className="title">Pay securely via vPOS</h2>
                                <p className="description">Your campaign activates the moment payment is verified.</p>
                                <div className="sesurity">
                                    <BsShieldCheck fontSize={18} className="highlight" style={{marginRight: 10}}/>
                                    <p>Powered by Ameriabank</p>
                                </div>
                            </div>
                            <button className="tax__button">Pay Now {formattedPendingCampaignAmount} ֏</button>
                        </div>
                    </div>
                );
            case "idram":
                return (
                    <div className="billing_method__details">
                        <div className="qr_wrapper">
                            <div className="QR">
                                <img src={require("../../assets/qr-code.png")} alt="IDram QR Code" className="QR__code" width={150}/>
                            </div>
                            <div className="billing_method__details--content">
                                <h2 className="title">Direct-to-Bank QR Code</h2>
                                <p className="description">Open your favorite Armenian banking app (Ameria, ACBA, Ineco, IDram, or Telcell) and scan this QR code to complete the payment.</p>
                            </div>
                        </div>
                    </div>
                );
            case "corporate":
                return (
                    <div className="billing_method__details">
                        <h2 className="title">Comming Soon</h2>
                        {/* <p>Transfer the amount to our corporate bank account using IBAN or SWIFT.</p>
                        <p>After making the transfer, please upload your payment receipt for approval.</p> */}
                    </div>
                );
            default:
                return null;
        }
    }

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
        return `${numericAmount.toLocaleString("en-US")} ֏`;
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

    const getInvoiceDescription = (dateValue) => {
        if (!dateValue) return "-";
        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return "-";
        const monthYear = parsedDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        });
        return `${monthYear} - Active Campaigns`;
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

    const shouldShowTaxInfo = !profileTax;

    const getBaseInvoiceDate = () => {
        const pendingInvoice = invoices.find((invoice) => String(invoice.status || "").toLowerCase() === "pending");
        const sourceDate = pendingInvoice?.created_at || invoices[0]?.created_at;

        if (!sourceDate) return null;

        const parsedDate = new Date(sourceDate);
        if (Number.isNaN(parsedDate.getTime())) return null;
        return parsedDate;
    };

    const getDateFromInvoicePlusDays = (daysToAdd) => {
        const baseDate = getBaseInvoiceDate();
        if (!baseDate) return "-";

        const resultDate = new Date(baseDate);
        resultDate.setDate(resultDate.getDate() + daysToAdd);
        return resultDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const nextCampaignStartDate = getDateFromInvoicePlusDays(7);
    const paymentDeadlineDate = getDateFromInvoicePlusDays(7);
    const campaignLaunchDate = getDateFromInvoicePlusDays(14);



    return (
        <div className="settings">
            {loading && <Loader />}
            <div className="settings__header">
                <h1 className="title">Billing & Payments</h1>
                <p className="description">Direct invoice payment and transaction history.</p>
            </div>

            <div className="current__campaign__billing">
                <div>
                    <div className="next-title">
                        <LuClock fontSize={18} className="highlight"/>
                        <p className="highlight">Next Campaign Start Date</p>
                    </div>
                    <h2 className="title date">{nextCampaignStartDate}</h2>
                    <div className="billing__notes">
                        <LuClock fontSize={15} className="highlight"/>
                        <p className="description">Complete payment by {paymentDeadlineDate} to Start your Campaign on {campaignLaunchDate}.</p>
                    </div>
                </div>

                <div className="billing__require">
                    <p>Amount Due</p>
                    <p className="title billing__rate">{formattedPendingCampaignAmount} <span>֏</span></p>
                    <p>INV-2026-001</p>
                </div>
            </div>
            {/* Shows only when profiles.tax is empty */}
            {shouldShowTaxInfo && (
                <div className="tax_info">
                    <div className="tax_info__info">
                        <div className="warn"><PiWarningOctagonBold fontSize={18} className="warn__icon"/></div>
                        <div>
                            <p className="warn__title">Tax Information Required</p>
                            <p className="description">Please confirm your Company TIN (ՀՎՀՀ) to generate your Tax Invoice.</p>
                        </div>
                    </div>
                    <div>
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

            <div className="billing_method">
                <div className={`billing_method__block ${currentBillingMethod === "card" ? "billing_method__block--active" : ""}`} onClick={() => setCurrentBillingMethod("card")}>
                    <IoMdCard fontSize={38} className="highlight"/>
                    <h3 className="title" style={{fontSize: 18}}>Credit/Debit Card</h3>
                    <p className="description" style={{fontSize: 12}}>Visa, MasterCard, ArCa</p>
                    <h4 className="highlight" style={{fontSize: 15}}>Activate Instantly</h4>
                </div>

                <div className={`billing_method__block ${currentBillingMethod === "idram" ? "billing_method__block--active" : ""}`} onClick={() => setCurrentBillingMethod("idram")}>
                    <IoPhonePortraitOutline fontSize={38} className="highlight"/>
                    <h3 className="title" style={{fontSize: 18}}>IDram</h3>
                    <p className="description" style={{fontSize: 12}}>Scan with IDram</p>
                    <h4 className="highlight" style={{fontSize: 15}}>Pay via Mobile App</h4>
                </div>

                <div className={`billing_method__block ${currentBillingMethod === "corporate" ? "billing_method__block--active" : ""}`} onClick={() => setCurrentBillingMethod("corporate")}>
                    <MdCorporateFare fontSize={38} className="highlight"/>
                    <h3 className="title" style={{fontSize: 18}}>Corporate Bank Transfer</h3>
                    <p className="description" style={{fontSize: 12}}>Account Number</p>
                    <h4 className="highlight" style={{fontSize: 15}}>Upload Receipt for Approval</h4>
                </div>
            </div>

            {renderBillingMethodDetails()}

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
                                            <button className="invoice-history__action--paynow">Pay Now</button>
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
                            <p className="invoice-drawer__label">Campaigns Included</p>
                            <div className="invoice-drawer__box">{selectedInvoice.campaignName || "-"}</div>
                        </div>

                        <div className="invoice-drawer__section">
                            <p className="invoice-drawer__label">Description</p>
                            <div className="invoice-drawer__box">{getInvoiceDescription(selectedInvoice.created_at)}</div>
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
        </div>
    );
}

export default Billing;