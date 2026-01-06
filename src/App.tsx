import React, { useState, Suspense, lazy, useMemo, useCallback } from 'react';
import { Layout, Menu, Typography, Button, Drawer, Tooltip, Spin } from 'antd';
import { 
  KeyOutlined, 
  CalculatorOutlined, 
  AppstoreOutlined, 
  MenuOutlined,
  LockOutlined,
  HomeOutlined,
  ToolOutlined,
  SunOutlined,
  MoonOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { LanguageSwitcher } from './components/common';

// 🚀 路由懒加载 - 只有访问时才加载对应页面
const HomePage = lazy(() => import('./pages/home/HomePage'));
const ASN1Page = lazy(() => import('./pages/pki/ASN1Page'));
const SSLCertificatesPage = lazy(() => import('./pages/pki/SSLCertificatesPage'));

// Cipher Tools
const AESPage = lazy(() => import('./pages/cipher/AESPage'));
const DESPage = lazy(() => import('./pages/cipher/DESPage'));
const RSAPage = lazy(() => import('./pages/cipher/RSAPage'));
const ECCPage = lazy(() => import('./pages/cipher/ECCPage'));
const FPEPage = lazy(() => import('./pages/cipher/FPEPage'));

// Key Management
const KeyGeneratorPage = lazy(() => import('./pages/keys/KeyGeneratorPage'));
const TR31Page = lazy(() => import('./pages/keys/TR31Page'));
const KCVPage = lazy(() => import('./pages/keys/KCVPage'));
const KeysharePage = lazy(() => import('./pages/keys/KeysharePage'));
const FuturexKeysPage = lazy(() => import('./pages/keys/FuturexKeysPage'));
const AtallaKeysPage = lazy(() => import('./pages/keys/AtallaKeysPage'));
const SafeNetKeysPage = lazy(() => import('./pages/keys/SafeNetKeysPage'));
const ThalesKeysPage = lazy(() => import('./pages/keys/ThalesKeysPage'));
const ThalesKeyBlockPage = lazy(() => import('./pages/keys/ThalesKeyBlockPage'));

// Payment
const PinBlockPage = lazy(() => import('./pages/payment/PinBlockPage'));

// Generic Tools
const HashPage = lazy(() => import('./pages/generic/HashPage'));
const CharacterEncodingPage = lazy(() => import('./pages/generic/CharacterEncodingPage'));
const BCDPage = lazy(() => import('./pages/generic/BCDPage'));
const CheckDigitsPage = lazy(() => import('./pages/generic/CheckDigitsPage'));
const Base64Page = lazy(() => import('./pages/generic/Base64Page'));
const Base94Page = lazy(() => import('./pages/generic/Base94Page'));
const MessageParserPage = lazy(() => import('./pages/generic/MessageParserPage'));
const RSADerPublicKeyPage = lazy(() => import('./pages/generic/RSADerPublicKeyPage'));
const UUIDPage = lazy(() => import('./pages/generic/UUIDPage'));

// Legal Pages
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/legal/TermsOfServicePage'));
const DisclaimerPage = lazy(() => import('./pages/legal/DisclaimerPage'));

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

// 加载中组件
const PageLoader: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 300,
    padding: 40 
  }}>
    <Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} />
  </div>
);

// 全局样式：调整子菜单宽度和字体
const globalStyles = `
  .ant-menu-submenu-popup .ant-menu-vertical {
    min-width: 80px !important;
  }
  .ant-menu-submenu-popup .ant-menu-item {
    padding-inline: 10px !important;
    margin-inline: 4px !important;
    font-size: 13px !important;
    height: 32px !important;
    line-height: 32px !important;
  }
  .ant-menu-submenu-popup .ant-menu {
    padding: 4px 0 !important;
  }
`;

const contentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px',
  width: '100%',
};

// Route to menu key mapping
const routeToKey: Record<string, string> = {
  '/': 'home',
  '/asn1-parser': 'pki-asn1',
  '/ssl-certificates': 'pki-ssl',
  '/aes-encryption': 'cipher-aes',
  '/des-encryption': 'cipher-des',
  '/rsa-encryption': 'cipher-rsa',
  '/ecc-encryption': 'cipher-ecc',
  '/fpe-encryption': 'cipher-fpe',
  '/hashes': 'generic-hashes',
  '/character-encoding': 'generic-encoding',
  '/bcd': 'generic-bcd',
  '/check-digits': 'generic-checkdigits',
  '/base64': 'generic-base64',
  '/base94': 'generic-base94',
  '/message-parser': 'generic-message',
  '/rsa-der-public-key': 'generic-rsader',
  '/uuid': 'generic-uuid',
  // Keys 菜单
  '/keys-dea': 'keys-dea',
  '/keyshare-generator': 'keys-keyshare',
  '/futurex-keys': 'keys-hsm-futurex',
  '/atalla-keys': 'keys-hsm-atalla',
  '/safenet-keys': 'keys-hsm-safenet',
  '/thales-keys': 'keys-hsm-thales',
  '/thales-key-block': 'keys-blocks-thales',
  '/tr31-key-block': 'keys-blocks-tr31',
  '/kcv-calculator': 'kcv',
  '/pin-block-generator': 'pin',
};

