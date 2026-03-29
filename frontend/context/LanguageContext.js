"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import translations from '@/utils/i18n';

const LanguageContext = createContext({
  lang: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('ui-lang');
    if (saved === 'tr' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  const setLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('ui-lang', newLang);
  };

  const t = (key, vars = {}) => {
    const str = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    return Object.entries(vars).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, v),
      str
    );
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
