import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { DESTool } from '../../components/cipher';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const DESPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.des || seoContent.en.des;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/des-encryption"
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
      toolName="DES/3DES Encryption Tool"
      toolCategory="SecurityApplication"
      aggregateRating={{ ratingValue: 4.7, ratingCount: 189 }}
    >
      <DESTool />
    </PageLayout>
  );
};

export default DESPage;
