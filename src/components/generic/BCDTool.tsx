import React, { useState, useCallback } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Tabs } from 'antd';
import { SwapOutlined, CopyOutlined, ClearOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;
const { TextArea } = Input;

type InputFormat = 'binary' | 'hex';

const BCDTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [inputFormat, setInputFormat] = useState<InputFormat>('binary');
  
  // Encode state
  const [encodeInput, setEncodeInput] = useState<string>('');
  const [encodeResult, setEncodeResult] = useState('');
  const [encodeError, setEncodeError] = useState('');
  
  // Decode state
  const [decodeInput, setDecodeInput] = useState<string>('');
  const [decodeResult, setDecodeResult] = useState('');
  const [decodeError, setDecodeError] = useState('');

  // Validate decimal input (only digits 0-9)
  const isValidDecimal = (str: string): boolean => {
    const cleaned = str.replace(/[\s\n\r]/g, '');
    return /^\d+$/.test(cleaned);
  };

  // Validate binary input (only 0s and 1s)
  const isValidBinary = (str: string): boolean => {
    const cleaned = str.replace(/[\s\n\r]/g, '');
    return /^[01]+$/.test(cleaned) && cleaned.length % 4 === 0;
  };

  // Validate hex input
  const isValidHex = (str: string): boolean => {
    const cleaned = str.replace(/[\s\n\r]/g, '').toUpperCase();
    return /^[0-9A-F]+$/.test(cleaned);
  };

  // Encode decimal to BCD (returns both binary and hex)
  const encodeToBCD = (decimal: string): { binary: string; hex: string } => {
    const cleaned = decimal.replace(/[\s\n\r]/g, '');
    let binary = '';
    let hex = '';
    
    for (const digit of cleaned) {
      const num = parseInt(digit, 10);
      binary += num.toString(2).padStart(4, '0') + ' ';
      hex += num.toString(16).toUpperCase();
    }
    
    return {
      binary: binary.trim(),
      hex: hex
    };
  };

  // Decode BCD binary to decimal
  const decodeBCDFromBinary = (binary: string): string => {
    const cleaned = binary.replace(/[\s\n\r]/g, '');
    let decimal = '';
    
    for (let i = 0; i < cleaned.length; i += 4) {
      const nibble = cleaned.substr(i, 4);
      const num = parseInt(nibble, 2);
      if (num > 9) {
        throw new Error(`Invalid BCD nibble: ${nibble} (value ${num} > 9)`);
      }
      decimal += num.toString();
    }
    
    return decimal;
  };

  // Decode BCD hex to decimal
  const decodeBCDFromHex = (hex: string): string => {
    const cleaned = hex.replace(/[\s\n\r]/g, '').toUpperCase();
    let decimal = '';
    
    for (const char of cleaned) {
      const num = parseInt(char, 16);
      if (num > 9) {
        throw new Error(`Invalid BCD digit: ${char} (value ${num} > 9)`);
      }
      decimal += num.toString();
    }
    
    return decimal;
  };

  // Encode function
  const performEncode = useCallback(() => {
    setEncodeError('');
    setEncodeResult('');

    if (!encodeInput.trim()) {
      setEncodeError(t.bcd?.errorNoInput || 'Please enter input data');
      return;
    }

    try {
      if (!isValidDecimal(encodeInput)) {
        setEncodeError(t.bcd?.errorInvalidDecimal || 'Invalid input: only digits 0-9 are allowed');
        return;
      }
      const bcd = encodeToBCD(encodeInput);
      setEncodeResult(`Binary: ${bcd.binary}\nHex: ${bcd.hex}`);
    } catch (err) {
      console.error('BCD encode error:', err);
      setEncodeError((t.bcd?.errorConversion || 'Conversion failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [encodeInput, t]);

  // Decode function
  const performDecode = useCallback(() => {
    setDecodeError('');
    setDecodeResult('');

    if (!decodeInput.trim()) {
      setDecodeError(t.bcd?.errorNoInput || 'Please enter input data');
      return;
    }

    try {
      let output = '';
      if (inputFormat === 'binary') {
        if (!isValidBinary(decodeInput)) {
          setDecodeError(t.bcd?.errorInvalidBinary || 'Invalid binary input (must be 0s and 1s, length multiple of 4)');
          return;
        }
        output = decodeBCDFromBinary(decodeInput);
      } else {
        if (!isValidHex(decodeInput)) {
          setDecodeError(t.bcd?.errorInvalidHex || 'Invalid hexadecimal input');
          return;
        }
        output = decodeBCDFromHex(decodeInput);
      }
      setDecodeResult(output);
    } catch (err) {
      console.error('BCD decode error:', err);
      setDecodeError((t.bcd?.errorConversion || 'Conversion failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [decodeInput, inputFormat, t]);

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
  const getInputLength = (input: string): number => {
    if (!input) return 0;
    const cleaned = input.replace(/[\s\n\r]/g, '');
    return cleaned.length;
  };

  // Encode Tab Content
  const encodeContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Input Data */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>
            {t.bcd?.data || 'Data'}:
          </Text>
          <Text style={{ 
            fontSize: '12px',
            color: getInputLength(encodeInput) > 0 ? '#52c41a' : '#999',
            fontWeight: getInputLength(encodeInput) > 0 ? 600 : 400
          }}>
            [{getInputLength(encodeInput)}]
          </Text>
        </div>
        <TextArea
          value={encodeInput}
          onChange={e => setEncodeInput(e.target.value)}
          placeholder={t.bcd?.placeholderEncode || 'Enter decimal number (e.g., 12345)'}
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
          {t.bcd?.encode || 'Encode'}
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
        <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
          <Text type="danger">{encodeError}</Text>
        </Card>
      )}

      {/* Result Display */}
      {encodeResult && (
        <Card 
          title={
            <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
              <SwapOutlined />
              {' '}
              {t.bcd?.encodeResult || 'BCD Encoded Result'}
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
              onClick={() => copyResult(encodeResult)}
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
            letterSpacing: '0.5px',
            whiteSpace: 'pre-line'
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
      {/* Input Format Selection */}
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.bcd?.inputFormat || 'Input'}:
        </Text>
        <Segmented
          value={inputFormat}
          onChange={(val) => {
            setInputFormat(val as InputFormat);
            setDecodeResult('');
            setDecodeError('');
          }}
          options={[
            { label: t.bcd?.binary || 'Binary', value: 'binary' },
            { label: t.bcd?.hexadecimal || 'Hexadecimal', value: 'hex' },
          ]}
          block
          size="large"
        />
      </div>

      {/* Input Data */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>
            {t.bcd?.data || 'Data'}:
          </Text>
          <Text style={{ 
            fontSize: '12px',
            color: getInputLength(decodeInput) > 0 ? '#52c41a' : '#999',
            fontWeight: getInputLength(decodeInput) > 0 ? 600 : 400
          }}>
            [{getInputLength(decodeInput)}]
          </Text>
        </div>
        <TextArea
          value={decodeInput}
          onChange={e => setDecodeInput(e.target.value)}
          placeholder={inputFormat === 'binary' 
            ? (t.bcd?.placeholderBinary || 'Enter BCD binary (e.g., 0010 0101)')
            : (t.bcd?.placeholderHex || 'Enter BCD hexadecimal (e.g., 25)')
          }
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
          {t.bcd?.decode || 'Decode'}
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
        <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
          <Text type="danger">{decodeError}</Text>
        </Card>
      )}

      {/* Result Display */}
      {decodeResult && (
        <Card 
          title={
            <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
              <SwapOutlined />
              {' '}
              {t.bcd?.decodeResult || 'Decoded Decimal'}
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
              onClick={() => copyResult(decodeResult)}
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
            letterSpacing: '0.5px',
            whiteSpace: 'pre-line'
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
          {t.bcd?.encode || 'Encode'}
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
          {t.bcd?.decode || 'Decode'}
        </span>
      ),
      children: decodeContent,
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.bcd?.title || 'Binary Coded Decimal (BCD)'}
          </Title>
          <CollapsibleInfo title={t.bcd?.info || 'BCD Information'}>
            <div>• {t.bcd?.encodeInfo1 || 'Each decimal digit (0-9) is encoded as 4 bits'}</div>
            <div>• {t.bcd?.encodeInfo2 || 'Example: 25 → 0010 0101 (binary) / 25 (hex)'}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.bcd?.description || 'Encode decimal numbers to BCD or decode BCD back to decimal'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default BCDTool;
