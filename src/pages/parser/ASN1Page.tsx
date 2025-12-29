import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { ASN1Parser } from '../../components/parser';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const ASN1Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.asn1 || seoContent.en.asn1;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/asn1-parser"
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
      toolName="ASN.1 Parser & DER/BER Decoder"
      toolCategory="DeveloperApplication"
      aggregateRating={{ ratingValue: 4.8, ratingCount: 167 }}
    >
      <ASN1Parser />
    </PageLayout>
  );
};

export default ASN1Page;
