import React, { useLayoutEffect } from 'react';
import { Typography, Result, Card } from 'antd';
import { ReadOutlined, RightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { PageLayout } from './PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import seoContent from '../../locales/seo';
import { getRelatedGuides, type RelatedGuide } from '../../data/toolGuidesMap';
import { getGuidesPath } from '../../utils/guidesPath';

const { Paragraph, Text, Title } = Typography;

interface ToolPageProps {
  seoKey: string;
  canonical: string;
  toolName: string;
  toolCategory: string;
  children: React.ReactNode;
}

const RelatedGuidesSection: React.FC<{
  guides: RelatedGuide[];
  language: string;
  isDark: boolean;
}> = ({ guides, language, isDark }) => {
  if (guides.length === 0) return null;

  return (
    <Card
      style={{
        marginTop: 24,
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
        background: isDark ? '#1f1f1f' : '#fff',
        border: isDark ? '1px solid #303030' : '1px solid #e8e8e8',
      }}
    >
      <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: isDark ? '#e6e6e6' : '#1a1a2e' }}>
        <ReadOutlined style={{ marginRight: 8 }} />
        Related Guides
      </Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {guides.map(guide => (
          <Link
            key={guide.slug}
            to={getGuidesPath(language as 'en' | 'zh' | 'ja' | 'ko' | 'de' | 'fr', guide.slug)}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 10,
                background: isDark ? '#262626' : '#f8f9fb',
                border: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? '#2a2a2a' : '#f0f4ff';
                e.currentTarget.style.borderColor = isDark ? '#404040' : '#c7d2fe';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDark ? '#262626' : '#f8f9fb';
                e.currentTarget.style.borderColor = isDark ? '#303030' : '#f0f0f0';
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ color: isDark ? '#e6e6e6' : '#1a1a2e', fontSize: 14, display: 'block' }}>
                  {guide.title}
                </Text>
                <Text style={{ color: isDark ? '#8c8c8c' : '#666', fontSize: 12, display: 'block', marginTop: 4 }}>
                  {guide.excerpt.slice(0, 100)}...
                </Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <Text style={{ color: isDark ? '#8c8c8c' : '#999', fontSize: 12 }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {guide.readTime} min
                </Text>
                <RightOutlined style={{ color: isDark ? '#8c8c8c' : '#999', fontSize: 12 }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
};

export const ToolPage: React.FC<ToolPageProps> = ({
  seoKey,
  canonical,
  toolName,
  toolCategory,
  children,
}) => {
  const { language } = useLanguage();
  const { isDark } = useTheme();
  const location = useLocation();
  const seo = seoContent[language]?.[seoKey as keyof typeof seoContent.en] 
    || seoContent.en[seoKey as keyof typeof seoContent.en];

  const relatedGuides = getRelatedGuides(location.pathname);

  // Inject BreadcrumbList Schema for tools - useLayoutEffect ensures prerender captures it
  useLayoutEffect(() => {
    if (!seo) return;
    
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hsmkit.com' },
        { '@type': 'ListItem', position: 2, name: seo.title, item: canonical },
      ],
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'tool-breadcrumb-schema';
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('tool-breadcrumb-schema');
      if (el) el.remove();
    };
  }, [seo, canonical]);

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
      <RelatedGuidesSection guides={relatedGuides} language={language} isDark={isDark} />
    </PageLayout>
  );
};

export default ToolPage;
