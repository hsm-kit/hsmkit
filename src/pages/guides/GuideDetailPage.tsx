import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  Typography, 
  Breadcrumb, 
  Row, 
  Col, 
  Card, 
  Button, 
  Anchor, 
  Skeleton,
  Alert,
} from 'antd';
import { 
  HomeOutlined, 
  ToolOutlined,
  ClockCircleOutlined,
  RightOutlined,
  ReadOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEO } from '../../components/common/SEO';
import { triggerPrerenderReady } from '../../utils/prerender';
import { calculateReadTime } from '../../utils/readTime';
import { getGuidesPath, getGuidesUrl } from '../../utils/guidesPath';
import { useLanguageContext as useLanguage } from '../../hooks/languageContext';
import { useTheme } from '../../hooks/useTheme';
import type { Language } from '../../locales';
import { type ArticleMeta, getCategoryIcon, getCategoryColor } from './shared';
import { GuideTag } from './GuideTag';
import {
  GUIDE_AUTHOR,
  GUIDE_REVIEWER,
  getGuideLastReviewed,
  getGuideReferences,
} from '../../data/guides/authority';

// Import article metadata
import articlesEn from '../../data/guides/en.json';
import articlesZh from '../../data/guides/zh.json';

const { Title, Text } = Typography;

interface AnchorItem {
  key: string;
  href: string;
  title: string;
}

const articlesMap: Record<string, ArticleMeta[]> = {
  en: articlesEn as ArticleMeta[],
  zh: articlesZh as ArticleMeta[],
};

const authorityLabels = {
  en: {
    author: 'Written by',
    reviewer: 'Technically reviewed by',
    lastReviewed: 'Last reviewed',
    references: 'Standards & references',
    referenceNote: 'Technical content is reviewed against the cited public standards and official documentation. Confirm licensed standards and vendor documentation before production use.',
  },
  zh: {
    author: '作者',
    reviewer: '技术审阅',
    lastReviewed: '最后审阅',
    references: '标准与参考资料',
    referenceNote: '技术内容依据所列公开标准与官方文档进行审阅。用于生产前，请同时核对已授权的标准文本和厂商文档。',
  },
};

// Dynamic import for markdown files
const importMarkdown = async (lang: Language, slug: string): Promise<string> => {
  try {
    // Try to load the localized version first
    const module = await import(`../../content/guides/${lang}/${slug}.md?raw`);
    return module.default;
  } catch {
    // Fallback to English if localized version doesn't exist
    if (lang !== 'en') {
      try {
        const enModule = await import(`../../content/guides/en/${slug}.md?raw`);
        return enModule.default;
      } catch {
        throw new Error('Article not found');
      }
    }
    throw new Error('Article not found');
  }
};

// Extract headings from markdown for TOC
const extractHeadings = (markdown: string): AnchorItem[] => {
  const headingRegex = /^#{2}\s+(.+)$/gm;
  const headings: AnchorItem[] = [];
  let match;
  let index = 0;
  
  while ((match = headingRegex.exec(markdown)) !== null) {
    const text = match[1].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
    headings.push({
      key: `heading-${index++}`,
      href: `#${id}`,
      title: text,
    });
  }
  
  return headings;
};

const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'ja', 'ko', 'de', 'fr'];

