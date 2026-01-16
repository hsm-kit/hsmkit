import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Typography, 
  Breadcrumb, 
  Row, 
  Col, 
  Card, 
  Button, 
  Anchor, 
  Tag, 
  Skeleton,
  Alert,
} from 'antd';
import { 
  HomeOutlined, 
  ToolOutlined,
  ClockCircleOutlined,
  KeyOutlined,
  CreditCardOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  RightOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SEO, triggerPrerenderReady } from '../../components/common/SEO';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import type { Language } from '../../locales';

// Import article metadata
import articlesEn from '../../data/guides/en.json';
import articlesZh from '../../data/guides/zh.json';

const { Title, Text } = Typography;

interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  publishDate: string;
  lastModified: string;
  readTime: number;
  relatedTool?: string;
  relatedToolName?: string;
}

interface AnchorItem {
  key: string;
  href: string;
  title: string;
}

const articlesMap: Record<string, ArticleMeta[]> = {
  en: articlesEn as ArticleMeta[],
  zh: articlesZh as ArticleMeta[],
};

// Category colors and icons
const getCategoryColor = (category: string): string => {
  switch(category) {
    case 'Keys': return '#faad14';
    case 'Payment': return '#1677ff';
    case 'Cipher': return '#52c41a';
    case 'PKI': return '#13c2c2';
    default: return '#722ed1';
  }
};

