import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { CMACTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const CMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.cmac || seoContent.en.cmac;

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
        canonical="/payments-mac-cmac"
        faqs={seo.faqs}
        usageContent={seo.usage}
      >
        <Suspense fallback={<Spin size="large" />}>
          <CMACTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default CMACPage;
