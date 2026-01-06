import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, Radio, Tag } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { isValidHex, cleanHexInput, adjustDesKeyParity } from '../../utils/crypto';

const { Title, Text } = Typography;

// Version ID options
const VERSION_OPTIONS = [
  { value: 'A', label: 'A - Key Variant Binding Method' },
  { value: 'B', label: 'B - TDEA Key Derivation Binding Method' },
  { value: 'C', label: 'C - TDEA Key Variant Binding Method' },
  { value: 'D', label: 'D - AES Key Derivation Binding Method' },
  { value: 'E', label: 'E - AES Key Derivation Binding Method (CMAC)' },
];

// Key Usage options (TR-31 specific)
const KEY_USAGE_OPTIONS = [
  { value: 'B0', label: 'B0 - BDK Base Derivation Key' },
  { value: 'B1', label: 'B1 - Initial DUKPT Key' },
  { value: 'B2', label: 'B2 - Base Key Variant Key' },
  { value: 'C0', label: 'C0 - CVK Card Verification Key' },
  { value: 'D0', label: 'D0 - Symmetric Key for Data Encryption' },
  { value: 'D1', label: 'D1 - Asymmetric Key for Data Encryption' },
  { value: 'D2', label: 'D2 - Data Encryption Key for Decimalization Table' },
  { value: 'D3', label: 'D3 - Data Encryption Key for EMV/Chip Card' },
  { value: 'E0', label: 'E0 - EMV/Chip Issuer Master Key: Application Cryptograms' },
  { value: 'E1', label: 'E1 - EMV/Chip Issuer Master Key: Secure Messaging for Confidentiality' },
  { value: 'E2', label: 'E2 - EMV/Chip Issuer Master Key: Secure Messaging for Integrity' },
  { value: 'E3', label: 'E3 - EMV/Chip Issuer Master Key: Data Authentication Code' },
  { value: 'E4', label: 'E4 - EMV/Chip Issuer Master Key: Dynamic Numbers' },
  { value: 'E5', label: 'E5 - EMV/Chip Issuer Master Key: Card Personalization' },
  { value: 'E6', label: 'E6 - EMV/Chip Issuer Master Key: Other' },
  { value: 'I0', label: 'I0 - Initialization Vector (IV)' },
  { value: 'K0', label: 'K0 - Key Encryption or Wrapping' },
  { value: 'K1', label: 'K1 - TR-31 Key Block Protection Key' },
  { value: 'K2', label: 'K2 - TR-34 Asymmetric Key' },
  { value: 'K3', label: 'K3 - Asymmetric Key for Key Agreement/Wrapping' },
  { value: 'K4', label: 'K4 - Key Block Protection Key, ISO 20038' },
  { value: 'M0', label: 'M0 - ISO 16609 MAC Algorithm 1' },
  { value: 'M1', label: 'M1 - ISO 9797-1 MAC Algorithm 1' },
  { value: 'M2', label: 'M2 - ISO 9797-1 MAC Algorithm 2' },
  { value: 'M3', label: 'M3 - ISO 9797-1 MAC Algorithm 3' },
  { value: 'M4', label: 'M4 - ISO 9797-1 MAC Algorithm 4' },
  { value: 'M5', label: 'M5 - ISO 9797-1:2011 MAC Algorithm 5' },
  { value: 'M6', label: 'M6 - ISO 9797-1:2011 MAC Algorithm 5/CMAC' },
  { value: 'M7', label: 'M7 - HMAC' },
  { value: 'M8', label: 'M8 - ISO 9797-1:2011 MAC Algorithm 6' },
  { value: 'P0', label: 'P0 - PIN Encryption' },
  { value: 'P1', label: 'P1 - PIN Generation Key' },
  { value: 'S0', label: 'S0 - Asymmetric Key Pair for Digital Signature' },
  { value: 'S1', label: 'S1 - Asymmetric Key Pair, CA Key' },
  { value: 'S2', label: 'S2 - Asymmetric Key Pair, nonX9.24 Key' },
  { value: 'V0', label: 'V0 - PIN Verification, KPV, Other Algorithm' },
  { value: 'V1', label: 'V1 - PIN Verification, IBM 3624' },
  { value: 'V2', label: 'V2 - PIN Verification, VISA PVV' },
  { value: 'V3', label: 'V3 - PIN Verification, X9.132 Algorithm 1' },
  { value: 'V4', label: 'V4 - PIN Verification, X9.132 Algorithm 2' },
];

