import React from 'react';
import { Card, Button } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

interface ResultDisplayProps {
  title?: string;
  value: string;
  onCopy?: () => void;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * ResultDisplay - A consistent result display component for all tools
 * Provides enhanced visibility in both light and dark modes
 */
export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  title,
  value,
  onCopy,
  extra,
  children,
  icon,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    } else if (value) {
      navigator.clipboard.writeText(value);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      title={title && (
        <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
          {icon} {title}
        </span>
      )}
      bordered={false}
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
          : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
        border: isDark ? '1px solid #274916' : '1px solid #95de64',
        boxShadow: isDark 
          ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
          : '0 4px 16px rgba(82, 196, 26, 0.2)',
      }}
      extra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {extra}
          <Button
            type={isDark ? 'primary' : 'default'}
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopy}
            size="small"
            style={{
              background: isDark ? '#52c41a' : undefined,
              borderColor: isDark ? '#52c41a' : '#52c41a',
              color: isDark ? '#fff' : '#52c41a',
            }}
          >
            {copied ? (t.common?.copied || 'Copied!') : (t.common?.copy || 'Copy')}
          </Button>
        </div>
      }
    >
      {value && (
        <div
          style={{
            background: isDark 
              ? 'rgba(0, 0, 0, 0.3)' 
              : 'rgba(255, 255, 255, 0.8)',
            padding: '16px',
            borderRadius: '8px',
            border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
            wordBreak: 'break-all',
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '15px',
            lineHeight: '1.8',
            color: isDark ? '#95de64' : '#237804',
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          {value}
        </div>
      )}
      {children}
    </Card>
  );
};

/**
 * Get consistent result container styles for inline usage
 */
export const getResultContainerStyle = (isDark: boolean) => ({
  background: isDark 
    ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
    : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
  border: isDark ? '1px solid #274916' : '1px solid #95de64',
  borderRadius: '8px',
  padding: '16px',
});

/**
 * Get consistent result text styles for inline usage
 */
export const getResultTextStyle = (isDark: boolean) => ({
  background: isDark 
    ? 'rgba(0, 0, 0, 0.3)' 
    : 'rgba(255, 255, 255, 0.8)',
  padding: '16px',
  borderRadius: '8px',
  border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
  wordBreak: 'break-all' as const,
  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
  fontSize: '15px',
  lineHeight: '1.8',
  color: isDark ? '#95de64' : '#237804',
  fontWeight: 600,
  letterSpacing: '0.5px',
});

/**
 * Get consistent copy button styles for inline usage
 */
export const getCopyButtonStyle = (isDark: boolean) => ({
  background: isDark ? '#52c41a' : undefined,
  borderColor: '#52c41a',
  color: isDark ? '#fff' : '#52c41a',
});

export default ResultDisplay;

