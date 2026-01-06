import React from 'react';
import { Popover } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';

interface CollapsibleInfoProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

/**
 * CollapsibleInfo - A compact info icon with hover/click popover
 * Shows a small ? icon that reveals info on hover
 */
export const CollapsibleInfo: React.FC<CollapsibleInfoProps> = ({
  title,
  children,
}) => {
  const { isDark } = useTheme();

  const content = (
    <div
      style={{
        maxWidth: 320,
        fontSize: 13,
        lineHeight: 1.7,
        color: isDark ? '#b0b0b0' : '#595959',
      }}
    >
      {children}
    </div>
  );

  return (
    <Popover
      content={content}
      title={
        <span style={{ 
          color: isDark ? '#69b1ff' : '#1677ff', 
          fontWeight: 500,
          fontSize: 13,
        }}>
          {title}
        </span>
      }
      trigger={['hover', 'click']}
      placement="bottomLeft"
      mouseLeaveDelay={0}
      styles={{
        content: {
          maxWidth: 360,
          background: isDark 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #262626 100%)' 
            : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
          border: isDark ? '1px solid #303030' : '1px solid #e8e8e8',
          boxShadow: isDark 
            ? '0 4px 12px rgba(0,0,0,0.4)' 
            : '0 4px 12px rgba(0,0,0,0.1)',
        },
      }}
    >
      <QuestionCircleOutlined
        style={{
          fontSize: 14,
          color: isDark ? '#595959' : '#bfbfbf',
          cursor: 'pointer',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#1677ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isDark ? '#595959' : '#bfbfbf';
        }}
      />
    </Popover>
  );
};

export default CollapsibleInfo;
