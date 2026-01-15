import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input } from 'antd';
import { LockOutlined, KeyOutlined, CreditCardOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo, ResultCard } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { sanitizeDigits, formatHexDisplay } from '../../utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Sanitize hex input
const sanitizeHex = (value: string): string => {
  return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
};

type OperationMode = 'encrypt' | 'decrypt';

const PinBlockAESTool: React.FC = () => {
  const { t } = useLanguage();
  useTheme();
  
  const [mode, setMode] = useState<OperationMode>('encrypt');
  const [aesKey, setAesKey] = useState('');
  const [pan, setPan] = useState('');
  const [pin, setPin] = useState('');
  const [encryptedBlock, setEncryptedBlock] = useState('');
  const [result, setResult] = useState('');
  const [, setPinBlock] = useState('');
  const [, setPanBlock] = useState('');
  const [error, setError] = useState('');

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

  // Generate AES PIN Block Format 4 (clear text, before encryption)
  const generatePinBlockFormat4 = (pinValue: string, panValue: string): { pinBlock: string; panBlock: string } => {
    const cleanPin = pinValue.replace(/\D/g, '');
    const cleanPan = panValue.replace(/\D/g, '');
    
    if (!/^\d{4,12}$/.test(cleanPin)) {
      throw new Error(t.pinBlockAes?.errorInvalidPin || 'PIN must be 4-12 digits');
    }
    
    if (!/^\d{13,19}$/.test(cleanPan)) {
      throw new Error(t.pinBlockAes?.errorInvalidPan || 'PAN must be 13-19 digits');
    }

    // PIN Block: 4 + 2-digit length + PIN + padding (total 32 hex chars for AES)
    const pinLen = cleanPin.length.toString(16).toUpperCase().padStart(2, '0');
    const paddedPin = cleanPin + 'A'.repeat(30 - cleanPin.length);
    const pinBlock = '4' + pinLen + paddedPin;
    
    // PAN Block: extract rightmost 12 digits (excluding check digit)
    const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
    const panBlock = '0000' + pan12 + '8' + '7'.repeat(15);
    
    // XOR operation (32 characters)
    let clearBlock = '';
    for (let i = 0; i < 32; i++) {
      const p = parseInt(pinBlock[i], 16);
      const a = parseInt(panBlock[i], 16);
      clearBlock += (p ^ a).toString(16).toUpperCase();
    }
    
    return { pinBlock: clearBlock, panBlock };
  };

  // Encrypt PIN Block with AES
  const encryptPinBlock = (clearBlock: string, key: string): string => {
    const cleanKey = sanitizeHex(key);
    
    if (cleanKey.length !== 32) {
      throw new Error(t.pinBlockAes?.errorInvalidKey || 'AES key must be 32 hex characters (16 bytes)');
    }
    
    if (clearBlock.length !== 32) {
      throw new Error(t.pinBlockAes?.errorInvalidBlock || 'PIN Block must be 32 hex characters');
    }
    
    try {
      const keyWords = CryptoJS.enc.Hex.parse(cleanKey);
      const dataWords = CryptoJS.enc.Hex.parse(clearBlock);
      
      const encrypted = CryptoJS.AES.encrypt(dataWords, keyWords, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();
    } catch {
      throw new Error(t.pinBlockAes?.errorEncryption || 'Encryption failed');
    }
  };

  // Decrypt PIN Block with AES
  const decryptPinBlock = (encryptedBlock: string, key: string, panValue: string): { pin: string; pinBlock: string; panBlock: string } => {
    const cleanKey = sanitizeHex(key);
    const cleanEncrypted = sanitizeHex(encryptedBlock);
    const cleanPan = panValue.replace(/\D/g, '');
    
    if (cleanKey.length !== 32) {
      throw new Error(t.pinBlockAes?.errorInvalidKey || 'AES key must be 32 hex characters (16 bytes)');
    }
    
    if (cleanEncrypted.length !== 32) {
      throw new Error(t.pinBlockAes?.errorInvalidBlock || 'Encrypted block must be 32 hex characters');
    }
    
    if (!/^\d{13,19}$/.test(cleanPan)) {
      throw new Error(t.pinBlockAes?.errorInvalidPan || 'PAN must be 13-19 digits');
    }
    
    try {
      const keyWords = CryptoJS.enc.Hex.parse(cleanKey);
      const ciphertext = CryptoJS.enc.Hex.parse(cleanEncrypted);
      
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext } as CryptoJS.lib.CipherParams,
        keyWords,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        }
      );
      
      const clearBlock = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
      
      if (clearBlock.length !== 32) {
        throw new Error(t.pinBlockAes?.errorDecryption || 'Decryption failed');
      }
      
      // Generate PAN block
      const pan12 = cleanPan.substring(cleanPan.length - 13, cleanPan.length - 1);
      const panBlock = '0000' + pan12 + '8' + '7'.repeat(15);
      
      // XOR to get PIN block
      let pinBlockClear = '';
      for (let i = 0; i < 32; i++) {
        const c = parseInt(clearBlock[i], 16);
        const a = parseInt(panBlock[i], 16);
        pinBlockClear += (c ^ a).toString(16).toUpperCase();
      }
      
      // Validate format
      if (pinBlockClear[0] !== '4') {
        throw new Error(t.pinBlockAes?.errorInvalidFormat || 'Invalid PIN Block format (not Format 4)');
      }
      
      const pinLength = parseInt(pinBlockClear.substring(1, 3), 16);
      if (pinLength < 4 || pinLength > 12) {
        throw new Error(t.pinBlockAes?.errorInvalidPinLength || 'Invalid PIN length');
      }
      
      const pin = pinBlockClear.substring(3, 3 + pinLength);
      
      return { pin, pinBlock: clearBlock, panBlock };
    } catch (err) {
      if (err instanceof Error) {
        throw err;
      }
      throw new Error(t.pinBlockAes?.errorDecryption || 'Decryption failed');
    }
  };

  const handleProcess = () => {
    setError('');
    setResult('');
    setPinBlock('');
    setPanBlock('');

    try {
      if (mode === 'encrypt') {
        const { pinBlock: clearBlock, panBlock: panBlockValue } = generatePinBlockFormat4(pin, pan);
        const encrypted = encryptPinBlock(clearBlock, aesKey);
        setResult(encrypted);
        setPinBlock(clearBlock);
        setPanBlock(panBlockValue);
      } else {
        const decrypted = decryptPinBlock(encryptedBlock, aesKey, pan);
        setResult(decrypted.pin);
        setPinBlock(decrypted.pinBlock);
        setPanBlock(decrypted.panBlock);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.pinBlockAes?.errorProcessing || 'Processing failed');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.pinBlockAes?.title || 'AES PIN Block Format 4'}
            </Title>
            <CollapsibleInfo title={t.pinBlockAes?.infoTitle || 'About AES PIN Block'}>
              <div>{t.pinBlockAes?.info1 || 'PIN Block Format 4 is designed specifically for AES encryption with 128-bit block size.'}</div>
              <div style={{ marginTop: 8 }}>{t.pinBlockAes?.info2 || 'Unlike older formats, Format 4 uses a 32 hex character block (16 bytes) suitable for AES.'}</div>
              <div style={{ marginTop: 8 }}>{t.pinBlockAes?.info3 || 'The PIN block is XORed with the PAN block before AES encryption for enhanced security.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.pinBlockAes?.description || 'Generate and process AES PIN blocks using Format 4 for secure PIN encryption.'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Encrypt/Decrypt Mode */}
            <div>
              <Segmented
                value={mode}
                onChange={(value) => setMode(value as OperationMode)}
                options={[
                  { label: t.pinBlockAes?.encrypt || 'Encrypt', value: 'encrypt' },
                  { label: t.pinBlockAes?.decrypt || 'Decrypt', value: 'decrypt' },
                ]}
                block
                size="large"
              />
            </div>

            {/* AES Key Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlockAes?.keyLabel || 'Key:'}
              </Text>
              <TextArea
                value={aesKey}
                onChange={(e) => setAesKey(sanitizeHex(e.target.value))}
                placeholder={t.pinBlockAes?.keyPlaceholder || 'C1D0F8FB4958670DBA40AB1F3752EF0D'}
                autoSize={{ minRows: 2, maxRows: 3 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
              />
              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                {t.pinBlockAes?.keyHint || 'AES-128 key: 32 hex characters (16 bytes)'}
              </Text>
            </div>

            {/* PAN Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.pinBlockAes?.panLabel || 'PAN/PAN Block:'}
              </Text>
              <Input
                value={pan}
                onChange={(e) => setPan(sanitizeDigits(e.target.value))}
                placeholder={t.pinBlockAes?.panPlaceholder || '6432198765432109870'}
                maxLength={19}
                prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}                suffix={lengthIndicator(pan.replace(/\D/g, '').length, 16)}                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                size="large"
              />
            </div>

            {/* Encrypt Mode: PIN Input */}
            {mode === 'encrypt' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.pinBlockAes?.pinLabel || 'PIN/PIN Block:'}
                </Text>
                <Input
                  value={pin}
                  onChange={(e) => setPin(sanitizeDigits(e.target.value))}
                  placeholder={t.pinBlockAes?.pinPlaceholder || '441234'}
                  maxLength={12}
                  prefix={<KeyOutlined style={{ color: '#bfbfbf' }} />}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                  size="large"
                />
              </div>
            )}

            {/* Decrypt Mode: Encrypted Block Input */}
            {mode === 'decrypt' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.pinBlockAes?.encryptedBlockLabel || 'Encrypted PIN Block:'}
                </Text>
                <TextArea
                  value={encryptedBlock}
                  onChange={(e) => setEncryptedBlock(sanitizeHex(e.target.value))}
                  placeholder={t.pinBlockAes?.encryptedBlockPlaceholder || 'Enter encrypted PIN block (32 hex chars)'}
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '16px' }}
                />
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
                {mode === 'encrypt' 
                  ? (t.pinBlockAes?.encryptButton || 'Encrypt') 
                  : (t.pinBlockAes?.decryptButton || 'Decrypt')
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
          <ResultCard
            title={t.common?.result || 'Result'}
            result={mode === 'encrypt' ? formatHexDisplay(result) : result}
            onCopy={() => {
              navigator.clipboard.writeText(result);
              message.success(t.common?.copied || 'Copied!');
            }}
            icon={<LockOutlined />}
          />
        )}
      </div>
    </div>
  );
};

export default PinBlockAESTool;
