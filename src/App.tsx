import React, { useState } from 'react';
import { Layout, Menu, Typography, Button, Drawer, Tooltip } from 'antd';
import { 
  KeyOutlined, 
  SafetyCertificateOutlined, 
  CalculatorOutlined, 
  AppstoreOutlined, 
  MenuOutlined,
  FileSearchOutlined,
  LockOutlined,
  HomeOutlined,
  ToolOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { LanguageSwitcher } from './components/common';
import {
  HomePage,
  ASN1Page,
  AESPage,
  DESPage,
  RSAPage,
  ECCPage,
  FPEPage,
  KeyGeneratorPage,
  TR31Page,
  KCVPage,
  PinBlockPage,
  HashPage,
  CharacterEncodingPage,
  BCDPage,
  CheckDigitsPage,
  Base64Page,
  Base94Page,
  MessageParserPage,
  RSADerPublicKeyPage,
  UUIDPage,
} from './pages';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

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
  '/asn1-parser': 'asn1',
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
  '/key-generator': 'gen',
  '/tr31-calculator': 'tr31',
  '/kcv-calculator': 'kcv',
  '/pin-block-generator': 'pin',
};

// Menu key to route mapping
const keyToRoute: Record<string, string> = {
  'home': '/',
  'asn1': '/asn1-parser',
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
  'gen': '/key-generator',
  'tr31': '/tr31-calculator',
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

  // 检测屏幕大小
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 注入全局样式
  React.useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = globalStyles;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // 菜单定义
  const items = [
    { label: t.menu.asn1, key: 'asn1', icon: <FileSearchOutlined /> },
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
    { label: t.menu.keyGenerator, key: 'gen', icon: <KeyOutlined /> },
    { label: t.menu.tr31, key: 'tr31', icon: <SafetyCertificateOutlined /> },
    { label: t.menu.kcv, key: 'kcv', icon: <CalculatorOutlined /> },
    { label: t.menu.pinBlock, key: 'pin', icon: <AppstoreOutlined /> },
  ];

  const handleMenuClick = (key: string) => {
    const route = keyToRoute[key];
    if (route) {
      navigate(route);
    }
    setDrawerVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: isDark ? '#141414' : '#f0f2f5' }}>
      {/* 1. 顶部导航栏 */}
      <Header 
        style={{ 
          position: 'sticky', 
          top: 0, 
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

      {/* 2. 内容区域 - 使用路由 */}
      <Content key={location.pathname} style={contentStyle}>
        <div style={{ marginTop: isMobile ? 16 : 24, minHeight: 380 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/asn1-parser" element={<ASN1Page />} />
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
            <Route path="/key-generator" element={<KeyGeneratorPage />} />
            <Route path="/tr31-calculator" element={<TR31Page />} />
            <Route path="/kcv-calculator" element={<KCVPage />} />
            <Route path="/pin-block-generator" element={<PinBlockPage />} />
            {/* Fallback to home for unknown routes */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </Content>

      {/* 3. 底部 */}
      <Footer style={{ textAlign: 'center', background: 'transparent', padding: isMobile ? '12px' : '24px' }}>
        <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>
          {t.footer.copyright}
        </Text>
      </Footer>
    </Layout>
  );
};

export default App;
