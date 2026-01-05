import React, { useState, useCallback } from 'react';
import { Card, Button, message, Divider, Typography, InputNumber, Select, Checkbox, Alert } from 'antd';
import { ThunderboltOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const MAX_UUID_COUNT = 100;

const { Title, Text } = Typography;

type UUIDVariant = 'VERSION_1_TIME' | 'VERSION_4_RANDOM' | 'VERSION_3_MD5' | 'VERSION_5_SHA1';

// Generate UUID v4 (random)
const generateUUIDv4 = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  
  // Set version 4
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant (RFC 4122)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

// Generate UUID v1 (time-based)
const generateUUIDv1 = (): string => {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, '0');
  
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  
  // Time low (4 bytes)
  const timeLow = timeHex.slice(-8);
  // Time mid (2 bytes)
  const timeMid = timeHex.slice(-12, -8).padStart(4, '0');
  // Time high and version (2 bytes)
  const timeHigh = ((parseInt(timeHex.slice(0, 4) || '0', 16) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
  
  // Clock seq (2 bytes)
  const clockSeq = ((bytes[8] & 0x3f) | 0x80).toString(16).padStart(2, '0') + bytes[9].toString(16).padStart(2, '0');
  
  // Node (6 bytes) - random
  const node = Array.from(bytes.slice(10, 16)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
};

// Generate UUID v3 (MD5 hash)
const generateUUIDv3 = async (): Promise<string> => {
  // Generate random namespace + name for demo
  const data = new TextEncoder().encode(Date.now().toString() + Math.random().toString());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hashBuffer).slice(0, 16);
  
  // Set version 3
  bytes[6] = (bytes[6] & 0x0f) | 0x30;
  // Set variant
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

// Generate UUID v5 (SHA-1 hash)
const generateUUIDv5 = async (): Promise<string> => {
  // Generate random namespace + name for demo
  const data = new TextEncoder().encode(Date.now().toString() + Math.random().toString());
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const bytes = new Uint8Array(hashBuffer).slice(0, 16);
  
  // Set version 5
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  // Set variant
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

const UUIDTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [variant, setVariant] = useState<UUIDVariant>('VERSION_4_RANDOM');
  const [count, setCount] = useState<number>(1);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [withoutHyphen, setWithoutHyphen] = useState<boolean>(false);

  const handleGenerate = useCallback(async () => {
    setError('');
    setResults([]);

    if (count < 1 || count > MAX_UUID_COUNT) {
      setError(t.uuid?.errorInvalidCount || `Count must be between 1 and ${MAX_UUID_COUNT}`);
      return;
    }

    try {
      const uuids: string[] = [];
      
      for (let i = 0; i < count; i++) {
        let uuid: string;
        switch (variant) {
          case 'VERSION_1_TIME':
            uuid = generateUUIDv1();
            break;
          case 'VERSION_4_RANDOM':
            uuid = generateUUIDv4();
            break;
          case 'VERSION_3_MD5':
            uuid = await generateUUIDv3();
            break;
          case 'VERSION_5_SHA1':
            uuid = await generateUUIDv5();
            break;
          default:
            uuid = generateUUIDv4();
        }
        // Remove hyphens if option is checked
        if (withoutHyphen) {
          uuid = uuid.replace(/-/g, '');
        }
        uuids.push(uuid);
      }
      
      setResults(uuids);
    } catch (err) {
      console.error('UUID generation error:', err);
      setError((t.uuid?.errorGenerate || 'Generation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [variant, count, t, withoutHyphen]);

  const handleClear = useCallback(() => {
    setResults([]);
    setError('');
  }, []);

  const copyResult = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  }, [t]);

  const copyAll = useCallback(() => {
    if (results.length > 0) {
      navigator.clipboard.writeText(results.join('\n'));
      message.success(t.common.copied);
    }
  }, [results, t]);

  const getVariantDescription = (v: UUIDVariant): string => {
    switch (v) {
      case 'VERSION_1_TIME':
        return t.uuid?.v1Desc || 'Time-based UUID using timestamp and random node';
      case 'VERSION_4_RANDOM':
        return t.uuid?.v4Desc || 'Random UUID - most commonly used';
      case 'VERSION_3_MD5':
        return t.uuid?.v3Desc || 'Name-based UUID using MD5 hash';
      case 'VERSION_5_SHA1':
        return t.uuid?.v5Desc || 'Name-based UUID using SHA-1 hash';
      default:
        return '';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.uuid?.title || 'UUID Generator'}
          </Title>
          <CollapsibleInfo title={t.uuid?.info || 'UUID Information'}>
            <div>• {getVariantDescription(variant)}</div>
            <div>• {t.uuid?.infoFormat || 'Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 characters)'}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.uuid?.description || 'Generate Universally Unique Identifiers (UUID)'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Variant Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.uuid?.variant || 'Variant'}:
            </Text>
            <Select
              value={variant}
              onChange={(val) => {
                setVariant(val);
                setResults([]);
              }}
              style={{ width: '100%' }}
              size="large"
              options={[
                { label: 'VERSION_1_TIME', value: 'VERSION_1_TIME' },
                { label: 'VERSION_4_RANDOM', value: 'VERSION_4_RANDOM' },
                { label: 'VERSION_3_MD5', value: 'VERSION_3_MD5' },
                { label: 'VERSION_5_SHA1', value: 'VERSION_5_SHA1' },
              ]}
            />
          </div>

          {/* Count Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.uuid?.count || 'Count'}:
              <Text type="secondary" style={{ fontWeight: 'normal', marginLeft: 8, fontSize: '12px' }}>
                ({t.uuid?.maxCount || `Max ${MAX_UUID_COUNT}`})
              </Text>
            </Text>
            <InputNumber
              value={count}
              onChange={(val) => {
                const newVal = val || 1;
                setCount(Math.min(newVal, MAX_UUID_COUNT));
              }}
              min={1}
              max={MAX_UUID_COUNT}
              style={{ width: '100%' }}
              size="large"
            />
          </div>

          {/* Without Hyphen Option */}
          <div>
            <Checkbox 
              checked={withoutHyphen}
              onChange={(e) => setWithoutHyphen(e.target.checked)}
            >
              <Text>{t.uuid?.withoutHyphen || 'Without "-"'}</Text>
            </Checkbox>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />}
              onClick={handleGenerate}
              size="large"
            >
              {t.common.generate || 'Generate'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={handleClear}
              danger
              size="large"
            >
              {t.common.clear || 'Clear'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
          )}

          {/* Results */}
          {results.length > 0 && (
            <Card
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <ThunderboltOutlined style={{ marginRight: 8 }} />
                  {t.uuid?.generatedUUIDs || 'Generated UUIDs'}
                  <span style={{ 
                    marginLeft: 8, 
                    fontSize: '12px', 
                    fontWeight: 400, 
                    color: isDark ? '#95de64' : '#52c41a',
                    background: isDark ? 'rgba(82, 196, 26, 0.2)' : '#f6ffed',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {results.length}
                  </span>
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
                borderRadius: '8px'
              }}
              extra={
                <Button 
                  type={isDark ? 'primary' : 'default'}
                  icon={<CopyOutlined />}
                  onClick={copyAll}
                  size="small"
                  style={{
                    background: isDark ? '#52c41a' : undefined,
                    borderColor: '#52c41a',
                    color: isDark ? '#fff' : '#52c41a',
                  }}
                >
                  {t.uuid?.copyAll || 'Copy All'}
                </Button>
              }
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                maxHeight: '660px',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '4px',
              }}>
                {results.map((uuid, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isDark 
                        ? (index % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.15)')
                        : (index % 2 === 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)'),
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                      fontSize: '14px',
                      color: isDark ? '#95de64' : '#237804',
                      fontWeight: 600,
                      letterSpacing: '0.5px'
                    }}>
                      {uuid}
                    </span>
                    <Button
                      type={isDark ? 'primary' : 'default'}
                      icon={<CopyOutlined />}
                      onClick={() => copyResult(uuid)}
                      size="small"
                      style={{
                        background: isDark ? '#52c41a' : undefined,
                        borderColor: '#52c41a',
                        color: isDark ? '#fff' : '#52c41a',
                      }}
                    >
                      {t.common.copy}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

export default UUIDTool;

