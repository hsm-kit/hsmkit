import React from 'react';
import { Typography } from 'antd';
import PageLayout from '../../components/common/PageLayout';
import ThalesKeysTool from '../../components/keys/ThalesKeysTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const ThalesKeysPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.thalesKeys || seoContent.en?.thalesKeys || {
    title: 'Thales Keys Encryption/Decryption Tool',
    description: 'Encrypt and decrypt keys using Thales HSM LMK methodology with various key schemes and variants',
    keywords: ['Thales', 'HSM', 'LMK', 'Key Encryption', 'Key Decryption', 'Key Scheme', 'Variant'],
    faqTitle: 'FAQ',
    usageTitle: 'How to Use',
    faqs: [],
    usage: [],
  };

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/thales-keys"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        seo.usage && seo.usage.length > 0 ? (
          <div>
            {seo.usage.map((text: string, index: number) => (
              <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
                • {text}
              </Paragraph>
            ))}
          </div>
        ) : undefined
      }
      toolName="Thales Keys (LMK) Tool"
      toolCategory="SecurityApplication"
      aggregateRating={{ ratingValue: 4.8, ratingCount: 96 }}
    >
      <ThalesKeysTool />
    </PageLayout>
  );
};

export default ThalesKeysPage;

