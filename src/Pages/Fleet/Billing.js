import "../../App.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowUp, FiCreditCard, FiDownload, FiPlus, FiTrash2 } from "react-icons/fi";
import { HiOutlineBuildingLibrary, HiOutlineWallet } from "react-icons/hi2";
import { RiBankCardLine } from "react-icons/ri";
import {
  getUser,
  getFleet,
  getTransfers,
  getBankData,
  deleteBankData,
  insertBankData,
  updateFleet,
  insertTransfer,
} from "../../data/service";
import pageData from "../../data/data.json";

import TopMenu from "../../Components/TopMenu";

function Billing({ setFleetPage }) {
    const billingText = pageData.fleet.billing;
    const [withdrawAmount, setWithdrawAmount] = useState("10000");
    const [selectedMethodId, setSelectedMethodId] = useState("");
    const [fleetData, setFleetData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [bankData, setBankData] = useState([]);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawSuccess, setWithdrawSuccess] = useState(null);
    const [withdrawError, setWithdrawError] = useState("");
    const [cardForm, setCardForm] = useState({
        cardNumber: "",
        expires: "",
        cvv: "",
        fullName: "",
    });

    const pendingWithdrawals = transactions
        .filter((t) => t.status === "in process")
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
    const totalWithdrawn = transactions
        .filter((t) => t.status === "Completed")
        .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);
    const withdrawFeeRate = 0;
    const itemsPerPage = 5;
    const cardMetaStorageKey = "fleet_billing_card_meta_v1";

    const getCardMetaFromStorage = useCallback(() => {
        try {
            const raw = localStorage.getItem(cardMetaStorageKey);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === "object" ? parsed : {};
        } catch {
            return {};
        }
    }, [cardMetaStorageKey]);

    const setCardMetaToStorage = useCallback((meta) => {
        localStorage.setItem(cardMetaStorageKey, JSON.stringify(meta));
    }, [cardMetaStorageKey]);

    const applyDefaultByCardId = useCallback((rows, defaultCardId) => {
        const meta = getCardMetaFromStorage();
        rows.forEach((row) => {
            meta[row.cardid] = {
                ...(meta[row.cardid] || {}),
                isDefault: row.cardid === defaultCardId,
            };
        });
        setCardMetaToStorage(meta);

        return rows.map((row) => ({
            ...row,
            isDefault: row.cardid === defaultCardId,
        }));
    }, [getCardMetaFromStorage, setCardMetaToStorage]);

    const getCardIcon = (type) => {
        const normalizedType = String(type || "").toLowerCase();
        if (normalizedType.includes("visa")) return <RiBankCardLine size={20} />;
        if (normalizedType.includes("bank")) return <HiOutlineBuildingLibrary size={20} />;
        return <FiCreditCard size={20} />;
    };

    const detectCardType = (cardNumber) => {
        const normalized = String(cardNumber || "").replace(/\D/g, "");
        if (normalized.startsWith("4")) return "Visa";
        if (/^(5[1-5]|2[2-7])/.test(normalized)) return "Mastercard";
        return "Card";
    };

    const formatCardNumberInput = (rawValue) => {
        const digits = String(rawValue || "").replace(/\D/g, "").slice(0, 16);
        return digits.replace(/(.{4})/g, "$1 ").trim();
    };

    useEffect(() => {
        
        // Simulate fetching fleet data
        const fetchFleetData = async () => {
            const { data: { user } } = await getUser();
            if (!user) return;
            const { data, error } = await getFleet(user.id);
            if (error) {
                console.error("Error fetching fleet data:", error);
            } else {
                setFleetData(data);
            }
        }

        const fetchTransactions = async () => {
            const { data: { user } } = await getUser();
            if (!user) return;
            const {data: transactions, error} = await getTransfers(user.id);
            if (error) {
                console.error("Error fetching transactions:", error);
            }
            else {
                setTransactions(transactions);
            }
        }

        const fetchBankData = async () => {
            const { data: { user } } = await getUser();
            if (!user) return;
            const { data, error } = await getBankData(user.id);
            if (error) {
                console.error("Error fetching bank data:", error);
            }
            else {
                const meta = getCardMetaFromStorage();
                let rows = (data || []).map((row) => ({
                    ...row,
                    tail: row.tail || String(row.card_number || "").replace(/\D/g, "").slice(-4),
                    owner: row.owner || row.full_name || "",
                    isDefault: Boolean(meta[row.cardid]?.isDefault),
                }));

                if (rows.length > 0 && !rows.some((row) => row.isDefault)) {
                    rows = applyDefaultByCardId(rows, rows[0].cardid);
                }

                setBankData(rows);
                setSelectedMethodId((prev) => {
                    if (!rows.length) return "";
                    if (rows.some((row) => row.cardid === prev)) return prev;
                    const defaultCard = rows.find((row) => row.isDefault);
                    return (defaultCard || rows[0]).cardid;
                });
            }
        };

        fetchFleetData();
        fetchTransactions();
        fetchBankData();
    }, [applyDefaultByCardId, getCardMetaFromStorage]);

    const transactionsData = transactions;

    const selectedMethod = bankData.find((method) => method.cardid === selectedMethodId) || bankData[0] || null;

    const handleSetDefaultCard = (cardid) => {
        const updatedRows = applyDefaultByCardId(bankData, cardid);
        setBankData(updatedRows);
        setSelectedMethodId(cardid);
    };

    const handleRemoveCard = async (card) => {
        const { data: { user } } = await getUser();
        if (!user) return;

        const { error } = await deleteBankData(card.id, user.id);

        if (error) {
            console.error("Error removing card:", error);
            return;
        }

        const nextRowsRaw = bankData.filter((row) => row.id !== card.id);
        if (!nextRowsRaw.length) {
            setBankData([]);
            setSelectedMethodId("");
            return;
        }

        const currentlyDefaultExists = nextRowsRaw.some((row) => row.isDefault);
        const nextRows = currentlyDefaultExists
            ? nextRowsRaw
            : applyDefaultByCardId(nextRowsRaw, nextRowsRaw[0].cardid);

        setBankData(nextRows);
        setSelectedMethodId((prev) => {
            if (nextRows.some((row) => row.cardid === prev)) return prev;
            const defaultCard = nextRows.find((row) => row.isDefault);
            return (defaultCard || nextRows[0]).cardid;
        });
    };

    const handleAddCard = async (event) => {
        event.preventDefault();

        const sanitizedNumber = String(cardForm.cardNumber || "").replace(/\D/g, "");
        const tailDigits = sanitizedNumber.slice(-4);
        const sanitizedCvv = String(cardForm.cvv || "").replace(/\D/g, "");
        const ownerName = String(cardForm.fullName || "").trim();

        if (sanitizedNumber.length < 13 || sanitizedNumber.length > 19) {
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardForm.expires)) {
            return;
        }

        if (sanitizedCvv.length < 3 || sanitizedCvv.length > 4) {
            return;
        }

        if (!ownerName) {
            return;
        }

        setIsAddingCard(true);

        try {
            const { data: { user } } = await getUser();
            if (!user) return;

            const cardType = detectCardType(sanitizedNumber);
            const baseCardId = `${cardType.toLowerCase()}-${tailDigits}`;
            const hasCollision = bankData.some((item) => item.cardid === baseCardId);
            const cardid = hasCollision ? `${baseCardId}-${Date.now()}` : baseCardId;

            const insertPayload = {
                type: cardType,
                tail: tailDigits,
                expires: cardForm.expires,
                owner: ownerName,
                full_name: ownerName,
                card_number: sanitizedNumber,
                cvv: sanitizedCvv,
                cardid,
                owner_id: user.id,
            };

            const { data, error } = await insertBankData(insertPayload);

            if (error) {
                console.error("Error adding card:", error);
                return;
            }

            const appended = [...bankData, { ...data, isDefault: false }];
            const nextRows = appended.some((row) => row.isDefault)
                ? appended
                : applyDefaultByCardId(appended, data.cardid);

            setBankData(nextRows);
            setSelectedMethodId(data.cardid);
            setShowAddCardModal(false);
            setCardForm({ cardNumber: "", expires: "", cvv: "", fullName: "" });
        } finally {
            setIsAddingCard(false);
        }
    };

    const handleWithdraw = async () => {
        setWithdrawError("");
        const { data: { user } } = await getUser();
        if (!user) return;

        if (!selectedMethod) {
            setWithdrawError(billingText.alerts.addSelectCard);
            return;
        }

        const currentBalance = Number(fleetData?.balance || 0);
        const amountToWithdraw = Math.min(Math.max(parsedWithdrawAmount || 0, 0), currentBalance);

        if (amountToWithdraw < 100) {
            setWithdrawError(billingText.alerts.minWithdrawal);
            return;
        }

        setIsWithdrawing(true);

        try {
            const newBalance = currentBalance - amountToWithdraw;

            const { error: balanceError } = await updateFleet(user.id, { balance: newBalance });

            if (balanceError) {
                console.error("Error updating balance:", balanceError);
                setWithdrawError(billingText.alerts.balanceUpdateFailed);
                return;
            }

            const withdrawId = `WD-${Date.now()}`;
            const transferPayload = {
                owner_id: user.id,
                withdraw_id: withdrawId,
                type: "Withdrawal",
                method: `${selectedMethod.type} •••• ${selectedMethod.tail}`,
                description: `Balance withdrawal to ${selectedMethod.type} •••• ${selectedMethod.tail}`,
                amount: -amountToWithdraw,
                status: "in process",
            };

            const { data: insertedTransfer, error: transferError } = await insertTransfer(transferPayload);

            if (transferError) {
                console.error("Error creating transfer:", transferError);
                // Rollback: restore the original balance
                await updateFleet(user.id, { balance: currentBalance });
                setWithdrawError(billingText.alerts.transferNotSaved);
                return;
            }

            setFleetData((prev) => ({
                ...(prev || {}),
                balance: newBalance,
            }));
            setTransactions((prev) => [insertedTransfer, ...(prev || [])]);
            setWithdrawAmount("10000");
            setWithdrawSuccess({ amount: amountToWithdraw, withdrawId });
        } finally {
            setIsWithdrawing(false);
        }
    };

    const totalTransactions = transactionsData.length;
    const totalPages = Math.max(1, Math.ceil(totalTransactions / itemsPerPage));

    const paginatedTransactions = useMemo(() => {
        const sortedTransactions = [...transactionsData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Сортировка по убыванию даты
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [transactionsData, currentPage]);

    const currentRangeStart = totalTransactions === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1;
    const currentRangeEnd = Math.min(currentPage * itemsPerPage, totalTransactions);

    useEffect(() => {
        setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
    }, [totalPages]);

    const parsedWithdrawAmount = Number(withdrawAmount) || 0;

    const netReceive = useMemo(() => {
        const maxAmount = Math.min(parsedWithdrawAmount, fleetData ? fleetData.balance : 0);
        return Math.max(0, maxAmount - (maxAmount * withdrawFeeRate));
    }, [parsedWithdrawAmount, fleetData]);

    const formatMoney = (value) =>
        "֏" + new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);

    const renderAmount = (amount) => {
        const isPositive = amount >= 0;
        const prettyAmount = "֏" + new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Math.abs(amount));

        return (
            <span className={isPositive ? "fleet-billing__amount-positive" : "fleet-billing__amount-negative"}>
                {isPositive ? `+${prettyAmount}` : `-${prettyAmount}`}
            </span>
        );
    };

    return (
        <div className="fleet-billing">
            <TopMenu sendto="dashboard" setFleetPage={setFleetPage} currentPage="billing" />
            <div className="dashboard__content fleet-billing__content">
                <div className="fleet-billing__header">
                    <div>
                        <h1 className="title">{billingText.title}</h1>
                        <p className="description">{billingText.description}</p>
                    </div>
                </div>

                <div className="fleet-billing__stats-grid">
                    <article className="fleet-billing__stat-card">
                        <div className="fleet-billing__stat-icon fleet-billing__stat-icon--green">
                            <HiOutlineWallet size={20} />
                        </div>
                        <div>
                            <p className="fleet-billing__stat-label">{billingText.stats.currentBalance}</p>
                            <h3 className="fleet-billing__stat-value">{formatMoney(fleetData ? fleetData.balance : 0)} <span>AMD</span></h3>
                            <p className="fleet-billing__stat-meta">{billingText.stats.availableWithdrawal}</p>
                        </div>
                    </article>

                    <article className="fleet-billing__stat-card">
                        <div className="fleet-billing__stat-icon fleet-billing__stat-icon--purple">
                            <FiArrowUp size={18} />
                        </div>
                        <div>
                            <p className="fleet-billing__stat-label">{billingText.stats.pendingWithdrawals}</p>
                            <h3 className="fleet-billing__stat-value">{formatMoney(pendingWithdrawals)} <span>AMD</span></h3>
                            <p className="fleet-billing__stat-meta">{billingText.stats.processing}</p>
                        </div>
                    </article>

                    <article className="fleet-billing__stat-card">
                        <div className="fleet-billing__stat-icon fleet-billing__stat-icon--blue">
                            <FiDownload size={18} />
                        </div>
                        <div>
                            <p className="fleet-billing__stat-label">{billingText.stats.totalWithdrawn}</p>
                            <h3 className="fleet-billing__stat-value">{formatMoney(totalWithdrawn)} <span>AMD</span></h3>
                            <p className="fleet-billing__stat-meta">{billingText.stats.allTime}</p>
                        </div>
                    </article>
                </div>

                <section className="fleet-billing__main-grid">
                    <article className="fleet-billing__panel fleet-billing__panel--withdraw">
                        <h2 className="fleet-billing__panel-title">{billingText.withdraw.title}</h2>
                        <p className="fleet-billing__panel-subtitle">{billingText.withdraw.subtitle}</p>

                        <div className="fleet-billing__field-row">
                            <span>{billingText.withdraw.availableBalance}</span>
                            <strong>{formatMoney(fleetData ? fleetData.balance : 0)} AMD</strong>
                        </div>

                        <label className="fleet-billing__label" htmlFor="withdrawAmount">{billingText.withdraw.amountLabel}</label>
                        <div className="fleet-billing__input-wrap">
                            <span>֏</span>
                            <input
                                id="withdrawAmount"
                                type="number"
                                min="100"
                                max={fleetData ? fleetData.balance : 0}
                                value={withdrawAmount}
                                onChange={(event) => setWithdrawAmount(event.target.value)}
                            />
                            <small>AMD</small>
                        </div>
                        <p className="fleet-billing__hint">{billingText.withdraw.minMaxPrefix} <b>•</b> Max: {formatMoney(fleetData ? fleetData.balance : 0)}</p>

                        <label className="fleet-billing__label" htmlFor="paymentMethod">{billingText.withdraw.paymentMethod}</label>
                        <div className="fleet-billing__method-picker">
                            <select
                                id="paymentMethod"
                                value={selectedMethodId}
                                onChange={(event) => setSelectedMethodId(event.target.value)}
                                disabled={!bankData.length}
                            >
                                {!bankData.length && <option value="">{billingText.withdraw.noCards}</option>}
                                {bankData.map((method) => (
                                    <option key={method.cardid} value={method.cardid}>
                                        {method.type} •••• {method.tail}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="fleet-billing__hint">
                            {selectedMethod
                                ? `${billingText.withdraw.selectedPrefix} ${selectedMethod.type} •••• ${selectedMethod.tail}`
                                : billingText.withdraw.addCardHint}
                        </p>

                        <div className="fleet-billing__receive-row">
                            <span>{billingText.withdraw.youReceive}</span>
                            <strong>{formatMoney(netReceive)} AMD</strong>
                        </div>

                        {withdrawError && <p className="signup_form__error" style={{marginBottom: "0.5em"}}>{withdrawError}</p>}
                        <button type="button" className="fleet-billing__withdraw-btn" onClick={handleWithdraw} disabled={isWithdrawing || !selectedMethod}>
                            {isWithdrawing ? billingText.withdraw.loading : `${billingText.withdraw.withdrawPrefix} ${formatMoney(Math.min(parsedWithdrawAmount || 0, fleetData ? fleetData.balance : 0))}`}
                        </button>
                    </article>

                    <article className="fleet-billing__panel fleet-billing__panel--methods">
                        <div className="fleet-billing__panel-header-row">
                            <div>
                                <h2 className="fleet-billing__panel-title">{billingText.methods.title}</h2>
                                <p className="fleet-billing__panel-subtitle">{billingText.methods.subtitle}</p>
                            </div>
                            <button type="button" className="fleet-billing__new-btn" onClick={() => setShowAddCardModal(true)}>
                                <FiPlus size={14} /> {billingText.methods.addNew}
                            </button>
                        </div>

                        {!bankData.length ? (
                            <div className="fleet-billing__empty-cards">
                                <p>{billingText.methods.empty}</p>
                                <button type="button" className="fleet-billing__new-btn" onClick={() => setShowAddCardModal(true)}>
                                    <FiPlus size={14} /> {billingText.methods.addFirst}
                                </button>
                            </div>
                        ) : (
                            <div className="fleet-billing__methods-list">
                                {bankData.map((method) => (
                                    <div className="fleet-billing__method-row" key={method.id}>
                                        <div className="fleet-billing__method-details">
                                            <div className="fleet-billing__method-icon">{getCardIcon(method.type)}</div>
                                            <div>
                                                <p className="fleet-billing__method-title">
                                                    {method.type} •••• {method.tail}
                                                    {method.isDefault && <span>{billingText.methods.default}</span>}
                                                </p>
                                                <p className="fleet-billing__method-meta">{billingText.methods.expires} {method.expires}</p>
                                                <p className="fleet-billing__method-meta">{method.owner}</p>
                                                <p className="fleet-billing__method-meta">{billingText.methods.cardId} {method.cardid}</p>
                                            </div>
                                        </div>
                                        <div className="fleet-billing__method-actions">
                                            {!method.isDefault && (
                                                <button type="button" onClick={() => handleSetDefaultCard(method.cardid)}>{billingText.methods.setDefault}</button>
                                            )}
                                            <button type="button" className="fleet-billing__danger-btn" onClick={() => handleRemoveCard(method)}>
                                                <FiTrash2 size={13} /> {billingText.methods.remove}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </article>
                </section>

                <section className="fleet-billing__panel fleet-billing__history-panel">
                    <div className="fleet-billing__table-wrap">
                        <table className="fleet-billing__table">
                            <thead>
                                <tr>
                                    {billingText.history.headers.map((header) => (
                                        <th key={header}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTransactions
                                    .map((transaction) => (
                                    <tr key={transaction.withdraw_id}>
                                        <td>{new Date(transaction.created_at).toLocaleString("en-US", {month: "short", day: "numeric", year: "numeric"})}</td>
                                        <td>{transaction.method}</td>
                                        <td>{transaction.description}</td>
                                        <td>{renderAmount(transaction.amount)}</td>
                                        <td><span className="fleet-billing__status">{transaction.status}</span></td>
                                        <td>{transaction.method}</td>
                                        <td>{transaction.withdraw_id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="fleet-billing__table-footer">
                        <p>{billingText.history.showing} {currentRangeStart} {billingText.history.to} {currentRangeEnd} {billingText.history.of} {totalTransactions} {billingText.history.transactions}</p>
                        <div className="fleet-billing__pager">
                            {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;

                                return (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        className={currentPage === pageNumber ? "fleet-billing__pager-btn fleet-billing__pager-btn--active" : "fleet-billing__pager-btn"}
                                        onClick={() => setCurrentPage(pageNumber)}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>

            {withdrawSuccess && (
                <div className="fleet-billing__modal-overlay" onClick={() => setWithdrawSuccess(null)}>
                    <div className="fleet-billing__success-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="fleet-billing__success-icon">✓</div>
                        <h3>{billingText.modal.successTitle}</h3>
                        <p className="fleet-billing__success-amount">{formatMoney(withdrawSuccess.amount)}</p>
                        <p className="fleet-billing__success-id">{withdrawSuccess.withdrawId}</p>
                        <button type="button" className="fleet-billing__cta-btn" onClick={() => setWithdrawSuccess(null)}>{billingText.modal.done}</button>
                    </div>
                </div>
            )}

            {showAddCardModal && (
                <div className="fleet-billing__modal-overlay">
                    <div className="fleet-billing__modal">
                        <h3>{billingText.modal.addCardTitle}</h3>
                        <p>{billingText.modal.addCardDescription}</p>

                        <form onSubmit={handleAddCard} className="fleet-billing__modal-form">
                            <label htmlFor="cardNumber">{billingText.modal.cardNumber}</label>
                            <input
                                id="cardNumber"
                                type="text"
                                inputMode="numeric"
                                maxLength={19}
                                placeholder={billingText.modal.cardNumberPlaceholder}
                                value={cardForm.cardNumber}
                                onChange={(event) => setCardForm((prev) => ({ ...prev, cardNumber: formatCardNumberInput(event.target.value) }))}
                            />

                            <label htmlFor="cardExpires">{billingText.modal.expires}</label>
                            <input
                                id="cardExpires"
                                type="text"
                                placeholder={billingText.modal.expiresPlaceholder}
                                value={cardForm.expires}
                                onChange={(event) => {
                                    const normalized = event.target.value.replace(/[^\d/]/g, "").slice(0, 5);
                                    const valueWithSlash = normalized.length > 2 && !normalized.includes("/")
                                        ? `${normalized.slice(0, 2)}/${normalized.slice(2)}`
                                        : normalized;
                                    setCardForm((prev) => ({ ...prev, expires: valueWithSlash }));
                                }}
                            />

                            <label htmlFor="cardCvv">{billingText.modal.cvv}</label>
                            <input
                                id="cardCvv"
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                placeholder={billingText.modal.cvvPlaceholder}
                                value={cardForm.cvv}
                                onChange={(event) => setCardForm((prev) => ({ ...prev, cvv: event.target.value.replace(/\D/g, "") }))}
                            />

                            <label htmlFor="cardOwner">{billingText.modal.owner}</label>
                            <input
                                id="cardOwner"
                                type="text"
                                placeholder={billingText.modal.ownerPlaceholder}
                                value={cardForm.fullName}
                                onChange={(event) => setCardForm((prev) => ({ ...prev, fullName: event.target.value }))}
                            />

                            <div className="fleet-billing__modal-actions">
                                <button type="button" className="fleet-billing__ghost-btn fleet-billing__ghost-btn--small" onClick={() => setShowAddCardModal(false)}>
                                    {billingText.modal.cancel}
                                </button>
                                <button type="submit" className="fleet-billing__cta-btn" disabled={isAddingCard}>
                                    {isAddingCard ? billingText.modal.saving : billingText.modal.saveCard}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Billing;