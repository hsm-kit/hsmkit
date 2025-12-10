import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Tag, Typography, Input } from 'antd';
import { KeyOutlined, CopyOutlined, AppstoreOutlined, NumberOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { generatePinBlock } from '../utils/crypto';
import { sanitizeDigits, formatHexDisplay } from '../utils/format';

const { Title, Text } = Typography;

const PinBlockTool: React.FC = () => {
  const { t } = useLanguage();
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
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
            {t.pinBlock.title}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.pinBlock.description}
          </Text>

          <Divider style={{ margin: '12px 0' }} />

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
                支持 4-12 位 PIN 码
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
                请输入完整卡号（13-19 位），系统会自动提取最右 12 位（不含校验位）
              </Text>
            </div>

            <Button 
              type="primary"
              icon={<AppstoreOutlined />}
              onClick={performGeneration}
              size="large"
              block
            >
              {t.pinBlock.generatePinBlock}
            </Button>
          </div>
        </Card>

        {error && (
          <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {pinBlock && (
          <Card 
            title={<><KeyOutlined /> {t.common.result}</>}
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            extra={
              <Button 
                type="text"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(pinBlock);
                  message.success(t.common.copied);
                }}
                size="small"
              >
                {t.common.copy}
              </Button>
            }
          >
            <div style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t.pinBlock.pinBlockHex}
              </Text>
              <div style={{
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: 'clamp(18px, 4vw, 24px)',
                letterSpacing: '2px',
                color: '#1677ff',
                marginTop: '8px',
                wordBreak: 'break-all',
                lineHeight: '1.6'
              }}>
                {formatHexDisplay(pinBlock)}
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
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

