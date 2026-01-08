import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { CMACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const CMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.cmac || seoContent.en.cmac;

  if (!seo) {
    return null;
  }

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/payments-mac-cmac"
      />
      <PageLayout
        seoTitle={seo.title}
        seoDescription={seo.description}
        seoKeywords={seo.keywords}
        canonical="https://hsmkit.com/payments-mac-cmac"
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
        toolName="CMAC Calculator"
        toolCategory="FinanceApplication"
      >
        <Suspense fallback={<Spin size="large" />}>
          <CMACTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default CMACPage;
