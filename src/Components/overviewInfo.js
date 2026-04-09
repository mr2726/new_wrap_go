import "../App.css";
import { MdOutlineDirectionsCar, MdLocationPin, MdOutlineRemoveRedEye, MdAttachMoney } from "react-icons/md";

function OverviewInfo ({data, driverCount, distance, totalBudget}) {
    const IconsRendr = ({id}) => {
        switch(id){
            case 0: 
                return <MdOutlineDirectionsCar color="#3B82F6" />
            case 1:
                return <MdLocationPin color="#A855F7" />
            case 2: 
                return <MdOutlineRemoveRedEye color="#39FF14" />
            case 3:
                return <MdAttachMoney color="#F97316" />
            default:
                return <MdOutlineDirectionsCar color="#3B82F6" />
        }
    }

    const AnalitictsInfo = ({id, driverCount, distance}) => {
        // Est. Impressions Formula
        const calculateImpressions = (_distance, cityFactor, timeFactor, formatFactor ) => {
            return _distance * cityFactor * timeFactor * formatFactor;
        };

        const totalDistance = distance;
        const cityFactor = 300; // Количество людей на километр
        const timeFactor = 1.2; // Фактор времяни суток (час пик)
        const formatFactor = 1.3; // уровень заметности рекламы
        const impressions = calculateImpressions(totalDistance, cityFactor, timeFactor, formatFactor);

        // Average CPM
        const cpm = parseFloat(totalBudget) / impressions
        // console.log(totalBudget)

        switch(id){
            case 0:
                return driverCount
            case 1:
                return distance
            case 2:
                return impressions
            case 3:
                return cpm.toFixed(2)
            default: 
                return 0
        }
    }

    return (
        <div className="overview__content_blocks--block">
            <div className="block__header">
                <p className="block__header--title">{data.title}</p>
                <div className="block__header--image" style={{backgroundColor: "#3B82F610"}}>
                    <IconsRendr id={data.id}/>
                </div>
            </div>
            <div className="block__data">
                <p className="block__data--title"><AnalitictsInfo id={data.id} driverCount={driverCount} distance={distance} /></p>
                {/* <p className="block__data--procent">+12%</p> */}
            </div>
            <p className="block__additional">{data.aditions}</p>
        </div>
    );
}

export default OverviewInfo;