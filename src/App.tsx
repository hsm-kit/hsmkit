import React, { useState } from 'react';
import { 
  Layout, Menu, Typography, Card, Button, 
  Radio, Space, message, Divider, Tag 
} from 'antd';
import { 
  KeyOutlined, 
  SafetyCertificateOutlined, 
  CalculatorOutlined, 
  AppstoreOutlined, 
  CopyOutlined, 
  ReloadOutlined 
} from '@ant-design/icons';
import CryptoJS from 'crypto-js';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// --- 样式配置 ---
const contentStyle: React.CSSProperties = {
  maxWidth: '1000px', // 限制最大宽度，不让工具拉得太长
  margin: '0 auto',   // 居中
  padding: '24px',
};

// --- 工具组件 1: 随机密钥生成器 (真实逻辑) ---
const KeyGenerator = () => {
  const [length, setLength] = useState(16); // 默认 16字节 (128-bit)
  const [generatedKey, setGeneratedKey] = useState('');
  const [checkValue, setCheckValue] = useState('');

  // 生成逻辑
  const handleGenerate = () => {
    // 1. 生成随机 Bytes
    const randomWord = CryptoJS.lib.WordArray.random(length);
    const keyHex = randomWord.toString().toUpperCase();
    setGeneratedKey(keyHex);

    // 2. 计算 KCV (用该密钥加密 8字节 00)
    try {
      // 这里的逻辑稍微复杂点，为了演示效果，简单用 AES 模拟一下 KCV 生成
      // 真实支付场景通常是 3DES，但这里主要看 UI
      const zero = CryptoJS.enc.Hex.parse("0000000000000000");
      // 简单的 ECB 模式
      const encrypted = CryptoJS.AES.encrypt(zero, randomWord, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      // 取前 6 位
      setCheckValue(encrypted.ciphertext.toString().toUpperCase().substring(0, 6));
    } catch(e) {
      setCheckValue("ERROR");
    }
  };

  const copyToClipboard = () => {
    if(!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    message.success('Key copied to clipboard!');
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 顶部控制区 */}
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0 }}>Random Key Generator</Title>
          <Text type="secondary">Generate cryptographically strong random keys for DES, 3DES, or AES.</Text>
          
          <Divider />
          
          <Space size="large" wrap>
            <div>
              <Text strong style={{ marginRight: 10 }}>Key Length:</Text>
              <Radio.Group value={length} onChange={e => setLength(e.target.value)} buttonStyle="solid">
                <Radio.Button value={8}>8 Bytes (64-bit)</Radio.Button>
                <Radio.Button value={16}>16 Bytes (128-bit)</Radio.Button>
                <Radio.Button value={24}>24 Bytes (192-bit)</Radio.Button>
                <Radio.Button value={32}>32 Bytes (256-bit)</Radio.Button>
              </Radio.Group>
            </div>
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleGenerate} size="large">
              Generate Now
            </Button>
          </Space>
        </Card>

        {/* 结果展示区 */}
        {generatedKey && (
          <Card 
            title={<><KeyOutlined /> Result</>} 
            bordered={false} 
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            extra={<Button type="text" icon={<CopyOutlined />} onClick={copyToClipboard}>Copy</Button>}
          >
            <div style={{ background: '#f5f7fa', padding: '20px', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
               <Text type="secondary" style={{ fontSize: '12px' }}>GENERATED KEY (HEX)</Text>
               <div style={{ 
                 fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace', 
                 fontSize: '24px', 
                 letterSpacing: '2px', 
                 color: '#1677ff',
                 wordBreak: 'break-all',
                 marginTop: '5px'
               }}>
                 {generatedKey.match(/.{1,4}/g)?.join(' ')}
               </div>
               
               <Divider style={{ margin: '15px 0' }} />
               
               <Space>
                 <Tag color="green">KCV: {checkValue}</Tag>
                 <Tag color="blue">Length: {length} bytes</Tag>
                 <Tag color="purple">Bits: {length * 8}</Tag>
               </Space>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

// --- 其他占位组件 ---
const Placeholder = ({ title, icon }: { title: string, icon: React.ReactNode }) => (
  <Card bordered={false} style={{ textAlign: 'center', padding: 50, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
    <div style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 20 }}>{icon}</div>
    <Title level={3}>{title}</Title>
    <Text type="secondary">This tool is under construction. Stay tuned!</Text>
  </Card>
);

const App: React.FC = () => {
  const [currentKey, setCurrentKey] = useState('gen');
  
  // 菜单定义
  const items = [
    { label: 'Key Generator', key: 'gen', icon: <KeyOutlined /> },
    { label: 'TR-31 Key Block', key: 'tr31', icon: <SafetyCertificateOutlined /> },
    { label: 'KCV Calc', key: 'kcv', icon: <CalculatorOutlined /> },
    { label: 'Pin Block', key: 'pin', icon: <AppstoreOutlined /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* 1. 顶部导航栏 (白色背景 + 阴影) */}
      <Header 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1, 
          width: '100%', 
          display: 'flex', 
          alignItems: 'center',
          background: '#fff',
          boxShadow: '0 2px 8px #f0f1f2',
          padding: '0 24px'
        }}
      >
        <div style={{ marginRight: 40, display: 'flex', alignItems: 'center' }}>
          {/* Logo 区域 */}
          <div style={{ 
            width: 32, height: 32, background: '#1677ff', borderRadius: 6, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold', marginRight: 10 
          }}>H</div>
          <span style={{ fontSize: '18px', fontWeight: 600, color: '#333', letterSpacing: '-0.5px' }}>HSM Kit</span>
        </div>
        
        {/* 顶部菜单 */}
        <Menu 
          mode="horizontal" 
          selectedKeys={[currentKey]} 
          onClick={e => setCurrentKey(e.key)}
          items={items}
          style={{ flex: 1, borderBottom: 'none', lineHeight: '64px' }}
        />
        
        {/* 右侧链接 */}
        <div>
          <Button type="link" href="https://github.com/yourname/hsmkit" target="_blank">GitHub</Button>
        </div>
      </Header>

      {/* 2. 内容区域 (居中 + 呼吸感) */}
      <Content style={contentStyle}>
        <div style={{ marginTop: 24, minHeight: 380 }}>
          {currentKey === 'gen' && <KeyGenerator />}
          {currentKey === 'tr31' && <Placeholder title="TR-31 Analyzer" icon={<SafetyCertificateOutlined />} />}
          {currentKey === 'kcv' && <Placeholder title="KCV Calculator" icon={<CalculatorOutlined />} />}
          {currentKey === 'pin' && <Placeholder title="Pin Block Tool" icon={<AppstoreOutlined />} />}
        </div>
      </Content>

      {/* 3. 底部 */}
      <Footer style={{ textAlign: 'center', background: 'transparent' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          HSMKit.com ©2025 | Secure Client-side Calculation
        </Text>
      </Footer>
    </Layout>
  );
};

export default App;