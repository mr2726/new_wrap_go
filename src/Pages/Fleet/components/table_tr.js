import "../../../App.css";

function TableTr({ vehicleData, contractData, driverData }) {
  const vehicle = vehicleData || {};
  const contract = contractData || {};
  const driver = driverData || {};

    const formatStartDate = (dateValue) => {
        if (!dateValue) return "-";

        const parsedDate = new Date(dateValue);
        if (Number.isNaN(parsedDate.getTime())) return "-";

        const plusSevenDays = new Date(parsedDate);
        plusSevenDays.setDate(plusSevenDays.getDate() + 7);

        return plusSevenDays.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
    };

  return (
    <tr>
        <td>
            <div>
                <p className='table_title'>{vehicle.mark || "-"} {vehicle.model || ""}</p>
                <p className='table_description'>{vehicle.year || "-"}</p>
                <p className='plate'>{vehicle.plate || "-"}</p>
            </div>
        </td>
        <td>
            <div>
                <img src={contract.image_link || "https://placehold.co/50x50.png"} alt="Contract Logo" className='table_img' />
                <div>
                    <p className='table_title'>{contract.name || "No Contract"}</p>
                    <p className='plate'>{contract.reclamtype === "side" ? "One Side" : "Full Wrap"}</p>
                </div>
            </div>
        </td>
        <td>
            <div>
                <div className={driver.name ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">Invite sent</p>
                    <p className='table_description'></p>
                </div>
                <div className={(vehicle.left_img && vehicle.right_img) ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">Photo check</p>
                    <p className='table_description'></p>
                </div>
                <div className={vehicle.wraped ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">Wrapping</p>
                    <p className='table_description'></p>
                </div>
                <div className={(vehicle.left_img && vehicle.right_img && driver.name && vehicle.wraped) ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">Active</p>
                    <p className='table_description'></p>
                </div>
            </div>
        </td>
        <td>
            <div>
                <img src="https://placehold.co/50x50.png" alt="Driver" className='table_img' />
                <div>
                    <p className='table_title'>{driver.name || "Not assigned"}</p>
                    <p className='table_description'>{driver.phone || "-"}</p>
                </div>
            </div>
        </td>
        
        <td><p className='table_title'>{formatStartDate(contract.created_at)}</p></td>
        <td><p className='table_title'>{vehicle.kmtoday || 0}</p></td>
        <td><p className='table_title'>{vehicle.zonehourse || 0}</p></td>
    </tr>
  );
}

export default TableTr;