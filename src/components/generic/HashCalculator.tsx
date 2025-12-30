import React, { useState, useCallback } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Select } from 'antd';
import { CopyOutlined, CalculatorOutlined, ClearOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import * as hashWasm from 'hash-wasm';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Hash algorithms supported with their library source
const HASH_TYPES = [
  { value: 'md4', label: 'MD4', lib: 'hash-wasm', bits: 128 },
  { value: 'md5', label: 'MD5', lib: 'crypto-js', bits: 128 },
  { value: 'sha1', label: 'SHA-1', lib: 'crypto-js', bits: 160 },
  { value: 'sha224', label: 'SHA-224', lib: 'crypto-js', bits: 224 },
  { value: 'sha256', label: 'SHA-256', lib: 'crypto-js', bits: 256 },
  { value: 'sha384', label: 'SHA-384', lib: 'crypto-js', bits: 384 },
  { value: 'sha512', label: 'SHA-512', lib: 'crypto-js', bits: 512 },
  { value: 'sha3-224', label: 'SHA3-224', lib: 'hash-wasm', bits: 224 },
  { value: 'sha3-256', label: 'SHA3-256', lib: 'hash-wasm', bits: 256 },
  { value: 'sha3-384', label: 'SHA3-384', lib: 'hash-wasm', bits: 384 },
  { value: 'sha3-512', label: 'SHA3-512', lib: 'hash-wasm', bits: 512 },
  { value: 'ripemd160', label: 'RIPEMD-160', lib: 'crypto-js', bits: 160 },
  { value: 'crc32', label: 'CRC32', lib: 'hash-wasm', bits: 32 },
  { value: 'whirlpool', label: 'WHIRLPOOL', lib: 'hash-wasm', bits: 512 },
  { value: 'blake2b', label: 'BLAKE2b-512', lib: 'hash-wasm', bits: 512 },
  { value: 'blake2s', label: 'BLAKE2s-256', lib: 'hash-wasm', bits: 256 },
  { value: 'blake3', label: 'BLAKE3', lib: 'hash-wasm', bits: 256 },
  { value: 'keccak256', label: 'Keccak-256', lib: 'hash-wasm', bits: 256 },
  { value: 'keccak512', label: 'Keccak-512', lib: 'hash-wasm', bits: 512 },
  { value: 'sm3', label: 'SM3', lib: 'hash-wasm', bits: 256 },
];

type InputType = 'ASCII' | 'Hex';

const HashCalculator: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [inputType, setInputType] = useState<InputType>('ASCII');
  const [hashType, setHashType] = useState<string>('sha256');
  const [inputData, setInputData] = useState<string>('');
  const [hashResult, setHashResult] = useState('');
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // 清理十六进制输入
  const cleanHex = (hex: string): string => {
    return hex.replace(/[\s\n\r]/g, '').toUpperCase();
  };

  // 验证十六进制
  const isValidHex = (hex: string): boolean => {
    return /^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0;
  };

  // Convert hex string to Uint8Array
  const hexToUint8Array = (hex: string): Uint8Array => {
    const cleanedHex = cleanHex(hex);
    const bytes = new Uint8Array(cleanedHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanedHex.substr(i * 2, 2), 16);
    }
    return bytes;
  };

  // Convert string to Uint8Array
  const stringToUint8Array = (str: string): Uint8Array => {
    return new TextEncoder().encode(str);
  };

  // Calculate hash using crypto-js
  const calculateCryptoJsHash = (data: string, type: string, isHex: boolean): string => {
    let input: CryptoJS.lib.WordArray | string;
    
    if (isHex) {
      input = CryptoJS.enc.Hex.parse(cleanHex(data));
    } else {
      input = data;
    }

    let hash: CryptoJS.lib.WordArray;

    switch (type) {
      case 'md5':
        hash = CryptoJS.MD5(input);
        break;
      case 'sha1':
        hash = CryptoJS.SHA1(input);
        break;
      case 'sha224':
        hash = CryptoJS.SHA224(input);
        break;
      case 'sha256':
        hash = CryptoJS.SHA256(input);
        break;
      case 'sha384':
        hash = CryptoJS.SHA384(input);
        break;
      case 'sha512':
        hash = CryptoJS.SHA512(input);
        break;
      case 'ripemd160':
        hash = CryptoJS.RIPEMD160(input);
        break;
      default:
        return '';
    }

    return hash.toString(CryptoJS.enc.Hex).toUpperCase();
  };

  // Calculate hash using hash-wasm
  const calculateHashWasmHash = async (data: Uint8Array, type: string): Promise<string> => {
    let result: string;

    switch (type) {
      case 'md4':
        result = await hashWasm.md4(data);
        break;
      case 'sha3-224':
        result = await hashWasm.sha3(data, 224);
        break;
      case 'sha3-256':
        result = await hashWasm.sha3(data, 256);
        break;
      case 'sha3-384':
        result = await hashWasm.sha3(data, 384);
        break;
      case 'sha3-512':
        result = await hashWasm.sha3(data, 512);
        break;
      case 'crc32':
        result = await hashWasm.crc32(data);
        break;
      case 'whirlpool':
        result = await hashWasm.whirlpool(data);
        break;
      case 'blake2b':
        result = await hashWasm.blake2b(data, 512);
        break;
      case 'blake2s':
        result = await hashWasm.blake2s(data, 256);
        break;
      case 'blake3':
        result = await hashWasm.blake3(data);
        break;
      case 'keccak256':
        result = await hashWasm.keccak(data, 256);
        break;
      case 'keccak512':
        result = await hashWasm.keccak(data, 512);
        break;
      case 'sm3':
        result = await hashWasm.sm3(data);
        break;
      default:
        return '';
    }

    return result.toUpperCase();
  };

  // Main calculation function
  const performCalculation = useCallback(async () => {
    setError('');
    setHashResult('');

    if (!inputData.trim()) {
      setError(t.hash?.errorNoInput || 'Please enter input data');
      return;
    }

    const isHex = inputType === 'Hex';

    // Validate hex input
    if (isHex) {
      const cleaned = cleanHex(inputData);
      if (!/^[0-9A-Fa-f]*$/.test(cleaned)) {
        setError(t.hash?.errorInvalidHex || 'Invalid hexadecimal input');
        return;
      }
      if (cleaned.length % 2 !== 0) {
        setError(t.hash?.errorOddHex || 'Hexadecimal input must have even number of characters');
        return;
      }
    }

    const hashConfig = HASH_TYPES.find(h => h.value === hashType);
    if (!hashConfig) {
      setError('Invalid hash type');
      return;
    }

    setIsCalculating(true);

    try {
      let result: string;
      
      if (hashConfig.lib === 'crypto-js') {
        result = calculateCryptoJsHash(inputData, hashType, isHex);
      } else {
        const inputBytes = isHex 
          ? hexToUint8Array(inputData)
          : stringToUint8Array(inputData);
        result = await calculateHashWasmHash(inputBytes, hashType);
      }

      setHashResult(result);
    } catch (err) {
      console.error('Hash calculation error:', err);
      setError(t.hash?.errorCalculation || 'Failed to calculate hash');
    } finally {
      setIsCalculating(false);
    }
  }, [inputData, inputType, hashType, t]);

  // Clear all
  const handleClear = () => {
    setInputData('');
    setHashResult('');
    setError('');
  };

  // Copy result
  const copyResult = () => {
    navigator.clipboard.writeText(hashResult);
    message.success(t.common.copied);
  };

  // Calculate byte length
  const getByteLength = (): number => {
    if (!inputData) return 0;
    if (inputType === 'Hex') {
      const cleaned = cleanHex(inputData);
      return isValidHex(cleaned) ? cleaned.length / 2 : 0;
    }
    return new TextEncoder().encode(inputData).length;
  };

  // Get length indicator color
  const getLengthColor = (): string => {
    const len = getByteLength();
    if (len === 0) return '#999';
    if (inputType === 'Hex') {
      const cleaned = cleanHex(inputData);
      return isValidHex(cleaned) ? '#52c41a' : '#ff4d4f';
    }
    return '#52c41a';
  };

  // Get selected hash info
  const getHashInfo = () => {
    return HASH_TYPES.find(h => h.value === hashType);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.hash?.title || 'Hash Calculator'}
            </Title>
            <CollapsibleInfo title={t.hash?.algorithmInfo || 'Algorithm Information'}>
              <div>• {getHashInfo()?.label} - {t.hash?.outputLength || 'Output'}: {getHashInfo()?.bits} bits ({(getHashInfo()?.bits || 0) / 4} hex chars)</div>
              <div>• {t.hash?.hashInfo || 'Hash functions are one-way - cannot be reversed'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.hash?.description || 'Calculate hash values using various algorithms'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Hash Type Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.hash?.hashType || 'Hash Type'}:
              </Text>
              <Select
                value={hashType}
                onChange={setHashType}
                style={{ width: '100%' }}
                size="large"
                showSearch
                optionFilterProp="label"
                options={HASH_TYPES.map(h => ({ 
                  value: h.value, 
                  label: h.label
                }))}
              />
            </div>

            {/* Input Type Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.hash?.dataInput || 'Data Input'}:
              </Text>
              <Segmented
                value={inputType}
                onChange={(value) => setInputType(value as InputType)}
                options={[
                  { label: 'ASCII', value: 'ASCII' },
                  { label: t.hash?.hexadecimal || 'Hexadecimal', value: 'Hex' },
                ]}
                block
              />
            </div>

            {/* Input Data */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>
                  {t.hash?.inputData || 'Input Data'}:
                </Text>
                <Text style={{ 
                  fontSize: '12px',
                  color: getLengthColor(),
                  fontWeight: getByteLength() > 0 ? 600 : 400
                }}>
                  [{getByteLength()}]
                </Text>
              </div>
              <TextArea
                value={inputData}
                onChange={e => setInputData(e.target.value)}
                placeholder={inputType === 'Hex' 
                  ? (t.hash?.hexPlaceholder || 'Enter hexadecimal data')
                  : (t.hash?.asciiPlaceholder || 'Enter ASCII text')
                }
                autoSize={{ minRows: 4, maxRows: 10 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<CalculatorOutlined />}
                onClick={performCalculation}
                size="large"
                loading={isCalculating}
              >
                {t.hash?.calculate || 'Calculate Hash'}
              </Button>
              <Button 
                icon={<ClearOutlined />}
                onClick={handleClear}
                danger
                size="large"
              >
                {t.common.clear || 'Clear'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* Result Display */}
        {hashResult && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                <CalculatorOutlined />
                {' '}
                {t.hash?.hashResult || 'Hash Result'} ({getHashInfo()?.label})
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
                onClick={copyResult}
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
              lineHeight: '1.8',
              color: isDark ? '#95de64' : '#237804',
              fontWeight: 600,
              letterSpacing: '0.5px'
            }}>
              {hashResult}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Text style={{ fontSize: '12px', color: isDark ? '#8c8c8c' : '#666' }}>
                {t.hash?.outputLength || 'Length'}: {hashResult.length / 2} bytes ({hashResult.length} hex)
              </Text>
              <Text style={{ fontSize: '12px', color: isDark ? '#8c8c8c' : '#666' }}>
                {t.hash?.inputLength || 'Input'}: {getByteLength()} bytes
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HashCalculator;
