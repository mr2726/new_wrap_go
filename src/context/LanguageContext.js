import React, { createContext, useContext, useState, useEffect } from 'react';
import dataEn from '../data/data.json';
import dataRu from '../data/data_ru.json';
import dataAm from '../data/data_am.json';

export const LANGUAGES = {
  en: {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    short: 'EN',
    data: dataEn,
  },
  ru: {
    code: 'ru',
    label: 'Русский',
    nativeName: 'Русский',
    short: 'RU',
    data: dataRu,
  },
  am: {
    code: 'am',
    label: 'Հայերեն',
    nativeName: 'Հայերեն',
    short: 'AM',
    data: dataAm,
  },
};

const STORAGE_KEY = 'wrapgo_lang';

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  data: dataEn,
  languages: LANGUAGES,
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES[saved]) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language from localStorage:', e);
    }
    return 'en';
  });

  const setLang = (newLang) => {
    if (LANGUAGES[newLang]) {
      setLangState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch (e) {
        console.warn('Could not save language to localStorage:', e);
      }
    }
  };

  useEffect(() => {
    // Sync if changed in another tab or context
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue && LANGUAGES[e.newValue]) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const currentData = LANGUAGES[lang]?.data || dataEn;

  return (
    <LanguageContext.Provider value={{ lang, setLang, data: currentData, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    let saved = 'en';
    try {
      saved = localStorage.getItem(STORAGE_KEY) || 'en';
    } catch (e) {
      saved = 'en';
    }
    const currentData = LANGUAGES[saved]?.data || dataEn;
    return {
      lang: saved,
      setLang: () => {},
      data: currentData,
      languages: LANGUAGES,
    };
  }
  return context;
};

export const getLanguageData = (langCode) => {
  return LANGUAGES[langCode]?.data || dataEn;
};

export default LanguageContext;
