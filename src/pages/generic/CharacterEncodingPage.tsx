import React from 'react';
import { Typography } from 'antd';
import { PageLayout } from '../../components/common/PageLayout';
import { CharacterEncodingTool } from '../../components/generic';
import { useLanguage } from '../../hooks/useLanguage';
import seoContent from '../../locales/seo';

const { Paragraph } = Typography;

const CharacterEncodingPage: React.FC = () => {
  const { language } = useLanguage();
  const seo = seoContent[language]?.encoding || seoContent.en.encoding;

  if (!seo) {
    return null;
  }

  return (
    <PageLayout
      seoTitle={seo.title}
      seoDescription={seo.description}
      seoKeywords={seo.keywords}
      canonical="https://hsmkit.com/character-encoding"
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
      toolName="Character Encoding Converter"
      toolCategory="DeveloperApplication"
    >
      <CharacterEncodingTool />
    </PageLayout>
  );
};

export default CharacterEncodingPage;
