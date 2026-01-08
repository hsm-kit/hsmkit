import React, { useState } from 'react';
import { Card, Button, Select, Input, message, Tag, Typography, Divider } from 'antd';
import { CalculatorOutlined, CopyOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ISO/IEC 9797-1 MAC Algorithms
const calculateISO9797MAC = (
  algorithm: string,
  keys: string[],
  data: string,
  padding: string,
  truncation: number
): string => {
  const cleanData = data.replace(/\s/g, '').toUpperCase();
  const cleanKeys = keys.map(k => k.replace(/\s/g, '').toUpperCase());
  
  // Pad data according to padding method
  let paddedData = cleanData;
  const blockSize = 16; // 8 bytes = 16 hex characters
  
  if (padding === 'ISO9797-1-1') {
    // Padding method 1: Pad with zeros
    if (paddedData.length % blockSize !== 0) {
      paddedData = paddedData.padEnd(Math.ceil(paddedData.length / blockSize) * blockSize, '0');
    }
  } else if (padding === 'ISO9797-1-2') {
    // Padding method 2: Pad with 0x80 followed by zeros
    paddedData += '80';
    if (paddedData.length % blockSize !== 0) {
      paddedData = paddedData.padEnd(Math.ceil(paddedData.length / blockSize) * blockSize, '0');
    }
  } else if (padding === 'ISO9797-1-3') {
    // Padding method 3: Pad with length
    const dataLength = (cleanData.length / 2).toString(16).padStart(16, '0');
    paddedData = dataLength + paddedData;
    if (paddedData.length % blockSize !== 0) {
      paddedData = paddedData.padEnd(Math.ceil(paddedData.length / blockSize) * blockSize, '0');
    }
  }
  
  const dataWords = CryptoJS.enc.Hex.parse(paddedData);
  let mac: CryptoJS.lib.WordArray;
  
  // Select algorithm
  if (algorithm === 'MAC Algorithm 1') {
    // CBC-MAC with single DES
    const key = CryptoJS.enc.Hex.parse(cleanKeys[0]);
    mac = CryptoJS.DES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    }).ciphertext;
  } else if (algorithm === 'MAC Algorithm 2') {
    // CBC-MAC with DES, final block encrypted with key2
    const key1 = CryptoJS.enc.Hex.parse(cleanKeys[0]);
    const key2 = CryptoJS.enc.Hex.parse(cleanKeys[3] || cleanKeys[0]);
    
    // Encrypt all but last block with key1
    const blocks = paddedData.match(/.{1,16}/g) || [];
    let iv = CryptoJS.enc.Hex.parse('0000000000000000');
    
    for (let i = 0; i < blocks.length - 1; i++) {
      const block = CryptoJS.enc.Hex.parse(blocks[i]);
      const xored = CryptoJS.lib.WordArray.create(
        block.words.map((w, idx) => w ^ iv.words[idx]),
        8
      );
      iv = CryptoJS.DES.encrypt(xored, key1, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext;
    }
    
    // Last block with key2
    const lastBlock = CryptoJS.enc.Hex.parse(blocks[blocks.length - 1]);
    const xored = CryptoJS.lib.WordArray.create(
      lastBlock.words.map((w, idx) => w ^ iv.words[idx]),
      8
    );
    mac = CryptoJS.DES.encrypt(xored, key2, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }).ciphertext;
  } else if (algorithm === 'MAC Algorithm 3') {
    // Retail MAC: CBC with DES, last block with 3DES
    const key1 = CryptoJS.enc.Hex.parse(cleanKeys[0]);
    const key2 = CryptoJS.enc.Hex.parse(cleanKeys[1] || cleanKeys[0]);
    
    // CBC-MAC with DES
    const cbcMac = CryptoJS.DES.encrypt(dataWords, key1, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    }).ciphertext;
    
    // Last 8 bytes encrypted with 3DES
    const lastBlock = CryptoJS.lib.WordArray.create(
      cbcMac.words.slice(-2),
      8
    );
    const key3des = CryptoJS.enc.Hex.parse(cleanKeys[0] + key2.toString());
    mac = CryptoJS.TripleDES.encrypt(lastBlock, key3des, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }).ciphertext;
  } else {
    // Default to Algorithm 1
    const key = CryptoJS.enc.Hex.parse(cleanKeys[0]);
    mac = CryptoJS.DES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    }).ciphertext;
  }
  
  // Get last block
  const result = mac.toString().toUpperCase();
  const lastBlock = result.substring(result.length - 16);
  
  // Apply truncation
  if (truncation > 0 && truncation < 8) {
    return lastBlock.substring(0, truncation * 2);
  }
  
  return lastBlock;
};

