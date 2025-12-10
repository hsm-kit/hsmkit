import React, { useState } from 'react';
import { Card, Button, Radio, message, Divider, Tag, Typography, Input } from 'antd';
import { KeyOutlined, CopyOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const { Title, Text } = Typography;

const PinBlockTool: React.FC = () => {
  const { t } = useLanguage();
  const [pin, setPin] = useState('');
  const [pan, setPan] = useState('');
  const [format, setFormat] = useState<'ISO0' | 'ISO1'>('ISO0');
  const [pinBlock, setPinBlock] = useState('');
  const [error, setError] = useState('');

  const generatePinBlock = () => {
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
      if (format === 'ISO0') {
        const pinLength = pin.length.toString(16).toUpperCase();
        const pinPart = (pinLength + pin).padEnd(16, 'F');
        const panPart = ('0000' + cleanPan.slice(-13, -1)).slice(-16);
        
        let result = '';
        for (let i = 0; i < 16; i++) {
          const a = parseInt(pinPart[i], 16);
          const b = parseInt(panPart[i], 16);
          result += (a ^ b).toString(16).toUpperCase();
        }
        
        setPinBlock(result);
      } else {
        setError(t.pinBlock.errorFormat1);
      }
    } catch (err) {
      setError(t.pinBlock.errorGeneration);
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
              <Radio.Group 
                value={format}
                onChange={e => setFormat(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="ISO0">ISO Format 0</Radio.Button>
                <Radio.Button value="ISO1" disabled>ISO Format 1</Radio.Button>
              </Radio.Group>
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlock.pinLabel}:
              </Text>
              <Input
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder={t.pinBlock.pinPlaceholder}
                maxLength={12}
                style={{ fontFamily: 'monospace', fontSize: '16px' }}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlock.panLabel}:
              </Text>
              <Input
                value={pan}
                onChange={e => setPan(e.target.value.replace(/\D/g, ''))}
                placeholder={t.pinBlock.panPlaceholder}
                maxLength={19}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <Button 
              type="primary"
              icon={<AppstoreOutlined />}
              onClick={generatePinBlock}
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
                fontFamily: 'monospace',
                fontSize: 'clamp(18px, 4vw, 24px)',
                letterSpacing: '2px',
                color: '#1677ff',
                marginTop: '8px',
                wordBreak: 'break-all',
                lineHeight: '1.6'
              }}>
                {pinBlock.match(/.{1,4}/g)?.join(' ')}
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

