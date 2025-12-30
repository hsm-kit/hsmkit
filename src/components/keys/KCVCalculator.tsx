import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Checkbox } from 'antd';
import { SafetyCertificateOutlined, CopyOutlined, CalculatorOutlined, NumberOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { calculateKCV, isValidHex, cleanHexInput } from '../../utils/crypto';

const { Title, Text } = Typography;

const KCVCalculator: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.kcvCalculator.title}
            </Title>
            <CollapsibleInfo title={t.kcvCalculator.kcvCalcTitle}>
              {algorithm === 'AES' ? t.kcvCalculator.aesCalcDesc : t.kcvCalculator.desCalcDesc}
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.kcvCalculator.description}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

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
                  {t.kcvCalculator.autoAdjustParity}
                </Checkbox>
                <div style={{ marginTop: 4, marginLeft: 24 }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {t.kcvCalculator.parityAdjustmentHint}
                  </Text>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<CalculatorOutlined />}
                onClick={performCalculation}
                size="large"
              >
                {t.kcvCalculator.calculateKCV}
              </Button>
            </div>
          </div>
        </Card>

        {error && (
          <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {kcvResult && (
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
            extra={
              <Button 
                type={isDark ? 'primary' : 'default'}
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(kcvResult);
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
                {t.kcvCalculator.keyCheckValue}
              </Text>
              <div style={{
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: 'clamp(20px, 5vw, 28px)',
                letterSpacing: '3px',
                color: isDark ? '#95de64' : '#237804',
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

