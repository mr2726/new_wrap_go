import "../App.css";

function CampaignTable ({data, pageData, state}) {
    
    const formatNumber = (num) => num.toLocaleString('en-US');
    if (!Array.isArray(data)) {
        return <div>No data available</div>;
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
                        item.status === "live" && <tbody key={index}>
                            <tr>
                                <td className="campaign__name">
                                    {item.name}
                                </td>

                                <td>{item.city}</td>
                                <td>{item.driverCount}</td>
                                <td>{formatNumber(Math.round(item.budget))} <span className="article"> AMD</span></td>

                                <td>
                                    <span className={`status status--${item.status}`}>{item.status}</span>
                                    {
                                        state ? null : item.status === "pending" && (
                                            <button className="payButton" onClick={() => console.log("Pay")}>Pay</button>
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