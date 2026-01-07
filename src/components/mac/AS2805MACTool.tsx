import React, { useState } from 'react';
import { Card, Button, Select, Input, message, Tag, Typography } from 'antd';
import { CalculatorOutlined, CopyOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;
const { TextArea } = Input;

const calculateAS2805MAC = (
  keyKL: string,
  keyKR: string,
  data: string,
  truncation: number
): string => {
  const cleanData = data.replace(/\s/g, '').toUpperCase();
  const cleanKL = keyKL.replace(/\s/g, '').toUpperCase();
  const cleanKR = keyKR.replace(/\s/g, '').toUpperCase();
  
  let paddedData = cleanData;
  if (paddedData.length % 16 !== 0) {
    paddedData = paddedData.padEnd(Math.ceil(paddedData.length / 16) * 16, '0');
  }
  
  const keyL = CryptoJS.enc.Hex.parse(cleanKL);
  const key3des = CryptoJS.enc.Hex.parse(cleanKL + cleanKR);
  const dataWords = CryptoJS.enc.Hex.parse(paddedData);
  
  // AS2805: CBC with left key, last block with 3DES
  const cbcMac = CryptoJS.DES.encrypt(dataWords, keyL, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.NoPadding,
    iv: CryptoJS.enc.Hex.parse('0000000000000000'),
  }).ciphertext;
  
  const lastBlock = CryptoJS.lib.WordArray.create(
    cbcMac.words.slice(-2),
    8
  );
  
  const mac = CryptoJS.TripleDES.encrypt(lastBlock, key3des, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).ciphertext;
  
  const result = mac.toString().toUpperCase();
  
  if (truncation > 0 && truncation < 8) {
    return result.substring(0, truncation * 2);
  }
  
  return result;
};

const AS2805MACTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [algorithm, setAlgorithm] = useState('AS2805.4.1 MAC Method 2');
  const [keyKL, setKeyKL] = useState('');
  const [keyKR, setKeyKR] = useState('');
  const [data, setData] = useState('');
  const [truncation, setTruncation] = useState('4');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const sanitizeHex = (value: string) => value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();

  const lengthIndicator = (current: number, expected: number) => (
    <Text style={{ fontSize: '12px', color: current === expected ? '#52c41a' : '#999', fontWeight: current > 0 ? 600 : 400 }}>
      [{current}]
    </Text>
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t.common?.copied || 'Copied to clipboard!');
    } catch {
      message.error('Failed to copy');
    }
  };

  const handleCalculate = () => {
    setError('');
    setResult('');
    
    const cleanKL = sanitizeHex(keyKL);
    const cleanKR = sanitizeHex(keyKR);
    const cleanData = sanitizeHex(data);
    
    if (cleanKL.length !== 16) {
      setError('Key (K|KL) must be 16 hex characters');
      return;
    }
    if (cleanKR.length !== 16) {
      setError('Key (KR) must be 16 hex characters');
      return;
    }
    if (cleanData.length === 0) {
      setError('Data is required');
      return;
    }
    
    const trunc = parseInt(truncation);
    if (isNaN(trunc) || trunc < 1 || trunc > 8) {
      setError('Truncation must be between 1 and 8');
      return;
    }
    
    try {
      const mac = calculateAS2805MAC(cleanKL, cleanKR, cleanData, trunc);
      setResult(mac);
    } catch (err) {
      setError('Failed to calculate MAC');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            AS2805 MACs
          </Title>
          <CollapsibleInfo title="About AS2805 MACs">
            <div>AS2805.4.1 defines MAC algorithms used in Australian payment systems.</div>
            <div style={{ marginTop: 8 }}>Method 2 uses DES CBC-MAC with final 3DES encryption.</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '13px' }}>
          Calculate Message Authentication Code using AS2805.4.1 standard.
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>MAC Algorithm:</Text>
            <Select value={algorithm} onChange={setAlgorithm} style={{ width: '100%' }} size="large"
              options={[
                { label: 'AS2805.4.1 MAC Method 1', value: 'AS2805.4.1 MAC Method 1' },
                { label: 'AS2805.4.1 MAC Method 2', value: 'AS2805.4.1 MAC Method 2' },
              ]}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Key (K|KL):</Text>
              {lengthIndicator(sanitizeHex(keyKL).length, 16)}
            </div>
            <Input value={keyKL} onChange={e => setKeyKL(sanitizeHex(e.target.value))} placeholder="0123456789ABCDEF"
              maxLength={16} style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} size="large" />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Key (KR):</Text>
              {lengthIndicator(sanitizeHex(keyKR).length, 16)}
            </div>
            <Input value={keyKR} onChange={e => setKeyKR(sanitizeHex(e.target.value))} placeholder="FEDCBA9876543210"
              maxLength={16} style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} size="large" />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Data:</Text>
              {lengthIndicator(sanitizeHex(data).length, 0)}
            </div>
            <TextArea value={data} onChange={e => setData(sanitizeHex(e.target.value))} placeholder="Enter hex data"
              autoSize={{ minRows: 6, maxRows: 12 }} style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Truncation:</Text>
              {lengthIndicator(truncation.length, 1)}
            </div>
            <Input value={truncation} onChange={e => setTruncation(e.target.value.replace(/[^0-9]/g, ''))} placeholder="4"
              maxLength={1} style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} size="large" />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button type="primary" size="large" icon={<CalculatorOutlined />} onClick={handleCalculate}>Calculate MAC</Button>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: isDark ? '#2a1215' : '#fff2f0', border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`, borderRadius: '6px' }}>
              <Text type="danger" style={{ fontSize: '13px' }}>{error}</Text>
            </div>
          )}

          {result && (
            <div style={{ padding: '16px', background: isDark ? '#162312' : '#f6ffed', border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`, borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong style={{ fontSize: '14px' }}>MAC:</Text>
                <Tag color="green">[{result.length}]</Tag>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input value={result} readOnly style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px', fontWeight: 600, color: '#52c41a', flex: 1 }} size="large" />
                <Button icon={<CopyOutlined />} onClick={() => handleCopy(result)} size="large">{t.common?.copy || 'Copy'}</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AS2805MACTool;