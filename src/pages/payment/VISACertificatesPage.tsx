import React from 'react';
import { Typography } from 'antd';
import PageLayout from '../../components/common/PageLayout';
import VISACertificatesTool from '../../components/payment/VISACertificatesTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const VISACertificatesPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.visaCertificates || seoContent.en.visaCertificates;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-visa-certificates"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {seo.usage.map((text, index) => (
            <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
              • {text}
            </Paragraph>
          ))}
        </div>
      }
      toolName="VISA Certificates Validator"
      toolCategory="SecurityApplication"
    >
      <VISACertificatesTool />
    </PageLayout>
  );
};

export default VISACertificatesPage;
