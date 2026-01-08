import React from 'react';
import PageLayout from '../../components/common/PageLayout';
import ZKATool from '../../components/payment/ZKATool';
import { useLanguage } from '../../hooks/useLanguage';

const ZKAPage: React.FC = () => {
  const { t } = useLanguage();
  const seoContent = t.seo?.zka;

  if (!seoContent) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seoContent.title}
      seoDescription={seoContent.description}
      seoKeywords={seoContent.keywords}
      canonical="https://hsmkit.com/payments-zka"
      faqTitle={seoContent.faqTitle}
      faqs={seoContent.faqs}
      usageTitle={seoContent.usageTitle}
      usageContent={
        <div>
          {seoContent.usage.map((step: string, index: number) => (
            <p key={index} style={{ marginBottom: 8 }}>
              • {step}
            </p>
          ))}
        </div>
      }
      toolName={t.mac?.zka?.title || 'ZKA Cryptographic Tool'}
      toolCategory="SecurityApplication"
    >
      <ZKATool />
    </PageLayout>
  );
};

export default ZKAPage;
