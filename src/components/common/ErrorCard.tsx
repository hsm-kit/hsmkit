import React from 'react';
import { Card, Typography } from 'antd';
import { useTheme } from '../../hooks/useTheme';

const { Text } = Typography;

interface ErrorCardProps {
  error: string;
  style?: React.CSSProperties;
}

/**
 * 统一的错误展示卡片组件
 * 红色左边框 + 错误信息
 */
export const ErrorCard: React.FC<ErrorCardProps> = React.memo(({ error, style }) => {
  const { isDark } = useTheme();

  return (
    <Card
      role="alert"
      aria-live="assertive"
      style={{
        borderLeft: '4px solid #ff4d4f',
        background: isDark ? '#2a1a1a' : '#fff2f0',
        ...style,
      }}
      styles={{ body: { padding: '12px 16px' } }}
    >
      <Text type="danger" style={{ fontFamily: 'inherit' }}>{error}</Text>
    </Card>
  );
});

ErrorCard.displayName = 'ErrorCard';

export default ErrorCard;
