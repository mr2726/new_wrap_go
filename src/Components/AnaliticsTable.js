import "../App.css";

function AnatiticTable ({data, pageData, state, page, setChoosedCampaign}) {
    
    const formatNumber = (num) => num.toLocaleString('en-US');
    if (!Array.isArray(data)) {
        return <div>No data available</div>;
    }
    const formatDate = (isoString) => {
        const date = new Date(isoString);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const addMonths = (isoString, monthsToAdd) => {
        const date = new Date(isoString);

        date.setMonth(date.getMonth() + monthsToAdd);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    const Table = ({item}) => {
        return (
            <tbody className="clickble" onClick={() => setChoosedCampaign(item.id)}>
                <tr>
                    <td className="campaign__name">
                        {item.name}
                    </td>

                    <td>{item.city}</td>
                    <td>
                        {formatDate(item.created_at)} - {addMonths(item.created_at, parseInt(item.duration))}
                    </td>
                    <td>{formatNumber(Math.round(item.budget))} <span className="article"> AMD</span></td>
                    <td>{item.driverCount}</td>
                    <td>
                        <span className={`status status--${item.status}`}>{item.status}</span>
                    </td>
                </tr>
            </tbody>
        );
    } 

    const RenderTable = ({item}) => {
        switch (page) {
            case "history" : 
                if (item.status !== "live") {
                    return (
                        <Table item={item} />
                    );
                }
                return null;
            case "active" : 
                if (item.status === "live"){
                    return (
                        <Table item={item} />
                    );
                }
                return null;
            default:
                return null;
        }
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
                        <RenderTable item={item} key={index}/>
                    ))
                }
            </table>
        </div>
    );
}

export default AnatiticTable;