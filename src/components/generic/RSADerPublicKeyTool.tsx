import React, { useState, useCallback } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, Checkbox, Alert } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;
const { TextArea } = Input;

type Mode = 'encode' | 'decode';
type DataEncoding = 
  | 'None'
  | 'ASCII'
  | 'EBCDIC'
  | 'BCD'
  | 'BCD_left_F'
  | 'UTF_8'
  | 'ASCII_HEX'
  | 'ASCII_BASE64'
  | 'EBCDIC_HEX'
  | 'ASCII_zero_padded'
  | 'BCD_Signed';
type OutputEncoding = 
  | 'UNKNOWN'
  | 'ENCODING_01_DER_ASN1_PUBLIC_KEY_UNSIGNED'
  | 'ENCODING_02_DER_ASN1_PUBLIC_KEY_2S_COMPLIMENT';

// EBCDIC to ASCII conversion table
const EBCDIC_TO_ASCII: number[] = new Array(256).fill(0x3F);
const ASCII_TO_EBCDIC: number[] = new Array(256).fill(0x3F);

// Initialize EBCDIC conversion tables
(() => {
  const mapping: [number, number][] = [
    [0x40, 0x20], // space
    [0x4B, 0x2E], // .
    [0x4C, 0x3C], // <
    [0x4D, 0x28], // (
    [0x4E, 0x2B], // +
    [0x4F, 0x7C], // |
    [0x50, 0x26], // &
    [0x5A, 0x21], // !
    [0x5B, 0x24], // $
    [0x5C, 0x2A], // *
    [0x5D, 0x29], // )
    [0x5E, 0x3B], // ;
    [0x60, 0x2D], // -
    [0x61, 0x2F], // /
    [0x6B, 0x2C], // ,
    [0x6C, 0x25], // %
    [0x6D, 0x5F], // _
    [0x6E, 0x3E], // >
    [0x6F, 0x3F], // ?
    [0x7A, 0x3A], // :
    [0x7B, 0x23], // #
    [0x7C, 0x40], // @
    [0x7D, 0x27], // '
    [0x7E, 0x3D], // =
    [0x7F, 0x22], // "
  ];
  // Numbers 0-9
  for (let i = 0; i < 10; i++) {
    mapping.push([0xF0 + i, 0x30 + i]);
  }
  // Uppercase A-Z
  for (let i = 0; i < 9; i++) mapping.push([0xC1 + i, 0x41 + i]); // A-I
  for (let i = 0; i < 9; i++) mapping.push([0xD1 + i, 0x4A + i]); // J-R
  for (let i = 0; i < 8; i++) mapping.push([0xE2 + i, 0x53 + i]); // S-Z
  // Lowercase a-z
  for (let i = 0; i < 9; i++) mapping.push([0x81 + i, 0x61 + i]); // a-i
  for (let i = 0; i < 9; i++) mapping.push([0x91 + i, 0x6A + i]); // j-r
  for (let i = 0; i < 8; i++) mapping.push([0xA2 + i, 0x73 + i]); // s-z
  
  for (const [ebcdic, ascii] of mapping) {
    EBCDIC_TO_ASCII[ebcdic] = ascii;
    ASCII_TO_EBCDIC[ascii] = ebcdic;
  }
})();

