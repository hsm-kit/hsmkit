import React, { useState } from 'react';
import { Card, Input, Button, Segmented, Select, message, Typography, Divider } from 'antd';
import { CopyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { TextArea } = Input;
const { Title, Text } = Typography;

type HashType =
  | 'None'
  | 'MD4'
  | 'MD5'
  | 'SHA-1'
  | 'SHA-224'
  | 'SHA-256'
  | 'SHA-384'
  | 'SHA-512'
  | 'SHA3-224'
  | 'SHA3-256'
  | 'SHA3-384'
  | 'SHA3-512'
  | 'RIPEMD-160'
  | 'TIGER-192'
  | 'CRC32'
  | 'CRC32_RFC1510'
  | 'CRC24_RFC2440'
  | 'WHIRLPOOL'
  | 'SM3';
type InputType = 'ASCII' | 'Hexadecimal';

const HMACTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [hashType, setHashType] = useState<HashType>('SHA-256');
  const [keyType, setKeyType] = useState<InputType>('Hexadecimal');
  const [keyInput, setKeyInput] = useState<string>('');
  const [dataType, setDataType] = useState<InputType>('Hexadecimal');
  const [dataInput, setDataInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Validate hex string
  const isValidHex = (str: string): boolean => {
    if (!str) return false;
    const hexRegex = /^[0-9A-Fa-f]+$/;
    return hexRegex.test(str) && str.length % 2 === 0;
  };

  // Calculate HMAC
  const calculateHMAC = (
    hash: HashType,
    keyStr: string,
    keyIsHex: boolean,
    dataStr: string,
    dataIsHex: boolean
  ): string => {
    try {
      // Parse key
      const key = keyIsHex ? CryptoJS.enc.Hex.parse(keyStr) : CryptoJS.enc.Utf8.parse(keyStr);

      // Parse data
      const data = dataIsHex ? CryptoJS.enc.Hex.parse(dataStr) : CryptoJS.enc.Utf8.parse(dataStr);

      // Calculate HMAC based on hash type
      let hmac: any;
      switch (hash) {
        case 'SHA-1':
          hmac = CryptoJS.HmacSHA1(data, key);
          break;
        case 'SHA-224':
          hmac = CryptoJS.HmacSHA224(data, key);
          break;
        case 'SHA-256':
          hmac = CryptoJS.HmacSHA256(data, key);
          break;
        case 'SHA-384':
          hmac = CryptoJS.HmacSHA384(data, key);
          break;
        case 'SHA-512':
          hmac = CryptoJS.HmacSHA512(data, key);
          break;
        case 'SHA3-224':
        case 'SHA3-256':
        case 'SHA3-384':
        case 'SHA3-512':
          hmac = CryptoJS.HmacSHA3(data, key);
          break;
        case 'MD5':
          hmac = CryptoJS.HmacMD5(data, key);
          break;
        case 'RIPEMD-160':
          if ((CryptoJS as any).HmacRIPEMD160) {
            hmac = (CryptoJS as any).HmacRIPEMD160(data, key);
          } else {
            throw new Error('RIPEMD-160 HMAC not available in this build');
          }
          break;
        case 'None':
          throw new Error('Please select a hash algorithm');
        default:
          throw new Error('Selected hash algorithm is not supported in this build');
      }

      return hmac.toString().toUpperCase();
    } catch (err) {
      throw new Error('HMAC calculation failed: ' + (err as Error).message);
    }
  };

  // Handle calculate
  const handleCalculate = () => {
    setResult('');
    setError('');

    try {
      // Validate key
      if (!keyInput) {
        throw new Error(t.mac.hmac.error.emptyKey);
      }
      if (keyType === 'Hexadecimal' && !isValidHex(keyInput)) {
        throw new Error(t.mac.hmac.error.invalidKeyFormat);
      }

      // Validate data
      if (!dataInput) {
        throw new Error(t.mac.hmac.error.emptyData);
      }
      if (dataType === 'Hexadecimal' && !isValidHex(dataInput)) {
        throw new Error(t.mac.hmac.error.invalidDataFormat);
      }

      // Calculate HMAC
      const hmac = calculateHMAC(
        hashType,
        keyInput,
        keyType === 'Hexadecimal',
        dataInput,
        dataType === 'Hexadecimal'
      );
      setResult(hmac);
      message.success(t.mac.hmac.success);
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  // Handle copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.mac.hmac.copied);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.mac.hmac.title}
            </Title>
            <CollapsibleInfo title="About HMAC">
              <div>{t.mac.hmac.description}</div>
            </CollapsibleInfo>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

            {/* Hash Type Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.mac.hmac.hashType}:
                </Text>
                <Select
                  value={hashType}
                  onChange={(value) => setHashType(value as HashType)}
                  showSearch
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  options={[
                    { label: 'None', value: 'None' },
                    { label: 'MD4', value: 'MD4' },
                    { label: 'MD5', value: 'MD5' },
                    { label: 'SHA-1', value: 'SHA-1' },
                    { label: 'SHA-224', value: 'SHA-224' },
                    { label: 'SHA-256', value: 'SHA-256' },
                    { label: 'SHA-384', value: 'SHA-384' },
                    { label: 'SHA-512', value: 'SHA-512' },
                    { label: 'SHA3-224', value: 'SHA3-224' },
                    { label: 'SHA3-256', value: 'SHA3-256' },
                    { label: 'SHA3-384', value: 'SHA3-384' },
                    { label: 'SHA3-512', value: 'SHA3-512' },
                    { label: 'RIPEMD-160', value: 'RIPEMD-160' },
                    { label: 'TIGER-192', value: 'TIGER-192' },
                    { label: 'CRC32', value: 'CRC32' },
                    { label: 'CRC32_RFC1510', value: 'CRC32_RFC1510' },
                    { label: 'CRC24_RFC2440', value: 'CRC24_RFC2440' },
                    { label: 'WHIRLPOOL', value: 'WHIRLPOOL' },
                    { label: 'SM3', value: 'SM3' }
                  ]}
                />
            </div>

            {/* Key Input Type */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Key Input:
              </Text>
              <Segmented
                value={keyType}
                onChange={(value) => setKeyType(value as InputType)}
                options={[
                  { label: 'ASCII', value: 'ASCII' },
                  { label: 'Hexadecimal', value: 'Hexadecimal' }
                ]}
                block
                style={{ marginBottom: 8 }}
              />

              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.hmac.hmacKey}:
              </Text>
              <TextArea
                value={keyInput}
                onChange={(e) => setKeyInput(keyType === 'Hexadecimal' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={keyType === 'Hexadecimal' ? 'Enter hex key' : 'Enter ASCII key'}
                autoSize={{ minRows: 3, maxRows: 6 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Data Input Type */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Data Input:
              </Text>
              <Segmented
                value={dataType}
                onChange={(value) => setDataType(value as InputType)}
                options={[
                  { label: 'ASCII', value: 'ASCII' },
                  { label: 'Hexadecimal', value: 'Hexadecimal' }
                ]}
                block
                style={{ marginBottom: 8 }}
              />

              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.hmac.data}:
              </Text>
              <TextArea
                value={dataInput}
                onChange={(e) => setDataInput(dataType === 'Hexadecimal' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={dataType === 'Hexadecimal' ? 'Enter hex data' : 'Enter ASCII data'}
                autoSize={{ minRows: 4, maxRows: 8 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Calculate Button */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleCalculate}
                size="large"
              >
                {t.mac.hmac.calculate}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* Result Display */}
        {result && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                <ThunderboltOutlined />
                {' '}
                {t.mac.hmac.result}
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
                onClick={() => handleCopy(result)}
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
              border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
              wordBreak: 'break-all',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              color: isDark ? '#95de64' : '#237804',
              fontWeight: 600
            }}>
              {result}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HMACTool;
