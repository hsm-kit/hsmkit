/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useLayoutEffect, useMemo, useCallback, type ReactNode } from 'react';
import { ConfigProvider, theme } from 'antd';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// 在 React 加载前就应用主题，避免闪烁
const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('hsmkit-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* localStorage unavailable */ }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// 立即应用主题（在 DOM 渲染前）
const applyThemeToDOM = (isDark: boolean) => {
  if (isDark) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  document.body.style.backgroundColor = isDark ? '#141414' : '#f5f7fa';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme);
  const [isReady, setIsReady] = useState(false);

  // 使用 useLayoutEffect 确保在渲染前同步应用主题
  useLayoutEffect(() => {
    applyThemeToDOM(themeMode === 'dark');
    // 短暂延迟后标记为就绪，避免过渡动画在初始加载时触发
    requestAnimationFrame(() => {
      setIsReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isReady) return;
    
    try {
      localStorage.setItem('hsmkit-theme', themeMode);
    } catch { /* localStorage unavailable */ }
    applyThemeToDOM(themeMode === 'dark');
  }, [themeMode, isReady]);

  const toggleTheme = useCallback(() => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const isDark = themeMode === 'dark';

  // 使用 useMemo 缓存主题配置，避免不必要的重渲染
  const themeConfig = useMemo(() => ({
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1677ff',
      colorBgLayout: isDark ? '#141414' : '#f5f7fa',
      colorBgContainer: isDark ? '#1f1f1f' : '#ffffff',
      colorText: isDark ? '#e6e6e6' : '#1f2937',
      colorTextSecondary: isDark ? '#a6a6a6' : '#6b7280',
      colorBorderSecondary: isDark ? '#303030' : '#e5e7eb',
      borderRadius: 8,
      borderRadiusLG: 8,
      controlHeight: 36,
      controlHeightLG: 40,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",
      fontFamilyCode: "'SF Mono', 'Cascadia Code', 'Roboto Mono', Consolas, 'Liberation Mono', Menlo, monospace",
    },
  }), [isDark]);

  const contextValue = useMemo(() => ({
    themeMode,
    toggleTheme,
    isDark,
  }), [themeMode, toggleTheme, isDark]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={themeConfig}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useTheme;
