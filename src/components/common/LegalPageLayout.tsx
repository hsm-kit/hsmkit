import React from 'react';
import { Typography, Card } from 'antd';
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

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 0 48px' }}>
        {/* Header Card */}
        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            background: isDark
              ? 'linear-gradient(135deg, #1a1e2e 0%, #1e2438 100%)'
              : 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
            border: isDark ? '1px solid #303030' : '1px solid #c7d2fe',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
          }}
          styles={{ body: { padding: '32px 40px' } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: iconGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}>
              {icon}
            </div>
            <div>
              <Title level={2} style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 28px)', lineHeight: 1.2, fontWeight: 700, color: isDark ? '#e6e6e6' : '#1a1a2e' }}>
                {title}
              </Title>
              <Text style={{ fontSize: 13, color: isDark ? '#8c8c8c' : '#8c8c8c', display: 'block', marginTop: 4 }}>
                {lastUpdated}: {lastUpdatedDate}
              </Text>
            </div>
          </div>
        </Card>

        {/* Content Card */}
        <Card
          style={{
            borderRadius: 16,
            background: isDark ? '#1f1f1f' : '#fff',
            border: isDark ? '1px solid #303030' : '1px solid #e8e8e8',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
          }}
          styles={{ body: { padding: '40px 48px' } }}
        >
          {children}
        </Card>
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
          margin: 0 0 16px 0 !important;
          font-size: 22px !important;
          font-weight: 700 !important;
          color: ${isDark ? '#e6e6e6' : '#1a1a2e'} !important;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .legal-section p,
        .legal-section .ant-typography {
          line-height: 1.9 !important;
          margin-bottom: 0 !important;
          color: ${isDark ? '#b0b0b0' : '#555'} !important;
          font-size: 16px !important;
        }
        .legal-section ul {
          padding-left: 0;
          margin: 16px 0 0 0;
          list-style: none;
        }
        .legal-section ul li {
          margin-bottom: 10px;
          line-height: 1.9;
          color: ${isDark ? '#b0b0b0' : '#555'};
          font-size: 16px;
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
          padding: 18px 24px;
          border-radius: 10px;
          margin: 16px 0 0 0;
          border-left: 3px solid;
          font-size: 15px;
          line-height: 1.8;
        }
        .legal-section a {
          color: ${isDark ? '#818cf8' : '#667eea'};
          font-weight: 500;
          text-decoration: none;
        }
        .legal-section a:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .legal-section-icon {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
          .legal-section-title {
            font-size: 19px !important;
            gap: 10px;
          }
          .legal-section p,
          .legal-section .ant-typography,
          .legal-section ul li {
            font-size: 15px !important;
          }
        }
      `}</style>
    </>
  );
};

export default LegalPageLayout;
