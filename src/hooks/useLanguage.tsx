/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Language, Translations } from '../locales';
import { translations, defaultLanguage } from '../locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言映射表 - 提取到组件外部避免重复创建
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
    // 从 localStorage 读取保存的语言设置，如果没有则使用默认语言
    const saved = localStorage.getItem('language') as Language;
    return saved || defaultLanguage;
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // 更新 HTML lang 属性
    document.documentElement.lang = langMap[lang];
  }, []);

  useEffect(() => {
    // 初始化时设置 HTML lang 属性
    document.documentElement.lang = langMap[language];
  }, [language]);

  // 使用 useMemo 缓存翻译对象，避免不必要的重渲染
  const t = useMemo(() => translations[language], [language]);

  const value: LanguageContextType = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