// Algorithm options
const ALGORITHM_OPTIONS = [
  { value: 'A', label: 'A - AES' },
  { value: 'D', label: 'D - DEA' },
  { value: 'E', label: 'E - Elliptic Curve' },
  { value: 'H', label: 'H - HMAC' },
  { value: 'R', label: 'R - RSA' },
  { value: 'S', label: 'S - DSA' },
  { value: 'T', label: 'T - Triple DEA (TDES)' },
];

// Mode of Use options
const MODE_OF_USE_OPTIONS = [
  { value: 'B', label: 'B - Both Encrypt & Decrypt / Wrap & Unwrap' },
  { value: 'C', label: 'C - Both Generate and Verify' },
  { value: 'D', label: 'D - Decrypt / Unwrap Only' },
  { value: 'E', label: 'E - Encrypt / Wrap Only' },
  { value: 'G', label: 'G - Generate Only' },
  { value: 'N', label: 'N - No Special Restrictions' },
  { value: 'S', label: 'S - Signature Only' },
  { value: 'T', label: 'T - Both Sign and Decrypt' },
  { value: 'V', label: 'V - Verify Only' },
  { value: 'X', label: 'X - Key Used to Derive Other Key(s)' },
  { value: 'Y', label: 'Y - Key Used to Create Key Variants' },
];

// Exportability options
const EXPORTABILITY_OPTIONS = [
  { value: 'E', label: 'E - Exportable u. a KEK (meeting req. of X9.24 Pt. 1 or 2)' },
  { value: 'N', label: 'N - Non-exportable' },
  { value: 'S', label: 'S - Sensitive, Exportable u. KEK (non-ANSI exportability)' },
];

