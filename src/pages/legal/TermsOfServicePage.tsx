import React from 'react';
import { Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { LegalPageLayout } from '../../components/common/LegalPageLayout';
import { useLanguage } from '../../hooks/useLanguage';

const { Paragraph, Text } = Typography;

const TermsOfServicePage: React.FC = () => {
  const { t } = useLanguage();
  const content = t.termsOfService;
  const currentYear = new Date().getFullYear();
  const sections = [
    { id: 'acceptance', title: content.acceptanceTitle },
    { id: 'use-of-service', title: content.useOfServiceTitle },
    { id: 'intellectual-property', title: content.intellectualPropertyTitle },
    { id: 'warranty-disclaimer', title: content.disclaimerTitle },
    { id: 'limitation-of-liability', title: content.limitationTitle },
    { id: 'terms-changes', title: content.changesTitle },
    { id: 'age-requirement', title: content.ageTitle },
    { id: 'governing-law', title: content.governingLawTitle },
    { id: 'contact', title: content.contactTitle },
  ];

  return (
    <LegalPageLayout
      seoTitle={content?.seoTitle}
      seoDescription={content?.seoDescription}
      seoKeywords={content?.seoKeywords}
      canonical="https://hsmkit.com/terms-of-service"
      icon={<FileTextOutlined />}
      title={content.title}
      lastUpdated={content.lastUpdated}
      lastUpdatedDate={content.lastUpdatedDate.replace('{year}', String(currentYear))}
      lastUpdatedDateTime={`${currentYear}-01`}
      sections={sections}
    >
      <section className="legal-section" id="acceptance">
        <h2 className="legal-section-title">{content.acceptanceTitle}</h2>
        <Paragraph>{content.acceptanceContent}</Paragraph>
      </section>

      <section className="legal-section" id="use-of-service">
        <h2 className="legal-section-title">{content.useOfServiceTitle}</h2>
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

      <section className="legal-section" id="intellectual-property">
        <h2 className="legal-section-title">{content.intellectualPropertyTitle}</h2>
        <Paragraph>{content.intellectualPropertyContent}</Paragraph>
      </section>

      <section className="legal-section" id="warranty-disclaimer">
        <h2 className="legal-section-title">{content.disclaimerTitle}</h2>
        <div className="legal-callout legal-callout-danger">{content.disclaimerContent}</div>
      </section>

      <section className="legal-section" id="limitation-of-liability">
        <h2 className="legal-section-title">{content.limitationTitle}</h2>
        <Paragraph>{content.limitationContent}</Paragraph>
      </section>

      <section className="legal-section" id="terms-changes">
        <h2 className="legal-section-title">{content.changesTitle}</h2>
        <Paragraph>{content.changesContent}</Paragraph>
      </section>

      <section className="legal-section" id="age-requirement">
        <h2 className="legal-section-title">{content.ageTitle}</h2>
        <Paragraph>{content.ageContent}</Paragraph>
      </section>

      <section className="legal-section" id="governing-law">
        <h2 className="legal-section-title">{content.governingLawTitle}</h2>
        <Paragraph>{content.governingLawContent}</Paragraph>
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

export default TermsOfServicePage;
