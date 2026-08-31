import React from "react";
import "../App.css";
import { useLanguage } from "../context/LanguageContext";

const Comp = ({ title, currentDate, setCurrentDate }) => {
    const { data: pageData } = useLanguage();
    const dateRanges = pageData.ui.dateRanges;

    return (
        <div className="camp__header">
            <h2 className="camp__title">{title}</h2>
            <div className="camp__dates">
                <p className={`camp__dates--stick ${currentDate === "today" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("today")}>
                    {dateRanges.today}
                </p>
                <p className={`camp__dates--stick ${currentDate === "week" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("week")}>
                    {dateRanges.week}
                </p>
                <p className={`camp__dates--stick ${currentDate === "month" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("month")}>
                    {dateRanges.month}
                </p>
                <p className={`camp__dates--stick ${currentDate === "year" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("year")}>
                    {dateRanges.year}
                </p>
            </div>
        </div>
    );
};

export default Comp;