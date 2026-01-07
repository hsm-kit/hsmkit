import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { ISO9797Tool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const ISO9797Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.iso9797Mac || seoContent.en.iso9797Mac;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/payments-mac-iso9797-1"
      />
      <PageLayout
        seoTitle={seo.title}
        seoDescription={seo.description}
        seoKeywords={seo.keywords}
        canonical="/payments-mac-iso9797-1"
        faqs={seo.faqs}
        usageContent={seo.usage}
      >
        <Suspense fallback={<Spin size="large" />}>
          <ISO9797Tool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default ISO9797Page;
