import React from 'react';
import { PageLayout } from '../../components/common';
import { HMACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const HMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.hmac || seoContent.en.hmac;

  if (!seo) {
    return null;
  }

  const usageSteps = (
    <div>
      {seo.usage.map((step, index) => (
        <p key={index}>{step}</p>
      ))}
    </div>
  );

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-mac-hmac"
      faqs={seo.faqs}
      faqTitle={seo.faqTitle}
      usageContent={usageSteps}
      usageTitle={seo.usageTitle}
      toolName="HMAC Calculator"
      toolCategory="Payment MAC"
    >
      <HMACTool />
    </PageLayout>
  );
};

export default HMACPage;
