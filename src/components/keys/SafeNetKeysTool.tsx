import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, Checkbox, Segmented } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { isValidHex, cleanHexInput, adjustDesKeyParity } from '../../utils/crypto';

const { Title, Text } = Typography;

// Key Format options for SafeNet
const KEY_FORMAT_OPTIONS = [
  { value: '00', label: '00 - Clear' },
  { value: '10', label: '10 - Single-length DES (ECB Encrypted)' },
  { value: '11', label: '11 - Double-length DES3 (ECB Encrypted)' },
  { value: '12', label: '12 - Triple-length DES3 (ECB Encrypted)' },
  { value: '20', label: '20 - Single-length DES (CBC Encrypted)' },
  { value: '21', label: '21 - Double-length DES3 (CBC Encrypted)' },
  { value: '22', label: '22 - Triple-length DES3 (CBC Encrypted)' },
];

// Variant options for SafeNet (complete list)
const VARIANT_OPTIONS = [
  { value: '00', label: '00 - DPK (Data Protection Key)' },
  { value: '01', label: '01 - PPK (PIN Protection Key)' },
  { value: '02', label: '02 - MPK' },
  { value: '03', label: '03 - KIS' },
  { value: '04', label: '04 - KIR' },
  { value: '05', label: '05 - KTM' },
  { value: '06', label: '06 - CSCK' },
  { value: '07', label: '07 - KPV, DT' },
  { value: '08', label: '08 - KPVV' },
  { value: '09', label: '09 - KCVV' },
  { value: '10', label: '10 - Bi-directional Interchange Key KI' },
  { value: '12', label: '12 - MAC Residue' },
  { value: '14', label: '14 - KTPV' },
  { value: '16', label: '16 - KGK' },
  { value: '17', label: '17 - KKBLZ' },
  { value: '18', label: '18 - MK-ZKA' },
  { value: '19', label: '19 - MAC used for Format 15 host stored keys' },
  { value: '20', label: '20 - (K) used for Format 15 host stored keys' },
  { value: '24', label: '24 - BDK' },
  { value: '25', label: '25 - SKB-auth' },
  { value: '26', label: '26 - SKB-enc' },
  { value: '27', label: '27 - PIN Block encryption - KM encrypted PIN' },
  { value: '30', label: '30 - IMK-AC' },
  { value: '31', label: '31 - IMK-SMI' },
  { value: '32', label: '32 - IMK-SMC' },
  { value: '33', label: '33 - IMK-DAC' },
  { value: '34', label: '34 - IMK-IDN' },
  { value: '35', label: '35 - KTK' },
  { value: '36', label: '36 - PTK' },
  { value: '37', label: '37 - KMC' },
  { value: '38', label: '38 - IMK-CVC' },
  { value: '39', label: '39 - TLS Master secret and Pre-master secret' },
  { value: '46', label: '46 - FPVK (Fuel-Card PIN Verification Key)' },
  { value: '47', label: '47 - Host-stored Random Keys (FEP-terminal)' },
];

// Result details interface
interface EncryptResultDetails {
  key: string;
  keyFormat: string;
  variant: string;
  kmKey: string;
  variantKey: string;
  encryptedKey: string;
  kcv: string;
  parity: string;
}

interface DecodeResultDetails {
  encryptedKey: string;
  keyFormat: string;
  variant: string;
  kmKey: string;
  decodedKey: string;
  kcv: string;
  parity: string;
}

const SafeNetKeysTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Key Encryption state
  const [encKey, setEncKey] = useState('');
  const [keyFormat, setKeyFormat] = useState('11');
  const [variant, setVariant] = useState('00');
  const [encKmKey, setEncKmKey] = useState('');
  const [encryptResult, setEncryptResult] = useState<EncryptResultDetails | null>(null);
  const [encryptError, setEncryptError] = useState('');
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | null>(null);

  // Key Lookup state
  const [lookupKey, setLookupKey] = useState('');
  const [checkKcv, setCheckKcv] = useState(false);
  const [expectedKcv, setExpectedKcv] = useState('');
  const [lookupParity, setLookupParity] = useState<'any' | 'odd' | 'even'>('any');
  const [lookupKmKey, setLookupKmKey] = useState('');
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

  // Calculate variant key for SafeNet
  // SafeNet uses variant bytes XORed with the KM key's first byte of each 8-byte block
  const calculateVariantKey = (kmKey: string, variantCode: string): string => {
    // SafeNet variant method: XOR the variant code with specific positions
    const variantNum = parseInt(variantCode, 10);
    
    // Create variant mask - XOR variant at first byte of each 8-byte block
    // Mask format: [variant][00*7][variant][00*7] for 16-byte key
    const createVariantMask = (variantNum: number): string => {
      const variantByte = variantNum.toString(16).padStart(2, '0').toUpperCase();
      // First 8 bytes: variant at position 0, zeros elsewhere
      const block1 = variantByte + '00000000000000'; // 16 chars = 8 bytes
      // Second 8 bytes: variant at position 0, zeros elsewhere
      const block2 = variantByte + '00000000000000'; // 16 chars = 8 bytes
      return block1 + block2; // 32 chars = 16 bytes
    };
    
    let variantKey = kmKey;
    
    if (variantNum !== 0) {
      const mask = createVariantMask(variantNum);
      variantKey = xorHex(kmKey.substring(0, 32), mask);
      
      // For triple-length keys
      if (kmKey.length >= 48) {
        const third8Mask = mask.substring(0, 16);
        const third8 = xorHex(kmKey.substring(32, 48), third8Mask);
        variantKey = variantKey + third8;
      }
    }

    return variantKey.toUpperCase();
  };
  
  // Alternative variant calculation - full byte XOR pattern
  const calculateVariantKeyAlt = (kmKey: string, variantCode: string): string => {
    const variantMasks: Record<string, string> = {
      '00': '0000000000000000', // DPK - no variant
      '01': 'A6A6A6A6A6A6A6A6', // PPK
      '02': '5A5A5A5A5A5A5A5A', // MPK
      '03': '6A6A6A6A6A6A6A6A', // KIS
      '04': 'DEDEDEDEDEDEDEDE', // KIR
      '05': 'EDED0000EDED0000', // KTM
      '06': 'CBCBCBCBCBCBCBCB', // CSCK
      '07': '0707070707070707', // KPV, DT
      '08': '0808080808080808', // KPVV
      '09': '0909090909090909', // KCVV
      '10': '1010101010101010', // Bi-directional Interchange Key KI
      '12': '1212121212121212', // MAC Residue
      '14': '1414141414141414', // KTPV
      '16': '1616161616161616', // KGK
      '17': '1717171717171717', // KKBLZ
      '18': '1818181818181818', // MK-ZKA
      '19': '1919191919191919', // MAC used for Format 15
      '20': '2020202020202020', // (K) used for Format 15
      '24': '2424242424242424', // BDK
      '25': '2525252525252525', // SKB-auth
      '26': '2626262626262626', // SKB-enc
      '27': '2727272727272727', // PIN Block encryption
      '30': '3030303030303030', // IMK-AC
      '31': '3131313131313131', // IMK-SMI
      '32': '3232323232323232', // IMK-SMC
      '33': '3333333333333333', // IMK-DAC
      '34': '3434343434343434', // IMK-IDN
      '35': '3535353535353535', // KTK
      '36': '3636363636363636', // PTK
      '37': '3737373737373737', // KMC
      '38': '3838383838383838', // IMK-CVC
      '39': '3939393939393939', // TLS Master secret
      '46': '4646464646464646', // FPVK
      '47': '4747474747474747', // Host-stored Random Keys
    };

    const mask = variantMasks[variantCode] || '0000000000000000';
    
    if (mask === '0000000000000000') {
      return kmKey.toUpperCase();
    }
    
    // XOR each 8-byte block with mask
    const first8 = xorHex(kmKey.substring(0, 16), mask);
    const second8 = xorHex(kmKey.substring(16, 32), mask);
    let variantKey = first8 + second8;
    
    if (kmKey.length >= 48) {
      const third8 = xorHex(kmKey.substring(32, 48), mask);
      variantKey = first8 + second8 + third8;
    }

    return variantKey.toUpperCase();
  };

  // Calculate KCV using 3DES
  const calculateKCV = (keyHex: string): string => {
    try {
      const cleaned = cleanHexInput(keyHex);
      if (!isValidHex(cleaned) || cleaned.length < 32) return '';
      
      let tripleKey = cleaned;
      if (cleaned.length === 32) {
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

  // Get expected key length based on format
  const getExpectedKeyLength = (format: string): number => {
    switch (format) {
      case '00':
      case '10':
      case '20':
        return 8; // Single-length DES
      case '11':
      case '21':
        return 16; // Double-length DES3
      case '12':
      case '22':
        return 24; // Triple-length DES3
      default:
        return 16;
    }
  };

  // Encrypt key using SafeNet methodology
  const handleEncrypt = () => {
    setEncryptError('');
    setEncryptResult(null);
    setLastOperation('encrypt');
    
    try {
      const cleanKey = cleanHexInput(encKey);
      const cleanKm = cleanHexInput(encKmKey);
      
      if (!isValidHex(cleanKey)) {
        setEncryptError(t.safenetKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      const expectedLen = getExpectedKeyLength(keyFormat);
      if (cleanKey.length / 2 !== expectedLen) {
        setEncryptError(`Key must be ${expectedLen} bytes for selected format`);
        return;
      }
      
      if (!isValidHex(cleanKm) || cleanKm.length < 32) {
        setEncryptError(t.safenetKeys?.errorInvalidKmKey || 'KM Key must be at least 16 bytes');
        return;
      }

      // Calculate variant key
      const variantKey = calculateVariantKey(cleanKm.substring(0, 32), variant);
      const parityAdjustedVariant = adjustDesKeyParity(variantKey + variantKey.substring(0, 16));

      // Encrypt key
      const keyWordArray = CryptoJS.enc.Hex.parse(cleanKey);
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedVariant);
      
      const encrypted = CryptoJS.TripleDES.encrypt(keyWordArray, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const encryptedHex = encrypted.ciphertext.toString().toUpperCase();
      
      setEncryptResult({
        key: cleanKey.toUpperCase(),
        keyFormat: keyFormat,
        variant: variant,
        kmKey: cleanKm.toUpperCase(),
        variantKey: variantKey,
        encryptedKey: encryptedHex,
        kcv: calculateKCV(cleanKey),
        parity: detectParity(cleanKey),
      });
      message.success(t.safenetKeys?.encryptSuccess || 'Key encrypted successfully');
    } catch (err) {
      setEncryptError((t.safenetKeys?.errorEncrypt || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Decrypt key
  const handleDecrypt = () => {
    setEncryptError('');
    setEncryptResult(null);
    setLastOperation('decrypt');
    
    try {
      const cleanKey = cleanHexInput(encKey);
      const cleanKm = cleanHexInput(encKmKey);
      
      if (!isValidHex(cleanKey)) {
        setEncryptError(t.safenetKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      if (!isValidHex(cleanKm) || cleanKm.length < 32) {
        setEncryptError(t.safenetKeys?.errorInvalidKmKey || 'KM Key must be at least 16 bytes');
        return;
      }

      // Calculate variant key
      const variantKey = calculateVariantKey(cleanKm.substring(0, 32), variant);
      const parityAdjustedVariant = adjustDesKeyParity(variantKey + variantKey.substring(0, 16));

      // Decrypt key
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedVariant);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(cleanKey)
      });
      
      const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const decryptedHex = decrypted.toString().toUpperCase();
      
      if (decryptedHex) {
        setEncryptResult({
          key: decryptedHex,
          keyFormat: keyFormat,
          variant: variant,
          kmKey: cleanKm.toUpperCase(),
          variantKey: variantKey,
          encryptedKey: cleanKey.toUpperCase(),
          kcv: calculateKCV(decryptedHex),
          parity: detectParity(decryptedHex),
        });
        message.success(t.safenetKeys?.decryptSuccess || 'Key decrypted successfully');
      } else {
        setEncryptError(t.safenetKeys?.decryptFailed || 'Decryption failed');
      }
    } catch (err) {
      setEncryptError((t.safenetKeys?.errorDecrypt || 'Decryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Try decryption with a given key (with or without parity adjustment)
  // keyExpansion: 'K1K2K1' or 'K1K2K2' or 'none'
  const tryDecrypt = (
    encryptedData: string, 
    variantKey: string, 
    adjustParity: boolean = true,
    keyExpansion: 'K1K2K1' | 'K1K2K2' | 'none' = 'K1K2K1'
  ): string | null => {
    try {
      let tripleKey = variantKey;
      
      if (variantKey.length === 32) {
        if (keyExpansion === 'K1K2K1') {
          tripleKey = variantKey + variantKey.substring(0, 16);
        } else if (keyExpansion === 'K1K2K2') {
          tripleKey = variantKey + variantKey.substring(16, 32);
        }
        // 'none' keeps the 32-char key as-is, CryptoJS will auto-expand
      }
      
      const finalKey = adjustParity ? adjustDesKeyParity(tripleKey) : tripleKey;
      const keyWordArray = CryptoJS.enc.Hex.parse(finalKey);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
      });
      
      const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      // Use explicit Hex encoding to ensure we get hex string
      const decryptedHex = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
      
      // Check if we got valid hex output (should be same length as input for ECB/NoPadding)
      if (decryptedHex && decryptedHex.length === encryptedData.length) {
        return decryptedHex;
      }
      return null;
    } catch {
      return null;
    }
  };
  
  // Helper to try all decryption combinations for a variant key
  const tryAllDecryptCombinations = (
    encryptedData: string, 
    variantKey: string, 
    seenKeys: Set<string>,
    results: DecodeResultDetails[],
    cleanKey: string,
    detectedFormat: string,
    variantValue: string,
    cleanKm: string,
    cleanKcv: string,
    maxResults: number = 100
  ) => {
    // Limit results to avoid performance issues
    if (results.length >= maxResults) return;
    
    const expansions: Array<'K1K2K1' | 'K1K2K2' | 'none'> = ['K1K2K1', 'K1K2K2', 'none'];
    const parityOptions = [true, false];
    
    for (const expansion of expansions) {
      for (const adjustParityFlag of parityOptions) {
        if (results.length >= maxResults) return;
        
        const decrypted = tryDecrypt(encryptedData, variantKey, adjustParityFlag, expansion);
        
        if (decrypted && !seenKeys.has(decrypted)) {
          const kcv = calculateKCV(decrypted);
          const parity = detectParity(decrypted);
          
          // If checkKcv is disabled, show all results (for debugging)
          // If checkKcv is enabled, filter by KCV
          const kcvMatch = !checkKcv || !cleanKcv || kcv.toUpperCase().startsWith(cleanKcv.substring(0, Math.min(cleanKcv.length, 6)).toUpperCase());
          
          let parityMatch = true;
          if (lookupParity !== 'any') {
            if (lookupParity === 'odd' && parity !== 'Odd') parityMatch = false;
            if (lookupParity === 'even' && parity !== 'Even') parityMatch = false;
          }
          
          if (kcvMatch && parityMatch) {
            seenKeys.add(decrypted);
            results.push({
              encryptedKey: cleanKey.toUpperCase(),
              keyFormat: detectedFormat,
              variant: variantValue,
              kmKey: cleanKm.toUpperCase(),
              decodedKey: decrypted,
              kcv,
              parity,
            });
          }
        }
      }
    }
  };

  // Key Lookup - try all variants with multiple calculation methods
  const handleLookup = () => {
    setLookupError('');
    setLookupResults([]);
    
    try {
      const cleanKey = cleanHexInput(lookupKey);
      const cleanKm = cleanHexInput(lookupKmKey);
      const cleanKcv = checkKcv ? cleanHexInput(expectedKcv).toUpperCase() : '';
      
      if (!isValidHex(cleanKey)) {
        setLookupError(t.safenetKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      if (!isValidHex(cleanKm) || cleanKm.length < 32) {
        setLookupError(t.safenetKeys?.errorInvalidKmKey || 'KM Key must be at least 16 bytes');
        return;
      }

      if (checkKcv && (!isValidHex(cleanKcv) || cleanKcv.length < 4)) {
        setLookupError(t.safenetKeys?.errorInvalidKcv || 'Invalid KCV format');
        return;
      }

      const results: DecodeResultDetails[] = [];
      const seenKeys = new Set<string>(); // Avoid duplicates

      // SafeNet encrypted key format: [4-char header][encrypted data]
      // Header format: first 2 chars = key format (e.g., 11), next 2 chars = variant info
      let encryptedData = cleanKey;
      let detectedFormat = '11';
      
      if (cleanKey.length > 32) {
        // Key has header - extract format and encrypted data
        detectedFormat = cleanKey.substring(0, 2);
        encryptedData = cleanKey.substring(4); // Skip 4-char header
      }

      const kmKeyPart = cleanKm.substring(0, 32);

      // Try all variants with multiple calculation methods and key expansion options
      for (const variantOpt of VARIANT_OPTIONS) {
        // Method 1: Primary variant calculation - try all combinations
        const variantKey1 = calculateVariantKey(kmKeyPart, variantOpt.value);
        tryAllDecryptCombinations(
          encryptedData, variantKey1, seenKeys, results,
          cleanKey, detectedFormat, variantOpt.value, cleanKm, cleanKcv
        );
        
        // Method 2: Alternative variant calculation (full byte pattern)
        const variantKey2 = calculateVariantKeyAlt(kmKeyPart, variantOpt.value);
        if (variantKey2 !== variantKey1) {
          tryAllDecryptCombinations(
            encryptedData, variantKey2, seenKeys, results,
            cleanKey, detectedFormat, variantOpt.value, cleanKm, cleanKcv
          );
        }
        
        // Method 3: Try with raw KM key (no variant applied) - only for variant 00
        if (variantOpt.value === '00') {
          tryAllDecryptCombinations(
            encryptedData, kmKeyPart, seenKeys, results,
            cleanKey, detectedFormat, '00', cleanKm, cleanKcv
          );
        }
      }

      if (results.length > 0) {
        // Sort results - exact KCV match first
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
        setLookupError(t.safenetKeys?.noResults || 'No matching keys found');
      }
    } catch (err) {
      setLookupError((t.safenetKeys?.errorLookup || 'Lookup failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // Key lengths for display
  const encKeyLength = getKeyLength(encKey);
  const lookupKeyLength = getKeyLength(lookupKey);
  const kcvLength = expectedKcv.length;
  const kmKeyLength = getKeyLength(encKmKey);
  const lookupKmKeyLength = getKeyLength(lookupKmKey);

  // Tab items
  const tabItems = [
    {
      key: 'encrypt',
      label: t.safenetKeys?.tabEncrypt || 'Key Encryption / Decryption',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.safenetKeys?.key || 'Key'}:</Text>
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
              placeholder={t.safenetKeys?.keyPlaceholder || 'Enter hex key'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Key Format */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.safenetKeys?.keyFormat || 'Key format'}:
            </Text>
            <Select
              value={keyFormat}
              onChange={setKeyFormat}
              options={KEY_FORMAT_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* Variant */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.safenetKeys?.variant || 'Variant'}:
            </Text>
            <Select
              value={variant}
              onChange={setVariant}
              options={VARIANT_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* KM Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.safenetKeys?.kmKey || 'KM Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(kmKeyLength, [16, 24]),
                fontWeight: kmKeyLength > 0 ? 600 : 400
              }}>
                [{kmKeyLength * 2 || 32}]
              </Text>
            </div>
            <Input
              value={encKmKey}
              onChange={e => setEncKmKey(e.target.value)}
              placeholder={t.safenetKeys?.kmKeyPlaceholder || 'Enter KM Key (32 hex characters)'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
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
              {t.safenetKeys?.encrypt || 'Encrypt'}
            </Button>
            <Button
              type="default"
              icon={<UnlockOutlined />}
              onClick={handleDecrypt}
              size="large"
            >
              {t.safenetKeys?.decrypt || 'Decrypt'}
            </Button>
          </div>

          {/* Error Display */}
          {encryptError && (
            <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
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
                    ? (t.safenetKeys?.encryptResult || 'Encryption Result')
                    : (t.safenetKeys?.decryptResult || 'Decryption Result')}
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
                      {lastOperation === 'encrypt' ? (t.safenetKeys?.plainKey || 'Plain Key') : (t.safenetKeys?.encryptedKeyLabel || 'Encrypted Key')}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {lastOperation === 'encrypt' ? encryptResult.key : encryptResult.encryptedKey}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.safenetKeys?.kcvLabel || 'KCV'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.kcv}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.safenetKeys?.parityDetected || 'Parity'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.parity}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.safenetKeys?.keyFormat || 'Key Format'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {KEY_FORMAT_OPTIONS.find(o => o.value === encryptResult.keyFormat)?.label || encryptResult.keyFormat}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.safenetKeys?.variant || 'Variant'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {VARIANT_OPTIONS.find(o => o.value === encryptResult.variant)?.label || encryptResult.variant}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      Variant Key:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {encryptResult.variantKey}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {lastOperation === 'encrypt' ? (t.safenetKeys?.encryptedKeyLabel || 'Encrypted Key') : (t.safenetKeys?.decodedKey || 'Decoded Key')}:
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
      label: t.safenetKeys?.tabLookup || 'Key Lookup',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.safenetKeys?.key || 'Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: lookupKeyLength > 0 ? '#52c41a' : '#999',
                fontWeight: lookupKeyLength > 0 ? 600 : 400
              }}>
                {lookupKeyLength * 2}
              </Text>
            </div>
            <Input
              value={lookupKey}
              onChange={e => setLookupKey(e.target.value)}
              placeholder={t.safenetKeys?.lookupKeyPlaceholder || 'Enter encrypted key to lookup'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Check KCV */}
          <div>
            <Checkbox
              checked={checkKcv}
              onChange={e => setCheckKcv(e.target.checked)}
            >
              <Text strong>{t.safenetKeys?.checkKcv || 'Check KCV?'}</Text>
            </Checkbox>
          </div>

          {/* KCV Input - only show when Check KCV is checked */}
          {checkKcv && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.safenetKeys?.kcv || 'KCV'}:</Text>
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
                placeholder={t.safenetKeys?.kcvPlaceholder || 'Enter expected KCV'}
                maxLength={6}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>
          )}

          {/* Parity Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.safenetKeys?.parity || 'Parity'}:
            </Text>
            <Segmented
              value={lookupParity}
              onChange={value => setLookupParity(value as 'any' | 'odd' | 'even')}
              options={[
                { label: t.safenetKeys?.parityAny || 'Any', value: 'any' },
                { label: t.safenetKeys?.parityOdd || 'Odd', value: 'odd' },
                { label: t.safenetKeys?.parityEven || 'Even', value: 'even' },
              ]}
              block
            />
          </div>

          {/* KM Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.safenetKeys?.kmKey || 'KM Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(lookupKmKeyLength, [16, 24]),
                fontWeight: lookupKmKeyLength > 0 ? 600 : 400
              }}>
                [{lookupKmKeyLength * 2 || 32}]
              </Text>
            </div>
            <Input
              value={lookupKmKey}
              onChange={e => setLookupKmKey(e.target.value)}
              placeholder={t.safenetKeys?.kmKeyPlaceholder || 'Enter KM Key (32 hex characters)'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
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
              {t.safenetKeys?.lookup || 'Lookup'}
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
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.safenetKeys?.title || 'SafeNet Keys Encryption/Decoding'}
            </Title>
            <CollapsibleInfo title={t.safenetKeys?.infoTitle || 'About SafeNet Keys'}>
              <div>• {t.safenetKeys?.infoContent1 || 'Encrypt/decrypt keys using SafeNet HSM methodology.'}</div>
              <div>• {t.safenetKeys?.infoContent2 || 'Key format defines the encryption type (ECB/CBC).'}</div>
              <div>• {t.safenetKeys?.infoContent3 || 'Variant determines key usage (DPK, PPK, MPK, etc.).'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.safenetKeys?.description || 'Encrypt and decrypt keys using SafeNet HSM key variant methodology'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <Tabs items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

export default SafeNetKeysTool;

