import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { ANSIMACTool } from '../../components/mac';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const ANSIMACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.ansiMac || seoContent.en.ansiMac;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/payments-mac-ansix9"
      />
      <PageLayout
        seoTitle={seo.title}
        seoDescription={seo.description}
        seoKeywords={seo.keywords}
        canonical="/payments-mac-ansix9"
        faqs={seo.faqs}
        usageContent={seo.usage}
      >
        <Suspense fallback={<Spin size="large" />}>
          <ANSIMACTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default ANSIMACPage;
