import "../App.css";
// import { useState } from "react";
import pageData from "../data/data.json";

export default function AdPlacement({setSelected, selected}) {
  // const [selected, setSelected] = useState("side");

  const options = pageData.ui.adPlacement.options;

  return (
    <div className="wrapper_component">
      <h2 className="title planSelector--title">{pageData.ui.adPlacement.title}</h2>

      {options.map((item) => (
        <div
          key={item.id}
          onClick={() => setSelected(item.id)}
          className={`card ${selected === item.id ? "active" : ""}`}
        >
          <div className="left">
            <div className={`radio ${selected === item.id ? "checked" : ""}`} />
            <p className="title">{item.title}</p>
          </div>

          <div className="price">{item.price}</div>
        </div>
      ))}
    </div>
  );
}