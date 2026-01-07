import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import PinBlockGeneralTool from '../../components/payment/PinBlockGeneralTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const PinBlockGeneralPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.pinBlockGeneral || seoContent.en.pinBlockGeneral;

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-pin-blocks-general"
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
      toolName="PIN Block General (ISO 9564 Formats 0-4)"
      toolCategory="FinanceApplication"
    >
      <PinBlockGeneralTool />
    </PageLayout>
  );
};

export default PinBlockGeneralPage;
