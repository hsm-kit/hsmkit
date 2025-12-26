import React, { useState } from 'react';
import { Layout, Menu, Typography, Button, Drawer } from 'antd';
import { 
  KeyOutlined, 
  SafetyCertificateOutlined, 
  CalculatorOutlined, 
  AppstoreOutlined, 
  MenuOutlined,
  FileSearchOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useLanguage } from './hooks/useLanguage';
// Components - organized by category
import { LanguageSwitcher } from './components/common';
import { CipherTool, DESTool, RSATool, ECCTool, FPETool } from './components/cipher';
import { KeyGenerator, KCVCalculator, TR31Analyzer } from './components/keys';
import { ASN1Parser } from './components/parser';
import { PinBlockTool } from './components/payment';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

// 全局样式：调整子菜单宽度
const globalStyles = `
  .ant-menu-submenu-popup .ant-menu-vertical {
    min-width: 80px !important;
  }
  .ant-menu-submenu-popup .ant-menu-item {
    padding-inline: 12px !important;
    margin-inline: 4px !important;
  }
`;

const contentStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '24px',
  width: '100%',
};

const App: React.FC = () => {
  const { t } = useLanguage();
  const [currentKey, setCurrentKey] = useState('asn1');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    setCurrentKey(key);
    setDrawerVisible(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 1. 顶部导航栏 */}
      <Header 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 999, 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center',
          background: '#fff',
          boxShadow: '0 2px 8px #f0f1f2',
          padding: isMobile ? '0 12px' : '0 24px',
          height: isMobile ? '56px' : '64px'
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginRight: isMobile ? 'auto' : 24,
          flexShrink: 0  // 防止被压缩
        }}>
          {/* Logo 区域 */}
          <div style={{ 
            width: isMobile ? 28 : 32, 
            height: isMobile ? 28 : 32, 
            background: '#1677ff', 
            borderRadius: 6, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            color: '#fff', 
            fontWeight: 'bold', 
            marginRight: 10,
            fontSize: isMobile ? '14px' : '16px',
            flexShrink: 0
          }}>H</div>
          <span style={{ 
            fontSize: isMobile ? '16px' : '18px', 
            fontWeight: 600, 
            color: '#333', 
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap'  // 防止换行
          }}>{t.header.title}</span>
        </div>
        
        {/* 桌面端菜单 */}
        {!isMobile && (
          <>
            <Menu 
              mode="horizontal" 
              selectedKeys={[currentKey]} 
              onClick={e => setCurrentKey(e.key)}
              items={items}
              style={{ 
                flex: 1, 
                borderBottom: 'none', 
                lineHeight: '64px',
                minWidth: 0  // 允许收缩但保持可读
              }}
            />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              flexShrink: 0,  // 右侧按钮不被压缩
              marginLeft: 16
            }}>
              <LanguageSwitcher />
              <Button 
                type="link" 
                href="https://github.com/hsm-kit/hsmkit" 
                target="_blank"
              >
                {t.header.github}
              </Button>
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
          items={items}
          style={{ borderRight: 'none', marginBottom: 20 }}
        />
        <div style={{ marginBottom: 16 }}>
          <LanguageSwitcher />
        </div>
        <Button 
          type="link" 
          href="https://github.com/hsm-kit/hsmkit" 
          target="_blank" 
          block
        >
          {t.header.github}
        </Button>
      </Drawer>

      {/* 2. 内容区域 */}
      <Content style={contentStyle}>
        <div style={{ marginTop: isMobile ? 16 : 24, minHeight: 380 }}>
          {currentKey === 'asn1' && <ASN1Parser />}
          {currentKey === 'cipher-aes' && <CipherTool />}
          {currentKey === 'cipher-des' && <DESTool />}
          {currentKey === 'cipher-rsa' && <RSATool />}
          {currentKey === 'cipher-ecc' && <ECCTool />}
          {currentKey === 'cipher-fpe' && <FPETool />}
          {currentKey === 'gen' && <KeyGenerator />}
          {currentKey === 'tr31' && <TR31Analyzer />}
          {currentKey === 'kcv' && <KCVCalculator />}
          {currentKey === 'pin' && <PinBlockTool />}
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
