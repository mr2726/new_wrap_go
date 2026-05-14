import "../App.css";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import pageData from "../data/data.json";

const CustomDot = (props) => {
    const { cx, cy } = props;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={4}
            fill="#00ff00"
            className="pulse-dot"
        />
    );
};

function AnaliticsChart({currentDate, analyticsData}) {
    const chartData = pageData.ui.analyticsChart;

    const data = analyticsData?.[currentDate] ?? [];

    return (
        <div>

            <div className="analitics_chart__block">
                
                {/* Impressions */}
                <div className="analitics__chart__block--data">
                    <h3>{chartData.impressionsTitle}</h3>
                    <ResponsiveContainer>
                        <LineChart data={data}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#333', borderRadius: '5px', color: '#fff' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="impressions"
                                stroke="#00ff00"
                                dot={<CustomDot />}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Distance */}
                <div className="analitics__chart__block--data">
                    <h3>{chartData.distanceTitle}</h3>
                    <ResponsiveContainer>
                        <BarChart data={data}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#333', borderRadius: '5px', color: '#fff' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="distance" fill="#00ff00" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
}

export default AnaliticsChart;