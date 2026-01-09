import React, { useState } from 'react';
import { Card, Button, Select, Input, message, Tag, Typography, Divider } from 'antd';
import { CalculatorOutlined, CopyOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ANSI X9.9 / X9.19 MAC calculation
const calculateANSIMAC = (
  algorithm: string,
  keyK: string,
  keyKPrime: string,
  data: string,
  truncation: number
): string => {
  const cleanData = data.replace(/\s/g, '').toUpperCase();
  const cleanK = keyK.replace(/\s/g, '').toUpperCase();
  const cleanKP = keyKPrime.replace(/\s/g, '').toUpperCase();
  
  // Pad data to multiple of 8 bytes
  let paddedData = cleanData;
  if (paddedData.length % 16 !== 0) {
    paddedData = paddedData.padEnd(Math.ceil(paddedData.length / 16) * 16, '0');
  }
  
  const dataWords = CryptoJS.enc.Hex.parse(paddedData);
  const key = CryptoJS.enc.Hex.parse(cleanK);
  let mac: CryptoJS.lib.WordArray;
  
  if (algorithm === 'ANSI MAC X9.9 (Wholesale MAC)') {
    // X9.9: CBC-MAC with DES
    mac = CryptoJS.DES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    }).ciphertext;
  } else if (algorithm === 'ANSI MAC X9.19 (Retail MAC)') {
    // X9.19: CBC with DES, last block with 3DES
    const blocks = paddedData.match(/.{1,16}/g) || [];
    let iv = CryptoJS.enc.Hex.parse('0000000000000000');
    
    // Process all blocks with DES
    for (let i = 0; i < blocks.length; i++) {
      const block = CryptoJS.enc.Hex.parse(blocks[i]);
      const xored = CryptoJS.lib.WordArray.create(
        block.words.map((w, idx) => w ^ iv.words[idx]),
        8
      );
      iv = CryptoJS.DES.encrypt(xored, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext;
    }
    
    // Final block with 3DES
    const keyPrime = CryptoJS.enc.Hex.parse(cleanKP || cleanK);
    const key3des = CryptoJS.enc.Hex.parse(cleanK + keyPrime.toString());
    mac = CryptoJS.TripleDES.encrypt(iv, key3des, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }).ciphertext;
  } else {
    // Default to X9.9
    mac = CryptoJS.DES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    }).ciphertext;
  }
  
  const result = mac.toString().toUpperCase();
  const lastBlock = result.substring(result.length - 16);
  
  // Apply truncation
  if (truncation > 0 && truncation < 8) {
    return lastBlock.substring(0, truncation * 2);
  }
  
  return lastBlock;
};

const ANSIMACTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [algorithm, setAlgorithm] = useState('ANSI MAC X9.9 (Wholesale MAC)');
  const [keyK, setKeyK] = useState('');
  const [keyKPrime, setKeyKPrime] = useState('');
  const [data, setData] = useState('');
  const [truncation, setTruncation] = useState('4');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const sanitizeHex = (value: string) => {
    return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  };

  const lengthIndicator = (current: number, expected: number) => (
    <Text 
      style={{ 
        fontSize: '12px', 
        color: current === expected ? '#52c41a' : '#999',
        fontWeight: current > 0 ? 600 : 400
      }}
    >
      [{current}]
    </Text>
  );

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t.common?.copied || 'Copied to clipboard!');
    } catch {
      message.error(t.common?.copyFailed || 'Failed to copy');
    }
  };

  const handleCalculate = () => {
    setError('');
    setResult('');
    
    const cleanK = sanitizeHex(keyK);
    const cleanKP = sanitizeHex(keyKPrime);
    const cleanData = sanitizeHex(data);
    
    if (cleanK.length !== 16 && cleanK.length !== 32) {
      setError(t.mac?.ansimac?.error?.invalidKeyK || 'Key (K) must be 16 or 32 hex characters');
      return;
    }
    
    if (cleanData.length === 0) {
      setError(t.mac?.ansimac?.error?.emptyData || 'Data is required');
      return;
    }
    
    const trunc = parseInt(truncation);
    if (isNaN(trunc) || trunc < 1 || trunc > 8) {
      setError(t.mac?.ansimac?.error?.invalidTruncation || 'Truncation must be between 1 and 8');
      return;
    }
    
    try {
      const mac = calculateANSIMAC(algorithm, cleanK, cleanKP, cleanData, trunc);
      setResult(mac);
    } catch {
      setError(t.mac?.ansimac?.error?.calculationFailed || 'Failed to calculate MAC');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.mac?.ansimac?.title || 'ANSI MACs'}
          </Title>
          <CollapsibleInfo title={t.mac?.ansimac?.infoTitle || 'About ANSI MACs'}>
            <div>
              {t.mac?.ansimac?.infoDescription1 || 'ANSI X9.9 and X9.19 define MAC algorithms used in financial transactions.'}
            </div>
            <div style={{ marginTop: 8 }}>
              {t.mac?.ansimac?.infoDescription2 || 'X9.9 (Wholesale MAC) uses DES CBC-MAC. X9.19 (Retail MAC) uses DES with final 3DES encryption for enhanced security.'}
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.mac?.ansimac?.description || 'Calculate Message Authentication Code using ANSI X9.9 or X9.19 standard.'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.mac?.ansimac?.algorithmLabel || 'MAC Algorithm:'}
            </Text>
            <Select
              value={algorithm}
              onChange={setAlgorithm}
              style={{ width: '100%' }}
              size="large"
              options={[
                { label: t.mac?.ansimac?.algorithmX99 || 'ANSI MAC X9.9 (Wholesale MAC)', value: 'ANSI MAC X9.9 (Wholesale MAC)' },
                { label: t.mac?.ansimac?.algorithmX919 || 'ANSI MAC X9.19 (Retail MAC)', value: 'ANSI MAC X9.19 (Retail MAC)' },
              ]}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac?.ansimac?.keyK || 'Key (K):'}</Text>
            <Input
              value={keyK}
              onChange={e => setKeyK(sanitizeHex(e.target.value))}
              placeholder="3636353534343333"
              maxLength={32}
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '14px'
              }}
              size="large"
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac?.ansimac?.keyKPrime || 'Key (K\'):'}</Text>
            <Input
              value={keyKPrime}
              onChange={e => setKeyKPrime(sanitizeHex(e.target.value))}
              placeholder="FEDCBA9876543210"
              maxLength={32}
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '14px'
              }}
              size="large"
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac?.ansimac?.dataLabel || 'Data:'}</Text>
            <TextArea
              value={data}
              onChange={e => setData(sanitizeHex(e.target.value))}
              placeholder={t.mac?.ansimac?.dataPlaceholder || 'Enter hex data'}
              autoSize={{ minRows: 6, maxRows: 12 }}
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.mac?.ansimac?.truncation || 'Truncation:'}</Text>
              {lengthIndicator(truncation.length, 1)}
            </div>
            <Input
              value={truncation}
              onChange={e => setTruncation(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="4"
              maxLength={1}
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '14px'
              }}
              size="large"
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              size="large"
              icon={<CalculatorOutlined />}
              onClick={handleCalculate}
            >
              {t.mac?.ansimac?.calculate || 'Calculate MAC'}
            </Button>
          </div>

          {error && (
            <div style={{ 
              padding: '12px 16px', 
              background: isDark ? '#2a1215' : '#fff2f0',
              border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
              borderRadius: '6px'
            }}>
              <Text type="danger" style={{ fontSize: '13px' }}>{error}</Text>
            </div>
          )}

          {result && (
            <div style={{ 
              padding: '16px', 
              background: isDark ? '#162312' : '#f6ffed',
              border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`,
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong style={{ fontSize: '14px' }}>{t.mac?.ansimac?.result || 'MAC:'}</Text>
                <Tag color="green">[{result.length}]</Tag>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Input
                  value={result}
                  readOnly
                  style={{ 
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#52c41a',
                    flex: 1
                  }}
                  size="large"
                />
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => handleCopy(result)}
                  size="large"
                >
                  {t.common?.copy || 'Copy'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ANSIMACTool;
