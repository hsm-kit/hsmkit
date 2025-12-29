import React, { useState, useMemo } from 'react';
import { Card, Typography, Row, Col, Input, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSearchOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  CalculatorOutlined,
  AppstoreOutlined,
  SecurityScanOutlined,
  NumberOutlined,
  SwapOutlined,
  FieldBinaryOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  CodeOutlined,
  ReadOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageLayout } from '../../components/common/PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import seoContent from '../../locales/seo';

const { Title, Text, Paragraph } = Typography;

type Category = 'all' | 'symmetric' | 'asymmetric' | 'payment' | 'encoding' | 'hashing';

interface ToolInfo {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  color: string;
  category: Category;
  keywords: string[];
}

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  color: string;
  isDark: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, path, color, isDark }) => (
  <Link to={path} style={{ textDecoration: 'none' }}>
    <Card
      hoverable
      style={{
        height: '100%',
        borderRadius: 12,
        border: 'none',
        boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        background: isDark ? '#1f1f1f' : '#fff',
      }}
      styles={{
        body: { padding: 24 }
      }}
    >
      <div style={{ 
        width: 56, 
        height: 56, 
        borderRadius: 12, 
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        fontSize: 24,
        color: '#fff'
      }}>
        {icon}
      </div>
      <Title level={5} style={{ marginBottom: 8, color: isDark ? '#e6e6e6' : '#1e293b' }}>{title}</Title>
      <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>{description}</Text>
    </Card>
  </Link>
);

