import { useState } from "react";
import Chart from "./Chart";
import "../App.js";
import { useLanguage } from "../context/LanguageContext";

function OverviewChart({data7, data30}) {
    const { data: pageData } = useLanguage();
    const chartText = pageData.ui.overviewChart;
    const [range, setRange] = useState("7");

    return (
        <div className="chart">
            <div className="chart__header">
                <p className="chart__header--title">{chartText.title}</p>
                <select onChange={(e) => setRange(e.target.value)}>
                    <option value="7">{chartText.ranges["7"]}</option>
                    <option value="30">{chartText.ranges["30"]}</option>
                </select>
            </div>

            <Chart data={range === "7" ? data7 : data30} />
        </div>
    );
}

export default OverviewChart;