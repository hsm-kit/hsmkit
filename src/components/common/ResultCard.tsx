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
export const ResultCard: React.FC<ResultCardProps> = ({
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
      title={
        <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
          {icon && <>{icon} </>}
          {title}
        </span>
      }
      size="small"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
          : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
        border: isDark ? '1px solid #274916' : '2px solid #95de64',
        boxShadow: isDark 
          ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
          : '0 4px 16px rgba(82, 196, 26, 0.2)',
        ...style,
      }}
      extra={
        onCopy && (
          <Button 
            type={isDark ? 'primary' : 'default'}
            icon={<CopyOutlined />}
            onClick={onCopy}
            size="small"
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
        background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        padding: '16px', 
        borderRadius: '8px', 
        border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
        wordBreak: 'break-all',
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
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
};

export default ResultCard;
