import React from 'react';
import { PageLayout } from '../../components/common';
import { TDESCBCMACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const TDESCBCMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.tdesCbcMac || seoContent.en.tdesCbcMac;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-mac-tdes-cbc-mac"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {(seo.usage as string[]).map((text: string, index: number) => (
            <p key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
              • {text}
            </p>
          ))}
        </div>
      }
      toolName="TDES CBC-MAC Calculator"
      toolCategory="PaymentSecurity"
    >
      <TDESCBCMACTool />
    </PageLayout>
  );
};

export default TDESCBCMACPage;

