import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Tag, Typography, Input } from 'antd';
import { KeyOutlined, CopyOutlined, AppstoreOutlined, NumberOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { generatePinBlock } from '../../utils/crypto';
import { sanitizeDigits, formatHexDisplay } from '../../utils/format';

const { Title, Text } = Typography;

const PinBlockTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [pin, setPin] = useState('');
  const [pan, setPan] = useState('');
  const [format, setFormat] = useState<'ISO0' | 'ISO1'>('ISO0');
  const [pinBlock, setPinBlock] = useState('');
  const [error, setError] = useState('');

  const performGeneration = () => {
    setError('');
    setPinBlock('');

    if (!/^\d{4,12}$/.test(pin)) {
      setError(t.pinBlock.errorInvalidPin);
      return;
    }

    const cleanPan = pan.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanPan)) {
      setError(t.pinBlock.errorInvalidPan);
      return;
    }

    try {
      const result = generatePinBlock({ format, pin, pan: cleanPan });
      setPinBlock(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.pinBlock.errorGeneration);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
            {t.pinBlock.title}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.pinBlock.description}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlock.format}:
              </Text>
              <Segmented
                value={format}
                onChange={(value) => setFormat(value as 'ISO0' | 'ISO1')}
                options={[
                  { label: 'ISO Format 0', value: 'ISO0' },
                  { label: 'ISO Format 1', value: 'ISO1', disabled: true }
                ]}
                block
                size="large"
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlock.pinLabel}:
              </Text>
              <Input
                value={pin}
                onChange={e => setPin(sanitizeDigits(e.target.value))}
                placeholder={t.pinBlock.pinPlaceholder}
                maxLength={12}
                prefix={<NumberOutlined style={{ color: '#bfbfbf' }} />}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                size="large"
              />
              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                {t.pinBlock.pinLengthHint}
              </Text>
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlock.panLabel}:
              </Text>
              <Input
                value={pan}
                onChange={e => setPan(sanitizeDigits(e.target.value))}
                placeholder={t.pinBlock.panPlaceholder}
                maxLength={19}
                prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                size="large"
              />
              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                {t.pinBlock.panHint}
              </Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
              <Button 
                type="primary"
                icon={<AppstoreOutlined />}
                onClick={performGeneration}
                size="large"
              >
                {t.pinBlock.generatePinBlock}
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {pinBlock && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                <KeyOutlined /> {t.common.result}
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
            }}
            extra={
              <Button 
                type={isDark ? 'primary' : 'default'}
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(pinBlock);
                  message.success(t.common.copied);
                }}
                size="small"
                style={{
                  background: isDark ? '#52c41a' : undefined,
                  borderColor: '#52c41a',
                  color: isDark ? '#fff' : '#52c41a',
                }}
              >
                {t.common.copy}
              </Button>
            }
          >
            <div style={{ 
              background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)', 
              padding: '16px', 
              borderRadius: '8px', 
              border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f' 
            }}>
              <Text type="secondary" style={{ fontSize: '12px', color: isDark ? '#a6a6a6' : undefined }}>
                {t.pinBlock.pinBlockHex}
              </Text>
              <div style={{
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: 'clamp(18px, 4vw, 24px)',
                letterSpacing: '2px',
                color: isDark ? '#95de64' : '#237804',
                marginTop: '8px',
                wordBreak: 'break-all',
                lineHeight: '1.6',
                fontWeight: 600
              }}>
                {formatHexDisplay(pinBlock)}
              </div>
              
              <Divider style={{ margin: '16px 0', borderColor: isDark ? '#3c5a24' : undefined }} />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Tag color="blue">{t.pinBlock.format}: {format}</Tag>
                <Tag color="green">{t.keyGenerator.length}: 16 {t.keyGenerator.bytes}</Tag>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PinBlockTool;

