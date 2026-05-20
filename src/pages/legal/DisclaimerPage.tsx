import React from 'react';
import { Typography, Alert } from 'antd';
import {
  FileProtectOutlined,
  WarningOutlined,
  StopOutlined,
  SafetyCertificateOutlined,
  AuditOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { LegalPageLayout } from '../../components/common/LegalPageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Paragraph } = Typography;

const DisclaimerPage: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const content = t.disclaimer;
  const currentYear = new Date().getFullYear();

  return (
    <LegalPageLayout
      seoTitle={content?.seoTitle}
      seoDescription={content?.seoDescription}
      seoKeywords={content?.seoKeywords}
      canonical="https://hsmkit.com/disclaimer"
      icon={<FileProtectOutlined style={{ fontSize: 24, color: '#fff' }} />}
      iconGradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
      title={content.title}
      lastUpdated={content.lastUpdated}
      lastUpdatedDate={content.lastUpdatedDate.replace('{year}', String(currentYear))}
    >
      <section className="legal-section">
        <Alert
          message={content.securityWarningTitle}
          description={content.securityWarningContent}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{
            marginBottom: 32,
            borderRadius: 10,
            border: isDark ? '1px solid #614e0a' : undefined,
          }}
        />
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FileProtectOutlined />
          </span>
          {content.generalTitle}
        </h4>
        <Paragraph>{content.generalContent}</Paragraph>
        <div
          className="legal-highlight"
          style={{
            background: isDark ? 'rgba(102, 126, 234, 0.08)' : 'rgba(102, 126, 234, 0.05)',
            borderColor: '#667eea',
            color: isDark ? '#a0b0f0' : '#1d39c4',
          }}
        >
          This tool is intended for educational, testing, and development purposes only.
        </div>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%)' }}>
            <StopOutlined />
          </span>
          {content.noLiabilityTitle}
        </h4>
        <Paragraph>{content.noLiabilityContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <SafetyCertificateOutlined />
          </span>
          {content.securityTitle}
        </h4>
        <Paragraph>{content.securityContent}</Paragraph>
        <div
          className="legal-highlight"
          style={{
            background: isDark ? 'rgba(250, 112, 154, 0.08)' : 'rgba(250, 112, 154, 0.05)',
            borderColor: '#fa709a',
            color: isDark ? '#f0a0c0' : '#a8071a',
          }}
        >
          Never use real production keys, sensitive data, or live credentials on this website.
        </div>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <AuditOutlined />
          </span>
          {content.complianceTitle}
        </h4>
        <Paragraph>{content.complianceContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}>
            <MailOutlined />
          </span>
          {content.contactTitle}
        </h4>
        <Paragraph>
          {content.contactContent}
          <a href="mailto:contact@hsmkit.com" style={{ color: '#667eea', fontWeight: 500 }}>contact@hsmkit.com</a>
        </Paragraph>
      </section>
    </LegalPageLayout>
  );
};

export default DisclaimerPage;
