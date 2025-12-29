import React from 'react';
import { Card, Typography, Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import {
  FileSearchOutlined,
  LockOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
  CalculatorOutlined,
  AppstoreOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { PageLayout } from '../components/common/PageLayout';
import { useLanguage } from '../hooks/useLanguage';
import seoContent from '../locales/seo';

const { Title, Text, Paragraph } = Typography;

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
  color: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, path, color }) => (
  <Link to={path} style={{ textDecoration: 'none' }}>
    <Card
      hoverable
      style={{
        height: '100%',
        borderRadius: 12,
        border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
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
      <Title level={5} style={{ marginBottom: 8, color: '#1e293b' }}>{title}</Title>
      <Text type="secondary" style={{ fontSize: 13, lineHeight: 1.6 }}>{description}</Text>
    </Card>
  </Link>
);

const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const seo = seoContent[language]?.home || seoContent.en.home;
  const home = t.home;

  const tools = [
    {
      icon: <FileSearchOutlined />,
      title: home.tools.asn1.title,
      description: home.tools.asn1.description,
      path: '/asn1-parser',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      icon: <LockOutlined />,
      title: home.tools.aes.title,
      description: home.tools.aes.description,
      path: '/aes-encryption',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      icon: <LockOutlined />,
      title: home.tools.des.title,
      description: home.tools.des.description,
      path: '/des-encryption',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      icon: <SecurityScanOutlined />,
      title: home.tools.rsa.title,
      description: home.tools.rsa.description,
      path: '/rsa-encryption',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
    {
      icon: <SecurityScanOutlined />,
      title: home.tools.ecc.title,
      description: home.tools.ecc.description,
      path: '/ecc-encryption',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
    {
      icon: <LockOutlined />,
      title: home.tools.fpe.title,
      description: home.tools.fpe.description,
      path: '/fpe-encryption',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    },
    {
      icon: <KeyOutlined />,
      title: home.tools.keyGenerator.title,
      description: home.tools.keyGenerator.description,
      path: '/key-generator',
      color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: home.tools.tr31.title,
      description: home.tools.tr31.description,
      path: '/tr31-calculator',
      color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    },
    {
      icon: <CalculatorOutlined />,
      title: home.tools.kcv.title,
      description: home.tools.kcv.description,
      path: '/kcv-calculator',
      color: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    },
    {
      icon: <AppstoreOutlined />,
      title: home.tools.pinBlock.title,
      description: home.tools.pinBlock.description,
      path: '/pin-block-generator',
      color: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    },
  ];

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
      {/* Hero Section */}
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
          margin: '0 auto',
          lineHeight: 1.8
        }}>
          {home.heroDescription}
        </Paragraph>
      </div>

      {/* Tools Grid */}
      <Title level={3} style={{ marginBottom: 24, color: '#1e293b' }}>
        🔧 {home.availableTools}
      </Title>
      <Row gutter={[24, 24]}>
        {tools.map((tool, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <ToolCard {...tool} />
          </Col>
        ))}
      </Row>

      {/* Features Section */}
      <div style={{ marginTop: 48 }}>
        <Title level={3} style={{ marginBottom: 24, color: '#1e293b' }}>
          ✨ {home.whyChoose}
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ height: '100%', background: '#f0fdf4' }}>
              <Title level={5} style={{ color: '#166534' }}>🔒 {home.features.clientSide.title}</Title>
              <Text style={{ color: '#166534' }}>
                {home.features.clientSide.description}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ height: '100%', background: '#eff6ff' }}>
              <Title level={5} style={{ color: '#1e40af' }}>🆓 {home.features.free.title}</Title>
              <Text style={{ color: '#1e40af' }}>
                {home.features.free.description}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} style={{ height: '100%', background: '#fef3c7' }}>
              <Title level={5} style={{ color: '#92400e' }}>💼 {home.features.paymentReady.title}</Title>
              <Text style={{ color: '#92400e' }}>
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

