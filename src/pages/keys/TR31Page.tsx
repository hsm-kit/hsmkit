import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { TR31Analyzer } from '../../components/keys';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const TR31Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.tr31 || seoContent.en.tr31;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/tr31-calculator"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {seo.usage.map((text, index) => (
            <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
              • {text}
            </Paragraph>
          ))}
        </div>
      }
      // Schema.org properties for rich snippets
      toolName="TR-31 Key Block Parser & Analyzer"
      toolCategory="FinanceApplication"
      aggregateRating={{ ratingValue: 4.9, ratingCount: 312 }}
    >
      <TR31Analyzer />
    </PageLayout>
  );
};

export default TR31Page;
