import React, { Suspense } from 'react';
import { Spin } from 'antd';
import { PageLayout, SEO } from '../../components/common';
import { AS2805MACTool } from '../../components/mac';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const AS2805MACPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.as2805Mac || seoContent.en.as2805Mac;

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonical="/payments-mac-as2805"
      />
      <PageLayout
        seoTitle={seo.title}
        seoDescription={seo.description}
        seoKeywords={seo.keywords}
        canonical="/payments-mac-as2805"
        faqs={seo.faqs}
        usageContent={seo.usage}
      >
        <Suspense fallback={<Spin size="large" />}>
          <AS2805MACTool />
        </Suspense>
      </PageLayout>
    </>
  );
};

export default AS2805MACPage;
