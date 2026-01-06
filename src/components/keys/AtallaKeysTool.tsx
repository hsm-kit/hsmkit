import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Checkbox, Segmented } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { isValidHex, cleanHexInput, adjustDesKeyParity } from '../../utils/crypto';

const { Title, Text } = Typography;

// Result details interface
interface EncryptResultDetails {
  key: string;
  akbHeader: string;
  mfk: string;
  variantKey: string;
  keyUnderMfk: string;
  mac: string;
  encryptedAkb: string;
  kcv: string;
}

interface DecodeResultDetails {
  akb: string;
  header: string;
  mfk: string;
  decodedKey: string;
  kcv: string;
  parity: string;
}

const AtallaKeysTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Key Encryption state
  const [encKey, setEncKey] = useState('');
  const [akbHeader, setAkbHeader] = useState('1PUNE000');
  const [encMfk, setEncMfk] = useState('');
  const [encryptResult, setEncryptResult] = useState<EncryptResultDetails | null>(null);
  const [encryptError, setEncryptError] = useState('');

  // AKB Decode state
  const [akbInput, setAkbInput] = useState('');
  const [checkKcv, setCheckKcv] = useState(false);
  const [expectedKcv, setExpectedKcv] = useState('');
  const [decodeParity, setDecodeParity] = useState<'any' | 'odd' | 'even'>('any');
  const [decodeMfk, setDecodeMfk] = useState('');
  const [decodeResults, setDecodeResults] = useState<DecodeResultDetails[]>([]);
  const [decodeError, setDecodeError] = useState('');

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

  // Calculate MAC for AKB
  const calculateAkbMac = (header: string, encryptedKey: string, mfkVariant: string): string => {
    try {
      // MAC is calculated over header + encrypted key using the MFK variant
      const headerHex = header.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      const dataToMac = headerHex + encryptedKey;
      
      // Pad to 8-byte boundary
      let paddedData = dataToMac;
      const remainder = paddedData.length % 16;
      if (remainder !== 0) {
        paddedData = paddedData + '00'.repeat((16 - remainder) / 2);
      }
      
      // CBC-MAC using 3DES
      const keyWordArray = CryptoJS.enc.Hex.parse(mfkVariant);
      let mac = CryptoJS.enc.Hex.parse('0000000000000000');
      
      for (let i = 0; i < paddedData.length; i += 16) {
        const block = CryptoJS.enc.Hex.parse(paddedData.substring(i, i + 16));
        const xored = CryptoJS.lib.WordArray.create([
          block.words[0] ^ mac.words[0],
          block.words[1] ^ mac.words[1]
        ]);
        const encrypted = CryptoJS.TripleDES.encrypt(xored, keyWordArray, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });
        mac = encrypted.ciphertext;
      }
      
      return mac.toString().toUpperCase();
    } catch {
      return '';
    }
  };

  // Encrypt key using Atalla AKB format
  const handleEncrypt = () => {
    setEncryptError('');
    setEncryptResult(null);
    
    try {
      const cleanKey = cleanHexInput(encKey);
      const cleanMfk = cleanHexInput(encMfk);
      const header = akbHeader.toUpperCase();
      
      if (!isValidHex(cleanKey)) {
        setEncryptError(t.atallaKeys?.errorInvalidKey || 'Invalid key format');
        return;
      }
      
      if (![16, 24, 32].includes(cleanKey.length / 2)) {
        setEncryptError(t.atallaKeys?.errorKeyLength || 'Key must be 16, 24, or 32 bytes');
        return;
      }
      
      if (header.length !== 8) {
        setEncryptError(t.atallaKeys?.errorHeaderLength || 'AKB header must be 8 characters');
        return;
      }
      
      if (!isValidHex(cleanMfk) || cleanMfk.length < 48) {
        setEncryptError(t.atallaKeys?.errorInvalidMfk || 'MFK must be at least 48 hex characters');
        return;
      }

      // Prepare key for encryption - pad to 24 bytes (triple DES key length)
      let keyToEncrypt = cleanKey;
      if (cleanKey.length === 32) {
        // 16 bytes -> extend to 24 bytes by repeating first 8 bytes
        keyToEncrypt = cleanKey + cleanKey.substring(0, 16);
      } else if (cleanKey.length === 48) {
        // 24 bytes -> use as is
        keyToEncrypt = cleanKey;
      } else if (cleanKey.length === 64) {
        // 32 bytes -> truncate to 24 bytes for 3DES
        keyToEncrypt = cleanKey.substring(0, 48);
      }

      // Calculate variant key from header
      // Atalla XORs MFK with header ASCII values repeated
      const headerHex = header.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      const variantMask = headerHex.repeat(3).substring(0, 48); // 48 hex chars = 24 bytes
      const variantKey = xorHex(cleanMfk.substring(0, 48), variantMask);
      
      // Adjust parity
      const parityAdjustedVariant = adjustDesKeyParity(variantKey);
      
      // Encrypt the key using 3DES ECB
      const keyWordArray = CryptoJS.enc.Hex.parse(keyToEncrypt);
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedVariant);
      
      const encrypted = CryptoJS.TripleDES.encrypt(keyWordArray, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      const encryptedHex = encrypted.ciphertext.toString().toUpperCase();
      
      // Calculate MAC
      const mac = calculateAkbMac(header, encryptedHex, parityAdjustedVariant);
      
      // Full AKB format: header,encrypted_key,mac (74 chars total)
      const akb = header + ',' + encryptedHex + ',' + mac;
      
      setEncryptResult({
        key: cleanKey.toUpperCase(),
        akbHeader: header,
        mfk: cleanMfk.toUpperCase(),
        variantKey: parityAdjustedVariant.toUpperCase(),
        keyUnderMfk: encryptedHex,
        mac: mac,
        encryptedAkb: akb,
        kcv: calculateKCV(cleanKey),
      });
      message.success(t.atallaKeys?.encryptSuccess || 'Key encrypted successfully');
    } catch (err) {
      setEncryptError((t.atallaKeys?.errorEncrypt || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Decode AKB
  const handleDecode = () => {
    setDecodeError('');
    setDecodeResults([]);
    
    try {
      const akb = akbInput.trim().toUpperCase();
      const cleanMfk = cleanHexInput(decodeMfk);
      const cleanKcv = checkKcv ? cleanHexInput(expectedKcv).toUpperCase() : '';
      
      if (!akb || !akb.includes(',')) {
        setDecodeError(t.atallaKeys?.errorInvalidAkb || 'Invalid AKB format (must contain header,data)');
        return;
      }
      
      const parts = akb.split(',');
      if (parts.length < 2) {
        setDecodeError(t.atallaKeys?.errorInvalidAkb || 'Invalid AKB format');
        return;
      }
      
      const header = parts[0];
      const encryptedData = parts[1];
      const mac = parts[2] || ''; // MAC is optional for backward compatibility
      
      if (header.length !== 8) {
        setDecodeError(t.atallaKeys?.errorHeaderLength || 'AKB header must be 8 characters');
        return;
      }
      
      if (!isValidHex(encryptedData)) {
        setDecodeError(t.atallaKeys?.errorInvalidAkbData || 'Invalid encrypted data in AKB');
        return;
      }
      
      if (!isValidHex(cleanMfk) || cleanMfk.length < 48) {
        setDecodeError(t.atallaKeys?.errorInvalidMfk || 'MFK must be at least 48 hex characters');
        return;
      }

      if (checkKcv && (!isValidHex(cleanKcv) || cleanKcv.length < 4)) {
        setDecodeError(t.atallaKeys?.errorInvalidKcv || 'Invalid KCV format');
        return;
      }

      // Calculate variant from header
      const headerHex = header.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      const variantMask = headerHex.repeat(3).substring(0, 48);
      const variantKey = xorHex(cleanMfk.substring(0, 48), variantMask);
      
      // Adjust parity
      const parityAdjustedKey = adjustDesKeyParity(variantKey);
      
      // Verify MAC if present
      if (mac && mac.length === 16) {
        const calculatedMac = calculateAkbMac(header, encryptedData, parityAdjustedKey);
        if (calculatedMac !== mac) {
          setDecodeError(t.atallaKeys?.macMismatch || 'MAC verification failed');
          return;
        }
      }
      
      // Decrypt
      const encKeyWordArray = CryptoJS.enc.Hex.parse(parityAdjustedKey);
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encryptedData)
      });
      
      const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, encKeyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      
      let decryptedHex = decrypted.toString().toUpperCase();
      
      // If decrypted key is 24 bytes and first 8 bytes == last 8 bytes, it's a double-length key
      if (decryptedHex.length === 48) {
        const first8 = decryptedHex.substring(0, 16);
        const last8 = decryptedHex.substring(32, 48);
        if (first8 === last8) {
          // This is actually a 16-byte key that was extended
          decryptedHex = decryptedHex.substring(0, 32);
        }
      }
      
      if (decryptedHex && decryptedHex.length >= 32) {
        const kcv = calculateKCV(decryptedHex);
        const parity = detectParity(decryptedHex);
        
        // Filter by KCV if checking
        if (checkKcv && cleanKcv && !kcv.startsWith(cleanKcv.substring(0, 4))) {
          setDecodeError(t.atallaKeys?.kcvMismatch || 'KCV does not match');
          return;
        }
        
        // Filter by parity
        if (decodeParity !== 'any') {
          if (decodeParity === 'odd' && parity !== 'Odd') {
            setDecodeError(t.atallaKeys?.parityMismatch || 'Parity does not match');
            return;
          }
          if (decodeParity === 'even' && parity !== 'Even') {
            setDecodeError(t.atallaKeys?.parityMismatch || 'Parity does not match');
            return;
          }
        }
        
        setDecodeResults([{
          akb,
          header,
          mfk: cleanMfk.toUpperCase(),
          decodedKey: decryptedHex,
          kcv,
          parity,
        }]);
        message.success(t.atallaKeys?.decodeSuccess || 'AKB decoded successfully');
      } else {
        setDecodeError(t.atallaKeys?.decodeFailed || 'Failed to decode AKB');
      }
    } catch (err) {
      setDecodeError((t.atallaKeys?.errorDecode || 'Decoding failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // Key lengths for display
  const encKeyLength = getKeyLength(encKey);
  const akbLength = akbInput.trim().length;
  const kcvLength = expectedKcv.length;
  const mfkLength = getKeyLength(decodeMfk);
  const encMfkLength = getKeyLength(encMfk);

  // Tab items
  const tabItems = [
    {
      key: 'encrypt',
      label: t.atallaKeys?.tabEncrypt || 'Key Encryption',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.atallaKeys?.key || 'Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(encKeyLength, [16, 24, 32]),
                fontWeight: encKeyLength > 0 ? 600 : 400
              }}>
                [{encKeyLength || 16}]
              </Text>
            </div>
            <Input
              value={encKey}
              onChange={e => setEncKey(e.target.value)}
              placeholder={t.atallaKeys?.keyPlaceholder || 'Enter hex key (16/24/32 bytes)'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* AKB Header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.atallaKeys?.akbHeader || 'AKB header'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: akbHeader.length === 8 ? '#52c41a' : '#ff4d4f',
                fontWeight: akbHeader.length > 0 ? 600 : 400
              }}>
                [{akbHeader.length}]
              </Text>
            </div>
            <Input
              value={akbHeader}
              onChange={e => setAkbHeader(e.target.value.substring(0, 8))}
              placeholder="1PUNE000"
              maxLength={8}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
              {t.atallaKeys?.akbHeaderHint || 'Atalla Key Block header (8 characters)'}
            </Text>
          </div>

          {/* MFK Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.atallaKeys?.mfkKey || 'MFK Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(encMfkLength, [24]),
                fontWeight: encMfkLength > 0 ? 600 : 400
              }}>
                [{encMfkLength || 48}]
              </Text>
            </div>
            <Input
              value={encMfk}
              onChange={e => setEncMfk(e.target.value)}
              placeholder={t.atallaKeys?.mfkPlaceholder || 'Enter MFK (48 hex characters)'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Encrypt Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<LockOutlined />}
              onClick={handleEncrypt}
              size="large"
            >
              {t.atallaKeys?.encrypt || 'Encrypt'}
            </Button>
          </div>

          {/* Error Display */}
          {encryptError && (
            <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{encryptError}</Text>
            </Card>
          )}

          {/* Encrypt Result */}
          {encryptResult && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <LockOutlined /> {t.atallaKeys?.encryptResult || 'Encryption Result'}
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
                  onClick={() => copyToClipboard(encryptResult.encryptedAkb)}
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
                      {t.atallaKeys?.plainKey || 'Plain Key'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {encryptResult.key}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.atallaKeys?.kcv || 'KCV'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.kcv}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.atallaKeys?.akbHeader || 'AKB Header'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.akbHeader}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      MFK Variant:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {encryptResult.variantKey}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      Key under MFK:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {encryptResult.keyUnderMfk}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      MAC:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.mac}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      {t.atallaKeys?.encryptedAkb || 'AKB'}:
                    </span>
                    <span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600, wordBreak: 'break-all' }}>
                      {encryptResult.encryptedAkb}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 140 }}>
                      Length:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {encryptResult.encryptedAkb.length}
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
      key: 'decode',
      label: t.atallaKeys?.tabDecode || 'AKB Decode',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* AKB Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.atallaKeys?.akb || 'AKB'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: akbLength > 8 ? '#52c41a' : '#999',
                fontWeight: akbLength > 0 ? 600 : 400
              }}>
                {akbLength}
              </Text>
            </div>
            <Input
              value={akbInput}
              onChange={e => setAkbInput(e.target.value)}
              placeholder={t.atallaKeys?.akbPlaceholder || 'Enter AKB (header,encrypted_data)'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Check KCV */}
          <div>
            <Checkbox
              checked={checkKcv}
              onChange={e => setCheckKcv(e.target.checked)}
            >
              <Text strong>{t.atallaKeys?.checkKcv || 'Check KCV?'}</Text>
            </Checkbox>
          </div>

          {/* KCV Input - only show when Check KCV is checked */}
          {checkKcv && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.atallaKeys?.kcvS || 'KCV (S)'}:</Text>
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
                placeholder={t.atallaKeys?.kcvPlaceholder || 'Enter expected KCV'}
                maxLength={6}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>
          )}

          {/* Parity Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.atallaKeys?.parity || 'Parity'}:
            </Text>
            <Segmented
              value={decodeParity}
              onChange={value => setDecodeParity(value as 'any' | 'odd' | 'even')}
              options={[
                { label: t.atallaKeys?.parityAny || 'Any', value: 'any' },
                { label: t.atallaKeys?.parityOdd || 'Odd', value: 'odd' },
                { label: t.atallaKeys?.parityEven || 'Even', value: 'even' },
              ]}
              block
            />
          </div>

          {/* MFK Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.atallaKeys?.mfkKey || 'MFK Key'}:</Text>
              <Text style={{ 
                fontSize: '12px', 
                color: getLengthColor(mfkLength, [24]),
                fontWeight: mfkLength > 0 ? 600 : 400
              }}>
                [{mfkLength || 48}]
              </Text>
            </div>
            <Input
              value={decodeMfk}
              onChange={e => setDecodeMfk(e.target.value)}
              placeholder={t.atallaKeys?.mfkPlaceholder || 'Enter MFK (48 hex characters)'}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Decode Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              icon={<UnlockOutlined />}
              onClick={handleDecode}
              size="large"
            >
              {t.atallaKeys?.decode || 'Decode'}
            </Button>
          </div>

          {/* Decode Error */}
          {decodeError && (
            <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
              <Text type="danger">{decodeError}</Text>
            </Card>
          )}

          {/* Decode Results */}
          {decodeResults.length > 0 && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <UnlockOutlined /> {t.atallaKeys?.decodeResult || 'Decode Result'}
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
                  onClick={() => copyToClipboard(decodeResults[0].decodedKey)}
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
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 120 }}>
                      {t.atallaKeys?.akb || 'AKB'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626', wordBreak: 'break-all' }}>
                      {decodeResults[0].akb}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 120 }}>
                      {t.atallaKeys?.header || 'Header'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {decodeResults[0].header}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 120 }}>
                      {t.atallaKeys?.decodedKey || 'Decoded Key'}:
                    </span>
                    <span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600, wordBreak: 'break-all' }}>
                      {decodeResults[0].decodedKey}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 120 }}>
                      {t.atallaKeys?.kcv || 'KCV'}:
                    </span>
                    <span style={{ color: isDark ? '#95de64' : '#237804', fontWeight: 600 }}>
                      {decodeResults[0].kcv}
                    </span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ color: isDark ? '#8c8c8c' : '#595959', minWidth: 120 }}>
                      {t.atallaKeys?.parityDetected || 'Parity'}:
                    </span>
                    <span style={{ color: isDark ? '#d9d9d9' : '#262626' }}>
                      {decodeResults[0].parity}
                    </span>
                  </div>
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
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.atallaKeys?.title || 'Atalla Keys (AKB)'}
            </Title>
            <CollapsibleInfo title={t.atallaKeys?.infoTitle || 'About Atalla Keys'}>
              <div>• {t.atallaKeys?.infoContent1 || 'Encrypt/decrypt keys using Atalla Key Block (AKB) format.'}</div>
              <div>• {t.atallaKeys?.infoContent2 || 'AKB header (8 chars) defines the key variant.'}</div>
              <div>• {t.atallaKeys?.infoContent3 || 'MFK (Master File Key) is the base encryption key.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.atallaKeys?.description || 'Encrypt and decrypt keys using Atalla HSM AKB format'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <Tabs items={tabItems} />
        </Card>
      </div>
    </div>
  );
};

export default AtallaKeysTool;

