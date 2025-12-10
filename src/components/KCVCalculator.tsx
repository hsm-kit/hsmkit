import React, { useState } from 'react';
import { Card, Button, Radio, message, Divider, Typography, Input } from 'antd';
import { SafetyCertificateOutlined, CopyOutlined, CalculatorOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { useLanguage } from '../hooks/useLanguage';

const { Title, Text } = Typography;

const KCVCalculator: React.FC = () => {
  const { t } = useLanguage();
  const [keyInput, setKeyInput] = useState('');
  const [algorithm, setAlgorithm] = useState<'DES' | 'AES'>('AES');
  const [kcvResult, setKcvResult] = useState('');
  const [error, setError] = useState('');

  const calculateKCV = () => {
    setError('');
    setKcvResult('');

    const cleanKey = keyInput.replace(/\s/g, '').toUpperCase();

    if (!/^[0-9A-F]+$/i.test(cleanKey)) {
      setError(t.kcvCalculator.errorInvalidHex);
      return;
    }

    try {
      const keyBytes = cleanKey.length / 2;
      
      if (algorithm === 'DES' && ![8, 16, 24].includes(keyBytes)) {
        setError(t.kcvCalculator.errorDesLength);
        return;
      }
      if (algorithm === 'AES' && ![16, 24, 32].includes(keyBytes)) {
        setError(t.kcvCalculator.errorAesLength);
        return;
      }

      const key = CryptoJS.enc.Hex.parse(cleanKey);
      const zero = CryptoJS.enc.Hex.parse('0000000000000000');

      let encrypted;
      if (algorithm === 'AES') {
        encrypted = CryptoJS.AES.encrypt(zero, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
      } else {
        encrypted = CryptoJS.TripleDES.encrypt(zero, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
      }

      const kcv = encrypted.ciphertext.toString().toUpperCase().substring(0, 6);
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
              <Radio.Group 
                value={algorithm} 
                onChange={e => setAlgorithm(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="AES">AES</Radio.Button>
                <Radio.Button value="DES">DES/3DES</Radio.Button>
              </Radio.Group>
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.kcvCalculator.keyInput}:
              </Text>
              <Input.TextArea
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                placeholder={t.kcvCalculator.keyPlaceholder}
                autoSize={{ minRows: 2, maxRows: 4 }}
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <Button 
              type="primary" 
              icon={<CalculatorOutlined />}
              onClick={calculateKCV}
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
                fontFamily: 'monospace',
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

