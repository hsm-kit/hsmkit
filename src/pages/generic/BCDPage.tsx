import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { BCDTool } from '../../components/generic';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const BCDPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.bcd || seoContent.en.bcd;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/bcd"
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
      toolName="BCD Encoder/Decoder"
      toolCategory="DeveloperApplication"
    >
      <BCDTool />
    </PageLayout>
  );
};

export default BCDPage;
