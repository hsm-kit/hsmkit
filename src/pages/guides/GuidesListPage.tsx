import React, { useState, useMemo, useEffect } from 'react';
import { Card, Typography, Row, Col, Tag, Input, Empty, Button } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { getGuidesPath } from '../../utils/guidesPath';
import type { Language } from '../../locales';
import {
  FileTextOutlined,
  SearchOutlined,
  StarFilled,
  ClockCircleOutlined,
  KeyOutlined,
  CreditCardOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { PageLayout } from '../../components/common/PageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

// Import article metadata
import articlesEn from '../../data/guides/en.json';
import articlesZh from '../../data/guides/zh.json';

const { Title, Paragraph, Text } = Typography;

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

type CategoryKey = 'Keys' | 'Payment' | 'Cipher' | 'PKI';

const articlesMap: Record<string, ArticleMeta[]> = {
  en: articlesEn as ArticleMeta[],
  zh: articlesZh as ArticleMeta[],
};

// Category icon mapping
const getCategoryIcon = (category: string, size: number = 28) => {
  const iconStyle = { fontSize: size };
  switch(category) {
    case 'Keys': 
      return <KeyOutlined style={{ ...iconStyle, color: '#faad14' }} />;
    case 'Payment': 
      return <CreditCardOutlined style={{ ...iconStyle, color: '#1677ff' }} />;
    case 'Cipher': 
      return <LockOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    case 'PKI': 
      return <SafetyCertificateOutlined style={{ ...iconStyle, color: '#13c2c2' }} />;
    default: 
      return <FileTextOutlined style={{ ...iconStyle, color: '#667eea' }} />;
  }
};

// Category colors
const getCategoryColor = (category: string): string => {
  switch(category) {
    case 'Keys': return '#faad14';
    case 'Payment': return '#1677ff';
    case 'Cipher': return '#52c41a';
    case 'PKI': return '#13c2c2';
    default: return '#722ed1';
  }
};

// Article Card Component
const ArticleCard: React.FC<{ 
  article: ArticleMeta; 
  isDark: boolean; 
  guides: Record<string, unknown>;
  compact?: boolean;
  language: Language;
}> = ({ article, isDark, guides, compact = false, language }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Link to={getGuidesPath(language, article.slug)} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <Card
        hoverable
        style={{
          height: '100%',
          borderRadius: 12,
          border: isDark ? '1px solid #303030' : '1px solid #e5e7eb',
          background: isDark ? '#1f1f1f' : '#fff',
          transition: 'all 0.2s',
        }}
        styles={{ body: { padding: compact ? 16 : 20 } }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Category Icon */}
          <div style={{ 
            flex: `0 0 ${compact ? 48 : 56}px`, 
            height: compact ? 48 : 56,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: isDark ? '#2a2a4a' : '#f0f5ff', 
            borderRadius: 10,
          }}>
            {getCategoryIcon(article.category, compact ? 22 : 26)}
          </div>
          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tag 
              color={getCategoryColor(article.category)} 
              style={{ marginBottom: 6, fontSize: 11 }}
            >
              {(guides as { articleCategories?: Record<string, string> }).articleCategories?.[article.category] || article.category}
            </Tag>
            <Title 
              level={5} 
              style={{ 
                marginTop: 4, 
                marginBottom: 6, 
                color: isDark ? '#e6e6e6' : '#1e293b',
                fontSize: compact ? 14 : 15,
                lineHeight: 1.4,
              }}
              ellipsis={{ rows: 2 }}
            >
              {article.title}
            </Title>
            {!compact && (
              <Paragraph 
                type="secondary" 
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: 8, fontSize: 13, color: isDark ? '#a6a6a6' : undefined }}
              >
                {article.excerpt}
              </Paragraph>
            )}
            <div style={{ fontSize: 11, color: isDark ? '#8c8c8c' : '#999' }}>
              <ClockCircleOutlined style={{ marginRight: 4 }} />
              {formatDate(article.lastModified)} · {article.readTime} min
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// Category Section Component (Netflix-style row)
const CategorySection: React.FC<{
  title: string;
  icon: React.ReactNode;
  articles: ArticleMeta[];
  isDark: boolean;
  guides: Record<string, unknown>;
  onViewAll?: () => void;
  language: Language;
}> = ({ title, icon, articles, isDark, guides, onViewAll, language }) => {
  if (articles.length === 0) return null;

  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 20 
      }}>
        <Title level={4} style={{ margin: 0, color: isDark ? '#e6e6e6' : '#1e293b' }}>
          {icon} {title}
        </Title>
        {articles.length > 4 && onViewAll && (
          <Button 
            type="link" 
            onClick={onViewAll}
            style={{ padding: 0, height: 'auto' }}
          >
            View all <RightOutlined />
          </Button>
        )}
      </div>
      <Row gutter={[16, 16]}>
        {articles.slice(0, 4).map(article => (
          <Col xs={24} sm={12} md={12} lg={6} key={article.slug}>
            <ArticleCard article={article} isDark={isDark} guides={guides} compact language={language} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

const SUPPORTED_LANGUAGES: Language[] = ['en', 'zh', 'ja', 'ko', 'de', 'fr'];

const GuidesListPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const { language: contextLanguage, setLanguage, t } = useLanguage();
  
  // Determine effective language from URL or context
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
  const { isDark } = useTheme();
  const guides = t.guides;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  // Get articles for current language, fallback to English
  const articles = useMemo(() => {
    return articlesMap[language] || articlesMap.en;
  }, [language]);

  // Sort articles by lastModified
  const sortedArticles = useMemo(() => {
    return [...articles].sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  }, [articles]);

  // Featured articles
  const featuredArticles = useMemo(() => {
    return sortedArticles.filter(a => a.isFeatured).slice(0, 2);
  }, [sortedArticles]);

  // Articles by category
  const articlesByCategory = useMemo(() => {
    const categories: Record<CategoryKey, ArticleMeta[]> = {
      Keys: [],
      Payment: [],
      Cipher: [],
      PKI: [],
    };
    
    sortedArticles.forEach(article => {
      if (article.category in categories) {
        categories[article.category as CategoryKey].push(article);
      }
    });
    
    return categories;
  }, [sortedArticles]);

  // Search filtered articles
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return null;
    
    const search = searchTerm.toLowerCase();
    return sortedArticles.filter(article => {
      const matchTitle = article.title.toLowerCase().includes(search);
      const matchExcerpt = article.excerpt.toLowerCase().includes(search);
      const matchTags = article.tags.some(tag => tag.toLowerCase().includes(search));
      return matchTitle || matchExcerpt || matchTags;
    });
  }, [sortedArticles, searchTerm]);

  // Category filter results
  const categoryResults = useMemo(() => {
    if (!selectedCategory) return null;
    return articlesByCategory[selectedCategory];
  }, [selectedCategory, articlesByCategory]);

  const categories: { key: CategoryKey; label: string; color: string; icon: React.ReactNode }[] = [
    { key: 'Keys', label: guides.articleCategories?.Keys || 'Key Management', color: '#faad14', icon: <KeyOutlined /> },
    { key: 'Payment', label: guides.articleCategories?.Payment || 'Payment Security', color: '#1677ff', icon: <CreditCardOutlined /> },
    { key: 'Cipher', label: guides.articleCategories?.Cipher || 'Encryption', color: '#52c41a', icon: <LockOutlined /> },
    { key: 'PKI', label: guides.articleCategories?.PKI || 'PKI & Certificates', color: '#13c2c2', icon: <SafetyCertificateOutlined /> },
  ];

  // Show search results or category filter results
  const showFilteredView = searchResults !== null || selectedCategory !== null;
  const filteredArticles = searchResults || categoryResults || [];

  return (
    <PageLayout
      seoTitle={guides.seoTitle || 'Security Knowledge Base - HSM Kit Guides'}
      seoDescription={guides.seoDescription || 'In-depth guides on cryptography, payment security, and HSM management.'}
      seoKeywords={guides.seoKeywords}
      canonical="https://hsmkit.com/guides"
      toolName="Security Knowledge Base"
      toolCategory="Documentation"
    >
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 48,
        padding: '48px 24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        color: '#fff'
      }}>
        <Title level={1} style={{ color: '#fff', marginBottom: 16, fontSize: 'clamp(28px, 5vw, 42px)' }}>
          📚 {guides.title || 'Security Knowledge Base'}
        </Title>
        <Title level={3} style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 400, marginBottom: 24 }}>
          {guides.heroTagline || 'Master the concepts behind the tools.'}
        </Title>
        <Paragraph style={{ 
          color: 'rgba(255,255,255,0.85)', 
          fontSize: 16, 
          maxWidth: 700, 
          margin: '0 auto 32px',
          lineHeight: 1.8
        }}>
          {guides.subtitle || 'In-depth guides on cryptography, payment security, and HSM management.'}
        </Paragraph>
        
        {/* Search Bar */}
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px' }}>
          <Input.Search
            placeholder={guides.searchPlaceholder || 'Search guides, algorithms, or concepts...'}
            size="large"
            enterButton={<SearchOutlined style={{ fontSize: 18 }} />}
            allowClear
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) setSelectedCategory(null);
            }}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Category Quick Filters */}
      <div style={{ marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        <Tag
          onClick={() => {
            setSelectedCategory(null);
            setSearchTerm('');
          }}
          style={{
            cursor: 'pointer',
            padding: '8px 20px',
            fontSize: 14,
            borderRadius: 20,
            border: !selectedCategory ? 'none' : '1px solid #d9d9d9',
            background: !selectedCategory ? '#722ed1' : (isDark ? '#2a2a2a' : '#fff'),
            color: !selectedCategory ? '#fff' : (isDark ? '#e6e6e6' : '#595959'),
            transition: 'all 0.2s',
          }}
        >
          {guides.categories?.all || 'All'} ({articles.length})
        </Tag>
        {categories.filter(cat => articlesByCategory[cat.key].length > 0).map(cat => (
          <Tag
            key={cat.key}
            onClick={() => {
              setSelectedCategory(selectedCategory === cat.key ? null : cat.key);
              setSearchTerm('');
            }}
            style={{
              cursor: 'pointer',
              padding: '8px 20px',
              fontSize: 14,
              borderRadius: 20,
              border: selectedCategory === cat.key ? 'none' : '1px solid #d9d9d9',
              background: selectedCategory === cat.key ? cat.color : (isDark ? '#2a2a2a' : '#fff'),
              color: selectedCategory === cat.key ? '#fff' : (isDark ? '#e6e6e6' : '#595959'),
              transition: 'all 0.2s',
            }}
          >
            {cat.icon} {cat.label} ({articlesByCategory[cat.key].length})
          </Tag>
        ))}
      </div>

      {/* Filtered View (Search or Category) */}
      {showFilteredView ? (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 24 
          }}>
            <Title level={3} style={{ margin: 0, color: isDark ? '#e6e6e6' : '#1e293b' }}>
              {searchTerm 
                ? `🔍 Search Results: "${searchTerm}"` 
                : `📂 ${categories.find(c => c.key === selectedCategory)?.label}`}
            </Title>
            <Text type="secondary">{filteredArticles.length} articles</Text>
          </div>
          
          {filteredArticles.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>
                  {searchTerm 
                    ? (guides.noSearchResults || `No guides found. Try searching for 'AES' or 'Key'.`)
                    : (guides.noArticles || 'No articles found.')
                  }
                </span>
              }
              style={{ 
                padding: '48px 24px',
                background: isDark ? '#1f1f1f' : '#fafafa',
                borderRadius: 12 
              }}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {filteredArticles.map(article => (
                <Col xs={24} sm={12} md={8} lg={6} key={article.slug}>
                  <ArticleCard article={article} isDark={isDark} guides={guides} compact language={language} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      ) : (
        /* Netflix-style Category Blocks View */
        <>
          {/* Featured Section */}
          {featuredArticles.length > 0 && (
            <div style={{ marginBottom: 48 }}>
              <Title level={4} style={{ marginBottom: 20, color: isDark ? '#e6e6e6' : '#1e293b' }}>
                <StarFilled style={{ color: '#faad14', marginRight: 8 }} />
                {guides.featuredGuides || 'Featured Guides'}
              </Title>
              <Row gutter={[24, 24]}>
                {featuredArticles.map(article => (
                  <Col xs={24} md={12} key={article.slug}>
                    <Link to={getGuidesPath(language, article.slug)} style={{ textDecoration: 'none', display: 'block' }}>
                      <Card
                        hoverable
                        style={{
                          borderRadius: 16,
                          border: isDark ? '1px solid #303030' : '1px solid #e5e7eb',
                          boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.1)',
                          background: isDark 
                            ? 'linear-gradient(135deg, #1f1f1f 0%, #2a2a3a 100%)' 
                            : 'linear-gradient(135deg, #fff 0%, #f8fafc 100%)',
                        }}
                        styles={{ body: { padding: 28 } }}
                      >
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                          <div style={{ 
                            flex: '0 0 72px', 
                            height: 72,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: `linear-gradient(135deg, ${getCategoryColor(article.category)}20 0%, ${getCategoryColor(article.category)}40 100%)`,
                            borderRadius: 16,
                          }}>
                            {getCategoryIcon(article.category, 32)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ marginBottom: 8 }}>
                              <Tag color={getCategoryColor(article.category)}>
                                {guides.articleCategories?.[article.category as keyof typeof guides.articleCategories] || article.category}
                              </Tag>
                              <StarFilled style={{ color: '#faad14', marginLeft: 8 }} />
                            </div>
                            <Title level={4} style={{ marginBottom: 8, color: isDark ? '#e6e6e6' : '#1e293b' }}>
                              {article.title}
                            </Title>
                            <Paragraph 
                              type="secondary" 
                              ellipsis={{ rows: 2 }}
                              style={{ marginBottom: 12, color: isDark ? '#a6a6a6' : undefined }}
                            >
                              {article.excerpt}
                            </Paragraph>
                            <div style={{ fontSize: 12, color: isDark ? '#8c8c8c' : '#666' }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {article.readTime} {guides.minRead || 'min read'}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Category Sections (Netflix-style rows) */}
          {categories.map(cat => (
            <CategorySection
              key={cat.key}
              title={cat.label}
              icon={cat.icon}
              articles={articlesByCategory[cat.key]}
              isDark={isDark}
              guides={guides}
              onViewAll={() => setSelectedCategory(cat.key)}
              language={language}
            />
          ))}
        </>
      )}
    </PageLayout>
  );
};

export default GuidesListPage;
