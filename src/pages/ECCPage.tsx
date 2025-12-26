import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../components/common/PageLayout';
import { ECCTool } from '../components/cipher';
import { useLanguage } from '../hooks/useLanguage';
import seoContent from '../locales/seo';

const { Paragraph } = Typography;

const ECCPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.ecc || seoContent.en.ecc;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/ecc-encryption"
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
      toolName="ECC/ECDSA Digital Signature Tool"
      toolCategory="SecurityApplication"
      aggregateRating={{ ratingValue: 4.7, ratingCount: 134 }}
    >
      <ECCTool />
    </PageLayout>
  );
};

export default ECCPage;
