import "../../../App.css";
import { useLanguage } from "../../../context/LanguageContext";
import { getEffectiveCampaignStartDate } from "../../../data/campaignDates";

function TableTr({ vehicleData, contractData, driverData }) {
    const { data: pageData } = useLanguage();
    const tableText = pageData.fleet.tableRow;
  const vehicle = vehicleData || {};
  const contract = contractData || {};
  const driver = driverData || {};

    const formatStartDate = (campaign) => {
        const startDate = getEffectiveCampaignStartDate(campaign);
        if (!startDate) return "-";

        return startDate.toLocaleDateString("en-US", {
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
                <img src={contract.document || "https://placehold.co/50x50.png"} alt={contract.name || "Contract Logo"} className='table_img' />
                <div>
                    <p className='table_title'>{contract.name || tableText.noContract}</p>
                    <p className='plate'>{contract.reclamtype === "side" ? tableText.oneSide : tableText.fullWrap}</p>
                </div>
            </div>
        </td>
        <td>
            <div>
                <div className={driver.name ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">{tableText.statusSteps.inviteSent}</p>
                    <p className='table_description'></p>
                </div>
                <div className={(vehicle.left_img && vehicle.right_img && driver.name) ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">{tableText.statusSteps.photoCheck}</p>
                    <p className='table_description'></p>
                </div>
                <div className={(vehicle.left_img && vehicle.right_img && driver.name && vehicle.wraped) ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">{tableText.statusSteps.wrapping}</p>
                    <p className='table_description'></p>
                </div>
                <div className={(vehicle.left_img && vehicle.right_img && driver.name && vehicle.wraped) ? "step--done" : "step--pending"}>
                    <div></div>
                    <p className="table_sub_title">{tableText.statusSteps.active}</p>
                    <p className='table_description'></p>
                </div>
            </div>
        </td>
        <td>
            <div>
                <img src="https://placehold.co/50x50.png" alt="Driver" className='table_img' />
                <div>
                    <p className='table_title'>{driver.name || tableText.notAssigned}</p>
                    <p className='table_description'>{driver.phone || "-"}</p>
                </div>
            </div>
        </td>
        
        <td><p className='table_title'>{formatStartDate(contract)}</p></td>
        <td><p className='table_title'>{driver.kmtoday || 0}</p></td>
        <td><p className='table_title'>{driver.zonehourse || 0}</p></td>
    </tr>
  );
}

export default TableTr;