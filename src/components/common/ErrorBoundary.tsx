import React, { Component, type ReactNode } from 'react';
import { Result, Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import i18n from '../../i18n';
import logger from '../../utils/logger';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const t = i18n.getResourceBundle(i18n.language, 'translation') as Record<string, Record<string, Record<string, string>>> | undefined;
      const eb = t?.common?.errorBoundary;

      return (
        <div style={{ 
          padding: '48px 24px', 
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Result
            status="error"
            title={eb?.title || 'Something went wrong'}
            subTitle={eb?.subtitle || 'An unexpected error occurred. Please try again.'}
            extra={[
              <Button 
                type="primary" 
                key="retry" 
                onClick={this.handleRetry}
              >
                {eb?.tryAgain || 'Try Again'}
              </Button>,
              <Button 
                key="reload" 
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                {eb?.reloadPage || 'Reload Page'}
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div style={{ 
                textAlign: 'left', 
                background: '#fff2f0', 
                padding: 16, 
                borderRadius: 8,
                marginTop: 16 
              }}>
                <Paragraph>
                  <Text strong style={{ color: '#ff4d4f' }}>{eb?.errorDetails || 'Error Details'}:</Text>
                </Paragraph>
                <Paragraph>
                  <Text code style={{ wordBreak: 'break-all' }}>
                    {this.state.error.message}
                  </Text>
                </Paragraph>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