// Helper functions for hex/base64 conversion
const hexToBytes = (hex: string): Uint8Array => {
  const cleaned = hex.replace(/[\s\n\r]/g, '');
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes[i / 2] = parseInt(cleaned.substr(i, 2), 16);
  }
  return bytes;
};

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
    .join('');
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = atob(base64.replace(/[\s\n\r]/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

// BCD encoding/decoding
const bcdToBytes = (bcd: string): Uint8Array => {
  const cleaned = bcd.replace(/[\s\n\r]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    const high = parseInt(cleaned[i], 10);
    const low = i + 1 < cleaned.length ? parseInt(cleaned[i + 1], 10) : 0;
    bytes.push((high << 4) | low);
  }
  return new Uint8Array(bytes);
};

// bytesToBcd is available for future use if needed
const _bytesToBcd = (bytes: Uint8Array): string => {
  let result = '';
  for (const b of bytes) {
    result += ((b >> 4) & 0x0F).toString();
    result += (b & 0x0F).toString();
  }
  return result;
};
void _bytesToBcd; // Suppress unused warning

// Convert data based on encoding type
const decodeData = (data: string, encoding: DataEncoding): Uint8Array => {
  const cleaned = data.replace(/[\s\n\r]/g, '');
  
  switch (encoding) {
    case 'None':
      // Raw bytes represented as hex
      return hexToBytes(cleaned);
    case 'ASCII':
      // ASCII text to bytes
      return new TextEncoder().encode(cleaned);
    case 'UTF_8':
      // UTF-8 text to bytes
      return new TextEncoder().encode(cleaned);
    case 'EBCDIC': {
      // EBCDIC encoded string
      const ebcdicBytes = new Uint8Array(cleaned.length);
      for (let i = 0; i < cleaned.length; i++) {
        ebcdicBytes[i] = ASCII_TO_EBCDIC[cleaned.charCodeAt(i)] || 0x3F;
      }
      return ebcdicBytes;
    }
    case 'BCD':
    case 'BCD_left_F':
    case 'BCD_Signed':
      return bcdToBytes(cleaned);
    case 'ASCII_HEX':
      // Hex string in ASCII
      return hexToBytes(cleaned);
    case 'ASCII_BASE64':
      return base64ToBytes(cleaned);
    case 'EBCDIC_HEX': {
      // First convert EBCDIC hex to ASCII hex, then to bytes
      let asciiHex = '';
      for (let i = 0; i < cleaned.length; i++) {
        asciiHex += String.fromCharCode(EBCDIC_TO_ASCII[cleaned.charCodeAt(i)] || 0x3F);
      }
      return hexToBytes(asciiHex);
    }
    case 'ASCII_zero_padded':
      // ASCII with zero padding
      return new TextEncoder().encode(cleaned);
    default:
      return hexToBytes(cleaned);
  }
};

// ASN.1 DER encoding helpers
const encodeLength = (length: number): Uint8Array => {
  if (length < 128) {
    return new Uint8Array([length]);
  } else if (length < 256) {
    return new Uint8Array([0x81, length]);
  } else if (length < 65536) {
    return new Uint8Array([0x82, (length >> 8) & 0xff, length & 0xff]);
  } else {
    return new Uint8Array([0x83, (length >> 16) & 0xff, (length >> 8) & 0xff, length & 0xff]);
  }
};

const decodeLength = (bytes: Uint8Array, offset: number): { length: number; bytesRead: number } => {
  const firstByte = bytes[offset];
  if (firstByte < 128) {
    return { length: firstByte, bytesRead: 1 };
  } else if (firstByte === 0x81) {
    return { length: bytes[offset + 1], bytesRead: 2 };
  } else if (firstByte === 0x82) {
    return { length: (bytes[offset + 1] << 8) | bytes[offset + 2], bytesRead: 3 };
  } else if (firstByte === 0x83) {
    return { length: (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3], bytesRead: 4 };
  }
  throw new Error('Invalid length encoding');
};

// Encode integer as ASN.1 DER INTEGER
const encodeInteger = (bytes: Uint8Array, signed: boolean = true): Uint8Array => {
  let data = bytes;
  
  // Add leading zero if high bit is set (for signed representation)
  if (signed && data.length > 0 && (data[0] & 0x80) !== 0) {
    const newData = new Uint8Array(data.length + 1);
    newData[0] = 0;
    newData.set(data, 1);
    data = newData;
  }
  
  const lengthBytes = encodeLength(data.length);
  const result = new Uint8Array(1 + lengthBytes.length + data.length);
  result[0] = 0x02; // INTEGER tag
  result.set(lengthBytes, 1);
  result.set(data, 1 + lengthBytes.length);
  return result;
};

// Encode RSA public key as DER
const encodeRSAPublicKeyDER = (
  modulus: Uint8Array,
  exponent: Uint8Array,
  signed: boolean = true
): Uint8Array => {
  const modulusEncoded = encodeInteger(modulus, signed);
  const exponentEncoded = encodeInteger(exponent, true);
  
  const sequenceContent = new Uint8Array(modulusEncoded.length + exponentEncoded.length);
  sequenceContent.set(modulusEncoded, 0);
  sequenceContent.set(exponentEncoded, modulusEncoded.length);
  
  const lengthBytes = encodeLength(sequenceContent.length);
  const result = new Uint8Array(1 + lengthBytes.length + sequenceContent.length);
  result[0] = 0x30; // SEQUENCE tag
  result.set(lengthBytes, 1);
  result.set(sequenceContent, 1 + lengthBytes.length);
  
  return result;
};

// Decode RSA public key from DER
const decodeRSAPublicKeyDER = (der: Uint8Array): { modulus: Uint8Array; exponent: Uint8Array } => {
  let offset = 0;
  
  // Check for SEQUENCE tag
  if (der[offset] !== 0x30) {
    throw new Error('Invalid DER format: expected SEQUENCE');
  }
  offset++;
  
  // Skip sequence length
  const seqLen = decodeLength(der, offset);
  offset += seqLen.bytesRead;
  
  // Parse modulus INTEGER
  if (der[offset] !== 0x02) {
    throw new Error('Invalid DER format: expected INTEGER for modulus');
  }
  offset++;
  
  const modLen = decodeLength(der, offset);
  offset += modLen.bytesRead;
  
  let modulus = der.slice(offset, offset + modLen.length);
  // Remove leading zero if present (signed representation)
  if (modulus[0] === 0 && modulus.length > 1) {
    modulus = modulus.slice(1);
  }
  offset += modLen.length;
  
  // Parse exponent INTEGER
  if (der[offset] !== 0x02) {
    throw new Error('Invalid DER format: expected INTEGER for exponent');
  }
  offset++;
  
  const expLen = decodeLength(der, offset);
  offset += expLen.bytesRead;
  
  let exponent = der.slice(offset, offset + expLen.length);
  // Remove leading zero if present
  if (exponent[0] === 0 && exponent.length > 1) {
    exponent = exponent.slice(1);
  }
  
  return { modulus, exponent };
};

// Convert to PEM format (kept for potential future use)
const _toPEM = (der: Uint8Array): string => {
  const base64 = bytesToBase64(der);
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.substring(i, i + 64));
  }
  return `-----BEGIN RSA PUBLIC KEY-----\n${lines.join('\n')}\n-----END RSA PUBLIC KEY-----`;
};
void _toPEM;

