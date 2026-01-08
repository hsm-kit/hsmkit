import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common';
import AtallaKeysTool from '../../components/keys/AtallaKeysTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const AtallaKeysPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.atallaKeys || seoContent.en.atallaKeys;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/atalla-keys"
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
      toolName="Atalla Keys (AKB)"
      toolCategory="SecurityApplication"
    >
      <AtallaKeysTool />
    </PageLayout>
  );
};

export default AtallaKeysPage;

