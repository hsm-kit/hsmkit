import React from 'react';
import { Typography } from 'antd';
import {
  SafetyOutlined,
  GlobalOutlined,
  DatabaseOutlined,
  CloudOutlined,
  EditOutlined,
  MailOutlined,
  MobileOutlined,
  HistoryOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { LegalPageLayout } from '../../components/common/LegalPageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Paragraph, Text } = Typography;

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const content = t.privacyPolicy;
  const currentYear = new Date().getFullYear();

  return (
    <LegalPageLayout
      seoTitle={content?.seoTitle}
      seoDescription={content?.seoDescription}
      seoKeywords={content?.seoKeywords}
      canonical="https://hsmkit.com/privacy-policy"
      icon={<SafetyOutlined style={{ fontSize: 24, color: '#fff' }} />}
      iconGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      title={content.title}
      lastUpdated={content.lastUpdated}
      lastUpdatedDate={content.lastUpdatedDate.replace('{year}', String(currentYear))}
    >
      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <GlobalOutlined />
          </span>
          {content.introTitle}
        </h4>
        <Paragraph>{content.introContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <SafetyOutlined />
          </span>
          {content.clientSideTitle}
        </h4>
        <Paragraph>{content.clientSideContent}</Paragraph>
        <div
          className="legal-highlight"
          style={{
            background: isDark ? 'rgba(67, 233, 123, 0.08)' : 'rgba(67, 233, 123, 0.06)',
            borderColor: '#43e97b',
            color: isDark ? '#a3d9a3' : '#237804',
          }}
        >
          All cryptographic operations run 100% in your browser. Your data never touches our servers.
        </div>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <DatabaseOutlined />
          </span>
          {content.dataCollectionTitle}
        </h4>
        <Paragraph>{content.dataCollectionContent}</Paragraph>
        <ul>
          <li>
            <Text strong>{content.analyticsTitle}:</Text> {content.analyticsContent}
          </li>
          <li>
            <Text strong>{content.localStorageTitle}:</Text> {content.localStorageContent}
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' }}>
            <MobileOutlined />
          </span>
          {content.pwaTitle}
        </h4>
        <Paragraph>{content.pwaContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)' }}>
            <HistoryOutlined />
          </span>
          {content.dataRetentionTitle}
        </h4>
        <Paragraph>{content.dataRetentionContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }}>
            <UserOutlined />
          </span>
          {content.gdprTitle}
        </h4>
        <Paragraph>{content.gdprContent}</Paragraph>
        <ul>
          <li>{content.gdprRight1}</li>
          <li>{content.gdprRight2}</li>
          <li>{content.gdprRight3}</li>
          <li>{content.gdprRight4}</li>
        </ul>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CloudOutlined />
          </span>
          {content.thirdPartyTitle}
        </h4>
        <Paragraph>{content.thirdPartyContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <EditOutlined />
          </span>
          {content.changesTitle}
        </h4>
        <Paragraph>{content.changesContent}</Paragraph>
      </section>

      <section className="legal-section">
        <h4 className="legal-section-title">
          <span className="legal-section-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
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

export default PrivacyPolicyPage;
