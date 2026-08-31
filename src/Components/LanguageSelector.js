import React, { useState, useRef, useEffect } from 'react';
import { MdLanguage } from 'react-icons/md';
import { FiChevronDown } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import '../App.css';

function LanguageSelector({ className = '', variant = 'default' }) {
  const { lang, setLang, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSelect = (code) => {
    setLang(code);
    setIsOpen(false);
  };

  const currentLang = languages[lang] || languages.en;

  return (
    <div
      className={`lang-selector lang-selector--${variant} ${className}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className={`lang-selector__trigger ${isOpen ? 'lang-selector__trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <MdLanguage className="lang-selector__icon" />
        <span className="lang-selector__label">{currentLang.short}</span>
        <FiChevronDown className={`lang-selector__arrow ${isOpen ? 'lang-selector__arrow--rotated' : ''}`} />
      </button>

      {isOpen && (
        <ul className="lang-selector__dropdown">
          {Object.values(languages).map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className={`lang-selector__item ${lang === item.code ? 'lang-selector__item--active' : ''}`}
                onClick={() => handleSelect(item.code)}
              >
                <span className="lang-selector__item-code">{item.short}</span>
                <span className="lang-selector__item-name">{item.nativeName}</span>
                {lang === item.code && <span className="lang-selector__item-dot" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageSelector;
