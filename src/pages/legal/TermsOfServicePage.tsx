import React from 'react';
import { Typography } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  LockOutlined,
  CopyrightOutlined,
  WarningOutlined,
  SafetyOutlined,
  EditOutlined,
  MailOutlined,
  UserOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { LegalPageLayout } from '../../components/common/LegalPageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Paragraph, Text } = Typography;

const TermsOfServicePage: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const content = t.termsOfService;
  const currentYear = new Date().getFullYear();

  return (
    <LegalPageLayout
      seoTitle={content?.seoTitle}
      seoDescription={content?.seoDescription}
      seoKeywords={content?.seoKeywords}
      canonical="https://hsmkit.com/terms-of-service"
      icon={<FileTextOutlined style={{ fontSize: 24, color: '#fff' }} />}
      iconGradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      title={content.title}
      lastUpdated={content.lastUpdated}
      lastUpdatedDate={content.lastUpdatedDate.replace('{year}', String(currentYear))}
    >
      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CheckCircleOutlined />
          </span>
          {content.acceptanceTitle}
        </h4>
        <Paragraph>{content.acceptanceContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <LockOutlined />
          </span>
          {content.useOfServiceTitle}
        </h4>
        <Paragraph>{content.useOfServiceIntro}</Paragraph>
        <ul>
          <li>
            <Text strong>{content.licenseTitle}:</Text> {content.licenseContent}
          </li>
          <li>
            <Text strong>{content.restrictionsTitle}:</Text> {content.restrictionsContent}
            <ul>
              <li>{content.restriction1}</li>
              <li>{content.restriction2}</li>
              <li>{content.restriction3}</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CopyrightOutlined />
          </span>
          {content.intellectualPropertyTitle}
        </h4>
        <Paragraph>{content.intellectualPropertyContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%)' }}>
            <WarningOutlined />
          </span>
          {content.disclaimerTitle}
        </h4>
        <Paragraph>{content.disclaimerContent}</Paragraph>
        <div
          className="legal-highlight"
          style={{
            background: isDark ? 'rgba(245, 87, 108, 0.08)' : 'rgba(245, 87, 108, 0.05)',
            borderColor: '#f5576c',
            color: isDark ? '#f5a0b0' : '#a8071a',
          }}
        >
          The tools are provided "AS IS" without warranty of any kind.
        </div>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <SafetyOutlined />
          </span>
          {content.limitationTitle}
        </h4>
        <Paragraph>{content.limitationContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}>
            <EditOutlined />
          </span>
          {content.changesTitle}
        </h4>
        <Paragraph>{content.changesContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)' }}>
            <UserOutlined />
          </span>
          {content.ageTitle}
        </h4>
        <Paragraph>{content.ageContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <GlobalOutlined />
          </span>
          {content.governingLawTitle}
        </h4>
        <Paragraph>{content.governingLawContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)' }}>
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

export default TermsOfServicePage;