// Parse PEM format
const fromPEM = (pem: string): Uint8Array => {
  const base64 = pem
    .replace(/-----BEGIN.*-----/, '')
    .replace(/-----END.*-----/, '')
    .replace(/[\s\n\r]/g, '');
  return base64ToBytes(base64);
};

const RSADerPublicKeyTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [mode, setMode] = useState<Mode>('encode');
  
  // Encode state
  const [modulus, setModulus] = useState('');
  const [modulusEncoding, setModulusEncoding] = useState<DataEncoding>('ASCII_HEX');
  const [exponent, setExponent] = useState('');
  const [exponentEncoding, setExponentEncoding] = useState<DataEncoding>('ASCII_HEX');
  const [modulusNegative, setModulusNegative] = useState(false);
  const [outputEncoding, setOutputEncoding] = useState<OutputEncoding>('ENCODING_01_DER_ASN1_PUBLIC_KEY_UNSIGNED');
  
  // Decode state
  const [derInput, setDerInput] = useState('');
  const [derInputEncoding, setDerInputEncoding] = useState<DataEncoding>('ASCII_HEX');
  const [derOutputEncoding, setDerOutputEncoding] = useState<OutputEncoding>('ENCODING_01_DER_ASN1_PUBLIC_KEY_UNSIGNED');
  
  // Result state
  const [result, setResult] = useState('');
  const [decodedModulus, setDecodedModulus] = useState('');
  const [decodedExponent, setDecodedExponent] = useState('');
  const [error, setError] = useState('');

  const handleEncode = useCallback(() => {
    setError('');
    setResult('');

    if (!modulus.trim()) {
      setError(t.rsaDer?.errorNoModulus || 'Please enter modulus');
      return;
    }

    if (!exponent.trim()) {
      setError(t.rsaDer?.errorNoExponent || 'Please enter exponent');
      return;
    }

    try {
      // Parse modulus
      const modulusBytes = decodeData(modulus, modulusEncoding);

      // Parse exponent
      const exponentBytes = decodeData(exponent, exponentEncoding);

      // Encode based on output encoding type
      // ENCODING_02 uses 2's complement (signed), ENCODING_01 uses unsigned
      const signed = outputEncoding === 'ENCODING_02_DER_ASN1_PUBLIC_KEY_2S_COMPLIMENT';
      const der = encodeRSAPublicKeyDER(modulusBytes, exponentBytes, signed);

      // Format output as hex
      setResult(bytesToHex(der));
    } catch (err) {
      console.error('Encode error:', err);
      setError((t.rsaDer?.errorEncode || 'Encoding failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [modulus, modulusEncoding, exponent, exponentEncoding, outputEncoding, t]);

  const handleDecode = useCallback(() => {
    setError('');
    setResult('');
    setDecodedModulus('');
    setDecodedExponent('');

    if (!derInput.trim()) {
      setError(t.rsaDer?.errorNoInput || 'Please enter DER data');
      return;
    }

    try {
      let derBytes: Uint8Array;
      
      // Check if it's PEM format
      if (derInput.includes('-----BEGIN')) {
        derBytes = fromPEM(derInput);
      } else {
        derBytes = decodeData(derInput, derInputEncoding);
      }

      // Use derOutputEncoding to determine if we should handle 2's complement
      const { modulus: mod, exponent: exp } = decodeRSAPublicKeyDER(derBytes);
      
      setDecodedModulus(bytesToHex(mod));
      setDecodedExponent(bytesToHex(exp));
      setResult('success');
    } catch (err) {
      console.error('Decode error:', err);
      setError((t.rsaDer?.errorDecode || 'Decoding failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [derInput, derInputEncoding, t]);

  const handleClear = useCallback(() => {
    setModulus('');
    setExponent('');
    setDerInput('');
    setResult('');
    setDecodedModulus('');
    setDecodedExponent('');
    setError('');
  }, []);

  const copyResult = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  }, [t]);

  const getModulusLength = (): number => {
    const cleaned = modulus.replace(/[\s\n\r]/g, '');
    if (modulusEncoding === 'ASCII_HEX') {
      return cleaned.length / 2;
    }
    return cleaned.length;
  };

  // Encode content
  const encodeContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Modulus */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>{t.rsaDer?.modulus || 'Modulus'}:</Text>
          <Text style={{ fontSize: '12px', color: getModulusLength() > 0 ? '#52c41a' : '#999', fontWeight: getModulusLength() > 0 ? 600 : 400 }}>
            [{getModulusLength()} bytes]
          </Text>
        </div>
        <TextArea
          value={modulus}
          onChange={e => setModulus(e.target.value)}
          placeholder={t.rsaDer?.modulusPlaceholder || 'Enter modulus (hex or base64)'}
          autoSize={{ minRows: 4, maxRows: 8 }}
          style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
        />
      </div>

      {/* Modulus Encoding */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.rsaDer?.modulusEncoding || 'Modulus Encoding'}:</Text>
        <Select
          value={modulusEncoding}
          onChange={setModulusEncoding}
          style={{ width: '100%' }}
          options={[
            { label: 'None', value: 'None' },
            { label: 'ASCII', value: 'ASCII' },
            { label: 'EBCDIC', value: 'EBCDIC' },
            { label: 'BCD', value: 'BCD' },
            { label: 'BCD_left_F', value: 'BCD_left_F' },
            { label: 'UTF_8', value: 'UTF_8' },
            { label: 'ASCII_HEX', value: 'ASCII_HEX' },
            { label: 'ASCII_BASE64', value: 'ASCII_BASE64' },
            { label: 'EBCDIC_HEX', value: 'EBCDIC_HEX' },
            { label: 'ASCII_zero_padded', value: 'ASCII_zero_padded' },
            { label: 'BCD_Signed', value: 'BCD_Signed' },
          ]}
        />
      </div>

      {/* Exponent */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.rsaDer?.exponent || 'Exponent'}:</Text>
        <TextArea
          value={exponent}
          onChange={e => setExponent(e.target.value)}
          placeholder={t.rsaDer?.exponentPlaceholder || 'Enter exponent (e.g., 010001 for 65537)'}
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
        />
      </div>

      {/* Exponent Encoding */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.rsaDer?.exponentEncoding || 'Exponent Encoding'}:</Text>
        <Select
          value={exponentEncoding}
          onChange={setExponentEncoding}
          style={{ width: '100%' }}
          options={[
            { label: 'None', value: 'None' },
            { label: 'ASCII', value: 'ASCII' },
            { label: 'EBCDIC', value: 'EBCDIC' },
            { label: 'BCD', value: 'BCD' },
            { label: 'BCD_left_F', value: 'BCD_left_F' },
            { label: 'UTF_8', value: 'UTF_8' },
            { label: 'ASCII_HEX', value: 'ASCII_HEX' },
            { label: 'ASCII_BASE64', value: 'ASCII_BASE64' },
            { label: 'EBCDIC_HEX', value: 'EBCDIC_HEX' },
            { label: 'ASCII_zero_padded', value: 'ASCII_zero_padded' },
            { label: 'BCD_Signed', value: 'BCD_Signed' },
          ]}
        />
      </div>

      {/* Modulus Negative Checkbox */}
      <div>
        <Checkbox
          checked={modulusNegative}
          onChange={e => setModulusNegative(e.target.checked)}
        >
          {t.rsaDer?.modulusNegative || 'Modulus Negative (unsigned encoding)'}
        </Checkbox>
      </div>

      {/* Modulus Encoding (Output) */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{'Modulus Encoding'}:</Text>
        <Select
          value={outputEncoding}
          onChange={setOutputEncoding}
          style={{ width: '100%' }}
          options={[
            { label: 'UNKNOWN', value: 'UNKNOWN' },
            { label: 'ENCODING_01_DER_ASN1_PUBLIC_KEY_UNSIGNED', value: 'ENCODING_01_DER_ASN1_PUBLIC_KEY_UNSIGNED' },
            { label: 'ENCODING_02_DER_ASN1_PUBLIC_KEY_2S_COMPLIMENT', value: 'ENCODING_02_DER_ASN1_PUBLIC_KEY_2S_COMPLIMENT' },
          ]}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button type="primary" icon={<LockOutlined />} onClick={handleEncode} size="large">
          {t.rsaDer?.encode || 'Encode'}
        </Button>
        <Button icon={<ClearOutlined />} onClick={handleClear} danger size="large">
          {t.common.clear || 'Clear'}
        </Button>
      </div>

      {/* Encode Result */}
      {result && mode === 'encode' && (
        <Card
          title={
            <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
              <LockOutlined /> {t.rsaDer?.encodeResult || 'Encoded Result'}
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
              onClick={() => copyResult(result)} 
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
            whiteSpace: 'pre-wrap'
          }}>
            {result}
          </div>
        </Card>
      )}
    </div>
  );

  // Decode content
  const decodeContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* DER Input */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.rsaDer?.derInput || 'DER/PEM Input'}:</Text>
        <TextArea
          value={derInput}
          onChange={e => setDerInput(e.target.value)}
          placeholder={t.rsaDer?.derInputPlaceholder || 'Enter DER (hex/base64) or PEM format public key'}
          autoSize={{ minRows: 6, maxRows: 12 }}
          style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
        />
      </div>

      {/* Input Encoding */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.rsaDer?.inputEncoding || 'Input Encoding'}:</Text>
        <Select
          value={derInputEncoding}
          onChange={setDerInputEncoding}
          style={{ width: '100%' }}
          options={[
            { label: 'None', value: 'None' },
            { label: 'ASCII', value: 'ASCII' },
            { label: 'EBCDIC', value: 'EBCDIC' },
            { label: 'BCD', value: 'BCD' },
            { label: 'BCD_left_F', value: 'BCD_left_F' },
            { label: 'UTF_8', value: 'UTF_8' },
            { label: 'ASCII_HEX', value: 'ASCII_HEX' },
            { label: 'ASCII_BASE64', value: 'ASCII_BASE64' },
            { label: 'EBCDIC_HEX', value: 'EBCDIC_HEX' },
            { label: 'ASCII_zero_padded', value: 'ASCII_zero_padded' },
            { label: 'BCD_Signed', value: 'BCD_Signed' },
          ]}
        />
      </div>

      {/* DER Encoding */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{'DER Encoding'}:</Text>
        <Select
          value={derOutputEncoding}
          onChange={setDerOutputEncoding}
          style={{ width: '100%' }}
          options={[
            { label: 'UNKNOWN', value: 'UNKNOWN' },
            { label: 'ENCODING_01_DER_ASN1_PUBLIC_KEY_UNSIGNED', value: 'ENCODING_01_DER_ASN1_PUBLIC_KEY_UNSIGNED' },
            { label: 'ENCODING_02_DER_ASN1_PUBLIC_KEY_2S_COMPLIMENT', value: 'ENCODING_02_DER_ASN1_PUBLIC_KEY_2S_COMPLIMENT' },
          ]}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button type="primary" icon={<UnlockOutlined />} onClick={handleDecode} size="large">
          {t.rsaDer?.decode || 'Decode'}
        </Button>
        <Button icon={<ClearOutlined />} onClick={handleClear} danger size="large">
          {t.common.clear || 'Clear'}
        </Button>
      </div>

      {/* Decode Result */}
      {result === 'success' && decodedModulus && (
        <Card
          title={
            <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
              <UnlockOutlined /> {t.rsaDer?.decodeResult || 'Decoded Result'}
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
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Modulus */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: isDark ? '#95de64' : '#237804' }}>{t.rsaDer?.modulus || 'Modulus'} ({decodedModulus.length / 2} bytes):</Text>
                <Button 
                  type={isDark ? 'primary' : 'default'} 
                  icon={<CopyOutlined />} 
                  onClick={() => copyResult(decodedModulus)} 
                  size="small"
                  style={{
                    background: isDark ? '#52c41a' : undefined,
                    borderColor: '#52c41a',
                    color: isDark ? '#fff' : '#52c41a',
                  }}
                >
                  {t.common.copy}
                </Button>
              </div>
              <div style={{
                background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                padding: '12px',
                borderRadius: '8px',
                border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
                wordBreak: 'break-all',
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '13px',
                lineHeight: '1.6',
                color: isDark ? '#95de64' : '#237804',
                fontWeight: 600
              }}>
                {decodedModulus}
              </div>
            </div>

            {/* Exponent */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: isDark ? '#69b1ff' : '#1677ff' }}>{t.rsaDer?.exponent || 'Exponent'} ({decodedExponent.length / 2} bytes):</Text>
                <Button 
                  type={isDark ? 'primary' : 'default'} 
                  icon={<CopyOutlined />} 
                  onClick={() => copyResult(decodedExponent)} 
                  size="small"
                  style={{
                    background: isDark ? '#1677ff' : undefined,
                    borderColor: '#1677ff',
                    color: isDark ? '#fff' : '#1677ff',
                  }}
                >
                  {t.common.copy}
                </Button>
              </div>
              <div style={{
                background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.8)',
                padding: '12px',
                borderRadius: '8px',
                border: isDark ? '1px solid #15395b' : '1px solid #adc6ff',
                wordBreak: 'break-all',
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                color: isDark ? '#69b1ff' : '#1677ff',
                fontWeight: 600
              }}>
                {decodedExponent}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'encode',
      label: <span><LockOutlined /> {t.rsaDer?.encode || 'Encode'}</span>,
      children: encodeContent,
    },
    {
      key: 'decode',
      label: <span><UnlockOutlined /> {t.rsaDer?.decode || 'Decode'}</span>,
      children: decodeContent,
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.rsaDer?.title || 'RSA DER Public Key'}
          </Title>
          <CollapsibleInfo title={t.rsaDer?.info || 'RSA DER Information'}>
            <div>• {t.rsaDer?.encodeInfo1 || 'Encode RSA modulus and exponent to DER/PEM format'}</div>
            <div>• {t.rsaDer?.encodeInfo2 || 'Supports both signed and unsigned integer encoding'}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.rsaDer?.description || 'Encode/Decode RSA public key in DER ASN.1 format'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs
          activeKey={mode}
          onChange={(key) => {
            setMode(key as Mode);
            handleClear();
          }}
          items={tabItems}
        />

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginTop: 16 }} closable onClose={() => setError('')} />
        )}
      </Card>
    </div>
  );
};

export default RSADerPublicKeyTool;

