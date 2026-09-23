import React, { useLayoutEffect, useId } from 'react';
import { Card, Typography, Collapse } from 'antd';
import { QuestionCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { SEO } from './SEO';
import { normalizeSiteUrl } from '../../utils/publicUrl';

const { Title, Text } = Typography;

interface FAQItem {
  question: string;
  answer: string;
}

interface PageLayoutProps {
  // SEO props
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  canonical?: string;
  alternates?: Array<{ lang: string; href: string }>;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  
  // Page content
  children: React.ReactNode;
  
  // FAQ section
  faqTitle?: string;
  faqs?: FAQItem[];
  
  // Usage guide
  usageTitle?: string;
  usageContent?: React.ReactNode;

  // Supporting content rendered after usage and after FAQ
  relatedContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  
  // Schema.org props for rich snippets
  toolName?: string;           // e.g., "AES Encryption Tool"
  toolCategory?: string;       // e.g., "Encryption", "Key Management"
  includeApplicationSchema?: boolean;
}

/**
 * PageLayout - Wraps tool pages with SEO metadata, FAQ, and usage instructions
 * This improves search engine visibility by adding text content to tool pages
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  canonical,
  alternates,
  ogImage,
  ogImageWidth,
  ogImageHeight,
  ogImageAlt,
  children,
  faqTitle = 'Frequently Asked Questions',
  faqs,
  usageTitle = 'How to Use',
  usageContent,
  relatedContent,
  footerContent,
  toolName,
  toolCategory = 'SecurityApplication',
  includeApplicationSchema = true,
}) => {
  const schemaId = useId();
  const canonicalUrl = canonical ? normalizeSiteUrl(canonical) : undefined;
  // Inject schema scripts dynamically - 使用 useLayoutEffect 确保预渲染时能捕获
  useLayoutEffect(() => {
    const schemaScripts: HTMLScriptElement[] = [];

    const addSchema = (schema: object, id: string) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      schemaScripts.push(script);
    };

    // Generate WebApplication Schema
    const webAppSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': canonicalUrl || 'https://hsmkit.com/',
      name: toolName || seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      applicationCategory: toolCategory,
      applicationSubCategory: 'Cryptography Tool',
      operatingSystem: 'Any (Web Browser)',
      browserRequirements: 'Requires JavaScript',
      softwareVersion: '1.0.0',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      author: {
        '@type': 'Organization',
        '@id': 'https://hsmkit.com/#organization',
        name: 'HSM Kit',
        url: 'https://hsmkit.com',
      },
      publisher: {
        '@type': 'Organization',
        '@id': 'https://hsmkit.com/#organization',
        name: 'HSM Kit',
        url: 'https://hsmkit.com',
      },
      featureList: [
        '100% Client-side Processing',
        'No Data Sent to Server',
        'Free to Use',
        'No Registration Required',
      ],
      isAccessibleForFree: true,
      inLanguage: ['en', 'zh', 'ja', 'ko', 'de', 'fr'],
    };

    if (includeApplicationSchema) {
      addSchema(webAppSchema, `schema-webapp-${schemaId}`);
    }

    // Add FAQPage schema if FAQs exist
    if (faqs && faqs.length > 0) {
      const faqPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      };
      addSchema(faqPageSchema, `schema-faq-${schemaId}`);
    }

    // Cleanup on unmount
    return () => {
      schemaScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [schemaId, seoTitle, seoDescription, canonicalUrl, faqs, toolName, toolCategory, usageContent, includeApplicationSchema]);

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonicalUrl}
        alternates={alternates}
        ogImage={ogImage}
        ogImageWidth={ogImageWidth}
        ogImageHeight={ogImageHeight}
        ogImageAlt={ogImageAlt}
      />
      
      {/* Main tool content */}
      {children}

      <div className="page-support-stack">
        {/* Usage Guide Section - adds text content for SEO */}
        {usageContent && (
          <Card className="support-panel support-panel--accent tool-page-usage">
            <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
              <ReadOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
              {usageTitle}
            </Title>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {usageContent}
            </div>
          </Card>
        )}

        {relatedContent}

        {/* FAQ Section - adds keyword-rich text content for SEO */}
        {faqs && faqs.length > 0 && (
          <Card className="support-panel tool-page-faq">
            <Title level={4} style={{ marginTop: 0, marginBottom: 16 }}>
              <QuestionCircleOutlined style={{ marginRight: 8, color: 'var(--primary-color)' }} />
              {faqTitle}
            </Title>
            <Collapse
              ghost
              items={faqs.map((faq, index) => ({
                key: index,
                label: <Text strong>{faq.question}</Text>,
                children: <div style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>{faq.answer}</div>
              }))}
              style={{ background: 'transparent' }}
            />
          </Card>
        )}

        {footerContent}
      </div>
    </>
  );
};

export default PageLayout;
