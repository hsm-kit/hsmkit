import React from 'react';
import { Popover } from 'antd';
import { InfoCircleOutlined, CheckOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';

interface CollapsibleInfoProps {
  title?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

/**
 * CollapsibleInfo - A modern info icon with hover popover
 * Shows a small info icon that reveals styled info on hover
 */
export const CollapsibleInfo: React.FC<CollapsibleInfoProps> = ({
  title,
  children,
}) => {
  const { isDark } = useTheme();

  // Process children to style list items
  const processChildren = (content: React.ReactNode): React.ReactNode => {
    if (!content) return null;
    
    const childCount = React.Children.count(content);
    
    // If children is an array of elements
    if (childCount > 1) {
      return React.Children.map(content, (child, index) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as { children?: React.ReactNode };
          const childContent = childProps.children;
          // Check if it's a div containing bullet point text
          if (typeof childContent === 'string' && childContent.startsWith('•')) {
            return (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 10,
                  marginBottom: index < childCount - 1 ? 10 : 0,
                }}
              >
                <CheckOutlined style={{ 
                  fontSize: 11, 
                  color: '#52c41a',
                  marginTop: 4,
                  flexShrink: 0,
                  opacity: 0.8,
                }} />
                <span style={{ 
                  color: isDark ? '#E5E7EB' : '#4B5563',
                  lineHeight: 1.6,
                }}>
                  {childContent.replace(/^•\s*/, '')}
                </span>
              </div>
            );
          }
          return child;
        }
        return child;
      });
    }
    
    return content;
  };

  const content = (
    <div style={{ 
      padding: '4px 2px',
    }}>
      {processChildren(children)}
    </div>
  );

  return (
    <Popover
      content={content}
      title={title ? (
        <div style={{
          padding: '2px 0 10px 0',
          marginBottom: 2,
          borderBottom: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
        }}>
          <span style={{ 
            color: isDark ? '#60A5FA' : '#1677ff', 
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: '0.01em',
          }}>
            {title}
          </span>
        </div>
      ) : null}
      trigger={['hover', 'click']}
      placement="bottomLeft"
      mouseLeaveDelay={0.15}
      overlayStyle={{
        maxWidth: 360,
      }}
      styles={{
        content: {
          padding: '14px 18px',
          fontSize: 13,
          lineHeight: 1.6,
          background: isDark ? '#1F2937' : '#FFFFFF',
          border: isDark ? '1px solid #374151' : '1px solid #E5E7EB',
          borderRadius: 10,
          boxShadow: isDark 
            ? '0 10px 40px rgba(0,0,0,0.5)' 
            : '0 10px 40px rgba(0,0,0,0.08)',
        }
      }}
    >
      <InfoCircleOutlined
        style={{
          fontSize: 15,
          color: isDark ? '#6B7280' : '#9CA3AF',
          cursor: 'help',
          transition: 'color 0.2s ease',
          marginLeft: 6,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = isDark ? '#60A5FA' : '#1677ff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = isDark ? '#6B7280' : '#9CA3AF';
        }}
      />
    </Popover>
  );
};

export default CollapsibleInfo;
