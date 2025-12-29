import React, { useState, useCallback } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Alert, Tabs } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined, ClearOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';

const { Title, Text } = Typography;
const { TextArea } = Input;

type InputEncoding = 'ASCII' | 'Hex';

// Base94 encoding: ASCII 0x21 (!) to 0x7E (~), using baseX algorithm
const BASE94_ALPHABET = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
const BASE = 94;

// Encode bytes to Base94 using baseX algorithm
const encodeBase94 = (bytes: Uint8Array): string => {
  if (bytes.length === 0) return '';
  
  // Count leading zeros
  let leadingZeros = 0;
  for (const byte of bytes) {
    if (byte === 0) leadingZeros++;
    else break;
  }
  
  // Convert bytes to big integer
  let num = BigInt(0);
  for (const byte of bytes) {
    num = num * BigInt(256) + BigInt(byte);
  }
  
  // Convert to base94
  let result = '';
  while (num > 0) {
    const remainder = Number(num % BigInt(BASE));
    result = BASE94_ALPHABET[remainder] + result;
    num = num / BigInt(BASE);
  }
  
  // Add leading '!' for each leading zero byte
  return BASE94_ALPHABET[0].repeat(leadingZeros) + result;
};

// Decode Base94 to bytes using baseX algorithm
const decodeBase94 = (str: string): Uint8Array => {
  if (str.length === 0) return new Uint8Array(0);
  
  // Count leading '!' (representing zero bytes)
  let leadingZeros = 0;
  for (const char of str) {
    if (char === BASE94_ALPHABET[0]) leadingZeros++;
    else break;
  }
  
  // Convert from base94 to big integer
  let num = BigInt(0);
  for (const char of str) {
    const index = BASE94_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base94 character: '${char}'`);
    }
    num = num * BigInt(BASE) + BigInt(index);
  }
  
  // Convert to bytes
  const bytes: number[] = [];
  while (num > 0) {
    bytes.unshift(Number(num % BigInt(256)));
    num = num / BigInt(256);
  }
  
  // Add leading zero bytes
  for (let i = 0; i < leadingZeros; i++) {
    bytes.unshift(0);
  }
  
  return new Uint8Array(bytes);
};

const Base94Tool: React.FC = () => {
  const { t } = useLanguage();
  
  // Encode state
  const [encodeInputEncoding, setEncodeInputEncoding] = useState<InputEncoding>('ASCII');
  const [encodeInput, setEncodeInput] = useState<string>('');
  const [encodeResult, setEncodeResult] = useState('');
  const [encodeError, setEncodeError] = useState('');
  
  // Decode state
  const [decodeOutputEncoding, setDecodeOutputEncoding] = useState<InputEncoding>('ASCII');
  const [decodeInput, setDecodeInput] = useState<string>('');
  const [decodeResult, setDecodeResult] = useState('');
  const [decodeError, setDecodeError] = useState('');

  // Validate hex input
  const isValidHex = (hex: string): boolean => {
    const cleaned = hex.replace(/[\s\n\r]/g, '').toUpperCase();
    return /^[0-9A-F]*$/.test(cleaned) && cleaned.length % 2 === 0;
  };

  // Hex to bytes
  const hexToBytes = (hex: string): Uint8Array => {
    const cleaned = hex.replace(/[\s\n\r]/g, '');
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = parseInt(cleaned.substr(i, 2), 16);
    }
    return bytes;
  };

  // Bytes to hex
  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
      .join('');
  };

  // Validate Base94 input
  const isValidBase94 = (str: string): boolean => {
    for (const char of str.replace(/[\s\n\r]/g, '')) {
      if (BASE94_ALPHABET.indexOf(char) === -1) {
        return false;
      }
    }
    return true;
  };

  // Encode function
  const performEncode = useCallback(() => {
    setEncodeError('');
    setEncodeResult('');

    if (!encodeInput.trim()) {
      setEncodeError(t.base94?.errorNoInput || 'Please enter input data');
      return;
    }

    try {
      let bytes: Uint8Array;
      
      if (encodeInputEncoding === 'ASCII') {
        const encoder = new TextEncoder();
        bytes = encoder.encode(encodeInput);
      } else {
        if (!isValidHex(encodeInput)) {
          setEncodeError(t.base94?.errorInvalidHex || 'Invalid hexadecimal input');
          return;
        }
        bytes = hexToBytes(encodeInput);
      }
      
      const result = encodeBase94(bytes);
      setEncodeResult(result);
    } catch (err) {
      console.error('Base94 encode error:', err);
      setEncodeError((t.base94?.errorEncode || 'Encoding failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [encodeInput, encodeInputEncoding, t]);

  // Decode function
  const performDecode = useCallback(() => {
    setDecodeError('');
    setDecodeResult('');

    if (!decodeInput.trim()) {
      setDecodeError(t.base94?.errorNoInput || 'Please enter input data');
      return;
    }

    try {
      const cleanInput = decodeInput.replace(/[\s\n\r]/g, '');
      
      if (!isValidBase94(cleanInput)) {
        setDecodeError(t.base94?.errorInvalidBase94 || 'Invalid Base94 input');
        return;
      }
      
      const bytes = decodeBase94(cleanInput);
      
      if (decodeOutputEncoding === 'ASCII') {
        const decoder = new TextDecoder();
        setDecodeResult(decoder.decode(bytes));
      } else {
        setDecodeResult(bytesToHex(bytes));
      }
    } catch (err) {
      console.error('Base94 decode error:', err);
      setDecodeError((t.base94?.errorDecode || 'Decoding failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [decodeInput, decodeOutputEncoding, t]);

  // Clear encode
  const handleClearEncode = () => {
    setEncodeInput('');
    setEncodeResult('');
    setEncodeError('');
  };

  // Clear decode
  const handleClearDecode = () => {
    setDecodeInput('');
    setDecodeResult('');
    setDecodeError('');
  };

  // Copy result
  const copyResult = (result: string) => {
    navigator.clipboard.writeText(result);
    message.success(t.common.copied);
  };

  // Get input length
  const getInputLength = (input: string, encoding: InputEncoding): number => {
    if (!input) return 0;
    if (encoding === 'Hex') {
      const cleaned = input.replace(/[\s\n\r]/g, '');
      return isValidHex(cleaned) ? cleaned.length / 2 : 0;
    }
    return input.length;
  };

  // Encode Tab Content
  const encodeContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Input Encoding Selection */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.base94?.inputEncoding || 'Input Encoding'}:
        </Text>
        <Segmented
          value={encodeInputEncoding}
          onChange={(val) => {
            setEncodeInputEncoding(val as InputEncoding);
            setEncodeResult('');
            setEncodeError('');
          }}
          options={[
            { label: 'ASCII', value: 'ASCII' },
            { label: t.base94?.hexadecimal || 'HEXADECIMAL', value: 'Hex' },
          ]}
          block
          size="large"
        />
      </div>

      {/* Info Alert */}
      <Alert
        message={t.base94?.info || 'Base94 Information'}
        description={
          <div style={{ marginTop: 8, fontSize: '13px', lineHeight: '1.6' }}>
            <div>• {t.base94?.encodeInfo1 || 'Uses 94 printable ASCII characters (! to ~)'}</div>
            <div>• {t.base94?.encodeInfo2 || 'BaseX encoding algorithm (similar to Base58)'}</div>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)', border: '1px solid #91caff' }}
      />

      {/* Input Data */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>
            {t.base94?.data || 'Data'}:
          </Text>
          <Text style={{ 
            fontSize: '12px',
            color: getInputLength(encodeInput, encodeInputEncoding) > 0 ? '#52c41a' : '#999',
            fontWeight: getInputLength(encodeInput, encodeInputEncoding) > 0 ? 600 : 400
          }}>
            [{getInputLength(encodeInput, encodeInputEncoding)}]
          </Text>
        </div>
        <TextArea
          value={encodeInput}
          onChange={e => setEncodeInput(e.target.value)}
          placeholder={encodeInputEncoding === 'ASCII' 
            ? (t.base94?.placeholderAscii || 'Enter text to encode')
            : (t.base94?.placeholderHex || 'Enter hexadecimal data to encode')
          }
          autoSize={{ minRows: 5, maxRows: 12 }}
          style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button 
          type="primary" 
          icon={<LockOutlined />}
          onClick={performEncode}
          size="large"
        >
          {t.base94?.encode || 'Encode'}
        </Button>
        <Button 
          icon={<ClearOutlined />}
          onClick={handleClearEncode}
          danger
          size="large"
        >
          {t.common.clear || 'Clear'}
        </Button>
      </div>

      {/* Error Display */}
      {encodeError && (
        <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
          <Text type="danger">{encodeError}</Text>
        </Card>
      )}

      {/* Result Display */}
      {encodeResult && (
        <Card 
          title={
            <>
              <LockOutlined />
              {' '}
              {t.base94?.encodeResult || 'Base94 Encoded Result'}
            </>
          }
          bordered={false}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          extra={
            <Button 
              type="text" 
              icon={<CopyOutlined />}
              onClick={() => copyResult(encodeResult)}
              size="small"
            >
              {t.common.copy}
            </Button>
          }
        >
          <div style={{ 
            background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #b7eb8f',
            wordBreak: 'break-all',
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px',
            lineHeight: '1.8',
            color: '#52c41a',
            fontWeight: 600,
            letterSpacing: '0.5px',
            whiteSpace: 'pre-wrap'
          }}>
            {encodeResult}
          </div>
        </Card>
      )}
    </div>
  );

  // Decode Tab Content
  const decodeContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Output Encoding Selection */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.base94?.outputEncoding || 'Output Encoding'}:
        </Text>
        <Segmented
          value={decodeOutputEncoding}
          onChange={(val) => {
            setDecodeOutputEncoding(val as InputEncoding);
            setDecodeResult('');
            setDecodeError('');
          }}
          options={[
            { label: 'ASCII', value: 'ASCII' },
            { label: t.base94?.hexadecimal || 'HEXADECIMAL', value: 'Hex' },
          ]}
          block
          size="large"
        />
      </div>

      {/* Info Alert */}
      <Alert
        message={t.base94?.info || 'Base94 Information'}
        description={
          <div style={{ marginTop: 8, fontSize: '13px', lineHeight: '1.6' }}>
            <div>• {t.base94?.decodeInfo1 || 'Decodes Base94 back to original data'}</div>
            <div>• {t.base94?.decodeInfo2 || 'Valid characters: ! to ~ (ASCII 33-126)'}</div>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)', border: '1px solid #91caff' }}
      />

      {/* Input Data */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>
            {t.base94?.data || 'Data'}:
          </Text>
          <Text style={{ 
            fontSize: '12px',
            color: decodeInput.length > 0 ? '#52c41a' : '#999',
            fontWeight: decodeInput.length > 0 ? 600 : 400
          }}>
            [{decodeInput.replace(/[\s\n\r]/g, '').length}]
          </Text>
        </div>
        <TextArea
          value={decodeInput}
          onChange={e => setDecodeInput(e.target.value)}
          placeholder={t.base94?.placeholderBase94 || 'Enter Base94 string to decode'}
          autoSize={{ minRows: 5, maxRows: 12 }}
          style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button 
          type="primary" 
          icon={<UnlockOutlined />}
          onClick={performDecode}
          size="large"
        >
          {t.base94?.decode || 'Decode'}
        </Button>
        <Button 
          icon={<ClearOutlined />}
          onClick={handleClearDecode}
          danger
          size="large"
        >
          {t.common.clear || 'Clear'}
        </Button>
      </div>

      {/* Error Display */}
      {decodeError && (
        <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
          <Text type="danger">{decodeError}</Text>
        </Card>
      )}

      {/* Result Display */}
      {decodeResult && (
        <Card 
          title={
            <>
              <UnlockOutlined />
              {' '}
              {t.base94?.decodeResult || 'Decoded Result'}
            </>
          }
          bordered={false}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          extra={
            <Button 
              type="text" 
              icon={<CopyOutlined />}
              onClick={() => copyResult(decodeResult)}
              size="small"
            >
              {t.common.copy}
            </Button>
          }
        >
          <div style={{ 
            background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)', 
            padding: '16px', 
            borderRadius: '8px', 
            border: '1px solid #b7eb8f',
            wordBreak: 'break-all',
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px',
            lineHeight: '1.8',
            color: '#52c41a',
            fontWeight: 600,
            letterSpacing: '0.5px',
            whiteSpace: 'pre-wrap'
          }}>
            {decodeResult}
          </div>
        </Card>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'encode',
      label: (
        <span>
          <LockOutlined />
          {' '}
          {t.base94?.encode || 'Encode'}
        </span>
      ),
      children: encodeContent,
    },
    {
      key: 'decode',
      label: (
        <span>
          <UnlockOutlined />
          {' '}
          {t.base94?.decode || 'Decode'}
        </span>
      ),
      children: decodeContent,
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
          {t.base94?.title || 'Base94'}
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.base94?.description || 'Encode data to Base94 or decode Base94 back to original format'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default Base94Tool;

