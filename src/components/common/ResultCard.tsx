import React from 'react';
import { Card, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';

interface ResultCardProps {
  title: string;
  result: string | React.ReactNode;
  onCopy?: () => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  resultStyle?: React.CSSProperties;
}

/**
 * 统一的结果展示卡片组件
 * 用于在所有工具页面保持一致的输出样式（完全匹配 Base64/Base94 等工具的视觉风格）
 */
export const ResultCard: React.FC<ResultCardProps> = React.memo(({
  title,
  result,
  onCopy,
  icon,
  style,
  resultStyle,
}) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  return (
    <Card
      aria-live="polite"
      title={
        <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
          {icon && <>{icon} </>}
          {title}
        </span>
      }
      size="small"
      style={{
        background: 'var(--card-bg)',
        border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`,
        borderLeft: '3px solid #52c41a',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      extra={
        onCopy && (
          <Button 
            type={isDark ? 'primary' : 'default'}
            icon={<CopyOutlined />}
            onClick={onCopy}
            size="small"
            aria-label={t.common?.copy || 'Copy'}
            style={{
              background: isDark ? '#52c41a' : undefined,
              borderColor: '#52c41a',
              color: isDark ? '#fff' : '#52c41a',
            }}
          >
            {t.common?.copy || 'Copy'}
          </Button>
        )
      }
    >
      <div style={{ 
        background: 'var(--surface-muted)',
        padding: '16px', 
        borderRadius: '6px',
        border: `1px solid ${isDark ? '#3c5a24' : '#d9f7be'}`,
        wordBreak: 'break-all',
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        lineHeight: '1.8',
        color: isDark ? '#95de64' : '#237804',
        fontWeight: 600,
        letterSpacing: '0.5px',
        whiteSpace: 'pre-wrap',
        ...resultStyle,
      }}>
        {result}
      </div>
    </Card>
  );
});

ResultCard.displayName = 'ResultCard';

export default ResultCard;
