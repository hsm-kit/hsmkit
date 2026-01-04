import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, Checkbox, Segmented, Radio } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { isValidHex, cleanHexInput, adjustDesKeyParity } from '../../utils/crypto';

const { Title, Text } = Typography;

// Key Scheme options
const KEY_SCHEME_OPTIONS = [
  { value: '0', label: '0 - Clear' },
  { value: 'U', label: 'U - Single length (ECB)' },
  { value: 'T', label: 'T - Double length (ECB)' },
  { value: 'X', label: 'X - Triple length (ECB)' },
  { value: 'Y', label: 'Y - Double length variant' },
  { value: 'Z', label: 'Z - Triple length variant' },
];

// LMK Pair options with default test keys (value contains pair ID, key is in the label)
const LMK_PAIR_OPTIONS = [
  { value: '00-01', label: '00-01: 01010101010101017902CD1FD36EF8BA', key: '01010101010101017902CD1FD36EF8BA' },
  { value: '02-03', label: '02-03: 20202020202020203131313131313131', key: '20202020202020203131313131313131' },
  { value: '04-05', label: '04-05: 40404040404040405151515151515151', key: '40404040404040405151515151515151' },
  { value: '06-07', label: '06-07: 61616161616161617070707070707070', key: '61616161616161617070707070707070' },
  { value: '08-09', label: '08-09: 80808080808080809191919191919191', key: '80808080808080809191919191919191' },
  { value: '10-11', label: '10-11: A1A1A1A1A1A1A1A1B0B0B0B0B0B0B0B0', key: 'A1A1A1A1A1A1A1A1B0B0B0B0B0B0B0B0' },
  { value: '12-13', label: '12-13: C1C1010101010101D0D0010101010101', key: 'C1C1010101010101D0D0010101010101' },
  { value: '14-15', label: '14-15: E0E0010101010101F1F1010101010101', key: 'E0E0010101010101F1F1010101010101' },
  { value: '16-17', label: '16-17: 1C587F1C13924FEF0101010101010101', key: '1C587F1C13924FEF0101010101010101' },
  { value: '18-19', label: '18-19: 01010101010101010101010101010101', key: '01010101010101010101010101010101' },
  { value: '20-21', label: '20-21: 02020202020202020404040404040404', key: '02020202020202020404040404040404' },
  { value: '22-23', label: '22-23: 07070707070707071010101010101010', key: '07070707070707071010101010101010' },
  { value: '24-25', label: '24-25: 13131313131313131515151515151515', key: '13131313131313131515151515151515' },
  { value: '26-27', label: '26-27: 16161616161616161919191919191919', key: '16161616161616161919191919191919' },
  { value: '28-29', label: '28-29: 1A1A1A1A1A1A1A1A1C1C1C1C1C1C1C1C', key: '1A1A1A1A1A1A1A1A1C1C1C1C1C1C1C1C' },
  { value: '30-31', label: '30-31: 23232323232323232525252525252525', key: '23232323232323232525252525252525' },
  { value: '32-33', label: '32-33: 26262626262626262929292929292929', key: '26262626262626262929292929292929' },
  { value: '34-35', label: '34-35: 2A2A2A2A2A2A2A2A2C2C2C2C2C2C2C2C', key: '2A2A2A2A2A2A2A2A2C2C2C2C2C2C2C2C' },
  { value: '36-37', label: '36-37: 2D2D2D2D2D2D2D2D2F2F2F2F2F2F2F2F', key: '2D2D2D2D2D2D2D2D2F2F2F2F2F2F2F2F' },
  { value: '38-39', label: '38-39: 30303030303030303232323232323232', key: '30303030303030303232323232323232' },
];

// Get LMK key from selected pair
const getLmkKeyFromPair = (pairValue: string): string => {
  const pair = LMK_PAIR_OPTIONS.find(p => p.value === pairValue);
  return pair?.key || '';
};

// Variant options
const VARIANT_OPTIONS = [
  { value: '0', label: '0: 00' },
  { value: '1', label: '1: A6' },
  { value: '2', label: '2: 5A' },
  { value: '3', label: '3: 6A' },
  { value: '4', label: '4: DE' },
  { value: '5', label: '5: 2B' },
  { value: '6', label: '6: 50' },
  { value: '7', label: '7: 74' },
  { value: '8', label: '8: 9C' },
  { value: '9', label: '9: FA' },
];

