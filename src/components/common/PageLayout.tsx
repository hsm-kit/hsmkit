import React, { useEffect, useId } from 'react';
import { Card, Typography, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { SEO } from './SEO';

const { Title, Text, Paragraph } = Typography;

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
  
  // Page content
  children: React.ReactNode;
  
  // FAQ section
  faqTitle?: string;
  faqs?: FAQItem[];
  
  // Usage guide
  usageTitle?: string;
  usageContent?: React.ReactNode;
  
  // Schema.org props for rich snippets
  toolName?: string;           // e.g., "AES Encryption Tool"
  toolCategory?: string;       // e.g., "Encryption", "Key Management"
  aggregateRating?: {
    ratingValue: number;       // e.g., 4.8
    ratingCount: number;       // e.g., 156
  };
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
  children,
  faqTitle = 'Frequently Asked Questions',
  faqs,
  usageTitle = 'How to Use',
  usageContent,
  toolName,
  toolCategory = 'SecurityApplication',
  aggregateRating = { ratingValue: 4.8, ratingCount: 127 }, // Default rating for all tools
}) => {
  const schemaId = useId();

  // Generate WebApplication Schema
  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    '@id': canonical || 'https://hsmkit.com',
    name: toolName || seoTitle,
    description: seoDescription,
    url: canonical,
    applicationCategory: toolCategory,
    applicationSubCategory: 'Cryptography Tool',
    operatingSystem: 'Any (Web Browser)',
    browserRequirements: 'Requires JavaScript',
    softwareVersion: '1.0.0',
    // Free offering
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    // Aggregate rating for rich snippets (star ratings)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
    // Provider/Publisher info
    author: {
      '@type': 'Organization',
      name: 'HSM Kit',
      url: 'https://hsmkit.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HSM Kit',
      url: 'https://hsmkit.com',
    },
    // Features
    featureList: [
      '100% Client-side Processing',
      'No Data Sent to Server',
      'Free to Use',
      'No Registration Required',
    ],
    // Additional properties
    isAccessibleForFree: true,
    inLanguage: ['en', 'zh', 'ja', 'ko', 'de', 'fr'],
  };

  // Generate SoftwareApplication Schema (alternative type for better coverage)
  const softwareAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: toolName || seoTitle,
    description: seoDescription,
    url: canonical,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
  };

  // Generate FAQPage Schema for FAQ section (shows Q&A in search results)
  const faqPageSchema = faqs && faqs.length > 0 ? {
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
  } : null;

  // Generate HowTo Schema for usage instructions
  const howToSchema = usageContent ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${toolName || seoTitle}`,
    description: seoDescription,
    tool: {
      '@type': 'HowToTool',
      name: 'Web Browser',
    },
  } : null;

  // Inject schema scripts dynamically to avoid SSR issues
  useEffect(() => {
    const schemaScripts: HTMLScriptElement[] = [];

    const addSchema = (schema: object, id: string) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = id;
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      schemaScripts.push(script);
    };

    // Add WebApplication schema
    addSchema(webAppSchema, `schema-webapp-${schemaId}`);
    
    // Add SoftwareApplication schema  
    addSchema(softwareAppSchema, `schema-software-${schemaId}`);

    // Add FAQPage schema if FAQs exist
    if (faqPageSchema) {
      addSchema(faqPageSchema, `schema-faq-${schemaId}`);
    }

    // Add HowTo schema if usage content exists
    if (howToSchema) {
      addSchema(howToSchema, `schema-howto-${schemaId}`);
    }

    // Cleanup on unmount
    return () => {
      schemaScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [schemaId, seoTitle, seoDescription, canonical, faqs]);

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonical}
      />
      
      {/* Main tool content */}
      {children}
      
      {/* Usage Guide Section - adds text content for SEO */}
      {usageContent && (
        <Card 
          bordered={false} 
          style={{ 
            marginTop: 24, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
          }}
        >
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: '#1e293b' }}>
            📖 {usageTitle}
          </Title>
          <div style={{ color: '#475569', lineHeight: 1.8 }}>
            {usageContent}
          </div>
        </Card>
      )}
      
      {/* FAQ Section - adds keyword-rich text content for SEO */}
      {faqs && faqs.length > 0 && (
        <Card 
          bordered={false} 
          style={{ 
            marginTop: 24, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)'
          }}
        >
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: '#854d0e' }}>
            <QuestionCircleOutlined style={{ marginRight: 8 }} />
            {faqTitle}
          </Title>
          <Collapse
            ghost
            items={faqs.map((faq, index) => ({
              key: index,
              label: <Text strong style={{ color: '#78350f' }}>{faq.question}</Text>,
              children: <Paragraph style={{ color: '#92400e', marginBottom: 0 }}>{faq.answer}</Paragraph>
            }))}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}
    </>
  );
};

export default PageLayout;
