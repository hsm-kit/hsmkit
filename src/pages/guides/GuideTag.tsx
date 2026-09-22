import React from 'react';

interface GuideTagProps {
  children: React.ReactNode;
  color?: string;
  subtle?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const GuideTag: React.FC<GuideTagProps> = ({ children, color = '#1677ff', subtle, style, className }) => (
  <span
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: subtle ? '3px 8px' : '4px 10px',
      borderRadius: 6,
      border: subtle ? '1px solid var(--border-color)' : `1px solid ${color}38`,
      background: subtle ? 'var(--surface-muted)' : `${color}16`,
      color: subtle ? 'var(--text-secondary)' : color,
      fontSize: subtle ? 12 : 13,
      fontWeight: subtle ? 500 : 600,
      lineHeight: 1.35,
      ...style,
    }}
  >
    {children}
  </span>
);
