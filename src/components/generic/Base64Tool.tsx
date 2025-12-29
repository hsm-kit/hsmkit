import React, { useState, useCallback } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Alert, Tabs } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined, ClearOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';

const { Title, Text } = Typography;
const { TextArea } = Input;

type InputEncoding = 'ASCII' | 'Hex';

const Base64Tool: React.FC = () => {
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

  // Encode to Base64
  const encodeBase64 = (input: string, encoding: InputEncoding): string => {
    if (encoding === 'ASCII') {
      // UTF-8 encoding for text
      const encoder = new TextEncoder();
      const bytes = encoder.encode(input);
      return btoa(String.fromCharCode(...bytes));
    } else {
      // Hex input
      const bytes = hexToBytes(input);
      return btoa(String.fromCharCode(...bytes));
    }
  };

  // Decode from Base64
  const decodeBase64 = (input: string, outputEncoding: InputEncoding): string => {
    const binaryStr = atob(input.replace(/[\s\n\r]/g, ''));
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    
    if (outputEncoding === 'ASCII') {
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } else {
      return bytesToHex(bytes);
    }
  };

  // Encode function
  const performEncode = useCallback(() => {
    setEncodeError('');
    setEncodeResult('');

    if (!encodeInput.trim()) {
      setEncodeError(t.base64?.errorNoInput || 'Please enter input data');
      return;
    }

    try {
      if (encodeInputEncoding === 'Hex' && !isValidHex(encodeInput)) {
        setEncodeError(t.base64?.errorInvalidHex || 'Invalid hexadecimal input');
        return;
      }
      
      const result = encodeBase64(encodeInput, encodeInputEncoding);
      setEncodeResult(result);
    } catch (err) {
      console.error('Base64 encode error:', err);
      setEncodeError((t.base64?.errorEncode || 'Encoding failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [encodeInput, encodeInputEncoding, t]);

  // Decode function
  const performDecode = useCallback(() => {
    setDecodeError('');
    setDecodeResult('');

    if (!decodeInput.trim()) {
      setDecodeError(t.base64?.errorNoInput || 'Please enter input data');
      return;
    }

    try {
      // Validate Base64 input
      const cleanInput = decodeInput.replace(/[\s\n\r]/g, '');
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanInput)) {
        setDecodeError(t.base64?.errorInvalidBase64 || 'Invalid Base64 input');
        return;
      }
      
      const result = decodeBase64(decodeInput, decodeOutputEncoding);
      setDecodeResult(result);
    } catch (err) {
      console.error('Base64 decode error:', err);
      setDecodeError((t.base64?.errorDecode || 'Decoding failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
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
          {t.base64?.inputEncoding || 'Input Encoding'}:
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
            { label: t.base64?.hexadecimal || 'HEXADECIMAL', value: 'Hex' },
          ]}
          block
          size="large"
        />
      </div>

      {/* Info Alert */}
      <Alert
        message={t.base64?.info || 'Base64 Information'}
        description={
          <div style={{ marginTop: 8, fontSize: '13px', lineHeight: '1.6' }}>
            <div>• {t.base64?.encodeInfo1 || 'Base64 encodes binary data into ASCII characters'}</div>
            <div>• {t.base64?.encodeInfo2 || 'Output is ~33% larger than input'}</div>
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
            {t.base64?.data || 'Data'}:
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
            ? (t.base64?.placeholderAscii || 'Enter text to encode')
            : (t.base64?.placeholderHex || 'Enter hexadecimal data to encode')
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
          {t.base64?.encode || 'Encode'}
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
              {t.base64?.encodeResult || 'Base64 Encoded Result'}
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
          {t.base64?.outputEncoding || 'Output Encoding'}:
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
            { label: t.base64?.hexadecimal || 'HEXADECIMAL', value: 'Hex' },
          ]}
          block
          size="large"
        />
      </div>

      {/* Info Alert */}
      <Alert
        message={t.base64?.info || 'Base64 Information'}
        description={
          <div style={{ marginTop: 8, fontSize: '13px', lineHeight: '1.6' }}>
            <div>• {t.base64?.decodeInfo1 || 'Decodes Base64 back to original data'}</div>
            <div>• {t.base64?.decodeInfo2 || 'Choose output format: ASCII text or Hexadecimal'}</div>
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
            {t.base64?.data || 'Data'}:
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
          placeholder={t.base64?.placeholderBase64 || 'Enter Base64 string to decode'}
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
          {t.base64?.decode || 'Decode'}
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
              {t.base64?.decodeResult || 'Decoded Result'}
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
          {t.base64?.encode || 'Encode'}
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
          {t.base64?.decode || 'Decode'}
        </span>
      ),
      children: decodeContent,
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
          {t.base64?.title || 'Base64'}
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.base64?.description || 'Encode data to Base64 or decode Base64 back to original format'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default Base64Tool;

