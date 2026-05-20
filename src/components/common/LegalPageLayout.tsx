import React from 'react';
import { Typography } from 'antd';
import { SEO } from './SEO';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;

interface LegalPageLayoutProps {
  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  canonical: string;
  icon: React.ReactNode;
  iconGradient: string;
  title: string;
  lastUpdated: string;
  lastUpdatedDate: string;
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  canonical,
  icon,
  iconGradient,
  title,
  lastUpdated,
  lastUpdatedDate,
  children,
}) => {
  const { isDark } = useTheme();

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonical={canonical}
      />

      {/* Header Section - T-layout, same width as content */}
      <div style={{
        background: isDark ? '#1f1f1f' : '#fff',
        borderBottom: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`,
        padding: '40px 0 32px',
        marginBottom: 32,
        marginLeft: -24,
        marginRight: -24,
        marginTop: -24,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: iconGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              {icon}
            </div>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 28, lineHeight: 1.2, fontWeight: 700, color: isDark ? '#e6e6e6' : '#1a1a2e' }}>
                {title}
              </Title>
              <Text style={{ fontSize: 13, color: isDark ? '#8c8c8c' : '#8c8c8c', display: 'block', marginTop: 4 }}>
                {lastUpdated}: {lastUpdatedDate}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 0 48px' }}>
        {children}
      </div>

      <style>{`
        .legal-section {
          margin-bottom: 40px;
        }
        .legal-section:last-child {
          margin-bottom: 0;
        }
        .legal-section-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 18px;
        }
        .legal-section-title {
          margin: 0 0 14px 0 !important;
          font-size: 20px !important;
          font-weight: 700 !important;
          color: ${isDark ? '#e6e6e6' : '#1a1a2e'} !important;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .legal-section p {
          line-height: 1.9 !important;
          margin-bottom: 0 !important;
          color: ${isDark ? '#b0b0b0' : '#555'} !important;
          font-size: 15px;
        }
        .legal-section ul {
          padding-left: 0;
          margin: 16px 0 0 0;
          list-style: none;
        }
        .legal-section ul li {
          margin-bottom: 10px;
          line-height: 1.8;
          color: ${isDark ? '#b0b0b0' : '#555'};
          font-size: 15px;
          padding-left: 24px;
          position: relative;
        }
        .legal-section ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 10px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${isDark ? '#667eea' : '#667eea'};
        }
        .legal-section ul li strong {
          color: ${isDark ? '#e6e6e6' : '#1a1a2e'};
        }
        .legal-section ul ul {
          margin: 8px 0 0 0;
        }
        .legal-section ul ul li::before {
          background: ${isDark ? '#8c8c8c' : '#bfbfbf'};
          width: 5px;
          height: 5px;
        }
        .legal-highlight {
          padding: 16px 20px;
          border-radius: 10px;
          margin: 16px 0 0 0;
          border-left: 3px solid;
          font-size: 14px;
          line-height: 1.8;
        }
      `}</style>
    </>
  );
};

export default LegalPageLayout;
