import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import PinOffsetTool from '../../components/payment/PinOffsetTool';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const PinOffsetPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.pinOffset || seoContent.en.pinOffset;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/payments-pin-offset"
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
      toolName="PIN Offset Calculator (IBM 3624 Method)"
      toolCategory="FinanceApplication"
    >
      <PinOffsetTool />
    </PageLayout>
  );
};

export default PinOffsetPage;
