/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import i18n, { loadLanguage } from '../i18n';
import type { Language, Translations } from '../locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const langMap: Record<Language, string> = {
  en: 'en',
  zh: 'zh-CN',
  ja: 'ja',
  ko: 'ko',
  de: 'de',
  fr: 'fr',
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language') as Language;
      return saved || 'en';
    } catch {
      return 'en';
    }
  });

  const [translations, setTranslations] = useState<Translations>(
    () => i18n.getResourceBundle('en', 'translation') as Translations
  );

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('language', lang);
    } catch { /* localStorage unavailable */ }
    document.documentElement.lang = langMap[lang];

    loadLanguage(lang).then(() => {
      void i18n.changeLanguage(lang);
    });
  }, []);

  useEffect(() => {
    const savedLang = language;
    document.documentElement.lang = langMap[savedLang];

    const onLangChanged = (lng: string) => {
      const bundle = i18n.getResourceBundle(lng, 'translation');
      if (bundle) {
        setTranslations(bundle as Translations);
        setLanguageState(lng as Language);
      }
    };

    i18n.on('languageChanged', onLangChanged);

    if (savedLang !== 'en' && i18n.language !== savedLang) {
      void loadLanguage(savedLang).then(() => {
        void i18n.changeLanguage(savedLang);
      });
    }

    return () => {
      i18n.off('languageChanged', onLangChanged);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: LanguageContextType = useMemo(() => ({
    language,
    setLanguage,
    t: translations,
  }), [language, setLanguage, translations]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
