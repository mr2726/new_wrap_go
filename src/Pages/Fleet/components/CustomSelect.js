import { useState } from "react";
import { HiChevronDown } from "react-icons/hi";
import "../../../App.css";

function CustomSelect({ label, options, value, onChange, isVehicle }) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="custom-select" style={{ position: "relative" }}>
            {label && <p className="custom-select__label">{label}</p>}
            <div className="custom-select__trigger" onClick={() => setIsOpen(!isOpen)}>
                {selectedOption ? (
                    isVehicle ? (
                        <div className="custom-select__value vehicle">
                            <span>{selectedOption.label}</span>
                        </div>
                    ) : (
                        <div className="custom-select__value contract">
                            <div className="contract__card">
                                {selectedOption.logo && (
                                    <div className="contract__logo">
                                        {selectedOption.logo}
                                    </div>
                                )}
                                <div className="contract__info">
                                    <p className="contract__name">{selectedOption.label}</p>
                                    {selectedOption.date && (
                                        <p className="contract__date">{selectedOption.date}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <span className="placeholder">Select option</span>
                )}
                <HiChevronDown size={20} className={`chevron ${isOpen ? 'open' : ''}`} />
            </div>

            {isOpen && (
                <div className="custom-select__dropdown">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`custom-select__option ${value === option.value ? 'active' : ''}`}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                        >
                            {isVehicle ? (
                                <div className="vehicle">
                                    <span>{option.label}</span>
                                </div>
                            ) : (
                                <div className="contract__card">
                                    {option.logo && (
                                        <div className="contract__logo">
                                            {option.logo}
                                        </div>
                                    )}
                                    <div className="contract__info">
                                        <p className="contract__name">{option.label}</p>
                                        {option.date && (
                                            <p className="contract__date">{option.date}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomSelect;
