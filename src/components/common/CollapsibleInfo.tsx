import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { InfoCircleOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';

interface CollapsibleInfoProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

/**
 * CollapsibleInfo - A compact info component that can be expanded/collapsed
 * Helps reduce vertical space for experienced users while keeping info accessible
 */
export const CollapsibleInfo: React.FC<CollapsibleInfoProps> = ({
  title,
  children,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { isDark } = useTheme();

  return (
    <div>
      {/* Compact header with toggle button */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8,
        marginBottom: expanded ? 8 : 0 
      }}>
        <Tooltip title={expanded ? 'Hide info' : 'Show info'}>
          <Button
            type="text"
            size="small"
            icon={<InfoCircleOutlined />}
            onClick={() => setExpanded(!expanded)}
            style={{
              color: isDark ? '#69b1ff' : '#1677ff',
              padding: '4px 8px',
              height: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 13,
              background: isDark 
                ? 'rgba(22, 119, 255, 0.1)' 
                : 'rgba(22, 119, 255, 0.06)',
              border: isDark ? '1px solid #15395b' : '1px solid #91caff',
              borderRadius: 6,
            }}
          >
            <span>{title}</span>
            {expanded ? <UpOutlined style={{ fontSize: 10 }} /> : <DownOutlined style={{ fontSize: 10 }} />}
          </Button>
        </Tooltip>
      </div>

      {/* Expandable content */}
      {expanded && (
        <div
          style={{
            background: isDark 
              ? 'linear-gradient(135deg, #111d2c 0%, #1a2c3d 100%)' 
              : 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
            border: isDark ? '1px solid #15395b' : '1px solid #91caff',
            borderRadius: 8,
            padding: '12px 16px',
            color: isDark ? '#69b1ff' : '#1677ff',
            fontSize: 13,
            lineHeight: 1.6,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleInfo;

