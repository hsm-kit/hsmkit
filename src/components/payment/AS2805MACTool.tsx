import React, { useState } from 'react';
import { Card, Button, Select, Input, message, Tag, Typography, Divider } from 'antd';
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
  
  const [algorithm, setAlgorithm] = useState(t.mac.as2805.algorithmMethod2);
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
      message.success(t.common?.copied || t.mac.as2805.copied);
    } catch {
      message.error(t.mac.as2805.error.calculationFailed);
    }
  };

  const handleCalculate = () => {
    setError('');
    setResult('');
    
    const cleanKL = sanitizeHex(keyKL);
    const cleanKR = sanitizeHex(keyKR);
    const cleanData = sanitizeHex(data);
    
    if (cleanKL.length !== 16) {
      setError(t.mac.as2805.error.invalidKeyKL);
      return;
    }
    if (cleanKR.length !== 16) {
      setError(t.mac.as2805.error.invalidKeyKR);
      return;
    }
    if (cleanData.length === 0) {
      setError(t.mac.as2805.error.emptyData);
      return;
    }
    
    const trunc = parseInt(truncation);
    if (isNaN(trunc) || trunc < 1 || trunc > 8) {
      setError(t.mac.as2805.error.invalidTruncation);
      return;
    }
    
    try {
      const mac = calculateAS2805MAC(cleanKL, cleanKR, cleanData, trunc);
      setResult(mac);
    } catch {
      setError(t.mac.as2805.error.calculationFailed);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.mac.as2805.title}
          </Title>
          <CollapsibleInfo title={t.mac.as2805.infoTitle}>
            <div>{t.mac.as2805.infoDescription1}</div>
            <div style={{ marginTop: 8 }}>{t.mac.as2805.infoDescription2}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.mac.as2805.description}
        </Text>
        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.as2805.algorithm}</Text>
            <Select value={algorithm} onChange={setAlgorithm} style={{ width: '100%' }} size="large"
              options={[
                { label: t.mac.as2805.algorithmMethod1, value: t.mac.as2805.algorithmMethod1 },
                { label: t.mac.as2805.algorithmMethod2, value: t.mac.as2805.algorithmMethod2 },
              ]}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.as2805.keyKL}</Text>
            <Input value={keyKL} onChange={e => setKeyKL(sanitizeHex(e.target.value))} placeholder={t.mac.as2805.keyKLPlaceholder}
              maxLength={16} suffix={lengthIndicator(sanitizeHex(keyKL).length, 16)} style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} size="large" />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.as2805.keyKR}</Text>
            <Input value={keyKR} onChange={e => setKeyKR(sanitizeHex(e.target.value))} placeholder={t.mac.as2805.keyKRPlaceholder}
              maxLength={16} suffix={lengthIndicator(sanitizeHex(keyKR).length, 16)} style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} size="large" />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.as2805.data}</Text>
            <TextArea 
              value={data} 
              onChange={e => setData(sanitizeHex(e.target.value))} 
              placeholder={t.mac.as2805.dataPlaceholder}
              autoSize={{ minRows: 6, maxRows: 12 }} 
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} 
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.as2805.truncation}</Text>
            <Input 
              value={truncation} 
              onChange={e => setTruncation(e.target.value.replace(/[^0-9]/g, ''))} 
              placeholder={t.mac.as2805.truncationPlaceholder}
              maxLength={1} 
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }} 
              size="large" 
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button type="primary" size="large" icon={<CalculatorOutlined />} onClick={handleCalculate}>{t.mac.as2805.calculate}</Button>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: isDark ? '#2a1215' : '#fff2f0', border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`, borderRadius: '6px' }}>
              <Text type="danger" style={{ fontSize: '13px' }}>{error}</Text>
            </div>
          )}

          {result && (
            <div style={{ padding: '16px', background: isDark ? '#162312' : '#f6ffed', border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`, borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong style={{ fontSize: '14px' }}>{t.mac.as2805.result}</Text>
                <Tag color="green">[{result.length}]</Tag>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input value={result} readOnly style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px', fontWeight: 600, color: '#52c41a', flex: 1 }} size="large" />
                <Button icon={<CopyOutlined />} onClick={() => handleCopy(result)} size="large">{t.common?.copy || t.mac.as2805.copied}</Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AS2805MACTool;