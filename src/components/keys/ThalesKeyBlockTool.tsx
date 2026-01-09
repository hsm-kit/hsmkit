import React, { useState, useMemo } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, Radio } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { isValidHex, cleanHexInput, adjustDesKeyParity } from '../../utils/crypto';

const { Title, Text } = Typography;

// Version ID options
const VERSION_OPTIONS = [
  { value: '0', label: '0 - 3DES KBPK' },
  { value: '1', label: '1 - AES KBPK' },
];

// Key Usage options (73 types based on Thales specification)
const KEY_USAGE_OPTIONS = [
  // Letter-based codes
  { value: 'B0', label: 'B0 - Base Derivation Key (BDK-1)' },
  { value: 'B1', label: 'B1 - DUKPT Initial Key (IKEY/IPEK)' },
  { value: 'C0', label: 'C0 - Card Verification Key (Generic)' },
  { value: 'D0', label: 'D0 - Data Encryption Key (Generic)' },
  { value: 'E0', label: 'E0 - EMV/Chip card MK: App. Cryptogram (MKAC)' },
  { value: 'E1', label: 'E1 - EMV/Chip card MK: Sec. Mesg. for Conf. (MKSMC)' },
  { value: 'E2', label: 'E2 - EMV/Chip card MK: Sec. Mesg. for Int. (MKSMI)' },
  { value: 'E3', label: 'E3 - EMV/Chip card MK: Data Auth. Code (MKDAC)' },
  { value: 'E4', label: 'E4 - EMV/Chip card MK: Dynamic Numbers (MKDN)' },
  { value: 'E5', label: 'E5 - EMV/Chip card MK: Card Personalization' },
  { value: 'E6', label: 'E6 - EMV/Chip card MK: Other' },
  { value: 'E7', label: 'E7 - EMV/Master Personalization Key' },
  { value: 'I0', label: 'I0 - Initialization Value' },
  { value: 'K0', label: 'K0 - Key Encryption / Wrapping Key (Generic)' },
  { value: 'M0', label: 'M0 - ISO 16609 MAC algorithm 1 (using 3-DES)' },
  { value: 'M1', label: 'M1 - ISO 9797-1 MAC algorithm 1' },
  { value: 'M2', label: 'M2 - ISO 9797-1 MAC algorithm 2' },
  { value: 'M3', label: 'M3 - ISO 9797-1 MAC algorithm 3' },
  { value: 'M4', label: 'M4 - ISO 9797-1 MAC algorithm 4' },
  { value: 'M5', label: 'M5 - AES CBC MAC' },
  { value: 'M6', label: 'M6 - AES CMAC' },
  { value: 'P0', label: 'P0 - PIN Encryption Key (Generic)' },
  { value: 'V0', label: 'V0 - PIN Verification Key (Generic)' },
  { value: 'V1', label: 'V1 - PIN Verification Key (IBM 3624 algorithm)' },
  { value: 'V2', label: 'V2 - PIN Verification Key (Visa PVV algorithm)' },
  // Numeric codes 01-06
  { value: '01', label: '01 - WatchWord Key (WWK)' },
  { value: '02', label: '02 - RSA Public Key' },
  { value: '03', label: '03 - RSA Private Key (for signing/key mgt)' },
  { value: '04', label: '04 - RSA Private Key (for ICCs)' },
  { value: '05', label: '05 - RSA Private Key (for PIN translation)' },
  { value: '06', label: '06 - RSA Private Key (for TLS pre-master secret decr.)' },
  // Numeric codes 11-24
  { value: '11', label: '11 - Card Verification Key (American Express CSC)' },
  { value: '22', label: '22 - Zone Encryption Key (ZEK)' },
  { value: '23', label: '23 - Terminal Encryption Key (TEK)' },
  { value: '24', label: '24 - Key Encryption Key (Transport Key)' },
  // Numeric codes 31-43
  { value: '31', label: '31 - Visa Cash Master Load Key (KML)' },
  { value: '32', label: '32 - Dynamic CVV Master Key (MK-CVC3)' },
  { value: '33', label: '33 - Mob. Rmt. Mgmt. MK for msg. conf. (M_KEY_CONF)' },
  { value: '34', label: '34 - Mob. Rmt. Mgmt. MK for msg. int. (M_KEY_MAC)' },
  { value: '35', label: '35 - Mob. Rmt. Mgmt. SK for msg. conf. (MS_KEY_CONF)' },
  { value: '36', label: '36 - Mob. Rmt. Mgmt. SK for msg. int. (MS_KEY_MAC)' },
  { value: '37', label: '37 - EMV Card Key for cryptograms' },
  { value: '38', label: '38 - EMV Card Key for integrity' },
  { value: '39', label: '39 - EMV Card Key for encryption' },
  { value: '40', label: '40 - EMV Personalization System Key' },
  { value: '41', label: '41 - Base Derivation Key (BDK-2)' },
  { value: '42', label: '42 - Base Derivation Key (BDK-3)' },
  { value: '43', label: '43 - Base Derivation Key (BDK-4)' },
  // Numeric codes 47-49
  { value: '47', label: '47 - EMV Session Key for cryptograms' },
  { value: '48', label: '48 - EMV Session Key for integrity' },
  { value: '49', label: '49 - EMV Session Key for encryption' },
  // Numeric codes 51-55
  { value: '51', label: '51 - Terminal Key Encryption (TMK)' },
  { value: '52', label: '52 - Zone Key Encryption (ZMK)' },
  { value: '53', label: '53 - ZKA Master Key' },
  { value: '54', label: '54 - Key Encryption Key (KEK)' },
  { value: '55', label: '55 - Key Encryption Key (Transport Key)' },
  // Numeric codes 61-65 (HMAC)
  { value: '61', label: '61 - HMAC key (using SHA-1)' },
  { value: '62', label: '62 - HMAC key (using SHA-224)' },
  { value: '63', label: '63 - HMAC key (using SHA-256)' },
  { value: '64', label: '64 - HMAC key (using SHA-384)' },
  { value: '65', label: '65 - HMAC key (using SHA-512)' },
  // Numeric codes 71-73
  { value: '71', label: '71 - Terminal PIN Encryption Key (TPK)' },
  { value: '72', label: '72 - Zone PIN Encryption Key (ZPK)' },
  { value: '73', label: '73 - Trans. Key Scheme Terminal Key Register (TKR)' },
  // Extended numeric codes
  { value: '74', label: '74 - Trans. Key Scheme Zone Key Register (ZKR)' },
  { value: '75', label: '75 - Trans. Key Scheme Unique Key per Transaction (UKPT)' },
  { value: '76', label: '76 - Trans. Key Scheme Pin Encryption (PEUKPT)' },
  { value: '77', label: '77 - Trans. Key Scheme MAC (MEUKPT)' },
  { value: '78', label: '78 - Trans. Key Scheme Data Encryption (DEUKPT)' },
  { value: '79', label: '79 - Trans. Key Scheme Signature (SEUKPT)' },
  { value: '80', label: '80 - Trans. Key Scheme Card Authentication (CAUKPT)' },
  { value: '81', label: '81 - IBM CCA Operational Key' },
];

