import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { RetailMACTool } from '../../components/mac';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const RetailMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.retailMac || seoContent.en.retailMac;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/payments-mac-retail"
      />
      <PageLayout
        seoTitle={seo.title}
        seoDescription={seo.description}
        seoKeywords={seo.keywords}
        canonical="/payments-mac-retail"
        faqs={seo.faqs}
        usageContent={seo.usage}
      >
        <Suspense fallback={<Spin size="large" />}>
          <RetailMACTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default RetailMACPage;
