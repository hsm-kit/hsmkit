import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { MastercardCVC3Tool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const MastercardCVC3Page: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.mastercardCvc3 || seoContent.en.mastercardCvc3;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/mastercard-cvc3-calculator"
      faqTitle={seo.faqTitle}
      faqs={seo.faqs}
      usageTitle={seo.usageTitle}
      usageContent={
        <div>
          {seo.usage.map((text, index) => (
            <Paragraph key={index} style={{ margin: '8px 0' }}>
              {text}
            </Paragraph>
          ))}
        </div>
      }
    >
      <MastercardCVC3Tool />
    </PageLayout>
  );
};

export default MastercardCVC3Page;