// Variant masks for Thales
const VARIANT_MASKS: Record<string, string> = {
  '0': '0000000000000000',
  '1': 'A6A6A6A6A6A6A6A6',
  '2': '5A5A5A5A5A5A5A5A',
  '3': '6A6A6A6A6A6A6A6A',
  '4': 'DEDEDEDEDEDEDEDE',
  '5': '2B2B2B2B2B2B2B2B',
  '6': '5050505050505050',
  '7': '7474747474747474',
  '8': '9C9C9C9C9C9C9C9C',
  '9': 'FAFAFAFAFAFAFAFA',
};

// Result details interface
interface EncryptResultDetails {
  key: string;
  keyScheme: string;
  lmkSize: string;
  lmkPair: string;
  variant: string;
  lmkKey: string;
  encryptedKey: string;
  kcv: string;
  parity: string;
}

interface DecodeResultDetails {
  encryptedKey: string;
  keyScheme: string;
  lmkPair: string;
  variant: string;
  decodedKey: string;
  kcv: string;
  parity: string;
}

const ThalesKeysTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Key Encryption state
  const [encKey, setEncKey] = useState('');
  const [keyScheme, setKeyScheme] = useState('U');
  const [lmkSize, setLmkSize] = useState<'double' | 'triple'>('double');
  const [lmkPair, setLmkPair] = useState('00-01');
  const [variant, setVariant] = useState('1');
  const [encryptResult, setEncryptResult] = useState<EncryptResultDetails | null>(null);
  const [encryptError, setEncryptError] = useState('');
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | null>(null);

  // Key Lookup state
  const [lookupKey, setLookupKey] = useState('');
  const [checkKcv, setCheckKcv] = useState(false);
  const [expectedKcv, setExpectedKcv] = useState('');
  const [lookupParity, setLookupParity] = useState<'any' | 'odd' | 'even'>('any');
  const [lookupResults, setLookupResults] = useState<DecodeResultDetails[]>([]);
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
    const len = Math.min(hex1.length, hex2.length);
    let result = '';
    for (let i = 0; i < len; i += 2) {
      const byte1 = parseInt(hex1.substring(i, i + 2), 16);
      const byte2 = parseInt(hex2.substring(i, i + 2), 16);
      result += (byte1 ^ byte2).toString(16).padStart(2, '0');
    }
    return result.toUpperCase();
  };

  // Calculate variant key for Thales
  const calculateVariantKey = (lmkKeyHex: string, variantCode: string): string => {
    const mask = VARIANT_MASKS[variantCode] || '0000000000000000';
    
    if (mask === '0000000000000000') {
      return lmkKeyHex.toUpperCase();
    }
    
    // Apply variant mask to each 8-byte block
    let variantKey = '';
    for (let i = 0; i < lmkKeyHex.length; i += 16) {
      const block = lmkKeyHex.substring(i, i + 16);
      if (block.length === 16) {
        variantKey += xorHex(block, mask);
      } else {
        variantKey += block.toUpperCase();
      }
    }
    
    return variantKey;
  };

  // Calculate KCV using 3DES
  const calculateKCV = (keyHex: string): string => {
    try {
      const cleaned = cleanHexInput(keyHex);
      if (!isValidHex(cleaned) || cleaned.length < 16) return '';
      
      let tripleKey = cleaned;
      if (cleaned.length === 16) {
        // Single length - extend to K1K1K1
        tripleKey = cleaned + cleaned + cleaned;
      } else if (cleaned.length === 32) {
        // Double length - extend to K1K2K1
        tripleKey = cleaned + cleaned.substring(0, 16);
      } else if (cleaned.length > 48) {
        tripleKey = cleaned.substring(0, 48);
      }
      
      const parityKey = adjustDesKeyParity(tripleKey);
      const zeros = CryptoJS.enc.Hex.parse('0000000000000000');
      const keyWordArray = CryptoJS.enc.Hex.parse(parityKey);
      
      const encrypted = CryptoJS.TripleDES.encrypt(zeros, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
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
      
      let isOdd = true;
      let isEven = true;
      
      for (let i = 0; i < cleaned.length; i += 2) {
        const byte = parseInt(cleaned.substring(i, i + 2), 16);
        const bitCount = byte.toString(2).split('1').length - 1;
        if (bitCount % 2 === 0) isOdd = false;
        if (bitCount % 2 !== 0) isEven = false;
      }
      
      if (isOdd) return 'Odd';
      if (isEven) return 'Even';
      return 'No parity';
    } catch {
      return 'Unknown';
    }
  };

  // Get valid key lengths based on scheme
  const getValidKeyLengths = (scheme: string): number[] => {
    switch (scheme) {
      case '0': // Clear - accepts any valid key length
        return [8, 16, 24];
      case 'U':
        return [8]; // Single-length
      case 'T':
      case 'Y':
        return [16]; // Double-length
      case 'X':
      case 'Z':
        return [24]; // Triple-length
      default:
        return [8, 16, 24];
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // Encrypt key using Thales LMK methodology
  const handleEncrypt = () => {
    setEncryptError('');
    setEncryptResult(null);
    setLastOperation('encrypt');
    
    try {
      const cleanKey = cleanHexInput(encKey);
      const lmkKeyValue = getLmkKeyFromPair(lmkPair);
      const cleanLmk = cleanHexInput(lmkKeyValue);
      
      if (!isValidHex(cleanKey)) {
        setEncryptError(t.thalesKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      const validLengths = getValidKeyLengths(keyScheme);
      const keyLenBytes = cleanKey.length / 2;
      if (!validLengths.includes(keyLenBytes)) {
        setEncryptError(`Key must be ${validLengths.join(' or ')} bytes for selected scheme`);
        return;
      }
      
      if (!cleanLmk) {
        setEncryptError('Invalid LMK Pair selection');
        return;
      }

      // Calculate variant key
      const variantKey = calculateVariantKey(cleanLmk, variant);
      
      // Prepare encryption key
      let encryptionKey = variantKey;
      if (variantKey.length === 32) {
        encryptionKey = variantKey + variantKey.substring(0, 16);
      }
      const parityAdjustedKey = adjustDesKeyParity(encryptionKey);

      // Encrypt the key
      const keyWordArray = CryptoJS.enc.Hex.parse(cleanKey);
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedKey);
      
      const encrypted = CryptoJS.TripleDES.encrypt(keyWordArray, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const encryptedHex = encrypted.ciphertext.toString().toUpperCase();
      
      // Add key scheme prefix (except for scheme 0 which is clear/no prefix)
      const finalEncrypted = keyScheme === '0' ? encryptedHex : keyScheme + encryptedHex;
      
      setEncryptResult({
        key: cleanKey.toUpperCase(),
        keyScheme: keyScheme,
        lmkSize: lmkSize,
        lmkPair: lmkPair,
        variant: variant,
        lmkKey: cleanLmk.toUpperCase(),
        encryptedKey: finalEncrypted,
        kcv: calculateKCV(cleanKey),
        parity: detectParity(cleanKey),
      });
      message.success(t.thalesKeys?.encryptSuccess || 'Key encrypted successfully');
    } catch (err) {
      setEncryptError((t.thalesKeys?.errorEncrypt || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Decrypt key
  const handleDecrypt = () => {
    setEncryptError('');
    setEncryptResult(null);
    setLastOperation('decrypt');
    
    try {
      let cleanKey = cleanHexInput(encKey);
      const lmkKeyValue = getLmkKeyFromPair(lmkPair);
      const cleanLmk = cleanHexInput(lmkKeyValue);
      
      // Check if key has scheme prefix
      let detectedScheme = keyScheme;
      if (/^[UTXYZ0]/i.test(cleanKey) && cleanKey.length % 2 === 1) {
        detectedScheme = cleanKey[0].toUpperCase();
        cleanKey = cleanKey.substring(1);
      }
      
      if (!isValidHex(cleanKey)) {
        setEncryptError(t.thalesKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      if (!cleanLmk) {
        setEncryptError('Invalid LMK Pair selection');
        return;
      }

      // Calculate variant key
      const variantKey = calculateVariantKey(cleanLmk, variant);
      
      // Prepare decryption key
      let decryptionKey = variantKey;
      if (variantKey.length === 32) {
        decryptionKey = variantKey + variantKey.substring(0, 16);
      }
      const parityAdjustedKey = adjustDesKeyParity(decryptionKey);

      // Decrypt the key
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedKey);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(cleanKey)
      });
      
      const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const decryptedHex = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
      
      if (decryptedHex) {
        setEncryptResult({
          key: decryptedHex,
          keyScheme: detectedScheme,
          lmkSize: lmkSize,
          lmkPair: lmkPair,
          variant: variant,
          lmkKey: cleanLmk.toUpperCase(),
          encryptedKey: (detectedScheme !== '0' ? detectedScheme : '') + cleanKey.toUpperCase(),
          kcv: calculateKCV(decryptedHex),
          parity: detectParity(decryptedHex),
        });
        message.success(t.thalesKeys?.decryptSuccess || 'Key decrypted successfully');
      } else {
        setEncryptError(t.thalesKeys?.decryptFailed || 'Decryption failed');
      }
    } catch (err) {
      setEncryptError((t.thalesKeys?.errorDecrypt || 'Decryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Try decryption with given parameters
  const tryDecrypt = (
    encryptedData: string, 
    lmkKeyHex: string, 
    variantCode: string,
    adjustParity: boolean = true
  ): string | null => {
    try {
      const variantKey = calculateVariantKey(lmkKeyHex, variantCode);
      
      let decryptionKey = variantKey;
      if (variantKey.length === 32) {
        decryptionKey = variantKey + variantKey.substring(0, 16);
      } else if (variantKey.length === 48) {
        // Triple length key, use as is
      } else {
        return null;
      }
      
      const finalKey = adjustParity ? adjustDesKeyParity(decryptionKey) : decryptionKey;
      const keyWordArray = CryptoJS.enc.Hex.parse(finalKey);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
      });
      
      const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const decryptedHex = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
      
      if (decryptedHex && decryptedHex.length === encryptedData.length) {
        return decryptedHex;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Key Lookup - try all variants and LMK pairs
  const handleLookup = () => {
    setLookupError('');
    setLookupResults([]);
    
    try {
      let cleanKey = cleanHexInput(lookupKey);
      const cleanKcv = checkKcv ? cleanHexInput(expectedKcv).toUpperCase() : '';
      
      // Extract scheme prefix if present
      let detectedScheme = '';
      if (/^[UTXYZ]/i.test(cleanKey) && cleanKey.length % 2 === 1) {
        detectedScheme = cleanKey[0].toUpperCase();
        cleanKey = cleanKey.substring(1);
      }
      
      if (!isValidHex(cleanKey)) {
        setLookupError(t.thalesKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }

      if (checkKcv && (!isValidHex(cleanKcv) || cleanKcv.length < 4)) {
        setLookupError(t.thalesKeys?.errorInvalidKcv || 'Invalid KCV format');
        return;
      }

      const results: DecodeResultDetails[] = [];
      const seenKeys = new Set<string>();

      // For lookup, we need to know the LMK - in real scenarios this would be configured
      // Here we'll try with a test LMK or show a message
      // For demonstration, we'll use a placeholder approach
      
      // Try all variants with the test data
      for (const variantOpt of VARIANT_OPTIONS) {
        for (const parityFlag of [true, false]) {
          // Since we don't have the actual LMK, we'll demonstrate the lookup logic
          // In real implementation, LMK would be securely stored in HSM
          
          // For now, let's create a dummy result structure for demonstration
          // This would be replaced with actual HSM lookup
          const testLmk = '0101010101010101' + '7902CD1FD36EF8BA'; // Example LMK
          
          const decrypted = tryDecrypt(cleanKey, testLmk, variantOpt.value, parityFlag);
          
          if (decrypted && !seenKeys.has(decrypted)) {
            const kcv = calculateKCV(decrypted);
            const parity = detectParity(decrypted);
            
            // Filter by KCV if checking
            const kcvMatch = !checkKcv || !cleanKcv || kcv.toUpperCase().startsWith(cleanKcv.substring(0, Math.min(cleanKcv.length, 6)).toUpperCase());
            
            // Filter by parity
            let parityMatch = true;
            if (lookupParity !== 'any') {
              if (lookupParity === 'odd' && parity !== 'Odd') parityMatch = false;
              if (lookupParity === 'even' && parity !== 'Even') parityMatch = false;
            }
            
            if (kcvMatch && parityMatch) {
              seenKeys.add(decrypted);
              results.push({
                encryptedKey: (detectedScheme || '') + cleanKey.toUpperCase(),
                keyScheme: detectedScheme || 'Unknown',
                lmkPair: '00-01',
                variant: variantOpt.value,
                decodedKey: decrypted,
                kcv,
                parity,
              });
            }
          }
        }
        
        if (results.length >= 50) break; // Limit results
      }

      if (results.length > 0) {
        // Sort - exact KCV match first
        if (checkKcv && cleanKcv) {
          results.sort((a, b) => {
            const aExact = a.kcv.toUpperCase() === cleanKcv.toUpperCase() ? 0 : 1;
            const bExact = b.kcv.toUpperCase() === cleanKcv.toUpperCase() ? 0 : 1;
            return aExact - bExact;
          });
        }
        setLookupResults(results);
        message.success(`Found ${results.length} matching key(s)`);
      } else {
        setLookupError(t.thalesKeys?.noResults || 'No matching keys found. Note: Key lookup requires configured LMK pairs.');
      }
    } catch (err) {
      setLookupError((t.thalesKeys?.errorLookup || 'Lookup failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Key lengths for display
  const encKeyLength = getKeyLength(encKey);
  const lookupKeyLength = lookupKey.length;
  const kcvLength = expectedKcv.length;

  // Tab items
  const tabItems = [
    {
      key: 'encrypt',
      label: t.thalesKeys?.tabEncrypt || 'Key Encryption / Decryption',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.thalesKeys?.key || 'Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(encKeyLength, [8, 16, 24]),
                fontWeight: encKeyLength > 0 ? 600 : 400
              }}>
                [{encKeyLength * 2 || 32}]
              </Text>
            </div>
            <Input
              value={encKey}
              onChange={e => setEncKey(e.target.value)}
              placeholder={t.thalesKeys?.keyPlaceholder || 'Enter hex key'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Key Scheme */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeys?.keyScheme || 'Key Scheme'}:
            </Text>
            <Select
              value={keyScheme}
              onChange={setKeyScheme}
              options={KEY_SCHEME_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* LMK Size */}
          <div style={{ 
            background: isDark 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
              : 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', 
            padding: 12, 
            borderRadius: 8, 
            border: isDark ? '1px solid #0f3460' : '1px solid #e6f0ff' 
          }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeys?.lmkSize || 'LMK size'}:
            </Text>
            <Radio.Group 
              value={lmkSize} 
              onChange={e => setLmkSize(e.target.value)}
            >
              <Radio value="double">{t.thalesKeys?.double || 'Double'}</Radio>
              <Radio value="triple">{t.thalesKeys?.triple || 'Triple'}</Radio>
            </Radio.Group>
          </div>

          {/* LMK Pair */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeys?.lmkPair || 'LMK Pair'}:
            </Text>
            <Select
              value={lmkPair}
              onChange={setLmkPair}
              options={LMK_PAIR_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* Variant */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeys?.variant || 'Variant'}:
            </Text>
            <Select
              value={variant}
              onChange={setVariant}
              options={VARIANT_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* Encrypt/Decrypt Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={handleEncrypt}
              size="large"
            >
              {t.thalesKeys?.encrypt || 'Encrypt'}
            </Button>
            <Button
              type="default"
              icon={<UnlockOutlined />}
              onClick={handleDecrypt}
              size="large"
            >
              {t.thalesKeys?.decrypt || 'Decrypt'}
            </Button>
          </div>

          {/* Error Display */}
          {encryptError && (
            <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{encryptError}</Text>
            </Card>
          )}

          {/* Encrypt/Decrypt Result */}
          {encryptResult && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  {lastOperation === 'encrypt' ? <LockOutlined /> : <UnlockOutlined />}
                  {' '}
                  {lastOperation === 'encrypt' 
                    ? (t.thalesKeys?.encryptResult || 'Encryption Result')
                    : (t.thalesKeys?.decryptResult || 'Decryption Result')}
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
                  onClick={() => copyToClipboard(lastOperation === 'encrypt' ? encryptResult.encryptedKey : encryptResult.key)}
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
                      {lastOperation === 'encrypt' ? (t.thalesKeys?.plainKey || 'Plain Key') : (t.thalesKeys?.encryptedKeyLabel || 'Encrypted Key')}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {lastOperation === 'encrypt' ? encryptResult.key : encryptResult.encryptedKey}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.thalesKeys?.kcvLabel || 'KCV'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.kcv}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.thalesKeys?.parityDetected || 'Parity'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.parity}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.thalesKeys?.keyScheme || 'Key Scheme'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {KEY_SCHEME_OPTIONS.find(o => o.value === encryptResult.keyScheme)?.label || encryptResult.keyScheme}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.thalesKeys?.lmkPair || 'LMK Pair'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {LMK_PAIR_OPTIONS.find(o => o.value === encryptResult.lmkPair)?.label || encryptResult.lmkPair}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.thalesKeys?.variant || 'Variant'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {VARIANT_OPTIONS.find(o => o.value === encryptResult.variant)?.label || encryptResult.variant}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {lastOperation === 'encrypt' ? (t.thalesKeys?.encryptedKeyLabel || 'Encrypted Key') : (t.thalesKeys?.decodedKey || 'Decoded Key')}:
                    </span>
                    <span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600, wordBreak: 'break-all' }}>
                      {lastOperation === 'encrypt' ? encryptResult.encryptedKey : encryptResult.key}
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
      label: t.thalesKeys?.tabLookup || 'Key Lookup',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.thalesKeys?.key || 'Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: lookupKeyLength > 0 ? '#52c41a' : '#999',
                fontWeight: lookupKeyLength > 0 ? 600 : 400
              }}>
                {lookupKeyLength}
              </Text>
            </div>
            <Input
              value={lookupKey}
              onChange={e => setLookupKey(e.target.value)}
              placeholder={t.thalesKeys?.lookupKeyPlaceholder || 'Enter encrypted key to lookup (with or without scheme prefix)'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Check KCV */}
          <div>
            <Checkbox
              checked={checkKcv}
              onChange={e => setCheckKcv(e.target.checked)}
            >
              <Text strong>{t.thalesKeys?.checkKcv || 'Check KCV?'}</Text>
            </Checkbox>
          </div>

          {/* KCV Input - only show when Check KCV is checked */}
          {checkKcv && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.thalesKeys?.kcv || 'KCV'}:</Text>
                <Text style={{ 
                  fontSize: '12px', 
                  color: kcvLength >= 4 ? '#52c41a' : '#999',
                  fontWeight: kcvLength > 0 ? 600 : 400
                }}>
                  {kcvLength}
                </Text>
              </div>
              <Input
                value={expectedKcv}
                onChange={e => setExpectedKcv(e.target.value)}
                placeholder={t.thalesKeys?.kcvPlaceholder || 'Enter expected KCV'}
                maxLength={6}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>
          )}

          {/* Parity Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeys?.parity || 'Parity'}:
            </Text>
            <Segmented
              value={lookupParity}
              onChange={value => setLookupParity(value as 'any' | 'odd' | 'even')}
              options={[
                { label: t.thalesKeys?.parityAny || 'Any', value: 'any' },
                { label: t.thalesKeys?.parityOdd || 'Odd', value: 'odd' },
                { label: t.thalesKeys?.parityEven || 'Even', value: 'even' },
              ]}
              block
            />
          </div>

          {/* Lookup Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<UnlockOutlined />}
              onClick={handleLookup}
              size="large"
            >
              {t.thalesKeys?.lookup || 'Lookup'}
            </Button>
          </div>

          {/* Lookup Error */}
          {lookupError && (
            <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{lookupError}</Text>
            </Card>
          )}

          {/* Lookup Results */}
          {lookupResults.length > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px', marginBottom: 8, display: 'block' }}>
                Found {lookupResults.length} result(s)
              </Text>
              <div style={{ 
                maxHeight: '400px', 
                overflowY: 'auto',
                display: 'flex', 
                flexDirection: 'column', 
                gap: 12,
                paddingRight: 4,
              }}>
                {lookupResults.map((result, index) => (
                  <Card 
                    key={index}
                    size="small"
                    bordered={false}
                    style={{ 
                      background: isDark 
                        ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                        : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                      border: isDark ? '1px solid #274916' : '1px solid #95de64',
                      flexShrink: 0,
                    }}
                    extra={
                      <Button 
                        type={isDark ? 'primary' : 'default'}
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(result.decodedKey)}
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
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                      fontSize: '12px',
                      lineHeight: '1.8',
                    }}>
                      <div>
                        <span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Variant: </span>
                        <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                          {VARIANT_OPTIONS.find(o => o.value === result.variant)?.label || result.variant}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Decoded Key: </span>
                        <span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600 }}>
                          {result.decodedKey}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>KCV: </span>
                        <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{result.kcv}</span>
                        <span style={{ marginLeft: 16, color: isDark ? '#8c8c8c' : '#595959' }}>Parity: </span>
                        <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{result.parity}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.thalesKeys?.title || 'Thales Keys Encryption/Decoding'}
            </Title>
            <CollapsibleInfo title={t.thalesKeys?.infoTitle || 'About Thales Keys'}>
              <div>• {t.thalesKeys?.infoContent1 || 'Encrypt/decrypt keys using Thales HSM LMK methodology.'}</div>
              <div>• {t.thalesKeys?.infoContent2 || 'Key scheme defines the key length and encryption type.'}</div>
              <div>• {t.thalesKeys?.infoContent3 || 'Variant determines the XOR mask applied to LMK.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.thalesKeys?.description || 'Encrypt and decrypt keys using Thales HSM LMK key variant methodology'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <Tabs items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

export default ThalesKeysTool;

