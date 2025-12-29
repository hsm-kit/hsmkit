import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { RSADerPublicKeyTool } from '../../components/generic';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const RSADerPublicKeyPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.rsaDer || seoContent.en.rsaDer;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/rsa-der-public-key"
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
      toolName="RSA DER Public Key"
      toolCategory="DeveloperApplication"
    >
      <RSADerPublicKeyTool />
    </PageLayout>
  );
};

export default RSADerPublicKeyPage;
