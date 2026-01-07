import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { HMACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const HMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.hmac || seoContent.en.hmac;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/payments-mac-hmac"
      />
      <PageLayout
        seoTitle={seo.title}
        seoDescription={seo.description}
        seoKeywords={seo.keywords}
        canonical="/payments-mac-hmac"
        faqs={seo.faqs}
        usageContent={seo.usage}
      >
        <Suspense fallback={<Spin size="large" />}>
          <HMACTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default HMACPage;
