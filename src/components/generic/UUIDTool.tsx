import React, { useState, useCallback } from 'react';
import { Card, Button, message, Divider, Typography, Input, InputNumber, Select, Checkbox, Alert } from 'antd';
import { ThunderboltOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';
import { CollapsibleInfo, FieldLabel } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import logger from '../../utils/logger';
import { generateUuidV1, generateUuidV3, generateUuidV4, generateUuidV5 } from '../../utils/uuid';

const MAX_UUID_COUNT = 100;

const { Title, Text } = Typography;

type UUIDVariant = 'VERSION_1_TIME' | 'VERSION_4_RANDOM' | 'VERSION_3_MD5' | 'VERSION_5_SHA1';

const UUIDTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [variant, setVariant] = useState<UUIDVariant>('VERSION_4_RANDOM');
  const [count, setCount] = useState<number>(1);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [withoutHyphen, setWithoutHyphen] = useState<boolean>(false);
  const [namespace, setNamespace] = useState('6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  const [name, setName] = useState('');

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
            uuid = generateUuidV1();
            break;
          case 'VERSION_4_RANDOM':
            uuid = generateUuidV4();
            break;
          case 'VERSION_3_MD5':
            uuid = generateUuidV3(namespace, name);
            break;
          case 'VERSION_5_SHA1':
            uuid = generateUuidV5(namespace, name);
            break;
          default:
            uuid = generateUuidV4();
        }
        // Remove hyphens if option is checked
        if (withoutHyphen) {
          uuid = uuid.replace(/-/g, '');
        }
        uuids.push(uuid);
      }
      
      setResults(uuids);
    } catch (err) {
      logger.error('UUID generation error:', err);
      setError((t.uuid?.errorGenerate || 'Generation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [variant, count, t, withoutHyphen, namespace, name]);

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
      <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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

          {(variant === 'VERSION_3_MD5' || variant === 'VERSION_5_SHA1') && (
            <>
              <div>
                <FieldLabel label="Namespace UUID:" current={namespace.length} expected={36} />
                <Input value={namespace} onChange={event => setNamespace(event.target.value.trim())} size="large" />
              </div>
              <div>
                <FieldLabel label="Name:" current={name.length} />
                <Input value={name} onChange={event => setName(event.target.value)} size="large" />
              </div>
            </>
          )}

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

