import React, { useState, useCallback } from 'react';
import { Card, Button, message, Divider, Typography, Input, Select } from 'antd';
import { SwapOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Encoding conversion types (following payment/HSM industry naming conventions)
const ENCODING_TYPES = [
  { value: 'bin2hex', label: 'Binary -> Hexadecimal' },  // Input: hex data, Output: hex ASCII of each char
  { value: 'hex2bin', label: 'Hexadecimal -> Binary' },  // Reverse of above
  { value: 'ascii2ebcdic', label: 'ASCII -> EBCDIC' },
  { value: 'ebcdic2ascii', label: 'EBCDIC -> ASCII' },
  { value: 'text2hex', label: 'ASCII Text -> Hexadecimal' },
  { value: 'atm2hex', label: 'ATM ASCII Decimal -> Hexadecimal' },
  { value: 'hex2atm', label: 'Hexadecimal -> ATM ASCII Decimal' },
];

// ASCII to EBCDIC conversion table
const ASCII_TO_EBCDIC: number[] = [
  0x00, 0x01, 0x02, 0x03, 0x37, 0x2D, 0x2E, 0x2F, 0x16, 0x05, 0x25, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
  0x10, 0x11, 0x12, 0x13, 0x3C, 0x3D, 0x32, 0x26, 0x18, 0x19, 0x3F, 0x27, 0x1C, 0x1D, 0x1E, 0x1F,
  0x40, 0x5A, 0x7F, 0x7B, 0x5B, 0x6C, 0x50, 0x7D, 0x4D, 0x5D, 0x5C, 0x4E, 0x6B, 0x60, 0x4B, 0x61,
  0xF0, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0x7A, 0x5E, 0x4C, 0x7E, 0x6E, 0x6F,
  0x7C, 0xC1, 0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6,
  0xD7, 0xD8, 0xD9, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xAD, 0xE0, 0xBD, 0x5F, 0x6D,
  0x79, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x91, 0x92, 0x93, 0x94, 0x95, 0x96,
  0x97, 0x98, 0x99, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xC0, 0x4F, 0xD0, 0xA1, 0x07,
  0x20, 0x21, 0x22, 0x23, 0x24, 0x15, 0x06, 0x17, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x09, 0x0A, 0x1B,
  0x30, 0x31, 0x1A, 0x33, 0x34, 0x35, 0x36, 0x08, 0x38, 0x39, 0x3A, 0x3B, 0x04, 0x14, 0x3E, 0xFF,
  0x41, 0xAA, 0x4A, 0xB1, 0x9F, 0xB2, 0x6A, 0xB5, 0xBB, 0xB4, 0x9A, 0x8A, 0xB0, 0xCA, 0xAF, 0xBC,
  0x90, 0x8F, 0xEA, 0xFA, 0xBE, 0xA0, 0xB6, 0xB3, 0x9D, 0xDA, 0x9B, 0x8B, 0xB7, 0xB8, 0xB9, 0xAB,
  0x64, 0x65, 0x62, 0x66, 0x63, 0x67, 0x9E, 0x68, 0x74, 0x71, 0x72, 0x73, 0x78, 0x75, 0x76, 0x77,
  0xAC, 0x69, 0xED, 0xEE, 0xEB, 0xEF, 0xEC, 0xBF, 0x80, 0xFD, 0xFE, 0xFB, 0xFC, 0xBA, 0xAE, 0x59,
  0x44, 0x45, 0x42, 0x46, 0x43, 0x47, 0x9C, 0x48, 0x54, 0x51, 0x52, 0x53, 0x58, 0x55, 0x56, 0x57,
  0x8C, 0x49, 0xCD, 0xCE, 0xCB, 0xCF, 0xCC, 0xE1, 0x70, 0xDD, 0xDE, 0xDB, 0xDC, 0x8D, 0x8E, 0xDF,
];

// EBCDIC to ASCII conversion table
const EBCDIC_TO_ASCII: number[] = new Array(256).fill(0x3F); // Initialize with '?'
// Build reverse table
ASCII_TO_EBCDIC.forEach((ebcdic, ascii) => {
  if (ebcdic < 256) {
    EBCDIC_TO_ASCII[ebcdic] = ascii;
  }
});

const CharacterEncodingTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [encodingType, setEncodingType] = useState<string>('hex2bin');
  const [inputData, setInputData] = useState<string>('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // Clean hex input
  const cleanHex = (hex: string): string => {
    return hex.replace(/[\s\n\r]/g, '').toUpperCase();
  };

  // Validate hex
  const isValidHex = (hex: string): boolean => {
    return /^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0;
  };

  // Binary -> Hexadecimal (Industry convention: input hex string as ASCII, output hex ASCII of each char)
  // Example: "57652C" -> "353736353243" (each char '5','7','6'... to hex 35,37,36...)
  const binToHex = (input: string): string => {
    const cleaned = input.replace(/[\s\n\r]/g, '');
    let hex = '';
    for (let i = 0; i < cleaned.length; i++) {
      hex += cleaned.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0');
    }
    return hex;
  };

  // Hexadecimal -> Binary (Reverse: hex ASCII pairs back to original chars)
  // Example: "353736353243" -> "57652C"
  const hexToBin = (hex: string): string => {
    const cleaned = cleanHex(hex);
    let result = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      const charCode = parseInt(cleaned.substr(i, 2), 16);
      result += String.fromCharCode(charCode);
    }
    return result;
  };

  // ASCII to EBCDIC (ASCII text input, hex EBCDIC output)
  // Example: "57652C20" -> "F5F7F6F5F2C3F2F0" (each char converted to EBCDIC)
  const asciiToEbcdic = (input: string): string => {
    const cleaned = input.replace(/[\s\n\r]/g, '');
    let result = '';
    for (let i = 0; i < cleaned.length; i++) {
      const ascii = cleaned.charCodeAt(i);
      const ebcdic = ASCII_TO_EBCDIC[ascii] || 0x3F;
      result += ebcdic.toString(16).toUpperCase().padStart(2, '0');
    }
    return result;
  };

  // EBCDIC to ASCII (hex EBCDIC input, ASCII text output)
  // Example: "F5F7F6F5F2C3F2F0" -> "57652C20"
  const ebcdicToAscii = (hex: string): string => {
    const cleaned = cleanHex(hex);
    let result = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      const ebcdic = parseInt(cleaned.substr(i, 2), 16);
      const ascii = EBCDIC_TO_ASCII[ebcdic] || 0x3F;
      result += String.fromCharCode(ascii);
    }
    return result;
  };

  // ASCII Text to Hexadecimal
  const textToHex = (text: string): string => {
    let hex = '';
    for (let i = 0; i < text.length; i++) {
      hex += text.charCodeAt(i).toString(16).toUpperCase().padStart(2, '0');
    }
    return hex;
  };

  // Hexadecimal to ASCII Text
  const hexToText = (hex: string): string => {
    const cleaned = cleanHex(hex);
    let text = '';
    for (let i = 0; i < cleaned.length; i += 2) {
      const charCode = parseInt(cleaned.substr(i, 2), 16);
      text += String.fromCharCode(charCode);
    }
    return text;
  };

  // ATM ASCII Decimal to Hexadecimal (e.g., "065 066 067" -> "414243")
  const atmToHex = (atm: string): string => {
    const numbers = atm.trim().split(/[\s,]+/).filter(n => n.length > 0);
    let hex = '';
    for (const num of numbers) {
      const decimal = parseInt(num, 10);
      if (isNaN(decimal) || decimal < 0 || decimal > 255) {
        throw new Error(`Invalid decimal value: ${num}`);
      }
      hex += decimal.toString(16).toUpperCase().padStart(2, '0');
    }
    return hex;
  };

  // Hexadecimal to ATM ASCII Decimal
  const hexToAtm = (hex: string): string => {
    const cleaned = cleanHex(hex);
    const decimals: string[] = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      const byte = parseInt(cleaned.substr(i, 2), 16);
      decimals.push(byte.toString().padStart(3, '0'));
    }
    return decimals.join(' ');
  };

  // Main conversion function
  const performConversion = useCallback(() => {
    setError('');
    setResult('');

    if (!inputData.trim()) {
      setError(t.encoding?.errorNoInput || 'Please enter input data');
      return;
    }

    try {
      let output = '';

      switch (encodingType) {
        case 'bin2hex':
          // Binary -> Hexadecimal: treat input as ASCII text, convert each char to hex
          if (!inputData.trim()) {
            setError(t.encoding?.errorNoInput || 'Please enter input data');
            return;
          }
          output = binToHex(inputData);
          break;

        case 'hex2bin':
          // Hexadecimal -> Binary: convert hex pairs back to ASCII chars
          if (!isValidHex(cleanHex(inputData))) {
            setError(t.encoding?.errorInvalidHex || 'Invalid hexadecimal input');
            return;
          }
          output = hexToBin(inputData);
          break;

        case 'ascii2ebcdic':
          // ASCII text to EBCDIC: convert each ASCII char to EBCDIC hex
          if (!inputData.trim()) {
            setError(t.encoding?.errorNoInput || 'Please enter input data');
            return;
          }
          output = asciiToEbcdic(inputData);
          break;

        case 'ebcdic2ascii':
          // EBCDIC hex to ASCII text: convert EBCDIC hex pairs to ASCII chars
          if (!isValidHex(cleanHex(inputData))) {
            setError(t.encoding?.errorInvalidHex || 'Invalid hexadecimal input');
            return;
          }
          output = ebcdicToAscii(inputData);
          break;

        case 'text2hex':
          output = textToHex(inputData);
          break;

        case 'hex2text':
          if (!isValidHex(cleanHex(inputData))) {
            setError(t.encoding?.errorInvalidHex || 'Invalid hexadecimal input');
            return;
          }
          output = hexToText(inputData);
          break;

        case 'atm2hex':
          output = atmToHex(inputData);
          break;

        case 'hex2atm':
          if (!isValidHex(cleanHex(inputData))) {
            setError(t.encoding?.errorInvalidHex || 'Invalid hexadecimal input');
            return;
          }
          output = hexToAtm(inputData);
          break;

        default:
          setError('Unknown encoding type');
          return;
      }

      setResult(output);
    } catch (err) {
      console.error('Conversion error:', err);
      setError((t.encoding?.errorConversion || 'Conversion failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [inputData, encodingType, t]);

  // Clear all
  const handleClear = () => {
    setInputData('');
    setResult('');
    setError('');
  };

  // Copy result
  const copyResult = () => {
    navigator.clipboard.writeText(result);
    message.success(t.common.copied);
  };

  // Get input length (in bytes or characters depending on type)
  const getInputLength = (): number => {
    if (!inputData) return 0;
    
    switch (encodingType) {
      case 'hex2bin':
      case 'ebcdic2ascii':
      case 'hex2atm':
        const cleaned = cleanHex(inputData);
        return isValidHex(cleaned) ? cleaned.length / 2 : 0;
      case 'bin2hex':
      case 'text2hex':
      case 'ascii2ebcdic':
        return inputData.replace(/[\s\n\r]/g, '').length;
      case 'atm2hex':
        return inputData.trim().split(/[\s,]+/).filter(n => n.length > 0).length;
      default:
        return 0;
    }
  };

  // Get encoding info
  const getEncodingInfo = () => {
    const info = ENCODING_TYPES.find(e => e.value === encodingType);
    return info?.label || '';
  };

  // Get placeholder based on encoding type
  const getPlaceholder = (): string => {
    switch (encodingType) {
      case 'bin2hex':
      case 'ascii2ebcdic':
        return t.encoding?.placeholderBinary || 'Enter data (e.g., 57652C206174...)';
      case 'hex2bin':
      case 'ebcdic2ascii':
      case 'hex2atm':
        return t.encoding?.placeholderHex || 'Enter hexadecimal data';
      case 'text2hex':
        return t.encoding?.placeholderText || 'Enter ASCII text';
      case 'atm2hex':
        return t.encoding?.placeholderAtm || 'Enter decimal values separated by spaces (e.g., 065 066 067)';
      default:
        return '';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.encoding?.title || 'Character Encoding'}
            </Title>
            <CollapsibleInfo title={t.encoding?.conversionInfo || 'Conversion Information'}>
              <div>• {getEncodingInfo()}</div>
              {encodingType.includes('ebcdic') && (
                <div>• {t.encoding?.ebcdicInfo || 'EBCDIC is used by IBM mainframes'}</div>
              )}
              {encodingType.includes('atm') && (
                <div>• {t.encoding?.atmInfo || 'ATM format uses space-separated decimal values (0-255)'}</div>
              )}
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.encoding?.description || 'Convert between different character encodings and formats'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Encoding Type Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.encoding?.encodingType || 'Encoding'}:
              </Text>
              <Select
                value={encodingType}
                onChange={setEncodingType}
                style={{ width: '100%' }}
                size="large"
                options={ENCODING_TYPES.map(e => ({ 
                  value: e.value, 
                  label: e.label
                }))}
              />
            </div>

            {/* Input Data */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>
                  {t.encoding?.data || 'Data'}:
                </Text>
                <Text style={{ 
                  fontSize: '12px',
                  color: getInputLength() > 0 ? '#52c41a' : '#999',
                  fontWeight: getInputLength() > 0 ? 600 : 400
                }}>
                  [{getInputLength()}]
                </Text>
              </div>
              <TextArea
                value={inputData}
                onChange={e => setInputData(e.target.value)}
                placeholder={getPlaceholder()}
                autoSize={{ minRows: 5, maxRows: 12 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<SwapOutlined />}
                onClick={performConversion}
                size="large"
              >
                {t.encoding?.convert || 'Convert'}
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
          <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* Result Display */}
        {result && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                <SwapOutlined />
                {' '}
                {t.encoding?.result || 'Conversion Result'}
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
              {result}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CharacterEncodingTool;

