import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { BitmapTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const BitmapPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.bitmap || seoContent.en.bitmap;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/iso8583-bitmap"
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
      toolName="ISO8583 Bitmap Encoder/Decoder"
      toolCategory="FinanceApplication"
    >
      <BitmapTool />
    </PageLayout>
  );
};

export default BitmapPage;
