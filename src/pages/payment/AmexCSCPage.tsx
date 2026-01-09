import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { AmexCSCTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const AmexCSCPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.amexCsc || seoContent.en.amexCsc;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/amex-csc-calculator"
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
      toolName="AMEX CSC Calculator and Validator"
      toolCategory="FinanceApplication"
    >
      <AmexCSCTool />
    </PageLayout>
  );
};

export default AmexCSCPage;
