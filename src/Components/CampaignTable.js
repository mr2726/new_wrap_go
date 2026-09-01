import "../App.css";
import { useLanguage } from "../context/LanguageContext";
import { getCampaignEndDate, getEffectiveCampaignStartDate } from "../data/campaignDates";

function CampaignTable ({data, pageData, state, onRowClick, selectedId, setPage, detailsPopup}) {
    const { data: appData } = useLanguage();
    const fallbackText = appData.ui.common;
    const formatNumber = (num) => num.toLocaleString('en-US');
    if (!Array.isArray(data)) {
        return <div>{pageData?.emptyState || fallbackText.noDataAvailable}</div>;
    }
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }
    return (
        <div className="campaigns" style={state ? {width: "100%"} : {}}>
            <div className="campaigns__header">
                <h2 className="table__title">{pageData.title}</h2>
            </div>

            <table className="campaigns__table">
                <thead>
                    <tr>
                        {
                            pageData.tableInfo.map((item, index) => (
                                <th key={index}>{item.title}</th>
                            ))
                        }
                    </tr>
                </thead>

                {
                    data.map((item, index) => (
                        (item.status === "live" || item.status === "pending" || item.status === "in process") && <tbody key={index}>
                            <tr
                                className={`${item.status === "live" ? "campaign__row--clickable" : ""} ${selectedId === item.id ? "campaign__row--selected" : ""}`}
                                onClick={() => item.status === "live" && onRowClick && onRowClick(item)}
                            >
                                <td className="campaign__name">
                                    {item.name}
                                </td>

                                <td>{item.city}</td>
                                <td>{item.driverCount} / {item.economValue}</td>
                                <td>{formatNumber(Math.round(item.budget))} <span className="article"> {pageData?.currency || fallbackText.currency}</span></td>
                                <td>{formatDate(getEffectiveCampaignStartDate(item))} - {formatDate(getCampaignEndDate(item))}</td>
                                <td>
                                    <span className={`status status--${item.status.replace(" ", "-")}`}>{pageData?.statusLabels?.[item.status] || item.status}</span>
                                </td>
                                <td>
                                    {
                                        item.status === "pending" && (
                                            <button className="payButton" onClick={(e) => { e.stopPropagation(); setPage("billing"); }}>{pageData?.pay || "Pay"}</button>
                                        )
                                    }
                                    {
                                        (item.status === "in process" || item.status === "live") && (
                                            <button className="detailsBtn" onClick={(e) => { e.stopPropagation(); detailsPopup && detailsPopup(item); }}>Details</button>
                                        )
                                    }
                                </td>
                            </tr>
                        </tbody>
                    ))
                }
            </table>
        </div>
    );
}

export default CampaignTable;