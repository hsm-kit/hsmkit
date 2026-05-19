/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Language, Translations } from '../locales';
import { defaultLanguage, getCachedTranslations, loadTranslations } from '../locales';

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

  // 翻译状态：初始从缓存加载，异步加载后更新
  const [translations, setTranslations] = useState<Translations>(() => {
    const userLang = localStorage.getItem('language') as Language;
    const cached = getCachedTranslations(userLang || defaultLanguage);
    return cached || getCachedTranslations(defaultLanguage)!;
  });

  // 跟踪当前已加载的语言，避免重复加载
  const loadedLangRef = useRef<Language>(language);

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

  // 按需加载语言包：避免将所有语言一次性打进首屏 bundle
  useEffect(() => {
    // 如果已经加载了该语言的翻译，跳过
    if (loadedLangRef.current === language) {
      return;
    }

    let cancelled = false;

    void loadTranslations(language)
      .then((loaded) => {
        if (!cancelled) {
          loadedLangRef.current = language;
          setTranslations(loaded);
        }
      })
      .catch(() => {
        // 动态加载失败时回退到默认语言
        const fallback = getCachedTranslations(defaultLanguage);
        if (!cancelled && fallback) {
          loadedLangRef.current = defaultLanguage;
          setTranslations(fallback);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [language]);

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
