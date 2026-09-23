import React, { useEffect, useLayoutEffect } from 'react';
import { Typography, Result, Card, Button } from 'antd';
import { ReadOutlined, RightOutlined, ClockCircleOutlined, ShareAltOutlined, StarFilled, StarOutlined, AppstoreAddOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { PageLayout } from './PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import seoContent from '../../locales/seo';
import { getRelatedGuides, type RelatedGuide } from '../../data/toolGuidesMap';
import { getGuidesPath } from '../../utils/guidesPath';
import { getRelatedTools } from '../../data/toolRelations';
import { useFavoriteTools, useRecentTools } from '../../hooks/useRecentTools';
import { trackToolEvent } from '../../utils/analytics';
import { normalizePublicPath, normalizeRoutePath, normalizeSiteUrl } from '../../utils/publicUrl';
import { prefetchRoutePath } from '../../routeConfig';

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
  toolId: string;
}> = ({ guides, language, isDark, toolId }) => {
  const { t } = useLanguage();
  if (guides.length === 0) return null;

  return (
    <Card
      className="tool-page-related"
      style={{
        marginTop: 24,
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.04)',
        background: isDark ? '#1f1f1f' : '#fff',
        border: isDark ? '1px solid #303030' : '1px solid #e8e8e8',
      }}
    >
      <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: isDark ? '#e6e6e6' : '#1a1a2e' }}>
        <ReadOutlined style={{ marginRight: 8 }} />
        {t.common?.relatedGuides || 'Related Guides'}
      </Title>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {guides.map(guide => (
          <a
            key={guide.slug}
            href={getGuidesPath(language as 'en' | 'zh' | 'ja' | 'ko' | 'de' | 'fr', guide.slug)}
            onClick={() => trackToolEvent('guide_click', { toolId, targetId: guide.slug })}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="related-guide-row"
              style={{
                cursor: 'pointer',
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
                  {guide.readTime} {t.common?.minRead || 'min'}
                </Text>
                <RightOutlined style={{ color: isDark ? '#8c8c8c' : '#999', fontSize: 12 }} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
};

const getShortTitle = (title: string): string => title
  .split(/\s[|–-]\s/)[0]
  .replace(/\s+Online\b.*$/i, '')
  .replace(/(.+)在线$/, '$1')
  .trim();

export const ToolPage: React.FC<ToolPageProps> = ({
  seoKey,
  canonical,
  toolName,
  toolCategory,
  children,
}) => {
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const toast = useToast();
  const location = useLocation();
  const routePath = normalizeRoutePath(location.pathname);
  const publicPath = normalizePublicPath(location.pathname);
  const canonicalUrl = normalizeSiteUrl(canonical);
  const { addRecentTool } = useRecentTools();
  const { favoriteTools, toggleFavorite } = useFavoriteTools();
  const seo = seoContent[language]?.[seoKey as keyof typeof seoContent.en] 
    || seoContent.en[seoKey as keyof typeof seoContent.en];

  const relatedGuides = getRelatedGuides(routePath);
  const relatedTools = getRelatedTools(seoKey);
  const favorite = favoriteTools.includes(publicPath);

  useEffect(() => {
    addRecentTool(publicPath);
    let source = 'direct';
    if (document.referrer) {
      try {
        source = new URL(document.referrer).origin === window.location.origin ? 'internal' : 'external';
      } catch {
        source = 'external';
      }
    }
    trackToolEvent('tool_view', { toolId: seoKey, source });
  }, [addRecentTool, publicPath, seoKey]);

  // Inject BreadcrumbList Schema for tools - useLayoutEffect ensures prerender captures it
  useLayoutEffect(() => {
    if (!seo) return;
    
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hsmkit.com/' },
        { '@type': 'ListItem', position: 2, name: seo.title, item: canonicalUrl },
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
  }, [seo, canonicalUrl]);

  if (!seo) {
    return (
      <Result
        status="warning"
        title={t.common?.contentNotAvailable || 'Content not available'}
        subTitle={(t.common?.contentLoadError || 'SEO data for "{{seoKey}}" could not be loaded. Please try refreshing the page.').replace('{{seoKey}}', seoKey)}
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
      canonical={canonicalUrl}
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
      relatedContent={(
        <>
          <RelatedGuidesSection guides={relatedGuides} language={language} isDark={isDark} toolId={seoKey} />
          {relatedTools.length > 0 && (
            <Card className="tool-page-related-tools" style={{ marginTop: 24 }}>
              <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
                <AppstoreAddOutlined style={{ marginRight: 8 }} />
                {t.common?.relatedTools || 'Related Tools'}
              </Title>
              <div className="tool-related-grid">
                {relatedTools.map(tool => {
                  const targetSeo = (seoContent[language] as Record<string, { title?: string }> | undefined)?.[tool.seoKey]
                    || (seoContent.en as Record<string, { title?: string }>)[tool.seoKey];
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="tool-related-link"
                      onPointerEnter={() => prefetchRoutePath(tool.path)}
                      onFocus={() => prefetchRoutePath(tool.path)}
                      onTouchStart={() => prefetchRoutePath(tool.path)}
                      onClick={() => trackToolEvent('next_tool_click', { toolId: seoKey, targetId: tool.seoKey })}
                    >
                      <span>{getShortTitle(targetSeo?.title || tool.seoKey)}</span>
                      <RightOutlined />
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
      footerContent={(
        <div className="support-panel tool-page-share" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShareAltOutlined style={{ fontSize: 18, color: 'var(--primary-color)' }} />
            <Text style={{ fontSize: 14, fontWeight: 500 }}>
              {t.common?.shareTool || 'Share this tool with others'}
            </Text>
          </div>
          <Button
            type="primary"
            icon={<ShareAltOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              trackToolEvent('tool_share', { toolId: seoKey, source: 'copy_link' });
              toast.copySuccess();
            }}
          >
            {t.common?.copyLink || 'Copy Link'}
          </Button>
        </div>
      )}
      toolName={toolName}
      toolCategory={toolCategory}
    >
      <h1 className="visually-hidden">{toolName}</h1>
      <div className="tool-page-actions">
        <Button
          type="text"
          icon={favorite ? <StarFilled /> : <StarOutlined />}
          aria-pressed={favorite}
          onClick={() => {
            toggleFavorite(publicPath);
            trackToolEvent(favorite ? 'favorite_remove' : 'favorite_add', { toolId: seoKey });
          }}
        >
          {favorite ? (t.common?.removeFavorite || 'Remove favorite') : (t.common?.addFavorite || 'Add favorite')}
        </Button>
      </div>
      {children}
    </PageLayout>
  );
};

export default ToolPage;
