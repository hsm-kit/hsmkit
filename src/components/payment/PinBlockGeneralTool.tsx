import React, { useState } from 'react';
import { Card, Button, Select, Segmented, message, Divider, Tag, Typography, Input } from 'antd';
import { LockOutlined, CopyOutlined, NumberOutlined, CreditCardOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { sanitizeDigits, formatHexDisplay } from '../../utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Sanitize hex input (remove non-hex chars, convert to uppercase)
const sanitizeHex = (value: string): string => {
  return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
};

type PinBlockFormat = 'ISO-0' | 'ISO-1' | 'ISO-2' | 'ISO-3' | 'ISO-4';
type OperationMode = 'encode' | 'decode';

const PinBlockGeneralTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  const [mode, setMode] = useState<OperationMode>('encode');
  const [format, setFormat] = useState<PinBlockFormat>('ISO-0');
  const [pan, setPan] = useState('');
  const [pin, setPin] = useState('');
  const [pinBlock, setPinBlock] = useState('');
  const [paddingChar, setPaddingChar] = useState('F');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  // PIN Block 编码（Encode）
  const encodePinBlock = (
    pinValue: string, 
    panValue: string, 
    fmt: PinBlockFormat, 
    padding: string
  ): string => {
    const cleanPin = pinValue.replace(/\D/g, '');
    const cleanPan = panValue.replace(/\D/g, '');
    
    if (!/^\d{4,12}$/.test(cleanPin)) {
      throw new Error(t.pinBlockGeneral?.errorInvalidPin || 'PIN must be 4-12 digits');
    }

    switch (fmt) {
      case 'ISO-0': {
        // Format 0: 0L[PIN][Padding] XOR 0000[PAN-12-digits]
        if (!/^\d{13,19}$/.test(cleanPan)) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPan || 'PAN must be 13-19 digits');
        }
        
        const pinLen = cleanPin.length.toString(16).toUpperCase();
        const paddedPin = cleanPin + padding.repeat(14 - cleanPin.length);
        const pinField = '0' + pinLen + paddedPin;
        
        // Extract rightmost 12 digits of PAN (excluding check digit)
        const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
        const panField = '0000' + pan12;
        
        // XOR operation
        let result = '';
        for (let i = 0; i < 16; i++) {
          const p = parseInt(pinField[i], 16);
          const a = parseInt(panField[i], 16);
          result += (p ^ a).toString(16).toUpperCase();
        }
        return result;
      }

      case 'ISO-1': {
        // Format 1: 1L[PIN][Padding-Random]
        const pinLen = cleanPin.length.toString(16).toUpperCase();
        const randomPadding = Array.from(
          { length: 14 - cleanPin.length }, 
          () => Math.floor(Math.random() * 16).toString(16).toUpperCase()
        ).join('');
        return '1' + pinLen + cleanPin + randomPadding;
      }

      case 'ISO-2': {
        // Format 2: 2L[PIN][Padding] XOR [PAN-sequence]
        if (!/^\d{13,19}$/.test(cleanPan)) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPan || 'PAN must be 13-19 digits');
        }
        
        const pinLen = cleanPin.length.toString(16).toUpperCase();
        const paddedPin = cleanPin + padding.repeat(14 - cleanPin.length);
        const pinField = '2' + pinLen + paddedPin;
        
        // PAN sequence number (rightmost 12 digits)
        const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
        const panField = '0000' + pan12;
        
        // XOR operation
        let result = '';
        for (let i = 0; i < 16; i++) {
          const p = parseInt(pinField[i], 16);
          const a = parseInt(panField[i], 16);
          result += (p ^ a).toString(16).toUpperCase();
        }
        return result;
      }

      case 'ISO-3': {
        // Format 3: 3L[PIN][Padding-Random] XOR [PAN-sequence]
        if (!/^\d{13,19}$/.test(cleanPan)) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPan || 'PAN must be 13-19 digits');
        }
        
        const pinLen = cleanPin.length.toString(16).toUpperCase();
        const randomPadding = Array.from(
          { length: 14 - cleanPin.length }, 
          () => Math.floor(Math.random() * 16).toString(16).toUpperCase()
        ).join('');
        const pinField = '3' + pinLen + cleanPin + randomPadding;
        
        // PAN sequence (rightmost 12 digits)
        const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
        const panField = '0000' + pan12;
        
        // XOR operation
        let result = '';
        for (let i = 0; i < 16; i++) {
          const p = parseInt(pinField[i], 16);
          const a = parseInt(panField[i], 16);
          result += (p ^ a).toString(16).toUpperCase();
        }
        return result;
      }

      case 'ISO-4': {
        // Format 4: 4L[PIN][Padding] XOR [PAN-sequence] (AES-based, 32 hex chars)
        if (!/^\d{13,19}$/.test(cleanPan)) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPan || 'PAN must be 13-19 digits');
        }
        
        const pinLen = cleanPin.length.toString(16).toUpperCase().padStart(2, '0');
        const paddedPin = cleanPin + padding.repeat(30 - cleanPin.length);
        const pinField = '4' + pinLen + paddedPin;
        
        // Extended PAN field for AES (32 chars)
        const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
        const panField = '0000' + pan12 + padding.repeat(16);
        
        // XOR operation for 32 characters
        let result = '';
        for (let i = 0; i < 32; i++) {
          const p = parseInt(pinField[i], 16);
          const a = parseInt(panField[i], 16);
          result += (p ^ a).toString(16).toUpperCase();
        }
        return result;
      }

      default:
        throw new Error('Unsupported format');
    }
  };

  // PIN Block 解码（Decode）
  const decodePinBlock = (
    pinBlockValue: string, 
    panValue: string, 
    fmt: PinBlockFormat
  ): { pin: string; details: string } => {
    const cleanPinBlock = sanitizeHex(pinBlockValue);
    const cleanPan = panValue.replace(/\D/g, '');
    
    const expectedLength = fmt === 'ISO-4' ? 32 : 16;
    if (cleanPinBlock.length !== expectedLength) {
      throw new Error(
        t.pinBlockGeneral?.errorInvalidPinBlock || 
        `PIN Block must be ${expectedLength} hex characters`
      );
    }

    switch (fmt) {
      case 'ISO-0':
      case 'ISO-2': {
        if (!/^\d{13,19}$/.test(cleanPan)) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPan || 'PAN must be 13-19 digits');
        }
        
        // Extract PAN field
        const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
        const panField = '0000' + pan12;
        
        // XOR to recover PIN field
        let pinField = '';
        for (let i = 0; i < 16; i++) {
          const b = parseInt(cleanPinBlock[i], 16);
          const a = parseInt(panField[i], 16);
          pinField += (b ^ a).toString(16).toUpperCase();
        }
        
        // Validate format control
        const formatControl = pinField[0];
        if ((fmt === 'ISO-0' && formatControl !== '0') || 
            (fmt === 'ISO-2' && formatControl !== '2')) {
          throw new Error(t.pinBlockGeneral?.errorInvalidFormat || 'Invalid PIN Block format');
        }
        
        const pinLength = parseInt(pinField[1], 16);
        if (pinLength < 4 || pinLength > 12) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPinLength || 'Invalid PIN length');
        }
        
        const pin = pinField.substring(2, 2 + pinLength);
        const padding = pinField.substring(2 + pinLength);
        
        return {
          pin,
          details: `Format: ${fmt}, PIN Length: ${pinLength}, Padding: ${padding}`
        };
      }

      case 'ISO-1': {
        // Format 1: No PAN needed, just extract from block
        const formatControl = cleanPinBlock[0];
        if (formatControl !== '1') {
          throw new Error(t.pinBlockGeneral?.errorInvalidFormat || 'Invalid PIN Block format');
        }
        
        const pinLength = parseInt(cleanPinBlock[1], 16);
        if (pinLength < 4 || pinLength > 12) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPinLength || 'Invalid PIN length');
        }
        
        const pin = cleanPinBlock.substring(2, 2 + pinLength);
        const padding = cleanPinBlock.substring(2 + pinLength);
        
        return {
          pin,
          details: `Format: ISO-1, PIN Length: ${pinLength}, Random Padding: ${padding}`
        };
      }

      case 'ISO-3': {
        if (!/^\d{13,19}$/.test(cleanPan)) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPan || 'PAN must be 13-19 digits');
        }
        
        const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
        const panField = '0000' + pan12;
        
        // XOR to recover PIN field
        let pinField = '';
        for (let i = 0; i < 16; i++) {
          const b = parseInt(cleanPinBlock[i], 16);
          const a = parseInt(panField[i], 16);
          pinField += (b ^ a).toString(16).toUpperCase();
        }
        
        const formatControl = pinField[0];
        if (formatControl !== '3') {
          throw new Error(t.pinBlockGeneral?.errorInvalidFormat || 'Invalid PIN Block format');
        }
        
        const pinLength = parseInt(pinField[1], 16);
        if (pinLength < 4 || pinLength > 12) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPinLength || 'Invalid PIN length');
        }
        
        const pin = pinField.substring(2, 2 + pinLength);
        const padding = pinField.substring(2 + pinLength);
        
        return {
          pin,
          details: `Format: ISO-3, PIN Length: ${pinLength}, Random Padding: ${padding}`
        };
      }

      case 'ISO-4': {
        if (!/^\d{13,19}$/.test(cleanPan)) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPan || 'PAN must be 13-19 digits');
        }
        
        const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
        const panField = '0000' + pan12 + 'F'.repeat(16);
        
        // XOR to recover PIN field (32 chars)
        let pinField = '';
        for (let i = 0; i < 32; i++) {
          const b = parseInt(cleanPinBlock[i], 16);
          const a = parseInt(panField[i], 16);
          pinField += (b ^ a).toString(16).toUpperCase();
        }
        
        const formatControl = pinField[0];
        if (formatControl !== '4') {
          throw new Error(t.pinBlockGeneral?.errorInvalidFormat || 'Invalid PIN Block format');
        }
        
        const pinLength = parseInt(pinField.substring(1, 3), 16);
        if (pinLength < 4 || pinLength > 12) {
          throw new Error(t.pinBlockGeneral?.errorInvalidPinLength || 'Invalid PIN length');
        }
        
        const pin = pinField.substring(3, 3 + pinLength);
        const padding = pinField.substring(3 + pinLength);
        
        return {
          pin,
          details: `Format: ISO-4 (AES), PIN Length: ${pinLength}, Padding: ${padding}`
        };
      }

      default:
        throw new Error('Unsupported format');
    }
  };

  const handleProcess = () => {
    setError('');
    setResult('');

    try {
      if (mode === 'encode') {
        const encoded = encodePinBlock(pin, pan, format, paddingChar);
        setResult(encoded);
      } else {
        const decoded = decodePinBlock(pinBlock, pan, format);
        setResult(decoded.pin);
        setError(''); // Use result card to show details
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.pinBlockGeneral?.errorProcessing || 'Processing failed');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
            {t.pinBlockGeneral?.title || 'PIN Blocks'}
          </Title>
          
          <CollapsibleInfo title={t.pinBlockGeneral?.infoTitle || 'About PIN Blocks'}>
            <Text style={{ fontSize: '13px', display: 'block', marginBottom: 8 }}>
              • {t.pinBlockGeneral?.info1 || 'ISO 9564 defines PIN block formats for secure PIN transmission in payment systems.'}
            </Text>
            <Text style={{ fontSize: '13px', display: 'block', marginBottom: 8 }}>
              • {t.pinBlockGeneral?.info2 || 'Format 0: XOR with PAN (most common). Format 1: No PAN required (random padding).'}
            </Text>
            <Text style={{ fontSize: '13px', display: 'block' }}>
              • {t.pinBlockGeneral?.info3 || 'Formats 2-4: Enhanced security with different PAN encoding and random padding schemes.'}
            </Text>
          </CollapsibleInfo>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* PIN Block Format Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlockGeneral?.formatLabel || 'PIN block format:'}
              </Text>
              <Select
                value={format}
                onChange={(value) => setFormat(value as PinBlockFormat)}
                size="large"
                style={{ width: '100%' }}
                options={[
                  { label: 'Format 0 (ISO-0)', value: 'ISO-0' },
                  { label: 'Format 1 (ISO-1)', value: 'ISO-1' },
                  { label: 'Format 2 (ISO-2)', value: 'ISO-2' },
                  { label: 'Format 3 (ISO-3)', value: 'ISO-3' },
                  { label: 'Format 4 (ISO-4) - AES', value: 'ISO-4' },
                ]}
              />
            </div>

            {/* Encode/Decode Mode */}
            <div>
              <Segmented
                value={mode}
                onChange={(value) => setMode(value as OperationMode)}
                options={[
                  { label: t.pinBlockGeneral?.encode || 'Encode', value: 'encode' },
                  { label: t.pinBlockGeneral?.decode || 'Decode', value: 'decode' },
                ]}
                block
                size="large"
              />
            </div>

            {/* PAN Input */}
            {(mode === 'encode' || format !== 'ISO-1') && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.pinBlockGeneral?.panLabel || 'PAN:'}
                  {mode === 'decode' && (
                    <Tag color="blue" style={{ marginLeft: 8, fontSize: '11px' }}>
                      [{pan.replace(/\D/g, '').length}]
                    </Tag>
                  )}
                </Text>
                <Input
                  value={pan}
                  onChange={(e) => setPan(sanitizeDigits(e.target.value))}
                  placeholder={t.pinBlockGeneral?.panPlaceholder || '456789012345cccc'}
                  maxLength={19}
                  prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                  size="large"
                />
              </div>
            )}

            {/* Encode Mode: PIN Input */}
            {mode === 'encode' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.pinBlockGeneral?.pinLabel || 'PIN:'}
                  <Tag color="green" style={{ marginLeft: 8, fontSize: '11px' }}>
                    [{pin.length}]
                  </Tag>
                </Text>
                <Input
                  value={pin}
                  onChange={(e) => setPin(sanitizeDigits(e.target.value))}
                  placeholder={t.pinBlockGeneral?.pinPlaceholder || '123456'}
                  maxLength={12}
                  prefix={<NumberOutlined style={{ color: '#bfbfbf' }} />}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                  size="large"
                />
              </div>
            )}

            {/* Decode Mode: PIN Block Input */}
            {mode === 'decode' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.pinBlockGeneral?.pinBlockLabel || 'PIN Block:'}
                </Text>
                <TextArea
                  value={pinBlock}
                  onChange={(e) => setPinBlock(sanitizeHex(e.target.value))}
                  placeholder={t.pinBlockGeneral?.pinBlockPlaceholder || '041226FFFFFFFF1234'}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                />
              </div>
            )}

            {/* Padding Character (Encode Only) */}
            {mode === 'encode' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.pinBlockGeneral?.paddingLabel || 'Padding character:'}
                </Text>
                <Input
                  value={paddingChar}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    if (/^[0-9A-F]?$/.test(val)) {
                      setPaddingChar(val);
                    }
                  }}
                  placeholder="F"
                  maxLength={1}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                  size="large"
                />
                <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                  {t.pinBlockGeneral?.paddingHint || 'Single hex digit (0-9, A-F). Default: F'}
                </Text>
              </div>
            )}

            {/* Process Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
              <Button 
                type="primary"
                icon={<LockOutlined />}
                onClick={handleProcess}
                size="large"
              >
                {mode === 'encode' 
                  ? (t.pinBlockGeneral?.encodeButton || 'Encode') 
                  : (t.pinBlockGeneral?.decodeButton || 'Decode')
                }
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
                <LockOutlined /> {t.common?.result || 'Result'}
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
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  message.success(t.common?.copied || 'Copied!');
                }}
                size="small"
                style={{
                  background: isDark ? '#52c41a' : undefined,
                  borderColor: '#52c41a',
                  color: isDark ? '#fff' : '#52c41a',
                }}
              >
                {t.common?.copy || 'Copy'}
              </Button>
            }
          >
            <div style={{ 
              background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)', 
              padding: '16px', 
              borderRadius: '8px', 
              border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f' 
            }}>
              <Text type="secondary" style={{ fontSize: '12px', color: isDark ? '#a6a6a6' : undefined }}>
                {mode === 'encode' 
                  ? (t.pinBlockGeneral?.resultPinBlock || 'PIN Block (Hex)')
                  : (t.pinBlockGeneral?.resultPin || 'Decoded PIN')
                }
              </Text>
              <div style={{
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: 'clamp(18px, 4vw, 24px)',
                letterSpacing: '2px',
                color: isDark ? '#95de64' : '#237804',
                marginTop: '8px',
                wordBreak: 'break-all',
                lineHeight: '1.6',
                fontWeight: 600
              }}>
                {mode === 'encode' ? formatHexDisplay(result) : result}
              </div>
              
              <Divider style={{ margin: '16px 0', borderColor: isDark ? '#3c5a24' : undefined }} />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Tag color="blue">{t.pinBlockGeneral?.format || 'Format'}: {format}</Tag>
                <Tag color="purple">
                  {t.pinBlockGeneral?.length || 'Length'}: {result.length} {t.pinBlockGeneral?.hexChars || 'hex chars'}
                </Tag>
                {mode === 'encode' && (
                  <Tag color="green">
                    {t.pinBlockGeneral?.pinLength || 'PIN Length'}: {pin.length}
                  </Tag>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PinBlockGeneralTool;
