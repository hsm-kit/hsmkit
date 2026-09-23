import React from 'react';
import { Typography } from 'antd';
import { InfoCircleOutlined, AuditOutlined, TeamOutlined } from '@ant-design/icons';
import { LegalPageLayout } from '../../components/common/LegalPageLayout';
import { useLanguage } from '../../hooks/useLanguage';
import type { AuthorityContent } from './authorityContent';
import type { Language } from '../../locales';

const { Paragraph } = Typography;

interface AuthorityPageProps {
  canonical: string;
  content: Record<Language, AuthorityContent>;
  type: 'about' | 'policy' | 'team';
}

const icons = {
  about: <InfoCircleOutlined />,
  policy: <AuditOutlined />,
  team: <TeamOutlined />,
};

export const AuthorityPage: React.FC<AuthorityPageProps> = ({ canonical, content, type }) => {
  const { language } = useLanguage();
  const page = content[language];
  const canonicalUrl = `https://hsmkit.com${canonical}`;
  const structuredData = type === 'team'
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: page.title,
        mainEntity: {
          '@type': 'Organization',
          '@id': `${canonicalUrl}#team`,
          name: 'HSM Kit Editorial Team',
          url: canonicalUrl,
          parentOrganization: { '@id': 'https://hsmkit.com/#organization' },
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': type === 'about' ? 'AboutPage' : 'WebPage',
        '@id': canonicalUrl,
        url: canonicalUrl,
        name: page.title,
        description: page.description,
        isPartOf: { '@id': 'https://hsmkit.com/#website' },
        about: { '@id': 'https://hsmkit.com/#organization' },
      };

  return (
    <LegalPageLayout
      seoTitle={page.seoTitle}
      seoDescription={page.description}
      seoKeywords={page.keywords}
      canonical={canonicalUrl}
      icon={icons[type]}
      title={page.title}
      lastUpdated={page.updatedLabel}
      lastUpdatedDate={page.updatedDate}
      lastUpdatedDateTime="2026-09-23"
      sections={page.sections.map(({ id, title }) => ({ id, title }))}
      structuredData={structuredData}
    >
      {page.sections.map((section) => (
        <section className="legal-section" id={section.id} key={section.id}>
          <h2 className="legal-section-title">{section.title}</h2>
          {section.paragraphs.map((paragraph) => <Paragraph key={paragraph}>{paragraph}</Paragraph>)}
          {section.bullets && (
            <ul>
              {section.bullets.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      ))}
    </LegalPageLayout>
  );
};