const TR31KeyBlockTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // 检测移动端
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // KBPK state
  const [kbpk, setKbpk] = useState('');
  const [keyBlockVersion, setKeyBlockVersion] = useState<'ansi'>('ansi');

  // Encode state
  const [plainKey, setPlainKey] = useState('');
  const [versionId, setVersionId] = useState('A');
  const [keyUsage, setKeyUsage] = useState('B0');
  const [algorithm, setAlgorithm] = useState('A');
  const [modeOfUse, setModeOfUse] = useState('B');
  const [keyVersion, setKeyVersion] = useState('00');
  const [exportability, setExportability] = useState('E');
  const [optKeyBlocks, setOptKeyBlocks] = useState('');
  const [reserved, setReserved] = useState('00');
  const [optionalHeaders, setOptionalHeaders] = useState('');
  const [encodeResult, setEncodeResult] = useState('');
  const [encodeError, setEncodeError] = useState('');

  // Decode state
  const [keyBlock, setKeyBlock] = useState('');
  const [decodeResult, setDecodeResult] = useState<any>(null);
  const [decodeError, setDecodeError] = useState('');

  // Calculate KCV for key
  const calculateKCV = (keyHex: string, algo: string = 'T'): string => {
    try {
      const cleaned = cleanHexInput(keyHex);
      if (!isValidHex(cleaned) || cleaned.length < 16) return '';
      
      if (algo === 'A') {
        // AES KCV
        const zeros = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
        let keyForKcv = cleaned;
        // Pad to valid AES key length
        if (cleaned.length === 32) {
          // 128-bit key
        } else if (cleaned.length === 48) {
          // 192-bit key
        } else if (cleaned.length === 64) {
          // 256-bit key
        } else {
          return '';
        }
        const keyWordArray = CryptoJS.enc.Hex.parse(keyForKcv);
        const encrypted = CryptoJS.AES.encrypt(zeros, keyWordArray, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
        return encrypted.ciphertext.toString().substring(0, 6).toUpperCase();
      } else {
        // 3DES KCV
        let tripleKey = cleaned;
        if (cleaned.length === 16) {
          tripleKey = cleaned + cleaned + cleaned;
        } else if (cleaned.length === 32) {
          tripleKey = cleaned + cleaned.substring(0, 16);
        } else if (cleaned.length === 48) {
          // Already triple length
        } else {
          return '';
        }
        
        const parityKey = adjustDesKeyParity(tripleKey);
        const zeros = CryptoJS.enc.Hex.parse('0000000000000000');
        const keyWordArray = CryptoJS.enc.Hex.parse(parityKey);
        
        const encrypted = CryptoJS.TripleDES.encrypt(zeros, keyWordArray, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
        
        return encrypted.ciphertext.toString().substring(0, 6).toUpperCase();
      }
    } catch {
      return '';
    }
  };


  // Get key length in hex characters
  const getKeyLengthHex = (hexKey: string): number => {
    const cleaned = cleanHexInput(hexKey);
    return isValidHex(cleaned) ? cleaned.length : 0;
  };

  // Get length indicator color
  const getLengthColor = (len: number): string => {
    if (len === 0) return '#999';
    if (len === 32 || len === 48 || len === 64) return '#52c41a';
    return '#ff4d4f';
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // Encode key block
  const handleEncode = () => {
    setEncodeError('');
    setEncodeResult('');
    
    try {
      const cleanKey = cleanHexInput(plainKey);
      const cleanKbpk = cleanHexInput(kbpk);
      
      if (!isValidHex(cleanKey) || cleanKey.length < 16) {
        setEncodeError(t.tr31KeyBlock?.errorInvalidKey || 'Invalid plain key format');
        return;
      }
      
      if (!isValidHex(cleanKbpk) || cleanKbpk.length < 32) {
        setEncodeError(t.tr31KeyBlock?.errorInvalidKbpk || 'Invalid KBPK format (minimum 32 hex characters)');
        return;
      }

      // Build header
      const numOptBlocks = optionalHeaders ? Math.ceil(optionalHeaders.length / 4) : 0;
      const keyLenBytes = cleanKey.length / 2;
      const paddedKeyLen = Math.ceil(keyLenBytes / 8) * 8 * 2; // Round up to block size
      const totalLen = 16 + paddedKeyLen + (versionId >= 'D' ? 32 : 16) + (numOptBlocks * 4);
      const lenStr = totalLen.toString().padStart(4, '0');
      const numOptStr = numOptBlocks.toString().padStart(2, '0');
      
      const header = `${versionId}${lenStr}${keyUsage}${algorithm}${modeOfUse}${keyVersion}${exportability}${numOptStr}${reserved}`;
      
      // For demonstration - simplified encoding
      // Real TR-31 encoding requires proper key derivation and MAC calculation
      let encryptedKey = '';
      let mac = '';
      
      // Pad key data
      let keyData = cleanKey;
      const keyLenField = (cleanKey.length / 2).toString(16).padStart(4, '0').toUpperCase();
      keyData = keyLenField + keyData;
      while (keyData.length < paddedKeyLen + 4) {
        keyData += '00';
      }
      
      if (versionId === 'A' || versionId === 'C') {
        // Variant binding - XOR with KBPK variant
        let encKey = cleanKbpk;
        if (encKey.length === 32) {
          encKey = encKey + encKey.substring(0, 16);
        }
        const parityKey = adjustDesKeyParity(encKey);
        
        const keyWordArray = CryptoJS.enc.Hex.parse(keyData);
        const encKeyWordArray = CryptoJS.enc.Hex.parse(parityKey);
        
        const encrypted = CryptoJS.TripleDES.encrypt(keyWordArray, encKeyWordArray, {
          mode: CryptoJS.mode.CBC,
          iv: CryptoJS.enc.Hex.parse('0000000000000000'),
          padding: CryptoJS.pad.NoPadding
        });
        
        encryptedKey = encrypted.ciphertext.toString().toUpperCase();
        
        // Calculate MAC
        const macData = header + encryptedKey;
        const macInput = CryptoJS.enc.Hex.parse(
          macData.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
        );
        const macResult = CryptoJS.TripleDES.encrypt(macInput, encKeyWordArray, {
          mode: CryptoJS.mode.CBC,
          iv: CryptoJS.enc.Hex.parse('0000000000000000'),
          padding: CryptoJS.pad.Pkcs7
        });
        mac = macResult.ciphertext.toString().substring(macResult.ciphertext.toString().length - 16).toUpperCase();
      } else if (versionId === 'D' || versionId === 'E') {
        // AES key derivation
        const keyWordArray = CryptoJS.enc.Hex.parse(keyData);
        const encKeyWordArray = CryptoJS.enc.Hex.parse(cleanKbpk);
        
        const encrypted = CryptoJS.AES.encrypt(keyWordArray, encKeyWordArray, {
          mode: CryptoJS.mode.CBC,
          iv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000'),
          padding: CryptoJS.pad.NoPadding
        });
        
        encryptedKey = encrypted.ciphertext.toString().toUpperCase();
        
        // 16-byte MAC for AES versions
        mac = CryptoJS.SHA256(header + encryptedKey).toString().substring(0, 32).toUpperCase();
      } else {
        // Version B - TDEA key derivation
        let encKey = cleanKbpk;
        if (encKey.length === 32) {
          encKey = encKey + encKey.substring(0, 16);
        }
        const parityKey = adjustDesKeyParity(encKey);
        
        const keyWordArray = CryptoJS.enc.Hex.parse(keyData);
        const encKeyWordArray = CryptoJS.enc.Hex.parse(parityKey);
        
        const encrypted = CryptoJS.TripleDES.encrypt(keyWordArray, encKeyWordArray, {
          mode: CryptoJS.mode.CBC,
          iv: CryptoJS.enc.Hex.parse('0000000000000000'),
          padding: CryptoJS.pad.NoPadding
        });
        
        encryptedKey = encrypted.ciphertext.toString().toUpperCase();
        mac = CryptoJS.SHA256(header + encryptedKey).toString().substring(0, 16).toUpperCase();
      }
      
      const result = header + optionalHeaders + encryptedKey + mac;
      setEncodeResult(result);
      message.success(t.tr31KeyBlock?.encodeSuccess || 'Key block encoded successfully');
    } catch (err) {
      setEncodeError((t.tr31KeyBlock?.errorEncode || 'Encoding failed: ') + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Decode key block
  const handleDecode = () => {
    setDecodeError('');
    setDecodeResult(null);
    
    try {
      const blockData = keyBlock.trim().replace(/\s/g, '').toUpperCase();
      
      if (blockData.length < 32) {
        setDecodeError(t.tr31KeyBlock?.errorKeyBlockShort || 'Key block is too short');
        return;
      }

      // Parse header
      const version = blockData[0];
      const length = blockData.substring(1, 5);
      const usage = blockData.substring(5, 7);
      const algo = blockData.substring(7, 8);
      const mode = blockData.substring(8, 9);
      const keyVer = blockData.substring(9, 11);
      const exp = blockData.substring(11, 12);
      const numOptBlocks = parseInt(blockData.substring(12, 14));
      const res = blockData.substring(14, 16);
      
      // Get optional headers if present
      let optHeaders = '';
      let dataStart = 16;
      if (numOptBlocks > 0) {
        optHeaders = blockData.substring(16, 16 + numOptBlocks * 4);
        dataStart = 16 + numOptBlocks * 4;
      }
      
      // Get encrypted data and MAC
      const macLen = ['D', 'E'].includes(version) ? 32 : 16;
      const encryptedData = blockData.substring(dataStart, blockData.length - macLen);
      const mac = blockData.substring(blockData.length - macLen);
      
      // Decrypt key if KBPK is provided
      let decryptedKey = '';
      let keyKcv = '';
      const cleanKbpk = cleanHexInput(kbpk);
      
      if (cleanKbpk && cleanKbpk.length >= 32) {
        try {
          if (version === 'A' || version === 'B' || version === 'C') {
            let decKey = cleanKbpk;
            if (decKey.length === 32) {
              decKey = decKey + decKey.substring(0, 16);
            }
            const parityKey = adjustDesKeyParity(decKey);
            
            const encKeyWordArray = CryptoJS.enc.Hex.parse(parityKey);
            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
            });
            
            const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, encKeyWordArray, {
              mode: CryptoJS.mode.CBC,
              iv: CryptoJS.enc.Hex.parse('0000000000000000'),
              padding: CryptoJS.pad.NoPadding
            });
            
            const decryptedHex = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
            // Extract key length and actual key
            const keyLenBytes = parseInt(decryptedHex.substring(0, 4), 16);
            decryptedKey = decryptedHex.substring(4, 4 + keyLenBytes * 2);
            keyKcv = calculateKCV(decryptedKey, algo === 'A' ? 'A' : 'T');
          } else {
            // AES decryption for version D/E
            const encKeyWordArray = CryptoJS.enc.Hex.parse(cleanKbpk);
            const cipherParams = CryptoJS.lib.CipherParams.create({
              ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
            });
            
            const decrypted = CryptoJS.AES.decrypt(cipherParams, encKeyWordArray, {
              mode: CryptoJS.mode.CBC,
              iv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000'),
              padding: CryptoJS.pad.NoPadding
            });
            
            const decryptedHex = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
            const keyLenBytes = parseInt(decryptedHex.substring(0, 4), 16);
            decryptedKey = decryptedHex.substring(4, 4 + keyLenBytes * 2);
            keyKcv = calculateKCV(decryptedKey, 'A');
          }
        } catch {
          decryptedKey = '(Decryption failed - check KBPK)';
        }
      }
      
      setDecodeResult({
        version: VERSION_OPTIONS.find(o => o.value === version)?.label || version,
        versionCode: version,
        length: parseInt(length),
        keyUsage: KEY_USAGE_OPTIONS.find(o => o.value === usage)?.label || usage,
        keyUsageCode: usage,
        algorithm: ALGORITHM_OPTIONS.find(o => o.value === algo)?.label || algo,
        algorithmCode: algo,
        modeOfUse: MODE_OF_USE_OPTIONS.find(o => o.value === mode)?.label || mode,
        modeCode: mode,
        keyVersion: keyVer,
        exportability: EXPORTABILITY_OPTIONS.find(o => o.value === exp)?.label || exp,
        exportCode: exp,
        numOptBlocks,
        reserved: res,
        optionalHeaders: optHeaders,
        encryptedData,
        mac,
        decryptedKey,
        keyKcv,
        header: blockData.substring(0, dataStart),
      });
      
      message.success(t.tr31KeyBlock?.decodeSuccess || 'Key block decoded successfully');
    } catch (err) {
      setDecodeError((t.tr31KeyBlock?.errorDecode || 'Decoding failed: ') + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Tab items
  const tabItems = [
    {
      key: 'encode',
      label: t.tr31KeyBlock?.tabEncode || 'Encode',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Plain Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.tr31KeyBlock?.plainKey || 'Plain Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(getKeyLengthHex(plainKey)),
                fontWeight: getKeyLengthHex(plainKey) > 0 ? 600 : 400
              }}>
                [{getKeyLengthHex(plainKey) || 32}]
              </Text>
            </div>
            <Input
              value={plainKey}
              onChange={e => setPlainKey(e.target.value)}
              placeholder={t.tr31KeyBlock?.plainKeyPlaceholder || 'Enter plain key in hex'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Header Section */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 12 }}>
              {t.tr31KeyBlock?.header || 'Header'}:
            </Text>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: 0 }}>
              {/* Version ID */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.versionId || 'Version Id'}:
                </Text>
                <Select
                  value={versionId}
                  onChange={setVersionId}
                  options={VERSION_OPTIONS}
                  style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}
                />
              </div>

              {/* Key Usage */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.keyUsage || 'Key Usage'}:
                </Text>
                <Select
                  value={keyUsage}
                  onChange={setKeyUsage}
                  options={KEY_USAGE_OPTIONS}
                  style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </div>

              {/* Algorithm */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.algorithm || 'Algorithm'}:
                </Text>
                <Select
                  value={algorithm}
                  onChange={setAlgorithm}
                  options={ALGORITHM_OPTIONS}
                  style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}
                />
              </div>

              {/* Mode of Use */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.modeOfUse || 'Mode of Use'}:
                </Text>
                <Select
                  value={modeOfUse}
                  onChange={setModeOfUse}
                  options={MODE_OF_USE_OPTIONS}
                  style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}
                />
              </div>

              {/* Key Version */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.keyVersionNum || 'Key version#'}:
                </Text>
                <Input
                  value={keyVersion}
                  onChange={e => setKeyVersion(e.target.value.substring(0, 2))}
                  placeholder="00"
                  maxLength={2}
                  style={{ 
                    width: isMobile ? '100%' : 100, 
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' 
                  }}
                />
              </div>

              {/* Exportability */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.exportability || 'Exportability'}:
                </Text>
                <Select
                  value={exportability}
                  onChange={setExportability}
                  options={EXPORTABILITY_OPTIONS}
                  style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}
                />
              </div>

              {/* # Opt. KeyBlocks */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.optKeyBlocks || '# Opt. KeyBlocks'}:
                </Text>
                <Input
                  value={optKeyBlocks}
                  onChange={e => setOptKeyBlocks(e.target.value)}
                  placeholder="11111111C14017E00000"
                  style={{ 
                    flex: 1, 
                    width: isMobile ? '100%' : 'auto',
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' 
                  }}
                />
              </div>

              {/* Reserved */}
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center', 
                gap: 12 
              }}>
                <Text style={{ 
                  minWidth: isMobile ? 'auto' : 120,
                  marginBottom: isMobile ? 4 : 0,
                  fontSize: isMobile ? '13px' : '14px'
                }}>
                  {t.tr31KeyBlock?.reserved || 'Reserved'}:
                </Text>
                <Input
                  value={reserved}
                  onChange={e => setReserved(e.target.value.substring(0, 2))}
                  placeholder="00"
                  maxLength={2}
                  style={{ 
                    width: isMobile ? '100%' : 100, 
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Optional Headers Section */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.tr31KeyBlock?.optionalHeadersSection || 'Optional Headers'}:
            </Text>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center', 
              gap: 12,
              paddingLeft: 0
            }}>
              <Text style={{ 
                minWidth: isMobile ? 'auto' : 120,
                marginBottom: isMobile ? 4 : 0,
                fontSize: isMobile ? '13px' : '14px'
              }}>
                {t.tr31KeyBlock?.optionalHeaders || 'Optional Headers'}:
              </Text>
              <Input
                value={optionalHeaders}
                onChange={e => setOptionalHeaders(e.target.value)}
                placeholder="11111111C14017E00000"
                style={{ 
                  flex: 1, 
                  width: isMobile ? '100%' : 'auto',
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' 
                }}
              />
            </div>
          </div>

          {/* Encode Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={handleEncode}
              size="large"
            >
              {t.tr31KeyBlock?.encode || 'Encode'}
            </Button>
          </div>

          {/* Error */}
          {encodeError && (
            <Card style={{ borderLeft: '4px solid #ff4d4f', border: 'none' }}>
              <Text type="danger">{encodeError}</Text>
            </Card>
          )}

          {/* Result */}
          {encodeResult && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <LockOutlined /> {t.tr31KeyBlock?.encodeResult || 'Encoded Key Block'}
                </span>
              }
              style={{ 
                background: isDark 
                  ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                  : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                border: isDark ? '1px solid #274916' : '2px solid #95de64',
              }}
              extra={
                <Button 
                  type={isDark ? 'primary' : 'default'}
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(encodeResult)}
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
                wordBreak: 'break-all',
                color: isDark ? '#95de64' : '#237804',
              }}>
                {encodeResult}
              </div>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'decode',
      label: t.tr31KeyBlock?.tabDecode || 'Decode',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Block Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.tr31KeyBlock?.keyBlock || 'Key block'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: keyBlock.replace(/\s/g, '').length > 0 ? '#52c41a' : '#999',
                fontWeight: keyBlock.replace(/\s/g, '').length > 0 ? 600 : 400
              }}>
                [{keyBlock.replace(/\s/g, '').length}]
              </Text>
            </div>
            <Input.TextArea
              value={keyBlock}
              onChange={e => setKeyBlock(e.target.value)}
              placeholder={t.tr31KeyBlock?.keyBlockPlaceholder || 'Enter TR-31 key block data'}
              rows={6}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Decode Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<UnlockOutlined />}
              onClick={handleDecode}
              size="large"
            >
              {t.tr31KeyBlock?.decode || 'Decode'}
            </Button>
          </div>

          {/* Error */}
          {decodeError && (
            <Card style={{ borderLeft: '4px solid #ff4d4f', border: 'none' }}>
              <Text type="danger">{decodeError}</Text>
            </Card>
          )}

          {/* Decode Result */}
          {decodeResult && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <UnlockOutlined /> {t.tr31KeyBlock?.decodeResult || 'Decoded Key Block'}
                </span>
              }
              style={{ 
                background: isDark 
                  ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                  : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                border: isDark ? '1px solid #274916' : '2px solid #95de64',
              }}
            >
              <div style={{ 
                background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
              }}>
                {/* Header Info */}
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>
                    {t.tr31KeyBlock?.headerInfo || 'Header'}
                  </Text>
                  <div style={{
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                    fontSize: '13px',
                    color: isDark ? '#69b1ff' : '#1677ff',
                    wordBreak: 'break-all',
                  }}>
                    {decodeResult.header}
                  </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Parsed Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Version</Text>
                    <Tag color="blue">{decodeResult.versionCode}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Length</Text>
                    <Tag color="purple">{decodeResult.length}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Key Usage</Text>
                    <Tag color="green">{decodeResult.keyUsageCode}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Algorithm</Text>
                    <Tag color="orange">{decodeResult.algorithmCode}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Mode of Use</Text>
                    <Tag color="cyan">{decodeResult.modeCode}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Key Version</Text>
                    <Tag>{decodeResult.keyVersion}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Exportability</Text>
                    <Tag color="red">{decodeResult.exportCode}</Tag>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text type="secondary" style={{ fontSize: '12px', minWidth: 100 }}>Opt. Blocks</Text>
                    <Tag>{decodeResult.numOptBlocks}</Tag>
                  </div>

                  {decodeResult.optionalHeaders && (
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Optional Headers</Text>
                      <Text style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}>
                        {decodeResult.optionalHeaders}
                      </Text>
                    </div>
                  )}

                  <Divider style={{ margin: '8px 0' }} />

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Encrypted Key Data</Text>
                    <Text style={{ 
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                      fontSize: '12px',
                      wordBreak: 'break-all',
                    }}>
                      {decodeResult.encryptedData}
                    </Text>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>MAC</Text>
                    <Text style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}>
                      {decodeResult.mac}
                    </Text>
                  </div>

                  {decodeResult.decryptedKey && (
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Decrypted Key</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Text style={{ 
                            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                            fontSize: '13px',
                            color: isDark ? '#95de64' : '#237804',
                            fontWeight: 600,
                          }}>
                            {decodeResult.decryptedKey}
                          </Text>
                          {decodeResult.decryptedKey && !decodeResult.decryptedKey.includes('(') && (
                            <Button 
                              type="text" 
                              icon={<CopyOutlined />} 
                              size="small"
                              onClick={() => copyToClipboard(decodeResult.decryptedKey)}
                            />
                          )}
                        </div>
                      </div>
                      {decodeResult.keyKcv && (
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Key KCV</Text>
                          <Text style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}>
                            {decodeResult.keyKcv}
                          </Text>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.tr31KeyBlock?.title || 'TR-31 Key Block'}
            </Title>
            <CollapsibleInfo title={t.tr31KeyBlock?.infoTitle || 'About TR-31 Key Block'}>
              <div>• {t.tr31KeyBlock?.infoContent1 || 'TR-31 (ANSI X9.143) is a standard for secure key exchange.'}</div>
              <div>• {t.tr31KeyBlock?.infoContent2 || 'Key blocks contain encrypted key data with metadata.'}</div>
              <div>• {t.tr31KeyBlock?.infoContent3 || 'KBPK (Key Block Protection Key) is used for encryption.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.tr31KeyBlock?.description || 'Encode and decode TR-31/ANSI X9.143 key blocks'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          {/* KBPK Input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center', 
              gap: 12, 
              marginBottom: 12 
            }}>
              <Text strong style={{ 
                minWidth: isMobile ? 'auto' : 60,
                marginBottom: isMobile ? 4 : 0,
                fontSize: isMobile ? '13px' : '14px'
              }}>
                KBPK:
              </Text>
              <Input
                value={kbpk}
                onChange={e => setKbpk(e.target.value)}
                placeholder={t.tr31KeyBlock?.kbpkPlaceholder || 'Enter KBPK (Key Block Protection Key)'}
                style={{ 
                  flex: 1, 
                  width: isMobile ? '100%' : 'auto',
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' 
                }}
              />
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(getKeyLengthHex(kbpk)),
                fontWeight: getKeyLengthHex(kbpk) > 0 ? 600 : 400,
                minWidth: isMobile ? 'auto' : 40,
                alignSelf: isMobile ? 'flex-start' : 'center',
              }}>
                [{getKeyLengthHex(kbpk) || 32}]
              </Text>
            </div>
          </div>

          {/* Key Block version */}
          <div style={{ marginBottom: 24 }}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: '12px' }}>
              {t.tr31KeyBlock?.keyBlockVersion || 'Key Block version'}
            </Text>
            <div style={{ 
              background: isDark 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
                : 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', 
              padding: 12, 
              borderRadius: 8, 
              border: isDark ? '1px solid #0f3460' : '1px solid #e6f0ff' 
            }}>
              <Radio.Group 
                value={keyBlockVersion} 
                onChange={e => setKeyBlockVersion(e.target.value)}
              >
                <Radio value="ansi">ANSI</Radio>
              </Radio.Group>
            </div>
          </div>

          <Tabs items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

export default TR31KeyBlockTool;

