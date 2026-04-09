import "../App.css";
import { useState } from "react";

export default function PlanSelector({setRoute, route}) {
  // const [selected, setSelected] = useState("3m");

  const options = [
    { id: "1m", label: "1 Month" },
    { id: "3m", label: "3 Months" },
    { id: "6m", label: "6 Months" },
    { id: "custom", label: "Custom" },
  ];

  return (
    
    <div className="planSelector">
        <h2 className="title planSelector--title">Campaign Duration</h2>
        <div className="grid">
        {options.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                  setRoute(item.id);
              }}
              className={`card ${route === item.id ? "active" : ""}`}
              >
              {item.label}
            </button>
        ))}
        </div>
    </div>
  );
}