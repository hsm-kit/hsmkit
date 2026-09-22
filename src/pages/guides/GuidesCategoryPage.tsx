import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { Breadcrumb, Card, Col, Row, Typography } from 'antd';
import { ClockCircleOutlined, HomeOutlined, RightOutlined } from '@ant-design/icons';
import { Link, useLocation, useParams } from 'react-router-dom';
import { SEO } from '../../components/common/SEO';
import { useLanguageContext as useLanguage } from '../../hooks/languageContext';
import type { Language } from '../../locales';
import { getGuidesPath } from '../../utils/guidesPath';
import categoriesData from '../../data/guides/categories.json';
import articlesEn from '../../data/guides/en.json';
import articlesZh from '../../data/guides/zh.json';
import { type ArticleMeta, getCategoryColor, getCategoryIcon } from './shared';
import { GuideTag } from './GuideTag';

const { Title, Paragraph } = Typography;

const articlesMap: Record<string, ArticleMeta[]> = {
  en: articlesEn as ArticleMeta[],
  zh: articlesZh as ArticleMeta[],
};

const categoryMap = new Map(categoriesData.map(category => [category.slug, category]));

const GuidesCategoryPage: React.FC = () => {
  const { lang } = useParams<{ lang?: string }>();
  const location = useLocation();
  const { language: contextLanguage, setLanguage, t } = useLanguage();
  const language: Language = lang === 'zh' || location.pathname.startsWith('/zh/') ? 'zh' : 'en';
  const categorySlug = location.pathname.split('/').filter(Boolean).at(-1) || '';
  const category = categoryMap.get(categorySlug);

  useEffect(() => {
    if (contextLanguage !== language) setLanguage(language);
  }, [contextLanguage, language, setLanguage]);

  const articles = useMemo(() => (
    category ? (articlesMap[language] || articlesMap.en).filter(article => article.category === category.category) : []
  ), [category, language]);

  const localized = category?.[language === 'zh' ? 'zh' : 'en'];
  const canonical = language === 'zh'
    ? `https://hsmkit.com/zh/guides/${categorySlug}`
    : `https://hsmkit.com/guides/${categorySlug}`;
  const alternates = [
    { lang: 'en', href: `https://hsmkit.com/guides/${categorySlug}` },
    { lang: 'zh', href: `https://hsmkit.com/zh/guides/${categorySlug}` },
    { lang: 'x-default', href: `https://hsmkit.com/guides/${categorySlug}` },
  ];

  useLayoutEffect(() => {
    if (!category || !localized) return;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: localized.title,
      description: localized.description,
      url: canonical,
      inLanguage: language === 'zh' ? 'zh-CN' : 'en',
      isPartOf: { '@type': 'WebSite', name: 'HSM Kit', url: 'https://hsmkit.com' },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: articles.length,
        itemListElement: articles.map((article, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Article',
            name: article.title,
            url: `https://hsmkit.com${getGuidesPath(language, article.slug)}`,
          },
        })),
      },
    };
    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hsmkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `https://hsmkit.com${getGuidesPath(language)}` },
        { '@type': 'ListItem', position: 3, name: localized.title, item: canonical },
      ],
    };
    const scripts = [
      ['guides-category-schema', schema],
      ['guides-category-breadcrumb-schema', breadcrumb],
    ].map(([id, value]) => {
      const script = document.createElement('script');
      script.id = id as string;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(value);
      document.head.appendChild(script);
      return script;
    });
    return () => scripts.forEach(script => script.remove());
  }, [articles, canonical, category, language, localized]);

  if (!category || !localized) return null;

  const guides = t.guides;
  return (
    <>
      <SEO
        title={`${localized.title} | HSM Kit Guides`}
        description={localized.description}
        keywords={`${localized.title}, cryptography guides, HSM Kit`}
        canonical={canonical}
        alternates={alternates}
        ogImage={`https://hsmkit.com/og/guides/${language}/category-${categorySlug}.png`}
        ogImageWidth={1200}
        ogImageHeight={630}
        ogLocale={language === 'zh' ? 'zh_CN' : 'en_US'}
      />

      <div className="guides-page-shell guides-category-page">
        <Breadcrumb
          items={[
            { title: <Link to="/"><HomeOutlined /> {guides.home || 'Home'}</Link> },
            { title: <Link to={getGuidesPath(language)}>{guides.title || 'Guides'}</Link> },
            { title: localized.title },
          ]}
          style={{ marginBottom: 28 }}
        />

        <header style={{ marginBottom: 36, maxWidth: 820 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span aria-hidden="true" style={{ display: 'inline-flex' }}>{getCategoryIcon(category.category, 32)}</span>
            <Title level={1} style={{ margin: 0, color: 'var(--text-primary)' }}>{localized.title}</Title>
          </div>
          <Paragraph style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.8 }}>
            {localized.description}
          </Paragraph>
        </header>

        <Row gutter={[20, 20]}>
          {articles.map(article => (
            <Col xs={24} md={12} key={article.slug}>
              <Link to={getGuidesPath(language, article.slug)} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
                <Card
                  hoverable
                  style={{ height: '100%', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--card-bg)' }}
                  styles={{ body: { padding: 20 } }}
                >
                  <GuideTag color={getCategoryColor(article.category)} style={{ marginBottom: 10 }}>
                    {guides.articleCategories?.[article.category as keyof typeof guides.articleCategories] || article.category}
                  </GuideTag>
                  <Title level={3} style={{ marginTop: 0, marginBottom: 10, fontSize: 18, color: 'var(--text-primary)' }}>
                    {article.title}
                  </Title>
                  <Paragraph ellipsis={{ rows: 2 }} style={{ color: 'var(--text-secondary)', marginBottom: 14 }}>
                    {article.excerpt}
                  </Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                    <span><ClockCircleOutlined /> {article.readTime} {guides.minRead || 'min read'}</span>
                    <RightOutlined aria-hidden="true" />
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        <div style={{ marginTop: 36 }}>
          <Link to={getGuidesPath(language)}>{guides.backToGuides || 'Back to Guides'} <RightOutlined /></Link>
        </div>
      </div>
    </>
  );
};

export default GuidesCategoryPage;
