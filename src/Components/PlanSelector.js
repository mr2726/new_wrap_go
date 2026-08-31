import "../App.css";
import { useLanguage } from "../context/LanguageContext";

export default function PlanSelector({setRoute, route, setCustomSelected}) {
  const { data: pageData } = useLanguage();
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
                  setCustomSelected(item.id === "custom");
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