const getCategoryIcon = (category: string) => {
  const iconStyle = { marginRight: 6 };
  switch(category) {
    case 'Keys': return <KeyOutlined style={iconStyle} />;
    case 'Payment': return <CreditCardOutlined style={iconStyle} />;
    case 'Cipher': return <LockOutlined style={iconStyle} />;
    case 'PKI': return <SafetyCertificateOutlined style={iconStyle} />;
    default: return <FileTextOutlined style={iconStyle} />;
  }
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

const GuideDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();
  const { isDark } = useTheme();
  const guides = t.guides;

  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

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

  // Extract headings for TOC
  const headings = useMemo(() => extractHeadings(content), [content]);

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
      } catch (err) {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Generate hreflang links
  const hreflangLinks = useMemo(() => {
    const languages = ['en', 'zh', 'ja', 'ko', 'de', 'fr'];
    return languages.map(lang => ({
      lang,
      href: lang === 'en' 
        ? `https://hsmkit.com/guides/${slug}`
        : `https://hsmkit.com/${lang}/guides/${slug}`,
    }));
  }, [slug]);

  if (!slug) {
    return <div>Invalid article</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <Title level={2}>Article Not Found</Title>
        <Text type="secondary">The requested article could not be found.</Text>
        <div style={{ marginTop: 24 }}>
          <Link to="/guides">
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
        canonical={`https://hsmkit.com/guides/${slug}`}
        prerenderReady={false}
      />
      
      {/* Inject hreflang links */}
      {hreflangLinks.map(({ lang, href }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={`https://hsmkit.com/guides/${slug}`} />

      {/* T-Layout: Full-width Header Section */}
      <div style={{ 
        background: isDark ? '#1f1f1f' : '#fff', 
        borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
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
              { title: <Link to="/guides" style={{ color: isDark ? '#8c8c8c' : '#595959' }}>{guides.title || 'Guides'}</Link> },
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
                  color: isDark ? '#e6e6e6' : '#1f1f1f',
                }}
              >
                {meta.title}
              </Title>

              {/* Tags - below title, above meta */}
              <div style={{ marginBottom: 20 }}>
                {/* Category Tag - colored, prominent */}
                <Tag 
                  color={getCategoryColor(meta.category)} 
                  style={{ 
                    padding: '4px 12px', 
                    fontSize: 14,
                  }}
                >
                  {getCategoryIcon(meta.category)}
                  {guides.articleCategories?.[meta.category as keyof typeof guides.articleCategories] || meta.category}
                </Tag>
                
                {/* Topic Tags - subtle */}
                {meta.tags.slice(0, 4).map(tag => (
                  <Tag 
                    key={tag} 
                    bordered={false}
                    style={{ 
                      background: isDark ? '#2a2a2a' : '#f5f5f5',
                      color: isDark ? '#a6a6a6' : '#595959',
                      marginLeft: 6,
                    }}
                  >
                    # {guides.tags?.[tag as keyof typeof guides.tags] || tag}
                  </Tag>
                ))}
              </div>

              {/* Meta info */}
              <div style={{ color: isDark ? '#a6a6a6' : '#666666', fontSize: 14 }}>
                <ClockCircleOutlined style={{ marginRight: 6 }} />
                <span>{guides.lastUpdated || 'Last Updated'}: {formatDate(meta.lastModified)}</span>
                <span style={{ margin: '0 12px' }}>•</span>
                <span>{meta.readTime} {guides.minRead || 'min read'}</span>
                <span style={{ margin: '0 12px' }}>•</span>
                <span>By HSM Kit Team</span>
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
                    message="This article is displayed in English. Translation is coming soon."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                )}

                {/* Tool CTA Banner */}
                {meta?.relatedTool && (
                  <Card 
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
                      <div style={{ fontWeight: 600, fontSize: 16, color: isDark ? '#69b1ff' : '#1d39c4' }}>
                        <ToolOutlined style={{ marginRight: 8 }} />
                        {guides.needToCalculate || 'Need to calculate this now?'}
                      </div>
                      <div style={{ color: isDark ? '#a6adb4' : '#595959', marginTop: 4 }}>
                        {(guides.useOurTool || 'Use our free online {toolName} tool.').replace('{toolName}', meta.relatedToolName || '')}
                      </div>
                    </div>
                    <Link to={meta.relatedTool}>
                      <Button type="primary" size="large">{guides.openTool || 'Open Tool'} <RightOutlined /></Button>
                    </Link>
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

                {/* Bottom CTA */}
                {meta?.relatedTool && (
                  <Card 
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
                      <div style={{ fontWeight: 600, fontSize: 16, color: isDark ? '#69b1ff' : '#1d39c4' }}>
                        <ToolOutlined style={{ marginRight: 8 }} />
                        {guides.relatedTool || 'Related Tool'}
                      </div>
                      <div style={{ color: isDark ? '#a6adb4' : '#595959', marginTop: 4 }}>
                        {meta.relatedToolName}
                      </div>
                    </div>
                    <Link to={meta.relatedTool}>
                      <Button type="primary" size="large">{guides.openTool || 'Open Tool'} <RightOutlined /></Button>
                    </Link>
                  </Card>
                )}

                {/* Read Next Section */}
                {relatedArticles.length > 0 && (
                  <div style={{ 
                    marginTop: 64, 
                    paddingTop: 40, 
                    borderTop: `1px solid ${isDark ? '#303030' : '#e5e7eb'}` 
                  }}>
                    <Title level={3} style={{ marginBottom: 24, color: isDark ? '#e6e6e6' : '#1f1f1f' }}>
                      📖 {guides.readNext || 'Read Next'}
                    </Title>
                    <Row gutter={[16, 16]}>
                      {relatedArticles.map(article => (
                        <Col xs={24} sm={12} md={8} key={article.slug}>
                          <Link to={`/guides/${article.slug}`} style={{ textDecoration: 'none' }}>
                            <Card
                              hoverable
                              style={{
                                borderRadius: 12,
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
                              }}>
                                {getCategoryIcon(article.category)}
                                {guides.articleCategories?.[article.category as keyof typeof guides.articleCategories] || article.category}
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
                                {article.readTime} {guides.minRead || 'min read'}
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
                <div style={{ 
                  borderLeft: `2px solid ${isDark ? '#303030' : '#f0f0f0'}`,
                  paddingLeft: 16,
                }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: 16, 
                    fontSize: 14,
                    color: isDark ? '#e6e6e6' : '#1f1f1f',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    {guides.onThisPage || 'On this page'}
                  </div>
                  <Anchor
                    targetOffset={100}
                    items={headings}
                    style={{ background: 'transparent' }}
                  />
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default GuideDetailPage;
