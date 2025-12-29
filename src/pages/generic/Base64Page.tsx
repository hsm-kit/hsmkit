import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { Base64Tool } from '../../components/generic';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const Base64Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.base64 || seoContent.en.base64;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/base64"
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
      toolName="Base64 Encoder/Decoder"
      toolCategory="DeveloperApplication"
    >
      <Base64Tool />
    </PageLayout>
  );
};

export default Base64Page;