// Menu key to route mapping
const keyToRoute: Record<string, string> = {
  'home': '/',
  'pki-asn1': '/asn1-parser',
  'pki-ssl': '/ssl-certificates',
  'cipher-aes': '/aes-encryption',
  'cipher-des': '/des-encryption',
  'cipher-rsa': '/rsa-encryption',
  'cipher-ecc': '/ecc-encryption',
  'cipher-fpe': '/fpe-encryption',
  'generic-hashes': '/hashes',
  'generic-encoding': '/character-encoding',
  'generic-bcd': '/bcd',
  'generic-checkdigits': '/check-digits',
  'generic-base64': '/base64',
  'generic-base94': '/base94',
  'generic-message': '/message-parser',
  'generic-rsader': '/rsa-der-public-key',
  'generic-uuid': '/uuid',
  // Keys 菜单
  'keys-dea': '/keys-dea',
  'keys-keyshare': '/keyshare-generator',
  'keys-hsm-futurex': '/futurex-keys',
  'keys-hsm-atalla': '/atalla-keys',
  'keys-hsm-safenet': '/safenet-keys',
  'keys-hsm-thales': '/thales-keys',
  'keys-blocks-thales': '/thales-key-block',
  'keys-blocks-tr31': '/tr31-key-block',
  'kcv': '/kcv-calculator',
  'pin': '/pin-block-generator',
};

