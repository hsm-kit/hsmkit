import React, { useState, useCallback, Suspense } from 'react';
import { Layout, Menu, Typography, Button, Drawer, Tooltip, Skeleton, Card } from 'antd';
import { 
  MenuOutlined,
  SunOutlined,
  MoonOutlined,
  ReadOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import { Routes, useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { LanguageSwitcher } from '../components/common';
import { ReloadPrompt } from '../components/common/ReloadPrompt';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { getGuidesPath, isGuidesPage } from '../utils/guidesPath';
import { routeToKey, keyToRoute, prefetchRoute, prefetchSubmenuRoutes } from '../routeConfig';
import { createMenuItems, createMobileMenuItems } from '../menuConfig';
import '../menu-styles.css';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const contentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px',
  width: '100%',
};

const PageSkeleton: React.FC = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <Card>
      <Skeleton active paragraph={{ rows: 8 }} />
    </Card>
    <Card>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
    <Card>
      <Skeleton active paragraph={{ rows: 4 }} />
    </Card>
  </div>
);

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { language, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get current menu key from route
  const currentKey = routeToKey[location.pathname] || 'home';

  // 路由切换时滚动到顶部
  React.useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // 检测屏幕大小
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  React.useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // 菜单定义
  const items = React.useMemo(() => createMenuItems(t), [t]);
  const mobileItems = React.useMemo(() => createMobileMenuItems(t), [t]);

  const handleMenuClick = useCallback((key: string) => {
    prefetchRoute(key);
    const route = key === 'home' ? '/' : key === 'guides' ? getGuidesPath(language) : keyToRoute[key];
    if (route) {
      navigate(route);
    }
    setDrawerVisible(false);
  }, [navigate, language]);

  return (
    <Layout style={{ minHeight: '100vh', background: isDark ? '#141414' : '#f8f9fb' }}>
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 9999,
          padding: '8px 16px',
          background: isDark ? '#177ddc' : '#1677ff',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '0 0 4px 0',
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
        }}
      >
        {t.common?.skipToContent || 'Skip to content'}
      </a>

      {/* 顶部导航栏 */}
      <Header 
        role="banner"
        aria-label={t.header?.title || 'HSM Kit'}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0,
          right: 0,
          zIndex: 999, 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center',
          background: isDark ? '#141414' : '#fff',
          boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.5)' : '0 2px 8px #f0f1f2',
          borderBottom: isDark ? '1px solid #303030' : 'none',
          padding: isMobile ? '0 12px' : '0 24px',
          height: isMobile ? '56px' : '64px'
        }}
      >
        <Link to="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginRight: isMobile ? 'auto' : 24,
          flexShrink: 0,
          textDecoration: 'none'
        }}>
          <img 
            src="/favicon.svg" 
            alt="HSM Kit"
            style={{ 
              width: isMobile ? 28 : 32, 
              height: isMobile ? 28 : 32, 
              marginRight: 10,
              flexShrink: 0
            }}
          />
          <span style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: 600, 
            color: isDark ? '#e6e6e6' : '#333', 
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap'
          }}>{t.header.title}</span>
        </Link>
        
        {/* 桌面端菜单 */}
        {!isMobile && (
          <>
            <Menu 
              mode="horizontal" 
              selectedKeys={[currentKey]} 
              onClick={e => handleMenuClick(e.key)}
              onOpenChange={(openKeys) => {
                openKeys.forEach(key => prefetchSubmenuRoutes(key as string));
              }}
              items={items}
              subMenuOpenDelay={0.1}
              subMenuCloseDelay={0.05}
              style={{ 
                flex: 1, 
                borderBottom: 'none', 
                lineHeight: '64px',
                minWidth: 0
              }}
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexShrink: 0,
              marginLeft: 16,
              gap: 8
            }}>
              {isGuidesPage(location.pathname) ? (
                <Tooltip title={t.guides?.exploreTools || 'Explore Tools'}>
                  <Link to="/">
                    <Button
                      type="primary"
                      icon={<AppstoreOutlined />}
                      style={{ fontSize: 14, fontWeight: 500 }}
                    >
                      {t.guides?.exploreTools || 'Explore Tools'}
                    </Button>
                  </Link>
                </Tooltip>
              ) : (
                <Tooltip title={t.guides?.title || 'Guides'}>
                  <Link to={getGuidesPath(language)}>
                    <Button
                      type="text"
                      icon={<ReadOutlined />}
                      style={{ 
                        fontSize: 14,
                        color: isDark ? '#e6e6e6' : '#595959',
                        fontWeight: 500,
                      }}
                    >
                      {t.guides?.title || 'Guides'}
                    </Button>
                  </Link>
                </Tooltip>
              )}
              <Tooltip title={isDark ? (t.common?.lightMode || 'Light Mode') : (t.common?.darkMode || 'Dark Mode')}>
                <Button
                  type="text"
                  icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                  onClick={toggleTheme}
                  aria-label={isDark ? (t.common?.lightMode || 'Light Mode') : (t.common?.darkMode || 'Dark Mode')}
                  style={{ 
                    fontSize: 18,
                    color: isDark ? '#fadb14' : '#595959'
                  }}
                />
              </Tooltip>
              <LanguageSwitcher />
            </div>
          </>
        )}
        
        {/* 移动端菜单按钮 */}
        {isMobile && (
          <Button 
            type="text" 
            icon={<MenuOutlined />} 
            onClick={() => setDrawerVisible(true)}
            aria-label={t.header?.menu || 'Menu'}
            style={{ marginLeft: 'auto' }}
          />
        )}
      </Header>

      {/* 移动端抽屉菜单 */}
      <Drawer
        title={t.header.title}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        size={250}
        aria-label={t.header?.menu || 'Navigation menu'}
      >
        <Menu
          mode="vertical"
          selectedKeys={[currentKey]}
          onClick={e => handleMenuClick(e.key)}
          onOpenChange={(openKeys) => {
            openKeys.forEach(key => prefetchSubmenuRoutes(key as string));
          }}
          items={mobileItems}
          subMenuOpenDelay={0.1}
          subMenuCloseDelay={0.05}
          style={{ borderRight: 'none', marginBottom: 20 }}
        />
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type={isDark ? 'primary' : 'default'}
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          >
            {isDark ? t.common.lightMode || 'Light' : t.common.darkMode || 'Dark'}
          </Button>
          <LanguageSwitcher />
        </div>
      </Drawer>

      {/* 内容区域 */}
      <Content 
        id="main-content"
        key={location.pathname} 
        style={{ ...contentStyle, paddingTop: isMobile ? 56 + 24 : 64 + 24 }}
        role="main"
        aria-label={t.common?.mainContent || 'Main content'}
      >
        <div style={{ marginTop: isMobile ? 16 : 24, minHeight: 380 }}>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {children}
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </Content>

      {/* 底部 */}
      <Footer style={{ 
        textAlign: 'center', 
        background: isDark ? '#141414' : '#fff', 
        padding: isMobile ? '24px 16px 32px' : '32px 24px 40px',
        marginTop: 48,
        borderTop: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
      }}>
        <div style={{ marginBottom: 12 }}>
          <Text style={{ 
            fontSize: isMobile ? 13 : 14, 
            color: isDark ? '#a6a6a6' : '#595959',
            fontWeight: 500,
          }}>
            HSMKit.com © 2025 - {new Date().getFullYear()} | {t.footer.tagline}
          </Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 12 : 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <Link to="/privacy-policy" style={{ 
            fontSize: isMobile ? 12 : 13, 
            color: isDark ? '#8c8c8c' : '#666',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}>
            {t.footer.privacyPolicy}
          </Link>
          <Text style={{ fontSize: 12, color: isDark ? '#595959' : '#bfbfbf' }}>•</Text>
          <Link to="/terms-of-service" style={{ 
            fontSize: isMobile ? 12 : 13, 
            color: isDark ? '#8c8c8c' : '#666',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}>
            {t.footer.termsOfService}
          </Link>
          <Text style={{ fontSize: 12, color: isDark ? '#595959' : '#bfbfbf' }}>•</Text>
          <Link to="/disclaimer" style={{ 
            fontSize: isMobile ? 12 : 13, 
            color: isDark ? '#8c8c8c' : '#666',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}>
            {t.footer.disclaimer}
          </Link>
          <Text style={{ fontSize: 12, color: isDark ? '#595959' : '#bfbfbf' }}>•</Text>
          <a href="mailto:contact@hsmkit.com" style={{ 
            fontSize: isMobile ? 12 : 13, 
            color: isDark ? '#8c8c8c' : '#666',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}>
            {t.footer.contact}
          </a>
        </div>
      </Footer>
      <ReloadPrompt />
    </Layout>
  );
};

export default MainLayout;
