import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { TDESCBCMACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const TDESCBCMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.tdesCbcMac || seoContent.en.tdesCbcMac;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/payments-mac-tdes-cbc-mac"
      />
      <PageLayout
        seoTitle={seo.title}
        seoDescription={seo.description}
        seoKeywords={seo.keywords}
        canonical="/payments-mac-tdes-cbc-mac"
        faqs={seo.faqs}
        usageContent={seo.usage}
      >
        <Suspense fallback={<Spin size="large" />}>
          <TDESCBCMACTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default TDESCBCMACPage;
