import { useState } from "react";
import Chart from "./Chart";
import "../App.js";

function OverviewChart({data7, data30}) {
    const [range, setRange] = useState("7");

    return (
        <div className="chart">
            <div className="chart__header">
                <p className="chart__header--title">Impression Analytics</p>
                <select onChange={(e) => setRange(e.target.value)}>
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                </select>
            </div>

            <Chart data={range === "7" ? data7 : data30} />
        </div>
    );
}

export default OverviewChart;