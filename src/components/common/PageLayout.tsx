import React, { useLayoutEffect, useId } from 'react';
import { Card, Typography, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { SEO } from './SEO';
import { useTheme } from '../../hooks/useTheme';

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
}) => {
  const schemaId = useId();
  const { isDark } = useTheme();

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
      '@id': canonical || 'https://hsmkit.com',
      name: toolName || seoTitle,
      description: seoDescription,
      url: canonical,
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
        name: 'HSM Kit',
        url: 'https://hsmkit.com',
      },
      publisher: {
        '@type': 'Organization',
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

    // Generate SoftwareApplication Schema
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
    };

    // Add WebApplication schema
    addSchema(webAppSchema, `schema-webapp-${schemaId}`);
    
    // Add SoftwareApplication schema  
    addSchema(softwareAppSchema, `schema-software-${schemaId}`);

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

    // Add HowTo schema if usage content exists
    if (usageContent) {
      const howToSchema = {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use ${toolName || seoTitle}`,
        description: seoDescription,
        tool: {
          '@type': 'HowToTool',
          name: 'Web Browser',
        },
      };
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
  }, [schemaId, seoTitle, seoDescription, canonical, faqs, toolName, toolCategory, usageContent]);

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
          style={{ 
            marginTop: 24, 
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
            background: isDark 
              ? 'linear-gradient(135deg, #1a2e1a 0%, #1e3a1e 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: 'none'
          }}
        >
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: isDark ? '#52c41a' : '#1e293b' }}>
            📖 {usageTitle}
          </Title>
          <div style={{ color: isDark ? '#a3d9a3' : '#475569', lineHeight: 1.8 }}>
            {usageContent}
          </div>
        </Card>
      )}
      
      {/* FAQ Section - adds keyword-rich text content for SEO */}
      {faqs && faqs.length > 0 && (
        <Card 
          style={{ 
            marginTop: 24, 
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
            background: isDark 
              ? 'linear-gradient(135deg, #2a2a1a 0%, #3a3a1a 100%)'
              : 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
            border: 'none'
          }}
        >
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: isDark ? '#faad14' : '#854d0e' }}>
            <QuestionCircleOutlined style={{ marginRight: 8 }} />
            {faqTitle}
          </Title>
          <Collapse
            ghost
            items={faqs.map((faq, index) => ({
              key: index,
              label: <Text strong style={{ color: isDark ? '#ffc53d' : '#78350f' }}>{faq.question}</Text>,
              children: <Paragraph style={{ color: isDark ? '#d9a200' : '#92400e', marginBottom: 0 }}>{faq.answer}</Paragraph>
            }))}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}
    </>
  );
};

export default PageLayout;
