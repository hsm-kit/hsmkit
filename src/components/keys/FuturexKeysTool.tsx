import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, Checkbox, Segmented } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { isValidHex, cleanHexInput, adjustDesKeyParity, checkDesKeyParityOdd } from '../../utils/crypto';

const { Title, Text } = Typography;

// Result details interface
interface ResultDetails {
  inputKey: string;
  parity: string;
  mfk: string;
  modifier: string;
  outputKey: string;
  kcv: string;
}

// Modifier options (0-F, 1A-1F for key variants)
const MODIFIER_OPTIONS = [
  // 0-F
  ...Array.from({ length: 16 }, (_, i) => ({
    value: i.toString(16).toUpperCase(),
    label: i.toString(16).toUpperCase(),
  })),
  // 1A-1F
  { value: '1A', label: '1A' },
  { value: '1B', label: '1B' },
  { value: '1C', label: '1C' },
  { value: '1D', label: '1D' },
  { value: '1E', label: '1E' },
  { value: '1F', label: '1F' },
];

// Default MFK options
const DEFAULT_MFK_OPTIONS = [
  { value: 'D2DE5CD9110F4CAB11111111111111110123456789ABCDEF', label: 'MFK triple: D2DE5CD9110F4CAB11111111111111110123456789ABCDEF' },
  { value: '0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF', label: 'MFK triple: 0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF' },
];

const FuturexKeysTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Key Encryption/Decryption state
  const [key, setKey] = useState('');
  const [modifier, setModifier] = useState('0');
  const [mfk, setMfk] = useState(DEFAULT_MFK_OPTIONS[0].value);
  const [customMfk, setCustomMfk] = useState('');
  const [useCustomMfk, setUseCustomMfk] = useState(false);
  const [resultDetails, setResultDetails] = useState<ResultDetails | null>(null);
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [error, setError] = useState('');

  // Key Lookup state
  const [lookupKey, setLookupKey] = useState('');
  const [checkKcv, setCheckKcv] = useState(false);
  const [lookupType, setLookupType] = useState<'any' | 'futurex' | 'ibm' | 'atalla' | 'visa'>('any');
  const [lookupKcv, setLookupKcv] = useState('');
  const [lookupParity, setLookupParity] = useState<'any' | 'odd' | 'even'>('any');
  const [lookupResults, setLookupResults] = useState<Array<{
    modifier: string;
    decryptedKey: string;
    kcv: string;
    parity: string;
  }>>([]);
  const [lookupError, setLookupError] = useState('');

  // Get key length in bytes
  const getKeyLength = (hexKey: string): number => {
    const cleaned = cleanHexInput(hexKey);
    return isValidHex(cleaned) ? cleaned.length / 2 : 0;
  };

  // Get length indicator color
  const getLengthColor = (actual: number, expected: number[]): string => {
    if (actual === 0) return '#999';
    if (expected.includes(actual)) return '#52c41a';
    return '#ff4d4f';
  };

  // XOR two hex strings
  const xorHex = (hex1: string, hex2: string): string => {
    const words1 = CryptoJS.enc.Hex.parse(hex1);
    const words2 = CryptoJS.enc.Hex.parse(hex2);
    
    for (let i = 0; i < words1.words.length; i++) {
      words1.words[i] ^= words2.words[i];
    }
    
    return words1.toString().toUpperCase();
  };

  // Calculate Futurex key variant
  // Variant is created by XORing the modifier with specific bytes of the key
  const calculateVariant = (mfkHex: string, mod: string): string => {
    const cleaned = cleanHexInput(mfkHex);
    if (cleaned.length < 32) return cleaned;
    
    // Create variant mask based on modifier
    const modByte = mod.padStart(2, '0');
    const variantMask = modByte.repeat(cleaned.length / 2);
    
    // XOR MFK with variant mask to get the variant key
    return xorHex(cleaned, variantMask);
  };

  // Calculate KCV (Key Check Value) using 3DES
  const calculateKCV = (keyHex: string): string => {
    try {
      const cleaned = cleanHexInput(keyHex);
      if (!isValidHex(cleaned) || cleaned.length < 32) return '';
      
      // Use first 24 bytes (48 hex chars) for 3DES, pad if needed
      let tripleKey = cleaned;
      if (cleaned.length === 32) {
        // Double-length key: K1K2 -> K1K2K1
        tripleKey = cleaned + cleaned.substring(0, 16);
      } else if (cleaned.length > 48) {
        tripleKey = cleaned.substring(0, 48);
      }
      
      // Adjust parity
      const parityKey = adjustDesKeyParity(tripleKey);
      
      // Encrypt 8 bytes of zeros
      const zeros = CryptoJS.enc.Hex.parse('0000000000000000');
      const keyWordArray = CryptoJS.enc.Hex.parse(parityKey);
      
      const encrypted = CryptoJS.TripleDES.encrypt(zeros, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      // Return first 3 bytes (6 hex chars)
      return encrypted.ciphertext.toString().substring(0, 6).toUpperCase();
    } catch {
      return '';
    }
  };

  // Detect key parity
  const detectParity = (keyHex: string): string => {
    try {
      const cleaned = cleanHexInput(keyHex);
      if (!isValidHex(cleaned) || cleaned.length < 16) return 'Unknown';
      
      const isOdd = checkDesKeyParityOdd(cleaned);
      if (isOdd) return 'Odd';
      
      // Check for even parity
      let isEven = true;
      for (let i = 0; i < cleaned.length; i += 2) {
        const byte = parseInt(cleaned.substring(i, i + 2), 16);
        const bitCount = byte.toString(2).split('1').length - 1;
        if (bitCount % 2 !== 0) {
          isEven = false;
          break;
        }
      }
      if (isEven) return 'Even';
      
      return 'No parity';
    } catch {
      return 'Unknown';
    }
  };

  // Encrypt key using 3DES with MFK variant
  const encryptKey = () => {
    setError('');
    setResultDetails(null);
    
    try {
      const cleanKey = cleanHexInput(key);
      const cleanMfk = cleanHexInput(useCustomMfk ? customMfk : mfk);
      
      if (!isValidHex(cleanKey)) {
        setError(t.futurexKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      if (![16, 24, 32].includes(cleanKey.length / 2)) {
        setError(t.futurexKeys?.errorKeyLength || 'Key must be 16, 24, or 32 bytes');
        return;
      }
      
      if (!isValidHex(cleanMfk) || cleanMfk.length < 32) {
        setError(t.futurexKeys?.errorInvalidMfk || 'Invalid MFK format');
        return;
      }

      // Calculate variant key from MFK
      const variantKey = calculateVariant(cleanMfk, modifier);
      
      // Adjust parity
      const parityAdjustedKey = adjustDesKeyParity(variantKey.substring(0, 48));
      
      // Encrypt the key using 3DES ECB
      const keyWordArray = CryptoJS.enc.Hex.parse(cleanKey);
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedKey);
      
      const encrypted = CryptoJS.TripleDES.encrypt(keyWordArray, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const encryptedHex = encrypted.ciphertext.toString().toUpperCase();
      
      setResultDetails({
        inputKey: cleanKey.toUpperCase(),
        parity: detectParity(cleanKey),
        mfk: cleanMfk.toUpperCase(),
        modifier: modifier,
        outputKey: encryptedHex,
        kcv: calculateKCV(cleanKey),
      });
      setLastOperation('encrypt');
      message.success(t.futurexKeys?.encryptSuccess || 'Key encrypted successfully');
    } catch (err) {
      setError((t.futurexKeys?.errorEncrypt || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Decrypt key using 3DES with MFK variant
  const decryptKey = () => {
    setError('');
    setResultDetails(null);
    
    try {
      const cleanKey = cleanHexInput(key);
      const cleanMfk = cleanHexInput(useCustomMfk ? customMfk : mfk);
      
      if (!isValidHex(cleanKey)) {
        setError(t.futurexKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      if (![16, 24, 32].includes(cleanKey.length / 2)) {
        setError(t.futurexKeys?.errorKeyLength || 'Key must be 16, 24, or 32 bytes');
        return;
      }
      
      if (!isValidHex(cleanMfk) || cleanMfk.length < 32) {
        setError(t.futurexKeys?.errorInvalidMfk || 'Invalid MFK format');
        return;
      }

      // Calculate variant key from MFK
      const variantKey = calculateVariant(cleanMfk, modifier);
      
      // Adjust parity
      const parityAdjustedKey = adjustDesKeyParity(variantKey.substring(0, 48));
      
      // Decrypt the key using 3DES ECB
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedKey);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(cleanKey)
      });
      
      const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const decryptedHex = decrypted.toString().toUpperCase();
      
      setResultDetails({
        inputKey: cleanKey.toUpperCase(),
        parity: detectParity(cleanKey),
        mfk: cleanMfk.toUpperCase(),
        modifier: modifier,
        outputKey: decryptedHex,
        kcv: calculateKCV(decryptedHex),
      });
      setLastOperation('decrypt');
      message.success(t.futurexKeys?.decryptSuccess || 'Key decrypted successfully');
    } catch (err) {
      setError((t.futurexKeys?.errorDecrypt || 'Decryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Calculate IBM variant key
  const calculateIbmVariant = (mfkHex: string, mod: string): string => {
    // IBM uses XOR with modifier on specific positions
    const cleaned = cleanHexInput(mfkHex);
    const modByte = mod.padStart(2, '0');
    // IBM variant: XOR modifier with bytes at positions 0, 8, 16
    const bytes = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      const byteVal = parseInt(cleaned.substring(i, i + 2), 16);
      const pos = i / 2;
      if (pos === 0 || pos === 8 || pos === 16) {
        bytes.push((byteVal ^ parseInt(modByte, 16)).toString(16).padStart(2, '0'));
      } else {
        bytes.push(cleaned.substring(i, i + 2));
      }
    }
    return bytes.join('').toUpperCase();
  };

  // Calculate Atalla variant key (AKB method)
  const calculateAtallaVariant = (mfkHex: string, mod: string): string => {
    // Atalla uses a different variant calculation
    const cleaned = cleanHexInput(mfkHex);
    const modByte = mod.padStart(2, '0');
    // Atalla: XOR all bytes with modifier
    return xorHex(cleaned, modByte.repeat(cleaned.length / 2));
  };

  // Calculate VISA variant key (PVK method)
  const calculateVisaVariant = (mfkHex: string, mod: string): string => {
    // VISA uses variant method similar to Futurex but with different positions
    const cleaned = cleanHexInput(mfkHex);
    const modByte = mod.padStart(2, '0');
    // VISA variant: XOR with variant mask at first 8 bytes
    const variantMask = modByte.repeat(8) + '00'.repeat(Math.max(0, cleaned.length / 2 - 8));
    return xorHex(cleaned, variantMask.substring(0, cleaned.length));
  };

  // Key lookup - find which modifier was used
  const performKeyLookup = () => {
    setLookupError('');
    setLookupResults([]);
    
    try {
      const cleanKey = cleanHexInput(lookupKey);
      const cleanKcv = checkKcv ? cleanHexInput(lookupKcv).toUpperCase() : '';
      
      if (!isValidHex(cleanKey)) {
        setLookupError(t.futurexKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }

      if (checkKcv && (!isValidHex(cleanKcv) || cleanKcv.length < 6)) {
        setLookupError(t.futurexKeys?.errorInvalidKcv || 'Invalid KCV format (must be at least 6 hex characters)');
        return;
      }

      // Get all modifiers to try
      const modifiers = MODIFIER_OPTIONS.map(opt => opt.value);
      const results: Array<{modifier: string; decryptedKey: string; kcv: string; parity: string}> = [];
      
      // Use default MFK for lookup
      const defaultMfk = DEFAULT_MFK_OPTIONS[0].value;
      
      // Determine which types to try
      const typesToTry = lookupType === 'any' 
        ? ['futurex', 'ibm', 'atalla', 'visa'] 
        : [lookupType];
      
      for (const mod of modifiers) {
        for (const type of typesToTry) {
          try {
            let variantKey = '';
            
            switch (type) {
              case 'futurex':
                variantKey = calculateVariant(defaultMfk, mod);
                break;
              case 'ibm':
                variantKey = calculateIbmVariant(defaultMfk, mod);
                break;
              case 'atalla':
                variantKey = calculateAtallaVariant(defaultMfk, mod);
                break;
              case 'visa':
                variantKey = calculateVisaVariant(defaultMfk, mod);
                break;
            }
            
            if (!variantKey) continue;
            
            const parityAdjustedKey = adjustDesKeyParity(variantKey.substring(0, 48));
            
            const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedKey);
            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(cleanKey)
            });
            
            const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, encKeyWordArray, {
              mode: CryptoJS.mode.ECB,
              padding: CryptoJS.pad.NoPadding
            });
            
            const decryptedHex = decrypted.toString().toUpperCase();
            
            if (decryptedHex && decryptedHex.length >= 32) {
              const kcv = calculateKCV(decryptedHex);
              const parity = detectParity(decryptedHex);
              
              // Filter by KCV if checking
              if (checkKcv && cleanKcv && kcv !== cleanKcv) {
                continue;
              }
              
              // Filter by parity
              if (lookupParity !== 'any') {
                if (lookupParity === 'odd' && parity !== 'Odd') continue;
                if (lookupParity === 'even' && parity !== 'Even') continue;
              }
              
              // Avoid duplicates
              const exists = results.some(r => r.decryptedKey === decryptedHex && r.modifier === mod);
              if (!exists) {
                results.push({
                  modifier: mod,
                  decryptedKey: decryptedHex,
                  kcv,
                  parity,
                });
              }
            }
          } catch {
            // Skip invalid results
          }
        }
      }
      
      if (results.length > 0) {
        setLookupResults(results);
      } else {
        setLookupError(t.futurexKeys?.noResults || 'No valid decryption found');
      }
    } catch (err) {
      setLookupError((t.futurexKeys?.errorLookup || 'Lookup failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // Key length for display
  const keyLength = getKeyLength(key);
  const lookupKeyLength = getKeyLength(lookupKey);

  // Tab items
  const tabItems = [
    {
      key: 'encrypt',
      label: (
        <span>
          <LockOutlined /> {t.futurexKeys?.tabEncrypt || 'Key Encryption / Decryption'}
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.futurexKeys?.key || 'Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(keyLength, [16, 24, 32]),
                fontWeight: keyLength > 0 ? 600 : 400
              }}>
                [{keyLength || 16}]
              </Text>
            </div>
            <Input
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter hex key (16/24/32 bytes)"
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Modifier Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.futurexKeys?.modifier || 'Modifier'}:
            </Text>
            <Select
              value={modifier}
              onChange={setModifier}
              options={MODIFIER_OPTIONS}
              style={{ width: '100%' }}
            />
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
              {t.futurexKeys?.modifierHint || 'Key variant selector (0-F)'}
            </Text>
          </div>

          {/* MFK Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.futurexKeys?.mfk || 'MFK (Master File Key)'}:
            </Text>
            <Select
              value={useCustomMfk ? 'custom' : mfk}
              onChange={(value) => {
                if (value === 'custom') {
                  setUseCustomMfk(true);
                } else {
                  setUseCustomMfk(false);
                  setMfk(value);
                }
              }}
              options={[
                ...DEFAULT_MFK_OPTIONS,
                { value: 'custom', label: t.futurexKeys?.customMfk || 'Custom MFK...' }
              ]}
              style={{ width: '100%' }}
            />
            {useCustomMfk && (
              <Input
                value={customMfk}
                onChange={e => setCustomMfk(e.target.value)}
                placeholder="Enter custom MFK (48 hex characters)"
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', marginTop: 8 }}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={encryptKey}
              size="large"
            >
              {t.futurexKeys?.encrypt || 'Encrypt'}
            </Button>
            <Button
              type="default"
              icon={<UnlockOutlined />}
              onClick={decryptKey}
              size="large"
            >
              {t.futurexKeys?.decrypt || 'Decrypt'}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{error}</Text>
            </Card>
          )}

          {/* Result Display */}
          {resultDetails && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  {lastOperation === 'encrypt' ? <LockOutlined /> : <UnlockOutlined />}
                  {' '}
                  {lastOperation === 'encrypt' 
                    ? (t.futurexKeys?.encryptResult || 'Key Encryption Result')
                    : (t.futurexKeys?.decryptResult || 'Key Decryption Result')}
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
                  onClick={() => copyToClipboard(resultDetails.outputKey)}
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
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '13px',
                lineHeight: '2',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {lastOperation === 'encrypt' 
                        ? (t.futurexKeys?.plainKey || 'Plain Key')
                        : (t.futurexKeys?.encryptedKeyLabel || 'Encrypted Key')}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {resultDetails.inputKey}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.futurexKeys?.parityDetected || 'Parity detected'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {resultDetails.parity}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.futurexKeys?.mfkLabel || 'MFK'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {resultDetails.mfk}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.futurexKeys?.keyModifier || 'Key modifier'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {resultDetails.modifier}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {lastOperation === 'encrypt' 
                        ? (t.futurexKeys?.encryptedKeyLabel || 'Encrypted Key')
                        : (t.futurexKeys?.decodedKey || 'Decoded Key')}:
                    </span>
                    <span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600, wordBreak: 'break-all' }}>
                      {resultDetails.outputKey}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.futurexKeys?.kcvLabel || 'KCV'}:
                    </span>
                    <span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600 }}>
                      {resultDetails.kcv}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'lookup',
      label: (
        <span>
          {t.futurexKeys?.tabLookup || 'Key Lookup'}
        </span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Lookup Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.futurexKeys?.key || 'Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(lookupKeyLength, [16, 24, 32]),
                fontWeight: lookupKeyLength > 0 ? 600 : 400
              }}>
                [{lookupKeyLength || 16}]
              </Text>
            </div>
            <Input
              value={lookupKey}
              onChange={e => setLookupKey(e.target.value)}
              placeholder={t.futurexKeys?.keyPlaceholder || 'Enter encrypted key to lookup'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Check KCV */}
          <div>
            <Checkbox
              checked={checkKcv}
              onChange={e => setCheckKcv(e.target.checked)}
            >
              <Text strong>{t.futurexKeys?.checkKcv || 'Check KCV?'}</Text>
            </Checkbox>
          </div>

          {/* Type Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.futurexKeys?.type || 'Type'}:
            </Text>
            <Segmented
              value={lookupType}
              onChange={value => setLookupType(value as 'any' | 'futurex' | 'ibm' | 'atalla' | 'visa')}
              options={[
                { label: t.futurexKeys?.typeAny || 'Any', value: 'any' },
                { label: t.futurexKeys?.typeFuturex || 'Futurex', value: 'futurex' },
                { label: t.futurexKeys?.typeIbm || 'IBM', value: 'ibm' },
                { label: t.futurexKeys?.typeAtalla || 'Atalla', value: 'atalla' },
                { label: t.futurexKeys?.typeVisa || 'VISA', value: 'visa' },
              ]}
              block
            />
          </div>

          {/* KCV Input - only show when Check KCV is checked */}
          {checkKcv && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.futurexKeys?.kcvLabel || 'KCV'}:</Text>
                <Text style={{ 
                  fontSize: '12px', 
                  color: lookupKcv.length >= 6 ? '#52c41a' : '#999',
                  fontWeight: lookupKcv.length >= 6 ? 600 : 400
                }}>
                  [{lookupKcv.length || 6}]
                </Text>
              </div>
              <Input
                value={lookupKcv}
                onChange={e => setLookupKcv(e.target.value)}
                placeholder={t.futurexKeys?.kcvPlaceholder || 'Enter KCV to match (6 hex chars)'}
                maxLength={6}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>
          )}

          {/* Parity Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.futurexKeys?.parityLabel || 'Parity'}:
            </Text>
            <Segmented
              value={lookupParity}
              onChange={value => setLookupParity(value as 'any' | 'odd' | 'even')}
              options={[
                { label: t.futurexKeys?.parityAny || 'Any', value: 'any' },
                { label: t.futurexKeys?.parityOdd || 'Odd', value: 'odd' },
                { label: t.futurexKeys?.parityEven || 'Even', value: 'even' },
              ]}
              block
            />
          </div>

          {/* Lookup Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              onClick={performKeyLookup}
              size="large"
            >
              {t.futurexKeys?.lookup || 'Lookup'}
            </Button>
          </div>

          {/* Lookup Error */}
          {lookupError && (
            <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{lookupError}</Text>
            </Card>
          )}

          {/* Lookup Results */}
          {lookupResults.length > 0 && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  {t.futurexKeys?.lookupResults || 'Lookup Results'} ({lookupResults.length})
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
                    const text = lookupResults.map(r => 
                      `Modifier ${r.modifier}: ${r.decryptedKey} (KCV: ${r.kcv}, Parity: ${r.parity})`
                    ).join('\n');
                    copyToClipboard(text);
                  }}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lookupResults.map((r, index) => (
                  <div
                    key={index}
                    style={{
                      background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div style={{ 
                      minWidth: 50,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                      fontWeight: 600,
                      color: isDark ? '#95de64' : '#237804',
                    }}>
                      {r.modifier}
                    </div>
                    <div style={{ 
                      flex: 1,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                      fontSize: '13px',
                      wordBreak: 'break-all',
                      color: isDark ? '#d9d9d9' : '#262626',
                    }}>
                      {r.decryptedKey}
                    </div>
                    <div style={{ 
                      minWidth: 60,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                      fontWeight: 600,
                      color: isDark ? '#95de64' : '#237804',
                    }}>
                      {r.kcv}
                    </div>
                    <div style={{ 
                      minWidth: 60,
                      fontSize: '12px',
                      color: isDark ? '#8c8c8c' : '#595959',
                    }}>
                      {r.parity}
                    </div>
                    <Button
                      type={isDark ? 'primary' : 'default'}
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(r.decryptedKey)}
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
                ))}
              </div>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.futurexKeys?.title || 'Futurex Keys Encryption/Decryption'}
            </Title>
            <CollapsibleInfo title={t.futurexKeys?.infoTitle || 'About Futurex Keys'}>
              <div>• {t.futurexKeys?.infoContent1 || 'Encrypt/decrypt keys using Futurex HSM key variants.'}</div>
              <div>• {t.futurexKeys?.infoContent2 || 'Modifier (0-F) creates different key variants from MFK.'}</div>
              <div>• {t.futurexKeys?.infoContent3 || 'MFK (Master File Key) is the base encryption key.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.futurexKeys?.description || 'Encrypt and decrypt keys using Futurex HSM key variant methodology'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <Tabs items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

export default FuturexKeysTool;

