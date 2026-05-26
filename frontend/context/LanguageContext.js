"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import translations from '@/utils/i18n';

const LanguageContext = createContext({
  lang: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const urlLang = searchParams.get('lang');
    if (urlLang === 'tr' || urlLang === 'en') {
      setLang(urlLang);
      localStorage.setItem('ui-lang', urlLang);
      return;
    }

    const saved = localStorage.getItem('ui-lang');
    if (saved === 'tr' || saved === 'en') {
      setLang(saved);
    }
  }, [searchParams]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLanguage = (newLang) => {
    if (newLang !== 'tr' && newLang !== 'en') {
      return;
    }

    setLang(newLang);
    localStorage.setItem('ui-lang', newLang);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('lang', newLang);
    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.replace(nextUrl);
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
