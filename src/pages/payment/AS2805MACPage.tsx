import React from 'react';
import { PageLayout } from '../../components/common';
import { AS2805MACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const AS2805MACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.as2805Mac || seoContent.en.as2805Mac;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-mac-as2805"
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
      toolName="AS2805 MAC Calculator"
      toolCategory="PaymentSecurity"
    >
      <AS2805MACTool />
    </PageLayout>
  );
};

export default AS2805MACPage;
