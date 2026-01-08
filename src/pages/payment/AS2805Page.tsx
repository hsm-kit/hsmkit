import React from 'react';
import { PageLayout } from '../../components/common/PageLayout';
import { AS2805Tool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const AS2805Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = (seoContent[language]?.as2805 || seoContent.en.as2805);
  if (!seo) {
    return null;
  }
  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-as2805"
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
      toolName="AS2805 Tools"
      toolCategory="FinanceApplication"
    >
      <AS2805Tool />
    </PageLayout>
  );
};

export default AS2805Page;
