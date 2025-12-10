import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Language, Translations } from '../locales';
import { translations, defaultLanguage } from '../locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // 从 localStorage 读取保存的语言设置，如果没有则使用默认语言
    const saved = localStorage.getItem('language') as Language;
    return saved || defaultLanguage;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // 更新 HTML lang 属性
    const langMap: Record<Language, string> = {
      en: 'en',
      zh: 'zh-CN',
      ja: 'ja',
      ko: 'ko',
      de: 'de',
      fr: 'fr',
    };
    document.documentElement.lang = langMap[lang];
  };

  useEffect(() => {
    // 初始化时设置 HTML lang 属性
    const langMap: Record<Language, string> = {
      en: 'en',
      zh: 'zh-CN',
      ja: 'ja',
      ko: 'ko',
      de: 'de',
      fr: 'fr',
    };
    document.documentElement.lang = langMap[language];
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