const GuideDetailPage: React.FC = () => {
  const { slug, lang } = useParams<{ slug: string; lang?: string }>();
  const location = useLocation();
  const { language: contextLanguage, setLanguage, t } = useLanguage();
  const { isDark } = useTheme();
  const guides = t.guides;

  // Determine effective language from URL or default to English
  const language: Language = useMemo(() => {
    if (lang && SUPPORTED_LANGUAGES.includes(lang as Language)) {
      return lang as Language;
    }
    // If no lang param (English route), use 'en'
    return 'en';
  }, [lang]);

  // Sync language context with URL
  useEffect(() => {
    if (language !== contextLanguage) {
      setLanguage(language);
    }
  }, [language, contextLanguage, setLanguage]);

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [prevArticle, setPrevArticle] = useState<ArticleMeta | null>(null);
  const [nextArticle, setNextArticle] = useState<ArticleMeta | null>(null);

  // Get article metadata
  const meta = useMemo(() => {
    if (!slug) return null;
    const langArticles = articlesMap[language] || articlesMap.en;
    const article = langArticles.find(a => a.slug === slug);
    // Fallback to English metadata if not found
    if (!article && language !== 'en') {
      return articlesMap.en.find(a => a.slug === slug) || null;
    }
    return article || null;
  }, [slug, language]);

  const canonical = language === 'zh' && articlesMap.zh.some(article => article.slug === slug)
    ? getGuidesUrl('zh', slug)
    : getGuidesUrl('en', slug);

  const hreflangLinks = useMemo(() => {
    const links = [{ lang: 'en', href: getGuidesUrl('en', slug) }];
    if (articlesMap.zh.some(article => article.slug === slug)) {
      links.push({ lang: 'zh', href: getGuidesUrl('zh', slug) });
    }
    links.push({ lang: 'x-default', href: getGuidesUrl('en', slug) });
    return links;
  }, [slug]);

  const references = useMemo(() => getGuideReferences(slug || ''), [slug]);
  const labels = language === 'zh' ? authorityLabels.zh : authorityLabels.en;

  // Get related articles for "Read Next" section (at least 3)
  const relatedArticles = useMemo(() => {
    if (!meta) return [];
    const langArticles = articlesMap[language] || articlesMap.en;
    
    // First, get articles from same category or with shared tags
    const related = langArticles
      .filter(a => a.slug !== slug && (a.category === meta.category || a.tags.some(tag => meta.tags.includes(tag))));
    
    // If not enough, add other articles
    if (related.length < 3) {
      const others = langArticles.filter(a => a.slug !== slug && !related.includes(a));
      return [...related, ...others].slice(0, 3);
    }
    
    return related.slice(0, 3);
  }, [meta, slug, language]);

  // Calculate prev/next articles
  useEffect(() => {
    if (!meta) return;
    const articles = articlesMap[language] || articlesMap.en;
    const currentIndex = articles.findIndex(a => a.slug === slug);
    if (currentIndex > 0) setPrevArticle(articles[currentIndex - 1]);
    else setPrevArticle(null);
    if (currentIndex < articles.length - 1) setNextArticle(articles[currentIndex + 1]);
    else setNextArticle(null);
  }, [meta, slug, language]);

  // Extract headings for TOC
  const headings = useMemo(() => extractHeadings(content), [content]);

  // Calculate reading time dynamically from content
  const readTime = useMemo(() => calculateReadTime(content), [content]);

  // Load markdown content
  useEffect(() => {
    if (!slug) return;

    const loadContent = async () => {
      setLoading(true);
      setError(null);
      setIsFallback(false);

      try {
        const md = await importMarkdown(language, slug);
        setContent(md);
        
        // Check if we're showing fallback content
        try {
          await import(`../../content/guides/${language}/${slug}.md?raw`);
        } catch {
          if (language !== 'en') {
            setIsFallback(true);
          }
        }
      } catch {
        setError('Article not found');
        setContent('');
      } finally {
        setLoading(false);
        // 内容加载完成后触发预渲染就绪事件
        setTimeout(() => {
          triggerPrerenderReady();
        }, 200);
      }
    };

    loadContent();
  }, [slug, language]);

  // Inject Article JSON-LD and BreadcrumbList Schema - useLayoutEffect ensures prerender captures it
  useLayoutEffect(() => {
    if (!meta || loading) return;

    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: meta.title,
      description: meta.excerpt,
      url: canonical,
      author: { '@type': 'Organization', name: GUIDE_AUTHOR.name, url: GUIDE_AUTHOR.url },
      reviewedBy: {
        '@type': 'Organization',
        name: GUIDE_REVIEWER.name,
        url: GUIDE_REVIEWER.url,
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://hsmkit.com/#organization',
        name: 'HSM Kit',
        url: 'https://hsmkit.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://hsmkit.com/favicon-512.png',
          width: 512,
          height: 512,
        },
      },
      datePublished: meta.publishDate,
      dateModified: meta.lastModified,
      citation: references.map(reference => ({
        '@type': 'CreativeWork',
        name: reference.title,
        publisher: reference.publisher,
        url: reference.url,
      })),
      mainEntityOfPage: canonical,
      isPartOf: {
        '@type': 'CollectionPage',
        name: 'HSM Kit Guides',
        url: `https://hsmkit.com${getGuidesPath(language)}`,
      },
      articleSection: meta.category,
      wordCount: content?.split(/\s+/).length || 0,
      inLanguage: language === 'en' ? 'en' : language,
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hsmkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `https://hsmkit.com${getGuidesPath(language)}` },
        { '@type': 'ListItem', position: 3, name: meta.title, item: `https://hsmkit.com${location.pathname}` },
      ],
    };

    const articleScript = document.createElement('script');
    articleScript.type = 'application/ld+json';
    articleScript.id = 'article-schema';
    articleScript.textContent = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.id = 'breadcrumb-schema';
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    return () => {
      const articleEl = document.getElementById('article-schema');
      if (articleEl) articleEl.remove();
      const breadcrumbEl = document.getElementById('breadcrumb-schema');
      if (breadcrumbEl) breadcrumbEl.remove();
    };
  }, [meta, loading, content, language, location.pathname, canonical, references]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!slug) {
    return <div>{guides.invalidArticle || 'Invalid article'}</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Title level={2}>{guides.articleNotFound || 'Article Not Found'}</Title>
        <Text type="secondary">{guides.articleNotFoundDesc || 'The requested article could not be found.'}</Text>
        <div style={{ marginTop: 24 }}>
          <Link to={getGuidesPath('en')}>
            <Button type="primary">
              {guides.backToGuides || 'Back to Guides'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={meta ? `${meta.title} - HSM Kit Guides` : 'HSM Kit Guides'}
        description={meta?.excerpt || guides.seoDescription || ''}
        keywords={meta?.tags.join(', ')}
        canonical={canonical}
        alternates={hreflangLinks}
        ogType="article"
        ogLocale={language === 'zh' ? 'zh_CN' : 'en_US'}
        ogImage={`https://hsmkit.com/og/guides/${language === 'zh' ? 'zh' : 'en'}/${slug}.png`}
        ogImageWidth={1200}
        ogImageHeight={630}
        ogImageAlt={meta?.title}
        articlePublishedTime={meta?.publishDate}
        articleModifiedTime={meta?.lastModified}
        articleSection={meta?.category}
        noindex={isFallback}
        prerenderReady={false}
      />

      {/* T-Layout: Full-width Header Section */}
      <div className="guide-detail-hero" style={{
        background: 'var(--card-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '48px 0 40px',
        marginBottom: 40,
        marginLeft: -24,
        marginRight: -24,
        marginTop: -24,
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          {/* Breadcrumb with category */}
          <Breadcrumb
            items={[
              { 
                title: (
                  <Link to="/" style={{ color: isDark ? '#8c8c8c' : '#595959' }}>
                    <HomeOutlined style={{ marginRight: 4 }} />
                    {guides.home || 'Home'}
                  </Link>
                ),
              },
              { title: <Link to={getGuidesPath(language)} style={{ color: isDark ? '#8c8c8c' : '#595959' }}>{guides.title || 'Guides'}</Link> },
              { 
                title: (
                  <span style={{ color: getCategoryColor(meta?.category || '') }}>
                    {guides.articleCategories?.[meta?.category as keyof typeof guides.articleCategories] || meta?.category}
                  </span>
                ) 
              },
            ]}
            style={{ marginBottom: 24 }}
          />

          {loading ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : meta && (
            <>
              {/* Large Title */}
              <Title 
                level={1} 
                style={{ 
                  marginBottom: 20, 
                  fontSize: 'clamp(28px, 4vw, 40px)',
                  lineHeight: 1.3,
                  color: 'var(--text-primary)',
                }}
              >
                {meta.title}
              </Title>

              {/* Tags - below title, above meta */}
              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                {/* Category Tag - colored, prominent */}
                <GuideTag
                  color={getCategoryColor(meta.category)}
                  style={{ 
                    fontSize: 14,
                  }}
                >
                  {getCategoryIcon(meta.category, 14)}
                  <span>{guides.articleCategories?.[meta.category as keyof typeof guides.articleCategories] || meta.category}</span>
                </GuideTag>
                
                {/* Topic Tags - subtle */}
                {meta.tags.slice(0, 4).map(tag => (
                  <GuideTag
                    key={tag} 
                    subtle
                  >
                    # {guides.tags?.[tag as keyof typeof guides.tags] || tag}
                  </GuideTag>
                ))}
              </div>

              {/* Authorship and review metadata */}
              <div className="guide-authority-meta" style={{ fontSize: 14, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
                <span><TeamOutlined style={{ marginRight: 6 }} />{labels.author} <a href={GUIDE_AUTHOR.url}>{GUIDE_AUTHOR.name}</a></span>
                <span><SafetyCertificateOutlined style={{ marginRight: 6 }} />{labels.reviewer} <a href={GUIDE_REVIEWER.url}>{GUIDE_REVIEWER.name}</a></span>
                <span><CalendarOutlined style={{ marginRight: 6 }} />{labels.lastReviewed}: {formatDate(getGuideLastReviewed(meta.lastModified))}</span>
                <span><ClockCircleOutlined style={{ marginRight: 6 }} />{readTime} {t.guides?.minRead || 'min read'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Area: Left-Right Split */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={64}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 15 }} />
            ) : (
              <>
                {/* Fallback Notice */}
                {isFallback && (
                  <Alert
                    message={guides.translationNotice || 'This article is displayed in English. Translation is coming soon.'}
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}

                {/* Tool CTA Banner */}
                {meta?.relatedTool && (
                  <Card
                    className="guide-tool-cta"
                    style={{ 
                      background: isDark ? '#1a2a4a' : 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)', 
                      borderColor: isDark ? '#2a3a5a' : '#adc6ff', 
                      marginBottom: 32,
                      borderRadius: 12,
                    }}
                    styles={{ 
                      body: { 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '20px 24px',
                        flexWrap: 'wrap',
                        gap: 16,
                      } 
                    }}
                  >
                    <div>
                      <div className="guide-tool-cta-title" style={{ fontWeight: 600, fontSize: 16 }}>
                        <ToolOutlined style={{ marginRight: 8 }} />
                        {guides.needToCalculate || 'Need to calculate this now?'}
                      </div>
                      <div className="guide-tool-cta-description" style={{ marginTop: 4 }}>
                        {(guides.useOurTool || 'Use our free online {toolName} tool.').replace('{toolName}', meta.relatedToolName || '')}
                      </div>
                    </div>
                    <a href={meta.relatedTool}>
                      <Button type="primary" size="large">{guides.openTool || 'Open Tool'} <RightOutlined /></Button>
                    </a>
                  </Card>
                )}

                {/* Article Content */}
                <div className="article-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Add IDs to h2 for anchor links
                      h2: ({ children }) => {
                        const text = String(children);
                        const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
                        return <h2 id={id}>{children}</h2>;
                      },
                      h3: ({ children }) => {
                        const text = String(children);
                        const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '');
                        return <h3 id={id}>{children}</h3>;
                      },
                      // Style code blocks
                      code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        if (isInline) {
                          return <code {...props}>{children}</code>;
                        }
                        return (
                          <pre className={className}>
                            <code {...props}>{children}</code>
                          </pre>
                        );
                      },
                      // Style tables
                      table: ({ children }) => (
                        <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                          <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse',
                            border: `1px solid ${isDark ? '#303030' : '#e5e7eb'}`,
                          }}>
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th style={{ 
                          padding: '12px 16px', 
                          textAlign: 'left',
                          background: isDark ? '#2a2a2a' : '#f5f5f5',
                          borderBottom: `1px solid ${isDark ? '#303030' : '#e5e7eb'}`,
                          fontWeight: 600,
                        }}>
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td style={{ 
                          padding: '12px 16px',
                          borderBottom: `1px solid ${isDark ? '#303030' : '#e5e7eb'}`,
                        }}>
                          {children}
                        </td>
                      ),
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>

                <Card className="guide-references" style={{ marginTop: 40, borderRadius: 8 }}>
                  <Title level={3} style={{ marginTop: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SafetyCertificateOutlined style={{ color: 'var(--primary-color)' }} />
                    <span>{labels.references}</span>
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16, lineHeight: 1.7 }}>
                    {labels.referenceNote}
                  </Text>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {references.map(reference => (
                      <li key={reference.url} style={{ marginBottom: 8 }}>
                        <a href={reference.url} target="_blank" rel="noreferrer">
                          {reference.title}
                          <LinkOutlined style={{ marginLeft: 6, fontSize: 12 }} />
                        </a>
                        <Text type="secondary"> — {reference.publisher}</Text>
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Bottom CTA */}
                {meta?.relatedTool && (
                  <Card
                    className="guide-tool-cta"
                    style={{ 
                      background: isDark ? '#1a2a4a' : 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)', 
                      borderColor: isDark ? '#2a3a5a' : '#adc6ff', 
                      marginTop: 48,
                      borderRadius: 12,
                    }}
                    styles={{ 
                      body: { 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '20px 24px',
                        flexWrap: 'wrap',
                        gap: 16,
                      } 
                    }}
                  >
                    <div>
                      <div className="guide-tool-cta-title" style={{ fontWeight: 600, fontSize: 16 }}>
                        <ToolOutlined style={{ marginRight: 8 }} />
                        {guides.relatedTool || 'Related Tool'}
                      </div>
                      <div className="guide-tool-cta-description" style={{ marginTop: 4 }}>
                        {meta.relatedToolName}
                      </div>
                    </div>
                    <a href={meta.relatedTool}>
                      <Button type="primary" size="large">{guides.openTool || 'Open Tool'} <RightOutlined /></Button>
                    </a>
                  </Card>
                )}

                {/* Prev/Next Navigation */}
                {(prevArticle || nextArticle) && (
                  <div className="article-pagination" style={{
                    marginTop: 64, 
                    paddingTop: 40, 
                    borderTop: `1px solid ${isDark ? '#303030' : '#e5e7eb'}`,
                  }}>
                    {prevArticle ? (
                      <Link 
                        to={getGuidesPath(language, prevArticle.slug)} 
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="article-pagination-card" style={{
                          padding: '16px 20px',
                          borderRadius: 8,
                          background: 'var(--surface-muted)',
                          border: '1px solid var(--border-color)',
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ fontSize: 12, color: isDark ? '#8c8c8c' : '#999', marginBottom: 4 }}>
                            {t.guides?.previousArticle || '← Previous'}
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, overflowWrap: 'anywhere' }}>
                            {prevArticle.title}
                          </div>
                        </div>
                      </Link>
                    ) : <div className="article-pagination__spacer" />}
                    
                    {nextArticle ? (
                      <Link 
                        to={getGuidesPath(language, nextArticle.slug)} 
                        style={{ textDecoration: 'none', textAlign: 'right' }}
                      >
                        <div className="article-pagination-card" style={{
                          padding: '16px 20px',
                          borderRadius: 8,
                          background: 'var(--surface-muted)',
                          border: '1px solid var(--border-color)',
                          transition: 'all 0.2s',
                        }}>
                          <div style={{ fontSize: 12, color: isDark ? '#8c8c8c' : '#999', marginBottom: 4 }}>
                            {t.guides?.nextArticle || 'Next →'}
                          </div>
                          <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500, overflowWrap: 'anywhere' }}>
                            {nextArticle.title}
                          </div>
                        </div>
                      </Link>
                    ) : <div className="article-pagination__spacer" />}
                  </div>
                )}

                {/* Read Next Section */}
                {relatedArticles.length > 0 && (
                  <div className="guide-related-section" style={{
                    borderTop: `1px solid ${isDark ? '#303030' : '#e5e7eb'}` 
                  }}>
                    <Title
                      level={3}
                      className="guides-read-next-title"
                      style={{
                        marginBottom: 6,
                        color: isDark ? '#e6e6e6' : '#1f1f1f',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <ReadOutlined aria-hidden="true" />
                      <span>{language === 'zh' ? '相关指南' : 'Related Guides'}</span>
                    </Title>
                    <Text type="secondary" className="guide-related-description">
                      {language === 'zh'
                        ? '根据当前主题与相关标准推荐的延伸阅读。'
                        : 'Further reading selected by shared topics and standards.'}
                    </Text>
                    <Row gutter={[16, 16]} className="guides-read-next">
                      {relatedArticles.map(article => (
                        <Col xs={24} sm={12} md={8} key={article.slug}>
                          <Link to={getGuidesPath(language, article.slug)} style={{ textDecoration: 'none' }}>
                            <Card
                              hoverable
                              style={{
                                borderRadius: 8,
                                height: '100%',
                                border: isDark ? '1px solid #303030' : '1px solid #e5e7eb',
                                background: isDark ? '#1f1f1f' : '#fff',
                              }}
                              styles={{ body: { padding: 16 } }}
                            >
                              <div style={{ 
                                color: getCategoryColor(article.category), 
                                fontSize: 12, 
                                fontWeight: 600,
                                marginBottom: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                              }}>
                                {getCategoryIcon(article.category, 12)}
                                <span>{guides.articleCategories?.[article.category as keyof typeof guides.articleCategories] || article.category}</span>
                              </div>
                              <Title 
                                level={5} 
                                style={{ 
                                  marginBottom: 8, 
                                  color: isDark ? '#e6e6e6' : '#1f1f1f',
                                }}
                                ellipsis={{ rows: 2 }}
                              >
                                {article.title}
                              </Title>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {article.readTime} {t.guides?.minRead || 'min read'}
                              </Text>
                            </Card>
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </>
            )}
          </Col>

          {/* Right Sidebar - TOC */}
          <Col xs={0} lg={8}>
            <div style={{ 
              position: 'sticky', 
              top: 88,
            }}>
              {loading ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : headings.length > 0 && (
                <nav className="guide-toc-sidebar" aria-label={t.guides?.onThisPage || 'On this page'}>
                  <div className="guide-toc-title" style={{
                    fontWeight: 'bold', 
                    marginBottom: 16, 
                    fontSize: 14,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {t.guides?.onThisPage || 'On this page'}
                  </div>
                  <Anchor
                    targetOffset={100}
                    items={headings}
                    className="guide-toc-anchor"
                    style={{ background: 'transparent' }}
                  />
                </nav>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default GuideDetailPage;
