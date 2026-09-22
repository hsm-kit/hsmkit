import React, { Suspense } from 'react';
import { Button, Layout, Skeleton, Typography } from 'antd';
import { AppstoreOutlined, MoonOutlined, ReadOutlined, SunOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import GuidesLanguageSwitcher from '../components/common/GuidesLanguageSwitcher';
import { useLanguageContext as useLanguage } from '../hooks/languageContext';
import { useTheme } from '../hooks/useTheme';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

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
          to={language === 'zh' ? '/zh/guides' : '/guides'}
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

      <Footer style={{ textAlign: 'center', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', padding: '28px 20px' }}>
        <Text type="secondary" style={{ display: 'block', marginBottom: 10 }}>
          HSMKit.com © 2025 - {new Date().getFullYear()} | {t.footer?.tagline || 'Browser-based Security Calculation Tools'}
        </Text>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
          <a href="/privacy-policy">{t.footer?.privacyPolicy || 'Privacy Policy'}</a>
          <a href="/terms-of-service">{t.footer?.termsOfService || 'Terms of Service'}</a>
          <a href="/disclaimer">{t.footer?.disclaimer || 'Disclaimer'}</a>
          <a href="mailto:contact@hsmkit.com">{t.footer?.contact || 'Contact'}</a>
        </div>
      </Footer>
    </Layout>
  );
};

export default GuidesLayout;
