import React from 'react';
import { Typography, Result } from 'antd';
import { PageLayout } from './PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

interface ToolPageProps {
  seoKey: string;
  canonical: string;
  toolName: string;
  toolCategory: string;
  children: React.ReactNode;
}

export const ToolPage: React.FC<ToolPageProps> = ({
  seoKey,
  canonical,
  toolName,
  toolCategory,
  children,
}) => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.[seoKey as keyof typeof seoContent.en] 
    || seoContent.en[seoKey as keyof typeof seoContent.en];

  if (!seo) {
    return (
      <Result
        status="warning"
        title="Content not available"
        subTitle={`SEO data for "${seoKey}" could not be loaded. Please try refreshing the page.`}
      />
    );
  }

  const seoData = seo as {
    title: string;
    description: string;
    keywords: string;
    faqTitle?: string;
    faqs?: Array<{ question: string; answer: string }>;
    usageTitle?: string;
    usage?: string[];
  };

  return (
    <PageLayout
      seoTitle={seoData.title}
      seoDescription={seoData.description}
      seoKeywords={seoData.keywords}
      canonical={canonical}
      faqTitle={seoData.faqTitle}
      faqs={seoData.faqs}
      usageTitle={seoData.usageTitle}
      usageContent={
        seoData.usage && seoData.usage.length > 0 ? (
          <div>
            {seoData.usage.map((text: string, index: number) => (
              <Paragraph 
                key={index} 
                style={{ marginBottom: index === seoData.usage!.length - 1 ? 0 : 8 }}
              >
                • {text}
              </Paragraph>
            ))}
          </div>
        ) : undefined
      }
      toolName={toolName}
      toolCategory={toolCategory}
    >
      {children}
    </PageLayout>
  );
};

export default ToolPage;
