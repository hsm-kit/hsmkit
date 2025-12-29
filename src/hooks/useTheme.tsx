import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('hsmkit-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // 检测系统偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('hsmkit-theme', themeMode);
    // 更新 document 的类，用于全局 CSS
    document.documentElement.setAttribute('data-theme', themeMode);
    if (themeMode === 'dark') {
      document.body.style.backgroundColor = '#141414';
    } else {
      document.body.style.backgroundColor = '#f0f2f5';
    }
  }, [themeMode]);

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

