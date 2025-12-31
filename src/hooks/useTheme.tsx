import React, { createContext, useContext, useState, useEffect, useLayoutEffect, type ReactNode } from 'react';
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
  const saved = localStorage.getItem('hsmkit-theme');
  if (saved === 'dark' || saved === 'light') return saved;
  // 检测系统偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// 立即应用主题（在 DOM 渲染前）
const applyThemeToDOM = (isDark: boolean) => {
  if (isDark) {
    document.body.classList.add('dark-mode');
    document.body.style.backgroundColor = '#141414';
  } else {
    document.body.classList.remove('dark-mode');
    document.body.style.backgroundColor = '#f0f2f5';
  }
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
  }, []);

  useEffect(() => {
    if (!isReady) return;
    
    localStorage.setItem('hsmkit-theme', themeMode);
    applyThemeToDOM(themeMode === 'dark');
  }, [themeMode, isReady]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDark }}>
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
          },
        }}
      >
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