const App: React.FC = () => {
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get current menu key from route
  const currentKey = routeToKey[location.pathname] || 'home';

  // 路由切换时滚动到顶部
  React.useLayoutEffect(() => {
    // 多种方式确保滚动到顶部
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  // 检测屏幕大小 - 使用 useCallback 优化
  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  React.useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // 注入全局样式
  React.useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = globalStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // 菜单定义 - 使用 useMemo 缓存，避免每次渲染都重新创建
  const items = useMemo(() => [
    { 
      label: t.menu.pki || 'PKI', 
      key: 'pki', 
      icon: <SafetyCertificateOutlined />,
      children: [
        { label: t.menu.asn1Decoder || 'ASN.1 Decoder', key: 'pki-asn1' },
        { label: t.menu.sslCertificates || 'SSL Certificates', key: 'pki-ssl' },
      ]
    },
    { 
      label: t.menu.generic || 'Generic', 
      key: 'generic', 
      icon: <ToolOutlined />,
      children: [
        { label: t.menu.hashes || 'Hashes', key: 'generic-hashes' },
        { label: t.menu.characterEncoding || 'Character Encoding', key: 'generic-encoding' },
        { label: t.menu.bcd || 'BCD', key: 'generic-bcd' },
        { label: t.menu.checkDigits || 'Check Digits', key: 'generic-checkdigits' },
        { label: t.menu.base64 || 'Base64', key: 'generic-base64' },
        { label: t.menu.base94 || 'Base94', key: 'generic-base94' },
        { label: t.menu.messageParser || 'Message Parser', key: 'generic-message' },
        { label: t.menu.rsaDerPublicKey || 'RSA DER Public Key', key: 'generic-rsader' },
        { label: t.menu.uuid || 'UUID', key: 'generic-uuid' },
      ]
    },
    { 
      label: t.menu.cipher || 'Cipher', 
      key: 'cipher', 
      icon: <LockOutlined />,
      children: [
        { label: 'AES', key: 'cipher-aes' },
        { label: 'DES', key: 'cipher-des' },
        { label: 'RSA', key: 'cipher-rsa' },
        { label: 'ECC (ECDSA)', key: 'cipher-ecc' },
        { label: 'FPE', key: 'cipher-fpe' },
      ]
    },
    { 
      label: t.menu.keys || 'Keys', 
      key: 'keys', 
      icon: <KeyOutlined />,
      children: [
        { label: t.menu.keysDea || 'Keys DEA', key: 'keys-dea' },
        { label: t.menu.keyshareGenerator || 'Keyshare Generator', key: 'keys-keyshare' },
        { 
          label: t.menu.keysHsm || 'Keys HSM', 
          key: 'keys-hsm',
          children: [
            { label: t.menu.keysFuturex || 'Keys Futurex', key: 'keys-hsm-futurex' },
            { label: t.menu.keysAtalla || 'Keys Atalla', key: 'keys-hsm-atalla' },
            { label: t.menu.keysSafeNet || 'Keys SafeNet', key: 'keys-hsm-safenet' },
            { label: t.menu.keysThales || 'Keys Thales', key: 'keys-hsm-thales' },
          ]
        },
        { 
          label: t.menu.keyBlocks || 'Key Blocks', 
          key: 'keys-blocks',
          children: [
            { label: t.menu.thalesKeyBlock || 'Thales Key Block', key: 'keys-blocks-thales' },
            { label: t.menu.tr31KeyBlock || 'TR-31 Key Block', key: 'keys-blocks-tr31' },
          ]
        },
      ]
    },
    { label: t.menu.kcv || 'KCV', key: 'kcv', icon: <CalculatorOutlined /> },
    { label: t.menu.pinBlock, key: 'pin', icon: <AppstoreOutlined /> },
  ], [t]);

  const handleMenuClick = useCallback((key: string) => {
    const route = keyToRoute[key];
    if (route) {
      navigate(route);
    }
    setDrawerVisible(false);
  }, [navigate]);

  return (
    <Layout style={{ minHeight: '100vh', background: isDark ? '#141414' : '#f0f2f5' }}>
      {/* 1. 顶部导航栏 */}
      <Header 
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
          {/* Logo 区域 - 紫蓝渐变 */}
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
              items={items}
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
              <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
                <Button
                  type="text"
                  icon={isDark ? <SunOutlined /> : <MoonOutlined />}
                  onClick={toggleTheme}
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
        width={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[currentKey]}
          onClick={e => handleMenuClick(e.key)}
          items={[
            { label: 'Home', key: 'home', icon: <HomeOutlined /> },
            ...items
          ]}
          style={{ borderRight: 'none', marginBottom: 20 }}
        />
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button
            type={isDark ? 'primary' : 'default'}
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          >
            {isDark ? 'Light' : 'Dark'}
          </Button>
          <LanguageSwitcher />
        </div>
      </Drawer>

      {/* 2. 内容区域 - 使用路由懒加载 */}
      <Content key={location.pathname} style={{ ...contentStyle, paddingTop: isMobile ? 56 + 24 : 64 + 24 }}>
        <div style={{ marginTop: isMobile ? 16 : 24, minHeight: 380 }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/asn1-parser" element={<ASN1Page />} />
              <Route path="/ssl-certificates" element={<SSLCertificatesPage />} />
              {/* Generic Tools */}
              <Route path="/hashes" element={<HashPage />} />
              <Route path="/character-encoding" element={<CharacterEncodingPage />} />
              <Route path="/bcd" element={<BCDPage />} />
              <Route path="/check-digits" element={<CheckDigitsPage />} />
              <Route path="/base64" element={<Base64Page />} />
              <Route path="/base94" element={<Base94Page />} />
              <Route path="/message-parser" element={<MessageParserPage />} />
              <Route path="/rsa-der-public-key" element={<RSADerPublicKeyPage />} />
              <Route path="/uuid" element={<UUIDPage />} />
              {/* Cipher Tools */}
              <Route path="/aes-encryption" element={<AESPage />} />
              <Route path="/des-encryption" element={<DESPage />} />
              <Route path="/rsa-encryption" element={<RSAPage />} />
              <Route path="/ecc-encryption" element={<ECCPage />} />
              <Route path="/fpe-encryption" element={<FPEPage />} />
              {/* Keys 菜单 */}
              <Route path="/keys-dea" element={<KeyGeneratorPage />} />
              <Route path="/key-generator" element={<KeyGeneratorPage />} /> {/* 旧URL重定向兼容 */}
              <Route path="/tr31-key-block" element={<TR31Page />} />
              <Route path="/kcv-calculator" element={<KCVPage />} />
              <Route path="/keyshare-generator" element={<KeysharePage />} />
              <Route path="/futurex-keys" element={<FuturexKeysPage />} />
              <Route path="/atalla-keys" element={<AtallaKeysPage />} />
              <Route path="/safenet-keys" element={<SafeNetKeysPage />} />
              <Route path="/thales-keys" element={<ThalesKeysPage />} />
              <Route path="/thales-key-block" element={<ThalesKeyBlockPage />} />
              <Route path="/pin-block-generator" element={<PinBlockPage />} />
              {/* Legal Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              {/* Fallback to home for unknown routes */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </div>
      </Content>

      {/* 3. 底部 */}
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
    </Layout>
  );
};

export default App;
