import React from 'react';
import { Typography } from 'antd';
import PageLayout from '../../components/common/PageLayout';
import TR31KeyBlockTool from '../../components/keys/TR31KeyBlockTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const TR31Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.tr31 || seoContent.en.tr31;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/tr31-key-block"
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
      toolName="TR-31 Key Block Encoder/Decoder"
      toolCategory="FinanceApplication"
    >
      <TR31KeyBlockTool />
    </PageLayout>
  );
};

export default TR31Page;
