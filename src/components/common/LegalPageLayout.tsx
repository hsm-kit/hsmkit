import React, { useId, useLayoutEffect } from 'react';
import { Typography } from 'antd';
import { SEO } from './SEO';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { normalizeSiteUrl } from '../../utils/publicUrl';

const { Title, Text } = Typography;

interface LegalSectionLink {
  id: string;
  title: string;
}

interface LegalPageLayoutProps {
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  canonical: string;
  icon: React.ReactNode;
  title: string;
  lastUpdated: string;
  lastUpdatedDate: string;
  lastUpdatedDateTime: string;
  sections: LegalSectionLink[];
  children: React.ReactNode;
  structuredData?: object;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  canonical,
  icon,
  title,
  lastUpdated,
  lastUpdatedDate,
  lastUpdatedDateTime,
  sections,
  children,
  structuredData,
}) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const schemaId = useId();
  const canonicalUrl = normalizeSiteUrl(canonical);
  const relatedPages = [
    { href: '/about/', label: t.footer.about },
    { href: '/editorial-policy/', label: t.footer.editorialPolicy },
    { href: '/authors/editorial-team/', label: t.footer.editorialTeam },
    { href: '/privacy-policy/', label: t.footer.privacyPolicy },
    { href: '/terms-of-service/', label: t.footer.termsOfService },
    { href: '/disclaimer/', label: t.footer.disclaimer },
  ].filter(({ href }) => canonicalUrl !== `https://hsmkit.com${href}`);

  const tableOfContents = (
    <nav className="legal-toc" aria-label={t.guides.onThisPage}>
      <div className="legal-toc-title">{t.guides.onThisPage}</div>
      <ol>
        {sections.map((section, index) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {section.title.replace(/^\d+\.\s*/, '')}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  useLayoutEffect(() => {
    if (!structuredData) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = `authority-schema-${schemaId}`;
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    return () => script.remove();
  }, [schemaId, structuredData]);

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonicalUrl}
      />

      <article className={`legal-page${isDark ? ' legal-page-dark' : ''}`}>
        <header className="legal-header">
          <div className="legal-header-icon" aria-hidden="true">{icon}</div>
          <div>
            <Title level={1}>{title}</Title>
            <Text className="legal-updated">
              {lastUpdated}:{' '}
              <time dateTime={lastUpdatedDateTime}>{lastUpdatedDate}</time>
            </Text>
          </div>
        </header>

        <details className="legal-toc-mobile">
          <summary>{t.guides.onThisPage}</summary>
          {tableOfContents}
        </details>

        <div className="legal-layout">
          <aside className="legal-sidebar">{tableOfContents}</aside>
          <div className="legal-document">
            {children}
            <nav className="legal-related" aria-label={title}>
              {relatedPages.map((page) => (
                <a href={page.href} key={page.href}>{page.label}</a>
              ))}
            </nav>
          </div>
        </div>
      </article>
    </>
  );
};

export default LegalPageLayout;