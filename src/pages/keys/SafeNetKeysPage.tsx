import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common';
import SafeNetKeysTool from '../../components/keys/SafeNetKeysTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const SafeNetKeysPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.safenetKeys || seoContent.en.safenetKeys;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/safenet-keys"
      faqTitle={seo?.faqTitle}
      faqs={seo?.faqs}
      usageTitle={seo?.usageTitle}
      usageContent={
        seo?.usage ? (
          <div>
            {seo.usage.map((text: string, index: number) => (
              <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
                • {text}
              </Paragraph>
            ))}
          </div>
        ) : undefined
      }
      toolName="SafeNet Keys Encryption/Decryption"
      toolCategory="SecurityApplication"
    >
      <SafeNetKeysTool />
    </PageLayout>
  );
};

export default SafeNetKeysPage;

