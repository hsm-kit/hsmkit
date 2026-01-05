import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { RSATool } from '../../components/cipher';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const RSAPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.rsa || seoContent.en.rsa;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/rsa-encryption"
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
      toolName="RSA Encryption & Key Generator"
      toolCategory="SecurityApplication"
    >
      <RSATool />
    </PageLayout>
  );
};

export default RSAPage;
