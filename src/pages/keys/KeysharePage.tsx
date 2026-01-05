import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { KeyshareGenerator } from '../../components/keys';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const KeysharePage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.keyshare || seoContent.en.keyshare;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/keyshare-generator"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {seo.usage.map((text: string, index: number) => (
            <Paragraph key={index} style={{ marginBottom: index === seo.usage.length - 1 ? 0 : 8 }}>
              • {text}
            </Paragraph>
          ))}
        </div>
      }
      toolName="Keyshare Generator"
      toolCategory="SecurityApplication"
    >
      <KeyshareGenerator />
    </PageLayout>
  );
};

export default KeysharePage;

