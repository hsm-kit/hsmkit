import React, { useState, Suspense, lazy, useMemo, useCallback } from 'react';
import { Layout, Menu, Typography, Button, Drawer, Tooltip, Spin } from 'antd';
import { 
  KeyOutlined, 
  MenuOutlined,
  LockOutlined,
  HomeOutlined,
  ToolOutlined,
  SunOutlined,
  MoonOutlined,
  LoadingOutlined,
  SafetyCertificateOutlined,
  CreditCardOutlined
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

// 全局样式：调整子菜单宽度和字体，优化三级菜单的鼠标移动体验
const globalStyles = `
  /* 统一二级菜单宽度，确保Keys和Payments菜单对齐 */
  .ant-menu-submenu-popup .ant-menu-vertical {
    min-width: 180px !important;
    width: auto !important;
  }
  /* 所有菜单项统一左内边距，右内边距为箭头预留空间 */
  .ant-menu-submenu-popup .ant-menu-item,
  .ant-menu-submenu-popup .ant-menu-submenu-title {
    padding-left: 16px !important;
    padding-right: 32px !important;
    margin-inline: 0 !important;
    font-size: 13px !important;
    height: 32px !important;
    line-height: 32px !important;
    white-space: nowrap !important;
    position: relative !important;
  }
  /* 确保文字内容区域对齐 - 使用flex布局 */
  .ant-menu-submenu-popup .ant-menu-item,
  .ant-menu-submenu-popup .ant-menu-submenu-title {
    display: flex !important;
    align-items: center !important;
  }
  /* 文字内容区域，统一宽度和对齐 - 针对所有span元素 */
  .ant-menu-submenu-popup .ant-menu-item > span,
  .ant-menu-submenu-popup .ant-menu-submenu-title > span:not(.ant-menu-submenu-arrow) {
    flex: 1 !important;
    text-align: left !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    min-width: 0 !important;
  }
  /* 箭头图标绝对定位在右侧，不占用布局空间，完全移除其flex影响 */
  .ant-menu-submenu-popup .ant-menu-submenu-title .ant-menu-submenu-arrow {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    margin: 0 !important;
    width: auto !important;
    flex: none !important;
    flex-shrink: 0 !important;
    order: 999 !important;
  }
  /* 确保submenu-title内部布局不影响文字位置 */
  .ant-menu-submenu-popup .ant-menu-submenu-title {
    display: flex !important;
    align-items: center !important;
  }
  /* 确保没有箭头的菜单项也有相同的右内边距，保持对齐 */
  .ant-menu-submenu-popup .ant-menu-item {
    padding-right: 32px !important;
  }
  .ant-menu-submenu-popup .ant-menu {
    padding: 4px 0 !important;
  }
  /* 优化三级菜单：减少菜单之间的间隙，让鼠标移动更顺畅 */
  .ant-menu-submenu-popup {
    margin: 0 !important;
  }
  /* 确保子菜单之间紧密连接，减少间隙 */
  .ant-menu-submenu-popup .ant-menu-submenu-popup {
    margin-left: -4px !important;
    margin-top: -4px !important;
  }
  /* 确保菜单容器之间有重叠，让鼠标移动时不会触发关闭 */
  .ant-menu-submenu-popup::before {
    content: '';
    position: absolute;
    left: -4px;
    top: 0;
    bottom: 0;
    width: 4px;
    z-index: 1;
  }
  /* 统一三级菜单宽度 */
  .ant-menu-submenu-popup .ant-menu-submenu-popup .ant-menu-vertical {
    min-width: 200px !important;
  }
`;

const contentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px',
  width: '100%',
};

