import React, { useLayoutEffect, useId } from 'react';
import { Card, Typography, Collapse } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { SEO } from './SEO';
import { useTheme } from '../../hooks/useTheme';

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
              ? 'linear-gradient(135deg, #1a1e2e 0%, #1e2438 100%)'
              : 'linear-gradient(135deg, #f8f9fc 0%, #f3f4f8 100%)',
            border: 'none'
          }}
        >
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: isDark ? '#818cf8' : '#374151' }}>
            📖 {usageTitle}
          </Title>
          <div style={{ color: isDark ? '#a5b4fc' : '#4b5563', lineHeight: 1.8 }}>
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
              ? 'linear-gradient(135deg, #2a1a2e 0%, #341e3a 100%)'
              : 'linear-gradient(135deg, #f9f8fc 0%, #f4f2f8 100%)',
            border: 'none'
          }}
        >
          <Title level={4} style={{ marginTop: 0, marginBottom: 16, color: isDark ? '#c084fc' : '#374151' }}>
            <QuestionCircleOutlined style={{ marginRight: 8 }} />
            {faqTitle}
          </Title>
          <Collapse
            ghost
            items={faqs.map((faq, index) => ({
              key: index,
              label: <Text strong style={{ color: isDark ? '#d8b4fe' : '#1f2937' }}>{faq.question}</Text>,
              children: <div style={{ color: isDark ? '#c4b5fd' : '#4b5563', marginBottom: 0 }}>{faq.answer}</div>
            }))}
            style={{ background: 'transparent' }}
          />
        </Card>
      )}
    </>
  );
};

export default PageLayout;
