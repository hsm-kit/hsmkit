import React from 'react';
import { Button, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { SEO } from '../components/common/SEO';

const { Title, Paragraph } = Typography;

const NotFoundPage: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  return (
    <>
      <SEO
        title="404 - Page Not Found | HSM Kit"
        description="The page you are looking for does not exist."
        noindex
      />
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 24px',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Title level={1} style={{ 
          fontSize: 'clamp(48px, 10vw, 72px)', 
          marginBottom: 16,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          404
        </Title>
        <Title level={3} style={{ color: isDark ? '#e6e6e6' : '#1f1f1f', marginBottom: 8 }}>
          {t.common?.notFound?.title || 'Page Not Found'}
        </Title>
        <Paragraph style={{ 
          color: isDark ? '#8c8c8c' : '#666', 
          fontSize: 16, 
          marginBottom: 32,
          maxWidth: 400,
        }}>
          {t.common?.notFound?.description || 'The page you are looking for does not exist or has been moved.'}
        </Paragraph>
        <Link to="/">
          <Button type="primary" size="large" icon={<HomeOutlined />}>
            {t.common.home || 'Home'}
          </Button>
        </Link>
      </div>
    </>
  );
};

export default NotFoundPage;
