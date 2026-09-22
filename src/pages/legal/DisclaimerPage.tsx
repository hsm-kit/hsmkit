import React from 'react';
import { Typography, Alert } from 'antd';
import { FileProtectOutlined, WarningOutlined } from '@ant-design/icons';
import { LegalPageLayout } from '../../components/common/LegalPageLayout';
import { useLanguage } from '../../hooks/useLanguage';

const { Paragraph } = Typography;

const DisclaimerPage: React.FC = () => {
  const { t } = useLanguage();
  const content = t.disclaimer;
  const currentYear = new Date().getFullYear();
  const sections = [
    { id: 'general-disclaimer', title: content.generalTitle },
    { id: 'no-liability', title: content.noLiabilityTitle },
    { id: 'security-warning', title: content.securityTitle },
    { id: 'compliance', title: content.complianceTitle },
    { id: 'contact', title: content.contactTitle },
  ];

  return (
    <LegalPageLayout
      seoTitle={content?.seoTitle}
      seoDescription={content?.seoDescription}
      seoKeywords={content?.seoKeywords}
      canonical="https://hsmkit.com/disclaimer"
      icon={<FileProtectOutlined />}
      title={content.title}
      lastUpdated={content.lastUpdated}
      lastUpdatedDate={content.lastUpdatedDate.replace('{year}', String(currentYear))}
      lastUpdatedDateTime={`${currentYear}-01`}
      sections={sections}
    >
      <section className="legal-section" id="security-notice">
        <Alert
          message={content.securityWarningTitle}
          description={content.securityWarningContent}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
        />
      </section>

      <section className="legal-section" id="general-disclaimer">
        <h2 className="legal-section-title">{content.generalTitle}</h2>
        <Paragraph>{content.generalContent}</Paragraph>
      </section>

      <section className="legal-section" id="no-liability">
        <h2 className="legal-section-title">{content.noLiabilityTitle}</h2>
        <Paragraph>{content.noLiabilityContent}</Paragraph>
      </section>

      <section className="legal-section" id="security-warning">
        <h2 className="legal-section-title">{content.securityTitle}</h2>
        <div className="legal-callout legal-callout-danger">{content.securityContent}</div>
      </section>

      <section className="legal-section" id="compliance">
        <h2 className="legal-section-title">{content.complianceTitle}</h2>
        <Paragraph>{content.complianceContent}</Paragraph>
      </section>

      <section className="legal-section" id="contact">
        <h2 className="legal-section-title">{content.contactTitle}</h2>
        <Paragraph>
          {content.contactContent}
          <a href="mailto:contact@hsmkit.com">contact@hsmkit.com</a>
        </Paragraph>
      </section>
    </LegalPageLayout>
  );
};

export default DisclaimerPage;
