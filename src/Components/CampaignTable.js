import "../App.css";
import appData from "../data/data.json";

function CampaignTable ({data, pageData, state, onRowClick, selectedId, setPage, detailsPopup}) {
    const fallbackText = appData.ui.common;
    const formatNumber = (num) => num.toLocaleString('en-US');
    if (!Array.isArray(data)) {
        return <div>{pageData?.emptyState || fallbackText.noDataAvailable}</div>;
    }
    const formatDate = (dateStr) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }
    const addDays = (dateValue, days) => {
        const date = new Date(dateValue);
        date.setDate(date.getDate() + days);
        return date;
    }
    const parseDurationMs = (duration) => {
        const match = (duration || "").match(/^(\d+)([mdhw])$/i);
        if (!match) return 0;

        const value = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        const msMap = {
            m: 30 * 24 * 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
            h: 60 * 60 * 1000,
            w: 7 * 24 * 60 * 60 * 1000,
        };

        return value * (msMap[unit] || 0);
    }
    const endDate = (duration, created_at) => {
        const start = new Date(created_at);
        const end = new Date(start.getTime() + (7 * 24 * 60 * 60 * 1000) + parseDurationMs(duration));
        return formatDate(end);
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
                                <td>{formatDate(addDays(item.created_at, 7))} - {endDate(item.duration, item.created_at)}</td>
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