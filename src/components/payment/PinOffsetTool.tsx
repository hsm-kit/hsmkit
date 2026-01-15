import React, { useState } from 'react';
import { Card, Button, Tabs, Radio, message, Divider, Typography, Input, InputNumber } from 'antd';
import { KeyOutlined, LockOutlined, CreditCardOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo, ResultCard } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { sanitizeDigits } from '../../utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Sanitize hex input
const sanitizeHex = (value: string): string => {
  return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
};

type ValidationMethod = 'parameters' | 'mask';

const PinOffsetTool: React.FC = () => {
  const { t } = useLanguage();
  useTheme();
  
  // Common inputs
  const [pdk, setPdk] = useState('');
  const [pan, setPan] = useState('');
  const [decTab, setDecTab] = useState('0123456789012345');
  
  // Offset tab inputs
  const [pin, setPin] = useState('');
  const [validationMethod, setValidationMethod] = useState<ValidationMethod>('mask');
  const [start, setStart] = useState<number>(1);
  const [length, setLength] = useState<number>(16);
  const [pad, setPad] = useState('F');
  const [pinLength, setPinLength] = useState<number>(4);
  const [validationMask, setValidationMask] = useState('0000000N0000');
  
  // PIN tab inputs
  const [pinOffset, setPinOffset] = useState('');
  
  // Results
  const [offsetResult, setOffsetResult] = useState('');
  const [pinResult, setPinResult] = useState('');
  const [error, setError] = useState('');

  // IBM 3624 PIN Offset calculation
  const calculatePinOffset = (
    pdkValue: string,
    panValue: string,
    pinValue: string,
    decTabValue: string,
    validationMethod: ValidationMethod,
    validationParams?: { start: number; length: number; pad: string; pinLength: number },
    validationMaskValue?: string
  ): string => {
    const cleanPdk = sanitizeHex(pdkValue);
    const cleanPan = panValue.replace(/\D/g, '');
    const cleanPin = pinValue.replace(/\D/g, '');
    const cleanDecTab = decTabValue.replace(/\D/g, '');
    
    if (cleanPdk.length !== 32) {
      throw new Error(t.pinOffset?.errorInvalidPdk || 'PDK must be 32 hex characters (16 bytes)');
    }
    
    if (!/^\d{12,19}$/.test(cleanPan)) {
      throw new Error(t.pinOffset?.errorInvalidPan || 'PAN must be 12-19 digits');
    }
    
    if (!/^\d{4,12}$/.test(cleanPin)) {
      throw new Error(t.pinOffset?.errorInvalidPin || 'PIN must be 4-12 digits');
    }
    
    if (cleanDecTab.length !== 16) {
      throw new Error(t.pinOffset?.errorInvalidDecTab || 'DecTab must be 16 digits');
    }
    
    // Prepare PAN for encryption (rightmost 12 digits, 0-padded to 16 hex chars)
    const pan12 = cleanPan.substring(cleanPan.length - 12).padStart(16, '0');
    
    // Encrypt PAN with PDK using 3DES
    const keyWords = CryptoJS.enc.Hex.parse(cleanPdk);
    const panWords = CryptoJS.enc.Hex.parse(pan12);
    
    const encrypted = CryptoJS.TripleDES.encrypt(panWords, keyWords, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });
    
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
    
    // Apply decimalization table
    let naturalPin = '';
    for (let i = 0; i < encryptedHex.length; i++) {
      const hexDigit = parseInt(encryptedHex[i], 16);
      naturalPin += cleanDecTab[hexDigit];
    }
    
    // Extract validation data based on method
    let validationData: string;
    if (validationMethod === 'parameters') {
      if (!validationParams) {
        throw new Error('Validation parameters required');
      }
      const { start, length, pad, pinLength } = validationParams;
      const extractedData = naturalPin.substring(start - 1, start - 1 + length);
      validationData = extractedData.substring(0, pinLength).padEnd(length, pad);
    } else {
      // Use validation mask
      const cleanMask = validationMaskValue || '';
      if (!/^[0-9N]+$/.test(cleanMask)) {
        throw new Error(t.pinOffset?.errorInvalidMask || 'Validation mask must contain only digits and N');
      }
      
      validationData = '';
      let naturalIndex = 0;
      for (let i = 0; i < cleanMask.length; i++) {
        if (cleanMask[i] === 'N') {
          validationData += naturalPin[naturalIndex] || '0';
          naturalIndex++;
        } else {
          validationData += cleanMask[i];
        }
      }
    }
    
    // Calculate offset (PIN - Validation Data) mod 10
    let offset = '';
    const offsetLength = Math.max(cleanPin.length, validationData.length);
    for (let i = 0; i < offsetLength; i++) {
      const pinDigit = parseInt(cleanPin[i] || '0');
      const valDigit = parseInt(validationData[i] || '0');
      offset += ((pinDigit - valDigit + 10) % 10).toString();
    }
    
    return offset;
  };

  // Verify PIN with offset
  const verifyPinWithOffset = (
    pdkValue: string,
    panValue: string,
    pinOffsetValue: string,
    decTabValue: string,
    validationMethod: ValidationMethod,
    validationParams?: { start: number; length: number; pad: string; pinLength: number },
    validationMaskValue?: string
  ): string => {
    const cleanPdk = sanitizeHex(pdkValue);
    const cleanPan = panValue.replace(/\D/g, '');
    const cleanOffset = pinOffsetValue.replace(/\D/g, '');
    const cleanDecTab = decTabValue.replace(/\D/g, '');
    
    if (cleanPdk.length !== 32) {
      throw new Error(t.pinOffset?.errorInvalidPdk || 'PDK must be 32 hex characters (16 bytes)');
    }
    
    if (!/^\d{12,19}$/.test(cleanPan)) {
      throw new Error(t.pinOffset?.errorInvalidPan || 'PAN must be 12-19 digits');
    }
    
    if (!/^\d{4,12}$/.test(cleanOffset)) {
      throw new Error(t.pinOffset?.errorInvalidOffset || 'PIN offset must be 4-12 digits');
    }
    
    if (cleanDecTab.length !== 16) {
      throw new Error(t.pinOffset?.errorInvalidDecTab || 'DecTab must be 16 digits');
    }
    
    // Prepare PAN for encryption
    const pan12 = cleanPan.substring(cleanPan.length - 12).padStart(16, '0');
    
    // Encrypt PAN with PDK
    const keyWords = CryptoJS.enc.Hex.parse(cleanPdk);
    const panWords = CryptoJS.enc.Hex.parse(pan12);
    
    const encrypted = CryptoJS.TripleDES.encrypt(panWords, keyWords, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });
    
    const encryptedHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
    
    // Apply decimalization table
    let naturalPin = '';
    for (let i = 0; i < encryptedHex.length; i++) {
      const hexDigit = parseInt(encryptedHex[i], 16);
      naturalPin += cleanDecTab[hexDigit];
    }
    
    // Extract validation data
    let validationData: string;
    if (validationMethod === 'parameters') {
      if (!validationParams) {
        throw new Error('Validation parameters required');
      }
      const { start, length, pad, pinLength } = validationParams;
      const extractedData = naturalPin.substring(start - 1, start - 1 + length);
      validationData = extractedData.substring(0, pinLength).padEnd(length, pad);
    } else {
      const cleanMask = validationMaskValue || '';
      if (!/^[0-9N]+$/.test(cleanMask)) {
        throw new Error(t.pinOffset?.errorInvalidMask || 'Validation mask must contain only digits and N');
      }
      
      validationData = '';
      let naturalIndex = 0;
      for (let i = 0; i < cleanMask.length; i++) {
        if (cleanMask[i] === 'N') {
          validationData += naturalPin[naturalIndex] || '0';
          naturalIndex++;
        } else {
          validationData += cleanMask[i];
        }
      }
    }
    
    // Calculate PIN (Validation Data + Offset) mod 10
    let calculatedPin = '';
    const pinLengthCalc = Math.max(cleanOffset.length, validationData.length);
    for (let i = 0; i < pinLengthCalc; i++) {
      const valDigit = parseInt(validationData[i] || '0');
      const offsetDigit = parseInt(cleanOffset[i] || '0');
      calculatedPin += ((valDigit + offsetDigit) % 10).toString();
    }
    
    return calculatedPin;
  };

  const handleCalculateOffset = () => {
    setError('');
    setOffsetResult('');

    try {
      const validationParams = validationMethod === 'parameters'
        ? { start, length, pad, pinLength }
        : undefined;
      
      const offset = calculatePinOffset(
        pdk,
        pan,
        pin,
        decTab,
        validationMethod,
        validationParams,
        validationMask
      );
      
      setOffsetResult(offset);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.pinOffset?.errorProcessing || 'Processing failed');
    }
  };

  const handleCalculatePin = () => {
    setError('');
    setPinResult('');

    try {
      const validationParams = validationMethod === 'parameters'
        ? { start, length, pad, pinLength }
        : undefined;
      
      const calculatedPin = verifyPinWithOffset(
        pdk,
        pan,
        pinOffset,
        decTab,
        validationMethod,
        validationParams,
        validationMask
      );
      
      setPinResult(calculatedPin);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.pinOffset?.errorProcessing || 'Processing failed');
    }
  };

  const tabItems = [
    {
      key: 'offset',
      label: t.pinOffset?.tabOffset || 'Offset',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PDK Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.pdkLabel || 'PDK:'}
            </Text>
            <TextArea
              value={pdk}
              onChange={(e) => setPdk(sanitizeHex(e.target.value))}
              placeholder={t.pinOffset?.pdkPlaceholder || '0123456789ABCDEFFEDCBA9876543210'}
              autoSize={{ minRows: 2, maxRows: 3 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
            />
          </div>

          {/* PAN Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.panLabel || 'PAN:'}
            </Text>
            <Input
              value={pan}
              onChange={(e) => setPan(sanitizeDigits(e.target.value))}
              placeholder={t.pinOffset?.panPlaceholder || '1234567899876543'}
              maxLength={19}
              prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
              size="large"
            />
          </div>

          {/* PIN Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.pinLabel || 'PIN:'}
            </Text>
            <Input
              value={pin}
              onChange={(e) => setPin(sanitizeDigits(e.target.value))}
              placeholder={t.pinOffset?.pinPlaceholder || '3196'}
              maxLength={12}
              prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
              size="large"
            />
          </div>

          {/* DecTab Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.decTabLabel || 'DecTab:'}
            </Text>
            <Input
              value={decTab}
              onChange={(e) => setDecTab(sanitizeDigits(e.target.value))}
              placeholder="0123456789012345"
              maxLength={16}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
              size="large"
            />
          </div>

          {/* Validation Data Method */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.validationDataLabel || 'Validation data'}
            </Text>
            <Radio.Group
              value={validationMethod}
              onChange={(e) => setValidationMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <Radio value="parameters">{t.pinOffset?.useParameters || 'Use validation data parameters'}</Radio>
              <Radio value="mask">{t.pinOffset?.useMask || 'Use validation data mask'}</Radio>
            </Radio.Group>
          </div>

          {/* Validation Parameters */}
          {validationMethod === 'parameters' && (
            <>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.startLabel || 'Start:'}
                  </Text>
                  <InputNumber
                    value={start}
                    onChange={(val) => setStart(val || 1)}
                    min={1}
                    max={16}
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.lengthLabel || 'Length:'}
                  </Text>
                  <InputNumber
                    value={length}
                    onChange={(val) => setLength(val || 16)}
                    min={1}
                    max={16}
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.padLabel || 'Pad:'}
                  </Text>
                  <Input
                    value={pad}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (/^[0-9A-F]?$/.test(val)) {
                        setPad(val);
                      }
                    }}
                    maxLength={1}
                    style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                    size="large"
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.pinLengthLabel || 'PIN Length:'}
                  </Text>
                  <InputNumber
                    value={pinLength}
                    onChange={(val) => setPinLength(val || 4)}
                    min={4}
                    max={12}
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>
              </div>
            </>
          )}

          {/* Validation Mask */}
          {validationMethod === 'mask' && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinOffset?.validationMaskLabel || 'Validation data mask:'}
              </Text>
              <Input
                value={validationMask}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (/^[0-9N]*$/.test(val)) {
                    setValidationMask(val);
                  }
                }}
                placeholder="0000000N0000"
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                size="large"
              />
              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                {t.pinOffset?.maskHint || 'Use N for natural PIN digits, 0-9 for fixed values'}
              </Text>
            </div>
          )}

          {/* Calculate Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button 
              type="primary"
              icon={<LockOutlined />}
              onClick={handleCalculateOffset}
              size="large"
            >
              {t.pinOffset?.calculateOffset || 'Calculate Offset'}
            </Button>
          </div>

          {/* Offset Result */}
          {offsetResult && (
            <ResultCard
              title={t.pinOffset?.offsetResult || 'PIN Offset'}
              result={offsetResult}
              onCopy={() => {
                navigator.clipboard.writeText(offsetResult);
                message.success(t.common?.copied || 'Copied!');
              }}
              icon={<LockOutlined />}
            />
          )}
        </div>
      ),
    },
    {
      key: 'pin',
      label: t.pinOffset?.tabPin || 'PIN',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* PDK Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.pdkLabel || 'PDK:'}
            </Text>
            <TextArea
              value={pdk}
              onChange={(e) => setPdk(sanitizeHex(e.target.value))}
              placeholder={t.pinOffset?.pdkPlaceholder || '0123456789ABCDEFFEDCBA9876543210'}
              autoSize={{ minRows: 2, maxRows: 3 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
            />
          </div>

          {/* PAN Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.panLabel || 'PAN:'}
            </Text>
            <Input
              value={pan}
              onChange={(e) => setPan(sanitizeDigits(e.target.value))}
              placeholder={t.pinOffset?.panPlaceholder || '1234567899876543'}
              maxLength={19}
              prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
              size="large"
            />
          </div>

          {/* PIN Offset Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.offsetLabel || 'PIN offset:'}
            </Text>
            <Input
              value={pinOffset}
              onChange={(e) => setPinOffset(sanitizeDigits(e.target.value))}
              placeholder={t.pinOffset?.offsetPlaceholder || '0000'}
              maxLength={12}
              prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
              size="large"
            />
          </div>

          {/* DecTab Input */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.decTabLabel || 'DecTab:'}
            </Text>
            <Input
              value={decTab}
              onChange={(e) => setDecTab(sanitizeDigits(e.target.value))}
              placeholder="0123456789012345"
              maxLength={16}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
              size="large"
            />
          </div>

          {/* Validation Data Method */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.pinOffset?.validationDataLabel || 'Validation data'}
            </Text>
            <Radio.Group
              value={validationMethod}
              onChange={(e) => setValidationMethod(e.target.value)}
              style={{ width: '100%' }}
            >
              <Radio value="parameters">{t.pinOffset?.useParameters || 'Use validation data parameters'}</Radio>
              <Radio value="mask">{t.pinOffset?.useMask || 'Use validation data mask'}</Radio>
            </Radio.Group>
          </div>

          {/* Validation Parameters */}
          {validationMethod === 'parameters' && (
            <>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.startLabel || 'Start:'}
                  </Text>
                  <InputNumber
                    value={start}
                    onChange={(val) => setStart(val || 1)}
                    min={1}
                    max={16}
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.lengthLabel || 'Length:'}
                  </Text>
                  <InputNumber
                    value={length}
                    onChange={(val) => setLength(val || 16)}
                    min={1}
                    max={16}
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.padLabel || 'Pad:'}
                  </Text>
                  <Input
                    value={pad}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      if (/^[0-9A-F]?$/.test(val)) {
                        setPad(val);
                      }
                    }}
                    maxLength={1}
                    style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                    size="large"
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {t.pinOffset?.pinLengthLabel || 'PIN Length:'}
                  </Text>
                  <InputNumber
                    value={pinLength}
                    onChange={(val) => setPinLength(val || 4)}
                    min={4}
                    max={12}
                    style={{ width: '100%' }}
                    size="large"
                  />
                </div>
              </div>
            </>
          )}

          {/* Validation Mask */}
          {validationMethod === 'mask' && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinOffset?.validationMaskLabel || 'Validation data mask:'}
              </Text>
              <Input
                value={validationMask}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  if (/^[0-9N]*$/.test(val)) {
                    setValidationMask(val);
                  }
                }}
                placeholder="0000000N0000"
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                size="large"
              />
              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                {t.pinOffset?.maskHint || 'Use N for natural PIN digits, 0-9 for fixed values'}
              </Text>
            </div>
          )}

          {/* Calculate Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button 
              type="primary"
              icon={<LockOutlined />}
              onClick={handleCalculatePin}
              size="large"
            >
              {t.pinOffset?.calculatePin || 'Calculate PIN'}
            </Button>
          </div>

          {/* PIN Result */}
          {pinResult && (
            <ResultCard
              title={t.pinOffset?.pinResult || 'Calculated PIN'}
              result={pinResult}
              onCopy={() => {
                navigator.clipboard.writeText(pinResult);
                message.success(t.common?.copied || 'Copied!');
              }}
              icon={<LockOutlined />}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.pinOffset?.title || 'PIN offset (IBM 3624 Method)'}
            </Title>
            <CollapsibleInfo title={t.pinOffset?.infoTitle || 'About PIN Offset'}>
              <div>{t.pinOffset?.info1 || 'IBM 3624 method calculates PIN offset using 3DES encryption with PDK and decimalization table.'}</div>
              <div style={{ marginTop: 8 }}>{t.pinOffset?.info2 || 'The offset is calculated as (Customer PIN - Natural PIN) mod 10.'}</div>
              <div style={{ marginTop: 8 }}>{t.pinOffset?.info3 || 'Validation data can be extracted using parameters or a mask pattern for flexible PIN verification.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.pinOffset?.description || 'Calculate and verify PIN offsets using IBM 3624 method with decimalization.'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <Tabs items={tabItems} />
        </Card>

        {/* Error Display */}
        {error && (
          <Card style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PinOffsetTool;
