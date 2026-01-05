import React, { useState } from 'react';
import { Typography, Card, Alert } from 'antd';
import { WarningOutlined, FileProtectOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/common/PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Paragraph, Text } = Typography;

const DisclaimerPage: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const content = t.disclaimer;
  const currentYear = new Date().getFullYear();
  const [isBackHovered, setIsBackHovered] = useState(false);

  return (
    <PageLayout
      seoTitle={content?.seoTitle}
      seoDescription={content?.seoDescription}
      seoKeywords={content?.seoKeywords}
      canonical="https://hsmkit.com/disclaimer"
    >
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card
          style={{
            borderRadius: 12,
            background: isDark ? '#1f1f1f' : '#fff',
            border: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
          }}
        >
          {/* Back button with hover effect */}
          <Link 
            to="/"
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 20, 
              padding: '6px 12px',
              borderRadius: 6,
              color: isBackHovered ? '#667eea' : (isDark ? '#8c8c8c' : '#595959'),
              background: isBackHovered ? (isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.08)') : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              fontSize: 14,
            }}
          >
            <ArrowLeftOutlined />
            {content.backToHome}
          </Link>

          {/* Title with icon - better alignment */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileProtectOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <Title level={2} style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
              {content.title}
            </Title>
          </div>

          {/* Last updated - moved below title */}
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 28 }}>
            {content.lastUpdated}: {content.lastUpdatedDate.replace('{year}', String(currentYear))}
          </Text>

          <Alert
            message={content.securityWarningTitle}
            description={content.securityWarningContent}
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 36 }}
          />

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.generalTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.generalContent}</Paragraph>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.noLiabilityTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.noLiabilityContent}</Paragraph>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.securityTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.securityContent}</Paragraph>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.complianceTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.complianceContent}</Paragraph>
          </section>

          {/* Contact section */}
          <section>
            <Title level={4} style={{ marginBottom: 12 }}>{content.contactTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>
              {content.contactContent}
              <a href="mailto:contact@hsmkit.com" style={{ color: '#667eea' }}>contact@hsmkit.com</a>
            </Paragraph>
          </section>
        </Card>
      </div>
    </PageLayout>
  );
};

export default DisclaimerPage;