const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const seo = seoContent[language]?.home || seoContent.en.home;
  const home = t.home;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const tools: ToolInfo[] = [
    // Symmetric Encryption
    {
      icon: <LockOutlined />,
      title: home.tools.aes.title,
      description: home.tools.aes.description,
      path: '/aes-encryption',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      category: 'symmetric',
      keywords: ['aes', 'encryption', 'symmetric', 'block cipher', '128', '192', '256', 'cbc', 'ecb', 'ctr'],
    },
    {
      icon: <LockOutlined />,
      title: home.tools.des.title,
      description: home.tools.des.description,
      path: '/des-encryption',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      category: 'symmetric',
      keywords: ['des', '3des', 'triple des', 'encryption', 'symmetric', 'block cipher'],
    },
    {
      icon: <LockOutlined />,
      title: home.tools.fpe.title,
      description: home.tools.fpe.description,
      path: '/fpe-encryption',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      category: 'symmetric',
      keywords: ['fpe', 'format preserving', 'ff1', 'ff3', 'tokenization'],
    },
    // Asymmetric Encryption
    {
      icon: <SecurityScanOutlined />,
      title: home.tools.rsa.title,
      description: home.tools.rsa.description,
      path: '/rsa-encryption',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      category: 'asymmetric',
      keywords: ['rsa', 'public key', 'private key', 'asymmetric', 'pkcs', 'oaep'],
    },
    {
      icon: <SecurityScanOutlined />,
      title: home.tools.ecc.title,
      description: home.tools.ecc.description,
      path: '/ecc-encryption',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      category: 'asymmetric',
      keywords: ['ecc', 'ecdsa', 'elliptic curve', 'secp256k1', 'signature', 'bitcoin'],
    },
    {
      icon: <SafetyOutlined />,
      title: home.tools.rsaDer.title,
      description: home.tools.rsaDer.description,
      path: '/rsa-der-public-key',
      color: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
      category: 'asymmetric',
      keywords: ['rsa', 'der', 'asn1', 'public key', 'pem', 'modulus', 'exponent'],
    },
    // Payment/Finance Tools
    {
      icon: <SafetyCertificateOutlined />,
      title: home.tools.tr31.title,
      description: home.tools.tr31.description,
      path: '/tr31-calculator',
      color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      category: 'payment',
      keywords: ['tr31', 'key block', 'ansi', 'key management', 'hsm', 'payment'],
    },
    {
      icon: <CalculatorOutlined />,
      title: home.tools.kcv.title,
      description: home.tools.kcv.description,
      path: '/kcv-calculator',
      color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      category: 'payment',
      keywords: ['kcv', 'key check value', 'verification', 'des', 'aes'],
    },
    {
      icon: <AppstoreOutlined />,
      title: home.tools.pinBlock.title,
      description: home.tools.pinBlock.description,
      path: '/pin-block-generator',
      color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      category: 'payment',
      keywords: ['pin block', 'iso 9564', 'format 0', 'format 1', 'format 3', 'format 4', 'atm', 'pos'],
    },
    {
      icon: <KeyOutlined />,
      title: home.tools.keyGenerator.title,
      description: home.tools.keyGenerator.description,
      path: '/key-generator',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      category: 'payment',
      keywords: ['key generator', 'random', 'des', 'aes', 'key component', 'xor'],
    },
    {
      icon: <ReadOutlined />,
      title: home.tools.messageParser.title,
      description: home.tools.messageParser.description,
      path: '/message-parser',
      color: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      category: 'payment',
      keywords: ['message parser', 'ndc', 'wincor', 'iso 8583', 'atm', 'financial'],
    },
    // Encoding Tools
    {
      icon: <SwapOutlined />,
      title: home.tools.encoding.title,
      description: home.tools.encoding.description,
      path: '/character-encoding',
      color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      category: 'encoding',
      keywords: ['encoding', 'ascii', 'ebcdic', 'hex', 'binary', 'character'],
    },
    {
      icon: <FieldBinaryOutlined />,
      title: home.tools.bcd.title,
      description: home.tools.bcd.description,
      path: '/bcd',
      color: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
      category: 'encoding',
      keywords: ['bcd', 'binary coded decimal', 'packed', 'unpacked'],
    },
    {
      icon: <FileTextOutlined />,
      title: home.tools.base64.title,
      description: home.tools.base64.description,
      path: '/base64',
      color: 'linear-gradient(135deg, #c1dfc4 0%, #deecdd 100%)',
      category: 'encoding',
      keywords: ['base64', 'encode', 'decode', 'binary', 'text'],
    },
    {
      icon: <CodeOutlined />,
      title: home.tools.base94.title,
      description: home.tools.base94.description,
      path: '/base94',
      color: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
      category: 'encoding',
      keywords: ['base94', 'encode', 'decode', 'compact'],
    },
    {
      icon: <FileSearchOutlined />,
      title: home.tools.asn1.title,
      description: home.tools.asn1.description,
      path: '/asn1-parser',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      category: 'encoding',
      keywords: ['asn1', 'der', 'ber', 'x509', 'certificate', 'pkcs'],
    },
    // Hashing Tools
    {
      icon: <NumberOutlined />,
      title: home.tools.hash.title,
      description: home.tools.hash.description,
      path: '/hashes',
      color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      category: 'hashing',
      keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'blake2', 'ripemd', 'checksum'],
    },
    {
      icon: <CheckCircleOutlined />,
      title: home.tools.checkDigits.title,
      description: home.tools.checkDigits.description,
      path: '/check-digits',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      category: 'hashing',
      keywords: ['check digit', 'luhn', 'mod 10', 'mod 9', 'credit card', 'validation'],
    },
    {
      icon: <ThunderboltOutlined />,
      title: home.tools.uuid.title,
      description: home.tools.uuid.description,
      path: '/uuid',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      category: 'hashing',
      keywords: ['uuid', 'guid', 'unique', 'identifier', 'v1', 'v4', 'v5'],
    },
  ];

  // 分类定义
  const categories: { key: Category; label: string; color: string }[] = [
    { key: 'all', label: home.categories?.all || 'All', color: '#722ed1' },
    { key: 'symmetric', label: home.categories?.symmetric || 'Symmetric', color: '#1677ff' },
    { key: 'asymmetric', label: home.categories?.asymmetric || 'Asymmetric', color: '#722ed1' },
    { key: 'payment', label: home.categories?.payment || 'Payment', color: '#faad14' },
    { key: 'encoding', label: home.categories?.encoding || 'Encoding', color: '#13c2c2' },
    { key: 'hashing', label: home.categories?.hashing || 'Hashing', color: '#52c41a' },
  ];

  // 过滤工具
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // 分类过滤
      if (activeCategory !== 'all' && tool.category !== activeCategory) {
        return false;
      }
      // 搜索过滤
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const matchTitle = tool.title.toLowerCase().includes(search);
        const matchDesc = tool.description.toLowerCase().includes(search);
        const matchKeywords = tool.keywords.some(kw => kw.includes(search));
        return matchTitle || matchDesc || matchKeywords;
      }
      return true;
    });
  }, [tools, activeCategory, searchTerm]);

  // 搜索并跳转
  const handleSearch = (value: string) => {
    if (value.trim()) {
      const search = value.toLowerCase().trim();
      // 找到第一个匹配的工具
      const match = tools.find(tool => {
        const matchTitle = tool.title.toLowerCase().includes(search);
        const matchKeywords = tool.keywords.some(kw => kw.includes(search));
        return matchTitle || matchKeywords;
      });
      if (match) {
        navigate(match.path);
      }
    }
  };

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {seo.usage.map((text, index) => (
            <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 12 }}>
              {text}
            </Paragraph>
          ))}
        </div>
      }
    >
      {/* Hero Section with Search */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 48,
        padding: '48px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        color: '#fff'
      }}>
        <Title level={1} style={{ color: '#fff', marginBottom: 16, fontSize: 'clamp(28px, 5vw, 42px)' }}>
          HSM Kit
        </Title>
        <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, marginBottom: 24 }}>
          {home.heroTitle}
        </Title>
        <Paragraph style={{ 
          color: 'rgba(255,255,255,0.85)', 
          fontSize: 16, 
          maxWidth: 700, 
          margin: '0 auto 32px',
          lineHeight: 1.8
        }}>
          {home.heroDescription}
        </Paragraph>
        
        {/* Search Bar */}
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          <Input.Search
            placeholder={home.searchPlaceholder || 'Search tools...'}
            size="large"
            enterButton={<SearchOutlined style={{ fontSize: 18 }} />}
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ 
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {categories.map(cat => (
          <Tag
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            style={{
              cursor: 'pointer',
              padding: '6px 16px',
              fontSize: 14,
              borderRadius: 20,
              border: activeCategory === cat.key ? 'none' : '1px solid #d9d9d9',
              background: activeCategory === cat.key ? cat.color : (isDark ? '#2a2a2a' : '#fff'),
              color: activeCategory === cat.key ? '#fff' : (isDark ? '#e6e6e6' : '#595959'),
              transition: 'all 0.2s',
            }}
          >
            {cat.label}
          </Tag>
        ))}
      </div>

      {/* Tools Grid */}
      <Title level={3} style={{ marginBottom: 24, color: isDark ? '#e6e6e6' : '#1e293b' }}>
        🔧 {home.availableTools} {filteredTools.length < tools.length && `(${filteredTools.length})`}
      </Title>
      <Row gutter={[24, 24]}>
        {filteredTools.map((tool, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <ToolCard {...tool} isDark={isDark} />
          </Col>
        ))}
      </Row>

      {/* No Results */}
      {filteredTools.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px',
          background: isDark ? '#1f1f1f' : '#fafafa',
          borderRadius: 12 
        }}>
          <Text type="secondary" style={{ fontSize: 16 }}>
            No tools found. Try a different search term.
          </Text>
        </div>
      )}

      {/* Features Section */}
      <div style={{ marginTop: 48 }}>
        <Title level={3} style={{ marginBottom: 24, color: isDark ? '#e6e6e6' : '#1e293b' }}>
          ✨ {home.whyChoose}
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ height: '100%', background: isDark ? '#1a3a1a' : '#f0fdf4' }}>
              <Title level={5} style={{ color: isDark ? '#52c41a' : '#166534' }}>🔒 {home.features.clientSide.title}</Title>
              <Text style={{ color: isDark ? '#73d13d' : '#166534' }}>
                {home.features.clientSide.description}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ height: '100%', background: isDark ? '#111d3a' : '#eff6ff' }}>
              <Title level={5} style={{ color: isDark ? '#1890ff' : '#1e40af' }}>🆓 {home.features.free.title}</Title>
              <Text style={{ color: isDark ? '#40a9ff' : '#1e40af' }}>
                {home.features.free.description}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ height: '100%', background: isDark ? '#3a2a11' : '#fef3c7' }}>
              <Title level={5} style={{ color: isDark ? '#faad14' : '#92400e' }}>💼 {home.features.paymentReady.title}</Title>
              <Text style={{ color: isDark ? '#ffc53d' : '#92400e' }}>
                {home.features.paymentReady.description}
              </Text>
            </Card>
          </Col>
        </Row>
      </div>
    </PageLayout>
  );
};

export default HomePage;
