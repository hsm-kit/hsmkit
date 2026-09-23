import React, { Suspense } from 'react';
import { Button, Layout, Skeleton } from 'antd';
import { AppstoreOutlined, MoonOutlined, ReadOutlined, SunOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import GuidesLanguageSwitcher from '../components/common/GuidesLanguageSwitcher';
import { useLanguageContext as useLanguage } from '../hooks/languageContext';
import { useTheme } from '../hooks/useTheme';
import { getGuidesPath } from '../utils/guidesPath';
import { SiteFooter } from '../components/common/SiteFooter';

const { Header, Content } = Layout;

const GuidesFallback = () => (
  <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
    <Skeleton active paragraph={{ rows: 12 }} />
  </div>
);

const GuidesLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, language } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Header
        className="guides-header"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 64,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <a href="/" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-primary)', flexShrink: 0 }}>
          <img src="/favicon.svg" alt="HSM Kit" width="32" height="32" style={{ marginRight: 10 }} />
          <strong style={{ fontSize: 18 }}>HSM Kit</strong>
        </a>
        <Link
          className="guides-section-link"
          to={getGuidesPath(language)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-secondary)', fontWeight: 500 }}
        >
          <ReadOutlined />
          <span className="guides-section-label">{t.guides?.title || 'Guides'}</span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <a href="/">
            <Button type="text" icon={<AppstoreOutlined />}>
              <span className="guides-desktop-label">{t.guides?.exploreTools || 'Explore Tools'}</span>
            </Button>
          </a>
          <Button
            data-guide-theme-toggle
            className="header-theme-toggle"
            type="text"
            onClick={toggleTheme}
            aria-label={isDark ? (t.common?.lightMode || 'Light') : (t.common?.darkMode || 'Dark')}
          >
            <MoonOutlined className="header-theme-icon header-theme-icon--moon" />
            <SunOutlined className="header-theme-icon header-theme-icon--sun" />
          </Button>
          <GuidesLanguageSwitcher />
        </div>
      </Header>

      <Content id="main-content" role="main" aria-label={t.common?.mainContent || 'Main content'}>
        <Suspense fallback={<GuidesFallback />}>
          {children}
        </Suspense>
      </Content>

      <SiteFooter />
    </Layout>
  );
};

export default GuidesLayout;
