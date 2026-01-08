import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { ISO9797Tool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const ISO9797Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.iso9797Mac || seoContent.en.iso9797Mac;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="/payments-mac-iso9797-1"
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
      toolName="ISO 9797-1 MAC Calculator"
      toolCategory="SecurityApplication"
    >
      <ISO9797Tool />
    </PageLayout>
  );
};

export default ISO9797Page;