// Route configuration - single source of truth
const routes = [
  { key: 'home', path: '/' },
  { key: 'pki-asn1', path: '/asn1-parser' },
  { key: 'pki-ssl', path: '/ssl-certificates' },
  { key: 'cipher-aes', path: '/aes-encryption' },
  { key: 'cipher-des', path: '/des-encryption' },
  { key: 'cipher-rsa', path: '/rsa-encryption' },
  { key: 'cipher-ecc', path: '/ecc-encryption' },
  { key: 'cipher-fpe', path: '/fpe-encryption' },
  { key: 'generic-hashes', path: '/hashes' },
  { key: 'generic-encoding', path: '/character-encoding' },
  { key: 'generic-bcd', path: '/bcd' },
  { key: 'generic-checkdigits', path: '/check-digits' },
  { key: 'generic-base64', path: '/base64' },
  { key: 'generic-base94', path: '/base94' },
  { key: 'generic-message', path: '/message-parser' },
  { key: 'generic-rsader', path: '/rsa-der-public-key' },
  { key: 'generic-uuid', path: '/uuid' },
  { key: 'keys-dea', path: '/keys-dea' },
  { key: 'keys-keyshare', path: '/keyshare-generator' },
  { key: 'keys-hsm-futurex', path: '/futurex-keys' },
  { key: 'keys-hsm-atalla', path: '/atalla-keys' },
  { key: 'keys-hsm-safenet', path: '/safenet-keys' },
  { key: 'keys-hsm-thales', path: '/thales-keys' },
  { key: 'keys-blocks-thales', path: '/thales-key-block' },
  { key: 'keys-blocks-tr31', path: '/tr31-key-block' },
  { key: 'kcv', path: '/kcv-calculator' },
  { key: 'pin', path: '/pin-block-generator' },
  // Payments menu routes
  { key: 'payments-as2805', path: '/payments-as2805' },
  { key: 'payments-bitmap', path: '/payments-bitmap' },
  { key: 'payments-card-validation-cvvs', path: '/payments-card-validation-cvvs' },
  { key: 'payments-card-validation-amex-cscs', path: '/payments-card-validation-amex-cscs' },
  { key: 'payments-card-validation-mastercard-cvc3', path: '/payments-card-validation-mastercard-cvc3' },
  { key: 'payments-dukpt-iso9797', path: '/payments-dukpt-iso9797' },
  { key: 'payments-dukpt-aes', path: '/payments-dukpt-aes' },
  { key: 'payments-mac-iso9797-1', path: '/payments-mac-iso9797-1' },
  { key: 'payments-mac-ansix9', path: '/payments-mac-ansix9' },
  { key: 'payments-mac-as2805', path: '/payments-mac-as2805' },
  { key: 'payments-mac-tdes-cbc-mac', path: '/payments-mac-tdes-cbc-mac' },
  { key: 'payments-mac-hmac', path: '/payments-mac-hmac' },
  { key: 'payments-mac-cmac', path: '/payments-mac-cmac' },
  { key: 'payments-mac-retail', path: '/payments-mac-retail' },
  { key: 'payments-pin-blocks-general', path: '/payments-pin-blocks-general' },
  { key: 'payments-pin-blocks-aes', path: '/payments-pin-blocks-aes' },
  { key: 'payments-pin-offset', path: '/payments-pin-offset' },
  { key: 'payments-pin-pvv', path: '/payments-pin-pvv' },
  { key: 'payments-visa-certificates', path: '/payments-visa-certificates' },
  { key: 'payments-zka', path: '/payments-zka' },
] as const;

// Generate bidirectional mappings from single source
const routeToKey: Record<string, string> = Object.fromEntries(
  routes.map(r => [r.path, r.key])
);
const keyToRoute: Record<string, string> = Object.fromEntries(
  routes.map(r => [r.key, r.path])
);

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
    { 
      label: t.menu.payments || 'Payments', 
      key: 'payments', 
      icon: <CreditCardOutlined />,
      children: [
        { label: t.menu.as2805 || 'AS2805', key: 'payments-as2805' },
        { label: t.menu.bitmap || 'Bitmap', key: 'payments-bitmap' },
        { 
          label: t.menu.cardValidation || 'Card Validation', 
          key: 'payments-card-validation',
          children: [
            { label: t.menu.cvvs || 'CVVs', key: 'payments-card-validation-cvvs' },
            { label: t.menu.amexCscs || 'AMEX CSCs', key: 'payments-card-validation-amex-cscs' },
            { label: t.menu.mastercardCvc3 || 'MasterCard dynamic CVC3', key: 'payments-card-validation-mastercard-cvc3' },
          ]
        },
        { 
          label: t.menu.dukpt || 'DUKPT', 
          key: 'payments-dukpt',
          children: [
            { label: t.menu.dukptIso9797 || 'DUKPT (ISO 9797)', key: 'payments-dukpt-iso9797' },
            { label: t.menu.dukptAes || 'DUKPT (AES)', key: 'payments-dukpt-aes' },
          ]
        },
        { 
          label: t.menu.macAlgorithms || 'MAC Algorithms', 
          key: 'payments-mac-algorithms',
          children: [
            { label: t.menu.iso9797_1 || 'ISO/IEC 9797-1', key: 'payments-mac-iso9797-1' },
            { label: t.menu.ansix9 || 'ANSI X9.9 & X9.19', key: 'payments-mac-ansix9' },
            { label: t.menu.as2805_4_1 || 'AS2805.4.1', key: 'payments-mac-as2805' },
            { label: t.menu.tdesCbcMac || 'TDES CBC-MAC', key: 'payments-mac-tdes-cbc-mac' },
            { label: t.menu.hmac || 'HMAC', key: 'payments-mac-hmac' },
            { label: t.menu.cmac || 'CMAC', key: 'payments-mac-cmac' },
            { label: t.menu.retail || 'Retail', key: 'payments-mac-retail' },
          ]
        },
        { 
          label: t.menu.pinBlocks || 'PIN Blocks', 
          key: 'payments-pin-blocks',
          children: [
            { label: t.menu.pinBlocksGeneral || 'PIN Blocks General', key: 'payments-pin-blocks-general' },
            { label: t.menu.pinBlocksAes || 'PIN Blocks AES', key: 'payments-pin-blocks-aes' },
          ]
        },
        { label: t.menu.pinOffset || 'PIN Offset', key: 'payments-pin-offset' },
        { label: t.menu.pinPvv || 'PIN PVV', key: 'payments-pin-pvv' },
        { label: t.menu.visaCertificates || 'Visa Certificates', key: 'payments-visa-certificates' },
        { label: t.menu.zka || 'ZKA', key: 'payments-zka' },
      ]
    },
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
        size={250}
      >
        <Menu
          mode="vertical"
          selectedKeys={[currentKey]}
          onClick={e => handleMenuClick(e.key)}
          items={[
            { label: 'Home', key: 'home', icon: <HomeOutlined /> },
            ...items
          ]}
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
