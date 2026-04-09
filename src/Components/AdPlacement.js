import "../App.css";
// import { useState } from "react";

export default function AdPlacement({setSelected, selected}) {
  // const [selected, setSelected] = useState("side");

  const options = [
    {      
      id: "side",
      title: "Side Doors (2 doors)",
      price: "Included",
    },
    {
      
      id: "full",
      title: "Both sides (4 Doors)",
      price: "+50k AMD",
    }
  ];

  return (
    <div className="wrapper_component">
      <h2 className="title planSelector--title">Ad Placement</h2>

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