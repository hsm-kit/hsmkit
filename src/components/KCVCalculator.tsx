import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Checkbox, Space } from 'antd';
import { SafetyCertificateOutlined, CopyOutlined, CalculatorOutlined, NumberOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { calculateKCV, isValidHex, cleanHexInput } from '../utils/crypto';

const { Title, Text } = Typography;

const KCVCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [keyInput, setKeyInput] = useState('');
  const [algorithm, setAlgorithm] = useState<'DES' | 'AES'>('AES');
  const [adjustParity, setAdjustParity] = useState(false);
  const [kcvResult, setKcvResult] = useState('');
  const [error, setError] = useState('');

  const performCalculation = () => {
    setError('');
    setKcvResult('');

    const cleanKey = cleanHexInput(keyInput);

    if (!isValidHex(cleanKey)) {
      setError(t.kcvCalculator.errorInvalidHex);
      return;
    }

    const keyBytes = cleanKey.length / 2;
    
    if (algorithm === 'DES' && ![8, 16, 24].includes(keyBytes)) {
      setError(t.kcvCalculator.errorDesLength);
      return;
    }
    if (algorithm === 'AES' && ![16, 24, 32].includes(keyBytes)) {
      setError(t.kcvCalculator.errorAesLength);
      return;
    }

    try {
      const kcv = calculateKCV(cleanKey, { 
        algorithm, 
        adjustParity: algorithm === 'DES' ? adjustParity : false 
      });
      setKcvResult(kcv);
    } catch (err) {
      setError(t.kcvCalculator.errorCalculation);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
            {t.kcvCalculator.title}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.kcvCalculator.description}
          </Text>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.kcvCalculator.algorithm}:
              </Text>
              <Segmented
                value={algorithm}
                onChange={(value) => setAlgorithm(value as 'DES' | 'AES')}
                options={[
                  { label: 'AES', value: 'AES' },
                  { label: 'DES/3DES', value: 'DES' }
                ]}
                block
                size="large"
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                <NumberOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                {t.kcvCalculator.keyInput}:
              </Text>
              <Input.TextArea
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder={t.kcvCalculator.keyPlaceholder}
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
              />
            </div>

            {algorithm === 'DES' && (
              <div>
                <Checkbox 
                  checked={adjustParity}
                  onChange={e => setAdjustParity(e.target.checked)}
                >
                  <Space>
                    <Text>自动修正奇偶校验位</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      (Parity Adjustment)
                    </Text>
                  </Space>
                </Checkbox>
                <div style={{ marginTop: 4, marginLeft: 24 }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    某些密钥可能未设置正确的奇偶校验位，勾选此项可自动修正
                  </Text>
                </div>
              </div>
            )}

            <Button 
              type="primary" 
              icon={<CalculatorOutlined />}
              onClick={performCalculation}
              size="large"
              block
            >
              {t.kcvCalculator.calculateKCV}
            </Button>
          </div>
        </Card>

        {error && (
          <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {kcvResult && (
          <Card 
            title={<><SafetyCertificateOutlined /> {t.common.result}</>}
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
            extra={
              <Button 
                type="text" 
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(kcvResult);
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
                {t.kcvCalculator.keyCheckValue}
              </Text>
              <div style={{
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: 'clamp(20px, 5vw, 28px)',
                letterSpacing: '3px',
                color: '#52c41a',
                marginTop: '8px',
                fontWeight: 'bold'
              }}>
                {kcvResult}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KCVCalculator;