const ISO9797Tool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [algorithm, setAlgorithm] = useState('MAC Algorithm 1');
  const [keys, setKeys] = useState(['', '', '', '', '', '']);
  const [padding, setPadding] = useState('ISO9797-1-1');
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
      message.error('Failed to copy');
    }
  };

  const handleCalculate = () => {
    setError('');
    setResult('');
    
    const cleanKeys = keys.map(k => sanitizeHex(k));
    const cleanData = sanitizeHex(data);
    
    // Validate key
    if (cleanKeys[0].length !== 16 && cleanKeys[0].length !== 32) {
      setError(t.mac?.iso9797?.error?.invalidKeyLength || 'Key (K) must be 16 or 32 hex characters');
      return;
    }
    
    // Validate data
    if (cleanData.length === 0) {
      setError(t.mac?.iso9797?.error?.emptyData || 'Data is required');
      return;
    }
    
    // Validate truncation
    const trunc = parseInt(truncation);
    if (isNaN(trunc) || trunc < 1 || trunc > 8) {
      setError(t.mac?.iso9797?.error?.invalidTruncation || 'Truncation must be between 1 and 8');
      return;
    }
    
    try {
      const mac = calculateISO9797MAC(algorithm, cleanKeys, cleanData, padding, trunc);
      setResult(mac);
    } catch {
      setError(t.common?.error || 'Failed to calculate MAC');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.mac?.iso9797?.title || 'ISO/IEC 9797-1 MACs'}
          </Title>
          <CollapsibleInfo title={t.mac?.iso9797?.title || 'About ISO/IEC 9797-1'}>
            <div>
              {t.mac?.iso9797?.description || 'ISO/IEC 9797-1 defines MAC algorithms using block cipher algorithms like DES and Triple DES.'}
            </div>
            <div style={{ marginTop: 8 }}>
              It specifies different padding methods and MAC algorithms for data authentication in financial and security applications.
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.mac?.iso9797?.description || 'Calculate Message Authentication Code using ISO/IEC 9797-1 standard.'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.mac?.iso9797?.algorithm || 'MAC Algorithm'}:
            </Text>
            <Select
              value={algorithm}
              onChange={setAlgorithm}
              style={{ width: '100%' }}
              size="large"
              options={[
                { label: 'MAC Algorithm 1', value: 'MAC Algorithm 1' },
                { label: 'MAC Algorithm 2', value: 'MAC Algorithm 2' },
                { label: 'MAC Algorithm 3', value: 'MAC Algorithm 3' },
                { label: 'MAC Algorithm 4', value: 'MAC Algorithm 4' },
                { label: 'MAC Algorithm 5', value: 'MAC Algorithm 5' },
                { label: 'MAC Algorithm 6', value: 'MAC Algorithm 6' },
              ]}
            />
          </div>

          {[
            t.mac?.iso9797?.keyK || 'Key (K):',
            t.mac?.iso9797?.keyKPrime || "Key (K'):",
            t.mac?.iso9797?.keyKDoublePrime || 'Key (K"):',
            t.mac?.iso9797?.key2K || 'Key 2 (K):',
            t.mac?.iso9797?.key2KPrime || "Key 2 (K'):",
            t.mac?.iso9797?.key2KDoublePrime || 'Key 2 (K"):'
          ].map((label, idx) => (
            <div key={idx}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>{label}</Text>
              <Input
                value={keys[idx]}
                onChange={e => {
                  const newKeys = [...keys];
                  newKeys[idx] = sanitizeHex(e.target.value);
                  setKeys(newKeys);
                }}
                placeholder="3636353534343333"
                maxLength={32}
                style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  fontSize: '14px'
                }}
                size="large"
              />
            </div>
          ))}

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.mac?.iso9797?.padding || 'Padding'}:
            </Text>
            <Select
              value={padding}
              onChange={setPadding}
              style={{ width: '100%' }}
              size="large"
              options={[
                { label: 'ISO9797-1 (Padding method 1)', value: 'ISO9797-1-1' },
                { label: 'ISO9797-1 (Padding method 2)', value: 'ISO9797-1-2' },
                { label: 'ISO9797-1 (Padding method 3)', value: 'ISO9797-1-3' },
              ]}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac?.iso9797?.data || 'Data'}:</Text>
            <TextArea
              value={data}
              onChange={e => setData(sanitizeHex(e.target.value))}
              placeholder="Enter hex data"
              autoSize={{ minRows: 6, maxRows: 12 }}
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.mac?.iso9797?.truncation || 'Truncation'}:</Text>
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
              {t.mac?.iso9797?.calculate || 'Calculate MAC'}
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
                <Text strong style={{ fontSize: '14px' }}>MAC:</Text>
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

export default ISO9797Tool;
