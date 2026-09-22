import React from 'react';
import { Typography } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { LegalPageLayout } from '../../components/common/LegalPageLayout';
import { useLanguage } from '../../hooks/useLanguage';

const { Paragraph, Text } = Typography;

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useLanguage();
  const content = t.privacyPolicy;
  const currentYear = new Date().getFullYear();
  const sections = [
    { id: 'introduction', title: content.introTitle },
    { id: 'client-side-processing', title: content.clientSideTitle },
    { id: 'data-collection', title: content.dataCollectionTitle },
    { id: 'progressive-web-app', title: content.pwaTitle },
    { id: 'data-retention', title: content.dataRetentionTitle },
    { id: 'privacy-rights', title: content.gdprTitle },
    { id: 'third-party-services', title: content.thirdPartyTitle },
    { id: 'policy-changes', title: content.changesTitle },
    { id: 'contact', title: content.contactTitle },
  ];

  return (
    <LegalPageLayout
      seoTitle={content?.seoTitle}
      seoDescription={content?.seoDescription}
      seoKeywords={content?.seoKeywords}
      canonical="https://hsmkit.com/privacy-policy"
      icon={<SafetyOutlined />}
      title={content.title}
      lastUpdated={content.lastUpdated}
      lastUpdatedDate={content.lastUpdatedDate.replace('{year}', String(currentYear))}
      lastUpdatedDateTime={`${currentYear}-01`}
      sections={sections}
    >
      <section className="legal-section" id="introduction">
        <h2 className="legal-section-title">{content.introTitle}</h2>
        <Paragraph>{content.introContent}</Paragraph>
      </section>

      <section className="legal-section" id="client-side-processing">
        <h2 className="legal-section-title">{content.clientSideTitle}</h2>
        <div className="legal-callout legal-callout-success">{content.clientSideContent}</div>
      </section>

      <section className="legal-section" id="data-collection">
        <h2 className="legal-section-title">{content.dataCollectionTitle}</h2>
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

      <section className="legal-section" id="progressive-web-app">
        <h2 className="legal-section-title">{content.pwaTitle}</h2>
        <Paragraph>{content.pwaContent}</Paragraph>
      </section>

      <section className="legal-section" id="data-retention">
        <h2 className="legal-section-title">{content.dataRetentionTitle}</h2>
        <Paragraph>{content.dataRetentionContent}</Paragraph>
      </section>

      <section className="legal-section" id="privacy-rights">
        <h2 className="legal-section-title">{content.gdprTitle}</h2>
        <Paragraph>{content.gdprContent}</Paragraph>
        <ul>
          <li>{content.gdprRight1}</li>
          <li>{content.gdprRight2}</li>
          <li>{content.gdprRight3}</li>
          <li>{content.gdprRight4}</li>
        </ul>
      </section>

      <section className="legal-section" id="third-party-services">
        <h2 className="legal-section-title">{content.thirdPartyTitle}</h2>
        <Paragraph>{content.thirdPartyContent}</Paragraph>
      </section>

      <section className="legal-section" id="policy-changes">
        <h2 className="legal-section-title">{content.changesTitle}</h2>
        <Paragraph>{content.changesContent}</Paragraph>
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

export default PrivacyPolicyPage;
