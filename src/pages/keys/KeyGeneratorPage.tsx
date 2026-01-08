import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { KeyGenerator } from '../../components/keys';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const KeyGeneratorPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.keyGenerator || seoContent.en.keyGenerator;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/key-generator"
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
      toolName="Cryptographic Key Generator"
      toolCategory="SecurityApplication"
    >
      <KeyGenerator />
    </PageLayout>
  );
};

export default KeyGeneratorPage;
