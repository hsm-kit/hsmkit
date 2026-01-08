import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { DUKPTAESTool } from '../../components/payment';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const DUKPTAESPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.dukptAes || seoContent.en.dukptAes;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/dukpt-aes-calculator"
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
      <DUKPTAESTool />
    </PageLayout>
  );
};

export default DUKPTAESPage;
