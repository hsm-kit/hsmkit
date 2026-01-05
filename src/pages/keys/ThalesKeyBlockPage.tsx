import React from 'react';
import { Typography } from 'antd';
import PageLayout from '../../components/common/PageLayout';
import ThalesKeyBlockTool from '../../components/keys/ThalesKeyBlockTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const ThalesKeyBlockPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.thalesKeyBlock || seoContent.en.thalesKeyBlock;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/thales-key-block"
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
      toolName="Thales Key Block Tool"
      toolCategory="SecurityApplication"
    >
      <ThalesKeyBlockTool />
    </PageLayout>
  );
};

export default ThalesKeyBlockPage;

