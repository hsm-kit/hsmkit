import React, { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';
import type { Language, Translations } from '../locales';
import { LanguageContext } from './languageContext';
import enCommon from '../locales/en/common';
import enGuides from '../locales/en/guides';
import enHeader from '../locales/en/header';
import enFooter from '../locales/en/footer';
import zhCommon from '../locales/zh/common';
import zhGuides from '../locales/zh/guides';
import zhHeader from '../locales/zh/header';
import zhFooter from '../locales/zh/footer';

const dictionaries = {
  en: { ...enCommon, ...enGuides, ...enHeader, ...enFooter },
  zh: { ...zhCommon, ...zhGuides, ...zhHeader, ...zhFooter },
};

const htmlLanguages: Record<Language, string> = {
  en: 'en',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  de: 'de',
  fr: 'fr',
};

export const GuidesLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return localStorage.getItem('language') === 'zh' ? 'zh' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    try {
      localStorage.setItem('language', nextLanguage);
    } catch { /* localStorage unavailable */ }
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = htmlLanguages[language];
  }, [language]);

  const translations = language === 'zh' ? dictionaries.zh : dictionaries.en;
  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations as unknown as Translations,
  }), [language, setLanguage, translations]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
