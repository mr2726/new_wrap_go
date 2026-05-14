import "../App.css";
// import { useState } from "react";
import pageData from "../data/data.json";

export default function PlanSelector({setRoute, route}) {
  // const [selected, setSelected] = useState("3m");

  const planText = pageData.ui.planSelector;
  const options = planText.options;

  return (
    
    <div className="planSelector">
      <h2 className="title planSelector--title">{planText.title}</h2>
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