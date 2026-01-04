import React, { useState } from 'react';
import { Typography, Card } from 'antd';
import { FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/common/PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Paragraph, Text } = Typography;

const TermsOfServicePage: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const content = t.termsOfService;
  const currentYear = new Date().getFullYear();
  const [isBackHovered, setIsBackHovered] = useState(false);

  return (
    <PageLayout
      seoTitle={content?.seoTitle || 'Terms of Service | HSM Kit'}
      seoDescription={content?.seoDescription || 'Terms of Service for HSM Kit'}
      seoKeywords={content?.seoKeywords || 'terms of service, HSM Kit'}
      canonical="https://hsmkit.com/terms-of-service"
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
            {content.backToHome || 'Back to Home'}
          </Link>

          {/* Title with icon - better alignment */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileTextOutlined style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <Title level={2} style={{ margin: 0, fontSize: 28, lineHeight: 1.2 }}>
              {content.title}
            </Title>
          </div>

          {/* Last updated - moved below title */}
          <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 36 }}>
            {content.lastUpdated}: {content.lastUpdatedDate.replace('{year}', String(currentYear))}
          </Text>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.acceptanceTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.acceptanceContent}</Paragraph>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.useOfServiceTitle}</Title>
            <Paragraph style={{ lineHeight: 1.8 }}>{content.useOfServiceIntro}</Paragraph>
            <ul style={{ paddingLeft: 24, margin: 0 }}>
              <li style={{ marginBottom: 8, lineHeight: 1.8 }}>
                <Text strong>{content.licenseTitle}:</Text> {content.licenseContent}
              </li>
              <li style={{ lineHeight: 1.8 }}>
                <Text strong>{content.restrictionsTitle}:</Text> {content.restrictionsContent}
                <ul style={{ paddingLeft: 24, marginTop: 8 }}>
                  <li style={{ marginBottom: 4, lineHeight: 1.8 }}>{content.restriction1}</li>
                  <li style={{ marginBottom: 4, lineHeight: 1.8 }}>{content.restriction2}</li>
                  <li style={{ lineHeight: 1.8 }}>{content.restriction3}</li>
                </ul>
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.intellectualPropertyTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.intellectualPropertyContent}</Paragraph>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.disclaimerTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.disclaimerContent}</Paragraph>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.limitationTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.limitationContent}</Paragraph>
          </section>

          <section style={{ marginBottom: 40 }}>
            <Title level={4} style={{ marginBottom: 12 }}>{content.changesTitle}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>{content.changesContent}</Paragraph>
          </section>

          {/* Contact section */}
          <section>
            <Title level={4} style={{ marginBottom: 12 }}>{content.contactTitle || 'Questions?'}</Title>
            <Paragraph style={{ marginBottom: 0, lineHeight: 1.8 }}>
              {content.contactContent || 'If you have any questions about these Terms, please contact us at '}
              <a href="mailto:contact@hsmkit.com" style={{ color: '#667eea' }}>contact@hsmkit.com</a>
            </Paragraph>
          </section>
        </Card>
      </div>
    </PageLayout>
  );
};

export default TermsOfServicePage;

