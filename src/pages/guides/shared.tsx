import React from 'react';
import {
  KeyOutlined,
  CreditCardOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

export interface ArticleMeta {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  publishDate: string;
  lastModified: string;
  readTime: number;
  relatedTool?: string;
  relatedToolName?: string;
}

export type CategoryKey = 'Keys' | 'Payment' | 'Cipher' | 'PKI';

export const getCategoryIcon = (category: string, size: number = 28) => {
  const iconStyle: React.CSSProperties = { fontSize: size, marginRight: size <= 16 ? 6 : 0 };
  switch (category) {
    case 'Keys':
      return <KeyOutlined style={{ ...iconStyle, color: '#faad14' }} />;
    case 'Payment':
      return <CreditCardOutlined style={{ ...iconStyle, color: '#1677ff' }} />;
    case 'Cipher':
      return <LockOutlined style={{ ...iconStyle, color: '#52c41a' }} />;
    case 'PKI':
      return <SafetyCertificateOutlined style={{ ...iconStyle, color: '#13c2c2' }} />;
    default:
      return <FileTextOutlined style={{ ...iconStyle, color: '#667eea' }} />;
  }
};

export const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'Keys': return '#faad14';
    case 'Payment': return '#1677ff';
    case 'Cipher': return '#52c41a';
    case 'PKI': return '#13c2c2';
    default: return '#722ed1';
  }
};
