import React from 'react';
import { PageLayout } from '../../components/common';
import { ANSIMACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const ANSIMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.ansiMac || seoContent.en.ansiMac;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-mac-ansix9"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {(seo.usage as string[]).map((text: string, index: number) => (
            <p key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
              {text}
            </p>
          ))}
        </div>
      }
      toolName="ANSI MAC Tools"
      toolCategory="PaymentSecurity"
    >
      <ANSIMACTool />
    </PageLayout>
  );
};

export default ANSIMACPage;
