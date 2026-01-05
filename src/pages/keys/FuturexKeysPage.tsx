import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common';
import { FuturexKeysTool } from '../../components/keys';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const FuturexKeysPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.futurexKeys || seoContent.en.futurexKeys;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/futurex-keys"
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
      toolName="Futurex Keys Encryption/Decryption"
      toolCategory="SecurityApplication"
    >
      <FuturexKeysTool />
    </PageLayout>
  );
};

export default FuturexKeysPage;