// Algorithm options
const ALGORITHM_OPTIONS = [
  { value: 'A', label: 'A - AES' },
  { value: 'D', label: 'D - DES' },
  { value: 'E', label: 'E - Elliptic Curve' },
  { value: 'H', label: 'H - HMAC' },
  { value: 'R', label: 'R - RSA' },
  { value: 'S', label: 'S - DSA' },
  { value: 'T', label: 'T - Triple DES' },
];

// Mode of Use options
const MODE_OF_USE_OPTIONS = [
  { value: 'B', label: 'B - Both Encrypt and Decrypt / Wrap and Unwrap' },
  { value: 'C', label: 'C - Both Generate and Verify' },
  { value: 'D', label: 'D - Decrypt / Unwrap Only' },
  { value: 'E', label: 'E - Encrypt / Wrap Only' },
  { value: 'G', label: 'G - Generate Only' },
  { value: 'N', label: 'N - No special restrictions or not applicable' },
  { value: 'S', label: 'S - Signature Only' },
  { value: 'T', label: 'T - Both Sign and Decrypt' },
  { value: 'V', label: 'V - Verify Only' },
  { value: 'X', label: 'X - Key used to derive other key(s)' },
  { value: 'Y', label: 'Y - Key used to create key variants' },
];

// Exportability options
const EXPORTABILITY_OPTIONS = [
  { value: 'E', label: 'E - May only be exported in a trusted key block' },
  { value: 'N', label: 'N - Not Exportable' },
  { value: 'S', label: 'S - Sensitive, Exportable with non-exportable under master key' },
];

const ThalesKeyBlockTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // KBPK (Key Block Protection Key) state
  const [desKbpk, setDesKbpk] = useState('0123456789ABCDEF808080808080FEDC');
  const [aesKbpk, setAesKbpk] = useState('9B71333A13F9FAE72F9D0E2DAB4AD678471801');

  // Encode state
  const [plainKey, setPlainKey] = useState('');
  const [versionId, setVersionId] = useState('0');
  const [keyUsage, setKeyUsage] = useState('B0');
  const [algorithm, setAlgorithm] = useState('T');
  const [modeOfUse, setModeOfUse] = useState('N');
  const [keyVersion, setKeyVersion] = useState('00');
  const [exportability, setExportability] = useState('E');
  const [optKeyBlocks, setOptKeyBlocks] = useState('00');
  const [lmkId, setLmkId] = useState('02');
  const [optionalHeaders, setOptionalHeaders] = useState('');
  const [encodeResult, setEncodeResult] = useState('');
  const [encodeError, setEncodeError] = useState('');

  // Decode state
  const [keyBlock, setKeyBlock] = useState('');
  const [dataInputFormat, setDataInputFormat] = useState<'ascii' | 'hex'>('ascii');
  const [decodeResult, setDecodeResult] = useState<Record<string, string> | null>(null);
  const [decodeError, setDecodeError] = useState('');

  // Calculate KCV for KBPK
  const calculateKCV = (keyHex: string): string => {
    try {
      const cleaned = cleanHexInput(keyHex);
      if (!isValidHex(cleaned) || cleaned.length < 16) return '';
      
      let tripleKey = cleaned;
      if (cleaned.length === 16) {
        tripleKey = cleaned + cleaned + cleaned;
      } else if (cleaned.length === 32) {
        tripleKey = cleaned + cleaned.substring(0, 16);
      } else if (cleaned.length === 48) {
        // Already triple length
      } else if (cleaned.length === 64) {
        // AES-256 - use CMAC
        const zeros = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
        const keyWordArray = CryptoJS.enc.Hex.parse(cleaned);
        const encrypted = CryptoJS.AES.encrypt(zeros, keyWordArray, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
        return encrypted.ciphertext.toString().substring(0, 6).toUpperCase();
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
    } catch {
      return '';
    }
  };

  // KCV values are now calculated inline using useMemo
  const desKbpkKcv = useMemo(() => calculateKCV(desKbpk), [desKbpk]);
  const aesKbpkKcv = useMemo(() => calculateKCV(aesKbpk), [aesKbpk]);

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
      const cleanKbpk = cleanHexInput(versionId === '0' ? desKbpk : aesKbpk);
      
      if (!isValidHex(cleanKey) || cleanKey.length < 16) {
        setEncodeError('Invalid plain key format');
        return;
      }
      
      if (!isValidHex(cleanKbpk)) {
        setEncodeError('Invalid KBPK format');
        return;
      }

      // Build header
      const header = buildHeader();
      
      // For demonstration - actual Thales key block encoding is complex
      // This is a simplified version
      const keyBlockData = encodeKeyBlock(cleanKey, cleanKbpk, header);
      
      setEncodeResult(keyBlockData);
      message.success(t.thalesKeyBlock?.encodeSuccess || 'Key block encoded successfully');
    } catch (err) {
      setEncodeError('Encoding failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Build header string
  const buildHeader = (): string => {
    // Format: Version(1) + Length(4) + KeyUsage(2) + Algorithm(1) + ModeOfUse(1) + KeyVersion(2) + Exportability(1) + OptBlocks(2) + LMK(2) + Reserved(1)
    const keyLen = cleanHexInput(plainKey).length / 2;
    const totalLen = 16 + keyLen + 8; // Header + Key + MAC
    const lenStr = totalLen.toString().padStart(4, '0');
    
    return `${versionId}${lenStr}${keyUsage}${algorithm}${modeOfUse}${keyVersion}${exportability}${optKeyBlocks}${lmkId}0`;
  };

  // Simplified key block encoding
  const encodeKeyBlock = (keyHex: string, kbpkHex: string, header: string): string => {
    try {
      // Pad key to block size
      let paddedKey = keyHex;
      const blockSize = versionId === '0' ? 16 : 32; // 8 bytes for 3DES, 16 for AES
      while (paddedKey.length < blockSize * 2) {
        paddedKey += '00';
      }
      
      // Convert header to hex
      const headerHex = header.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').toUpperCase();
      
      // Derive encryption key from KBPK (simplified)
      let encKey = kbpkHex;
      if (encKey.length === 32) {
        encKey = encKey + encKey.substring(0, 16);
      }
      
      // Encrypt key
      const parityKey = adjustDesKeyParity(encKey);
      const keyWordArray = CryptoJS.enc.Hex.parse(paddedKey);
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityKey);
      
      const encrypted = CryptoJS.TripleDES.encrypt(keyWordArray, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const encryptedHex = encrypted.ciphertext.toString().toUpperCase();
      
      // Calculate MAC (simplified - real implementation would use CMAC)
      const macData = headerHex + encryptedHex;
      const macKeyArray = CryptoJS.enc.Hex.parse(parityKey);
      const macDataArray = CryptoJS.enc.Hex.parse(macData.substring(0, 32));
      const mac = CryptoJS.TripleDES.encrypt(macDataArray, macKeyArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      }).ciphertext.toString().substring(0, 16).toUpperCase();
      
      return header + encryptedHex + mac;
    } catch {
      throw new Error('Key block encoding failed');
    }
  };

  // Decode key block
  const handleDecode = () => {
    setDecodeError('');
    setDecodeResult(null);
    
    try {
      let blockData = keyBlock.trim();
      
      // Convert to uppercase and remove spaces
      if (dataInputFormat === 'ascii') {
        blockData = blockData.replace(/\s/g, '');
      } else {
        blockData = cleanHexInput(blockData);
      }
      
      if (blockData.length < 32) {
        setDecodeError('Key block is too short');
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
      const optBlocks = blockData.substring(12, 14);
      const lmk = blockData.substring(14, 16);
      // Reserved field at position 16-17
      
      // Get encrypted data and MAC
      const headerLen = 17 + (parseInt(optBlocks) * 4); // Base header + optional blocks
      const dataWithMac = blockData.substring(headerLen);
      const macLen = 16; // 8 bytes
      const encryptedData = dataWithMac.substring(0, dataWithMac.length - macLen);
      const mac = dataWithMac.substring(dataWithMac.length - macLen);
      
      // Determine KBPK to use
      const kbpk = version === '0' ? desKbpk : aesKbpk;
      const cleanKbpk = cleanHexInput(kbpk);
      
      // Decrypt (simplified)
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
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const decryptedHex = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
      
      setDecodeResult({
        version: VERSION_OPTIONS.find(o => o.value === version)?.label || version,
        length: length,
        keyUsage: KEY_USAGE_OPTIONS.find(o => o.value === usage)?.label || usage,
        algorithm: ALGORITHM_OPTIONS.find(o => o.value === algo)?.label || algo,
        modeOfUse: MODE_OF_USE_OPTIONS.find(o => o.value === mode)?.label || mode,
        keyVersion: keyVer,
        exportability: EXPORTABILITY_OPTIONS.find(o => o.value === exp)?.label || exp,
        optKeyBlocks: optBlocks,
        lmkId: lmk,
        decryptedKey: decryptedHex,
        kcv: calculateKCV(decryptedHex),
        mac: mac,
      });
      
      message.success(t.thalesKeyBlock?.decodeSuccess || 'Key block decoded successfully');
    } catch (err) {
      setDecodeError('Decoding failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Tab items
  const tabItems = [
    {
      key: 'encode',
      label: t.thalesKeyBlock?.tabEncode || 'Encode',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Plain Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.thalesKeyBlock?.plainKey || 'Plain Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(getKeyLength(plainKey), [8, 16, 24, 32]),
                fontWeight: getKeyLength(plainKey) > 0 ? 600 : 400
              }}>
                [{cleanHexInput(plainKey).length || 32}]
              </Text>
            </div>
            <Input
              value={plainKey}
              onChange={e => setPlainKey(e.target.value)}
              placeholder="Enter plain key in hex"
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Version ID */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.versionId || 'Version Id'}:
            </Text>
            <Select
              value={versionId}
              onChange={setVersionId}
              options={VERSION_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* Key Usage */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.keyUsage || 'Key Usage'}:
            </Text>
            <Select
              value={keyUsage}
              onChange={setKeyUsage}
              options={KEY_USAGE_OPTIONS}
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          {/* Algorithm */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.algorithm || 'Algorithm'}:
            </Text>
            <Select
              value={algorithm}
              onChange={setAlgorithm}
              options={ALGORITHM_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* Mode of Use */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.modeOfUse || 'Mode of Use'}:
            </Text>
            <Select
              value={modeOfUse}
              onChange={setModeOfUse}
              options={MODE_OF_USE_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* Key Version */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.keyVersionNum || 'Key version#'}:
            </Text>
            <Input
              value={keyVersion}
              onChange={e => setKeyVersion(e.target.value.substring(0, 2))}
              placeholder="00"
              maxLength={2}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Exportability */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.exportability || 'Exportability'}:
            </Text>
            <Select
              value={exportability}
              onChange={setExportability}
              options={EXPORTABILITY_OPTIONS}
              style={{ width: '100%' }}
            />
          </div>

          {/* # Opt. KeyBlocks */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.optKeyBlocks || '# Opt. KeyBlocks'}:
            </Text>
            <Input
              value={optKeyBlocks}
              onChange={e => setOptKeyBlocks(e.target.value.substring(0, 2))}
              placeholder="00"
              maxLength={2}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* LMK ID */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.lmkId || 'LMK ID'}:
            </Text>
            <Input
              value={lmkId}
              onChange={e => setLmkId(e.target.value.substring(0, 2))}
              placeholder="02"
              maxLength={2}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Optional Headers */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.thalesKeyBlock?.optionalHeaders || 'Optional Headers'}:
            </Text>
            <Input.TextArea
              value={optionalHeaders}
              onChange={e => setOptionalHeaders(e.target.value)}
              placeholder="Optional header data"
              rows={3}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Encode Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={handleEncode}
              size="large"
            >
              {t.thalesKeyBlock?.encode || 'Encode'}
            </Button>
          </div>

          {/* Error */}
          {encodeError && (
            <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{encodeError}</Text>
            </Card>
          )}

          {/* Result */}
          {encodeResult && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <LockOutlined /> {t.thalesKeyBlock?.encodeResult || 'Encoded Key Block'}
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
      label: t.thalesKeyBlock?.tabDecode || 'Decode',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Block Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.thalesKeyBlock?.keyBlock || 'Key block'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: keyBlock.length > 0 ? '#52c41a' : '#999',
                fontWeight: keyBlock.length > 0 ? 600 : 400
              }}>
                [{keyBlock.replace(/\s/g, '').length}]
              </Text>
            </div>
            <Input.TextArea
              value={keyBlock}
              onChange={e => setKeyBlock(e.target.value)}
              placeholder="Enter key block data"
              rows={6}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
              Data input
            </Text>
          </div>

          {/* Data Input Format */}
          <div style={{ 
            background: isDark 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
              : 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', 
            padding: 12, 
            borderRadius: 8, 
            border: isDark ? '1px solid #0f3460' : '1px solid #e6f0ff' 
          }}>
            <Radio.Group 
              value={dataInputFormat} 
              onChange={e => setDataInputFormat(e.target.value)}
            >
              <Radio value="ascii">ASCII</Radio>
              <Radio value="hex">Hexadecimal</Radio>
            </Radio.Group>
          </div>

          {/* Decode Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<UnlockOutlined />}
              onClick={handleDecode}
              size="large"
            >
              {t.thalesKeyBlock?.decode || 'Decode'}
            </Button>
          </div>

          {/* Error */}
          {decodeError && (
            <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{decodeError}</Text>
            </Card>
          )}

          {/* Decode Result */}
          {decodeResult && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <UnlockOutlined /> {t.thalesKeyBlock?.decodeResult || 'Decoded Key Block'}
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
                  onClick={() => copyToClipboard(decodeResult.decryptedKey)}
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
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Version: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.version}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Length: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.length}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Key Usage: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.keyUsage}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Algorithm: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.algorithm}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Mode of Use: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.modeOfUse}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Key Version: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.keyVersion}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Exportability: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.exportability}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Opt. KeyBlocks: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.optKeyBlocks}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>LMK ID: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.lmkId}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>Decrypted Key: </span><span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600 }}>{decodeResult.decryptedKey}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>KCV: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.kcv}</span></div>
                <div><span style={{ color: isDark ? '#8c8c8c' : '#595959' }}>MAC: </span><span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>{decodeResult.mac}</span></div>
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
              {t.thalesKeyBlock?.title || 'Thales Key Block'}
            </Title>
            <CollapsibleInfo title={t.thalesKeyBlock?.infoTitle || 'About Thales Key Block'}>
              <div>• {t.thalesKeyBlock?.infoContent1 || 'Encode and decode Thales proprietary key blocks.'}</div>
              <div>• {t.thalesKeyBlock?.infoContent2 || 'Similar to TR-31 but with Thales-specific format.'}</div>
              <div>• {t.thalesKeyBlock?.infoContent3 || 'Uses KBPK (Key Block Protection Key) for encryption.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.thalesKeyBlock?.description || 'Encode and decode Thales proprietary key blocks'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          {/* KBPK Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: 24 }}>
            {/* 3DES KBPK */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Text strong style={{ minWidth: 90 }}>3DES KBPK:</Text>
              <Input
                value={desKbpk}
                onChange={e => setDesKbpk(e.target.value)}
                style={{ flex: 1, minWidth: 300, fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
              <Input
                value={desKbpkKcv}
                readOnly
                style={{ width: 80, fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
                placeholder="KCV"
              />
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(getKeyLength(desKbpk), [24]),
                fontWeight: 600,
                minWidth: 40,
              }}>
                [{cleanHexInput(desKbpk).length}]
              </Text>
            </div>

            {/* AES KBPK */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Text strong style={{ minWidth: 90 }}>AES KBPK:</Text>
              <Input
                value={aesKbpk}
                onChange={e => setAesKbpk(e.target.value)}
                style={{ flex: 1, minWidth: 300, fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
              <Input
                value={aesKbpkKcv}
                readOnly
                style={{ width: 80, fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
                placeholder="KCV"
              />
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(getKeyLength(aesKbpk), [32]),
                fontWeight: 600,
                minWidth: 40,
              }}>
                [{cleanHexInput(aesKbpk).length}]
              </Text>
            </div>
          </div>

          <Tabs items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

export default ThalesKeyBlockTool;

