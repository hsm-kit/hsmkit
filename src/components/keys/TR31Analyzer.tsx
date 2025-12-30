import React, { useState, useEffect } from 'react';
import { Card, Button, Divider, Tag, Typography, Input, Alert } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { parseTR31KeyBlock, validateTR31Header } from '../../utils/crypto';

const { Title, Text } = Typography;

const TR31Analyzer: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [keyBlock, setKeyBlock] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [inputStatus, setInputStatus] = useState<'' | 'error' | 'warning'>('');

  // 即时校验
  useEffect(() => {
    if (!keyBlock) {
      setValidationError('');
      setInputStatus('');
      return;
    }

    const validation = validateTR31Header(keyBlock);
    if (!validation.valid) {
      setValidationError(validation.error || '');
      setInputStatus('error');
    } else {
      setValidationError('');
      setInputStatus('');
    }
  }, [keyBlock]);

  const performParsing = () => {
    setError('');
    setResult(null);

    try {
      const parsed = parseTR31KeyBlock(keyBlock);
      
      // 添加 exportability 的翻译映射
      const exportMap: Record<string, string> = {
        'E': t.tr31.exportable,
        'N': t.tr31.nonExportable,
        'S': t.tr31.sensitive
      };
      
      setResult({
        ...parsed,
        exportability: exportMap[parsed.exportability] || parsed.exportability
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.tr31.errorParsing);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
            {t.tr31.title}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.tr31.description}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.tr31.keyBlock}:
              </Text>
              <Input.TextArea
                value={keyBlock}
                onChange={e => setKeyBlock(e.target.value)}
                placeholder={t.tr31.keyBlockPlaceholder}
                autoSize={{ minRows: 3, maxRows: 6 }}
                status={inputStatus}
                style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                  fontSize: '14px' 
                }}
              />
              {validationError && (
                <Alert
                  message={validationError}
                  type="error"
                  showIcon
                  style={{ marginTop: 8, fontSize: '12px' }}
                />
              )}
              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                {t.tr31.keyBlockFormatHint}
              </Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
              <Button 
                type="primary"
                icon={<SafetyCertificateOutlined />}
                onClick={performParsing}
                size="large"
                disabled={!!validationError}
              >
                {t.tr31.parseKeyBlock}
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {result && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                <SafetyCertificateOutlined /> {t.common.result}
              </span>
            }
            bordered={false}
            style={{ 
              background: isDark 
                ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              border: isDark ? '1px solid #274916' : '2px solid #95de64',
              boxShadow: isDark 
                ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
                : '0 4px 16px rgba(82, 196, 26, 0.2)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', color: isDark ? '#a6a6a6' : undefined }}>
                  {t.tr31.header}
                </Text>
                <div style={{
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  fontSize: '16px',
                  color: isDark ? '#69b1ff' : '#1677ff',
                  background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                  padding: '8px',
                  borderRadius: '4px',
                  marginTop: '4px',
                  wordBreak: 'break-all',
                  border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f'
                }}>
                  {result.header}
                </div>
              </div>

              <Divider style={{ margin: '12px 0', borderColor: isDark ? '#3c5a24' : undefined }} />

              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: isDark ? '#a6a6a6' : undefined }}>
                      {t.tr31.version}
                    </Text>
                    <Tag color="blue" style={{ marginTop: 4 }}>{result.version}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: isDark ? '#a6a6a6' : undefined }}>
                      {t.tr31.keyLength}
                    </Text>
                    <Tag color="purple" style={{ marginTop: 4 }}>
                      {result.length} {t.tr31.characters}
                    </Tag>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: isDark ? '#a6a6a6' : undefined }}>
                      {t.tr31.keyUsage}
                    </Text>
                    <Tag color="green" style={{ marginTop: 4 }}>{result.keyUsage}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: isDark ? '#a6a6a6' : undefined }}>
                      {t.kcvCalculator.algorithm}
                    </Text>
                    <Tag color="orange" style={{ marginTop: 4 }}>{result.algorithm}</Tag>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: isDark ? '#a6a6a6' : undefined }}>
                      {t.tr31.mode}
                    </Text>
                    <Tag color="cyan" style={{ marginTop: 4 }}>{result.mode}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: isDark ? '#a6a6a6' : undefined }}>
                      {t.tr31.keyVersion}
                    </Text>
                    <Tag style={{ marginTop: 4 }}>{result.keyVersion}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', color: isDark ? '#a6a6a6' : undefined }}>
                      {t.tr31.exportability}
                    </Text>
                    <Tag color="red" style={{ marginTop: 4 }}>{result.exportability}</Tag>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TR31Analyzer;

