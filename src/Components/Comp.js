import React from "react";
import "../App.css";

const Comp = ({ title, currentDate, setCurrentDate }) => {
    return (
        <div className="camp__header">
            <h2 className="camp__title">{title}</h2>
            <div className="camp__dates">
                <p className={`camp__dates--stick ${currentDate === "today" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("today")}>
                    Today
                </p>
                <p className={`camp__dates--stick ${currentDate === "week" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("week")}>
                    1 Week
                </p>
                <p className={`camp__dates--stick ${currentDate === "month" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("month")}>
                    1 Month
                </p>
                <p className={`camp__dates--stick ${currentDate === "year" ? "camp__dates__active" : ""}`} onClick={() => setCurrentDate("year")}>
                    1 Year
                </p>
            </div>
        </div>
    );
};

export default Comp;