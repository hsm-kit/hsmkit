import React from 'react';
import { Typography } from 'antd';
import { PinPVVTool } from '../../components/payment';
import PageLayout from '../../components/common/PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const PinPVVPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.pinPvv || seoContent.en.pinPvv;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-pin-pvv"
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
      toolName="PIN PVV Calculator"
      toolCategory="FinanceApplication"
    >
      <PinPVVTool />
    </PageLayout>
  );
};

export default PinPVVPage;
