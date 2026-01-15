import React, { useState } from 'react';
import { Card, Input, Button, Segmented, Checkbox, message, Typography, Divider } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo, ResultCard } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { TextArea } = Input;
const { Title, Text } = Typography;

type EncryptionType = 'AES' | 'TDES';
type InputType = 'ASCII' | 'Hexadecimal';

const CMACTool: React.FC = () => {
  const { t } = useLanguage();
  useTheme();
  const [encryptionType, setEncryptionType] = useState<EncryptionType>('AES');
  const [keyType, setKeyType] = useState<InputType>('Hexadecimal');
  const [keyInput, setKeyInput] = useState<string>('');
  const [dataType, setDataType] = useState<InputType>('Hexadecimal');
  const [dataInput, setDataInput] = useState<string>('');
  const [useCMAC96, setUseCMAC96] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Validate hex string
  const isValidHex = (str: string): boolean => {
    if (!str) return false;
    const hexRegex = /^[0-9A-Fa-f]+$/;
    return hexRegex.test(str) && str.length % 2 === 0;
  };

  // Left shift a byte array by 1 bit
  const leftShift = (data: number[]): number[] => {
    const result = new Array(data.length).fill(0);
    let carry = 0;
    
    for (let i = data.length - 1; i >= 0; i--) {
      result[i] = ((data[i] << 1) | carry) & 0xFF;
      carry = (data[i] & 0x80) ? 1 : 0;
    }
    
    return result;
  };

  // XOR two byte arrays
  const xorBytes = (a: number[], b: number[]): number[] => {
    const result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
      result[i] = a[i] ^ b[i];
    }
    return result;
  };

  // Generate CMAC subkeys
  const generateSubkeys = (key: CryptoJS.lib.WordArray, blockSize: number): { K1: number[], K2: number[] } => {
    // Rb constants
    const Rb = blockSize === 16 ? 0x87 : 0x1B; // AES: 0x87, DES: 0x1B

    // Encrypt zero block
    const zeroBlock = CryptoJS.lib.WordArray.create(new Array(blockSize).fill(0), blockSize);
    let L: CryptoJS.lib.WordArray;

    if (blockSize === 16) {
      // AES
      const cipher = CryptoJS.AES.encrypt(zeroBlock, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      L = cipher.ciphertext;
    } else {
      // Triple DES
      const cipher = CryptoJS.TripleDES.encrypt(zeroBlock, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      L = cipher.ciphertext;
    }

    // Convert to byte array
    const LBytes: number[] = [];
    for (let i = 0; i < L.words.length; i++) {
      const word = L.words[i];
      LBytes.push((word >>> 24) & 0xFF);
      LBytes.push((word >>> 16) & 0xFF);
      LBytes.push((word >>> 8) & 0xFF);
      LBytes.push(word & 0xFF);
    }
    const LBytesSliced = LBytes.slice(0, blockSize);

    // Generate K1
    const K1 = leftShift(LBytesSliced);
    if (LBytesSliced[0] & 0x80) {
      K1[K1.length - 1] ^= Rb;
    }

    // Generate K2
    const K2 = leftShift(K1);
    if (K1[0] & 0x80) {
      K2[K2.length - 1] ^= Rb;
    }

    return { K1, K2 };
  };

  // Calculate CMAC
  const calculateCMAC = (
    encryption: EncryptionType,
    keyStr: string,
    keyIsHex: boolean,
    dataStr: string,
    dataIsHex: boolean,
    truncate96: boolean
  ): string => {
    try {
      // Parse key
      const key = keyIsHex 
        ? CryptoJS.enc.Hex.parse(keyStr) 
        : CryptoJS.enc.Utf8.parse(keyStr);

      // Parse data
      const data = dataIsHex 
        ? CryptoJS.enc.Hex.parse(dataStr) 
        : CryptoJS.enc.Utf8.parse(dataStr);

      // Determine block size
      const blockSize = encryption === 'AES' ? 16 : 8;

      // Generate subkeys
      const { K1, K2 } = generateSubkeys(key, blockSize);

      // Prepare data with padding
      const dataBytes: number[] = [];
      for (let i = 0; i < data.words.length; i++) {
        const word = data.words[i];
        dataBytes.push((word >>> 24) & 0xFF);
        dataBytes.push((word >>> 16) & 0xFF);
        dataBytes.push((word >>> 8) & 0xFF);
        dataBytes.push(word & 0xFF);
      }
      const dataBytesSliced = dataBytes.slice(0, data.sigBytes);

      // Determine if padding is needed
      const lastBlockComplete = (dataBytesSliced.length % blockSize === 0) && dataBytesSliced.length > 0;

      let paddedData: number[];
      if (lastBlockComplete) {
        // XOR last block with K1
        const lastBlock = dataBytesSliced.slice(-blockSize);
        const xored = xorBytes(lastBlock, K1);
        paddedData = dataBytesSliced.slice(0, -blockSize).concat(xored);
      } else {
        // Pad with 0x80 followed by zeros, then XOR with K2
        const paddedBlock = dataBytesSliced.slice(-(dataBytesSliced.length % blockSize || blockSize));
        paddedBlock.push(0x80);
        while (paddedBlock.length < blockSize) {
          paddedBlock.push(0x00);
        }
        const xored = xorBytes(paddedBlock, K2);
        paddedData = dataBytesSliced.slice(0, dataBytesSliced.length - (dataBytesSliced.length % blockSize || blockSize)).concat(xored);
      }

      // Convert back to WordArray
      const paddedWordArray = CryptoJS.lib.WordArray.create(paddedData as number[], paddedData.length);

      // Encrypt using CBC mode with zero IV
      const iv = CryptoJS.lib.WordArray.create(new Array(blockSize).fill(0), blockSize);
      let encrypted: CryptoJS.lib.CipherParams;

      if (encryption === 'AES') {
        encrypted = CryptoJS.AES.encrypt(paddedWordArray, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.NoPadding
        });
      } else {
        encrypted = CryptoJS.TripleDES.encrypt(paddedWordArray, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.NoPadding
        });
      }

      // Get the last block as CMAC
      const ciphertext = encrypted.ciphertext.toString();
      const cmac = ciphertext.slice(-blockSize * 2);

      // Apply truncation if AES CMAC 96
      if (truncate96 && encryption === 'AES') {
        return cmac.slice(0, 24).toUpperCase(); // 12 bytes = 96 bits
      }

      return cmac.toUpperCase();
    } catch (err) {
      throw new Error('CMAC calculation failed: ' + (err as Error).message);
    }
  };

  // Handle calculate
  const handleCalculate = () => {
    setResult('');
    setError('');

    try {
      // Validate key
      if (!keyInput) {
        throw new Error(t.mac.cmac.error.emptyKey);
      }
      if (keyType === 'Hexadecimal') {
        if (!isValidHex(keyInput)) {
          throw new Error(t.mac.cmac.error.invalidKeyFormat);
        }
        // Validate key length based on encryption type
        const expectedLengths = encryptionType === 'AES' ? [32, 48, 64] : [32, 48]; // AES: 16/24/32 bytes, TDES: 16/24 bytes
        if (!expectedLengths.includes(keyInput.length)) {
          throw new Error(t.mac.cmac.error.invalidKeyLength);
        }
      }

      // Validate data
      if (!dataInput) {
        throw new Error(t.mac.cmac.error.emptyData);
      }
      if (dataType === 'Hexadecimal' && !isValidHex(dataInput)) {
        throw new Error(t.mac.cmac.error.invalidDataFormat);
      }

      // Calculate CMAC
      const cmac = calculateCMAC(
        encryptionType,
        keyInput,
        keyType === 'Hexadecimal',
        dataInput,
        dataType === 'Hexadecimal',
        useCMAC96
      );
      setResult(cmac);
      message.success(t.mac.cmac.success);
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t.common?.copied || 'Copied!');
    } catch {
      message.error(t.common?.copyFailed || 'Failed to copy');
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.mac.cmac.title}
            </Title>
            <CollapsibleInfo title={t.mac.cmac.infoTitle || 'About CMAC'}>
              <div>{t.mac.cmac.info || 'Calculate cipher-based MAC using AES or TDES with NIST SP 800-38B standard'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.mac.cmac.description}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

            {/* Encryption Type */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.cmac.encryptionType}:
              </Text>
              <Segmented
                value={encryptionType}
                onChange={(value) => setEncryptionType(value as 'AES' | 'TDES')}
                options={[
                  { label: 'AES', value: 'AES' },
                  { label: 'TDES', value: 'TDES' }
                ]}
                block
              />
            </div>

            {/* CMAC Key */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.mac.cmac.inputTypeLabel || 'Key Input'}:
              </Text>
              <Segmented
                value={keyType}
                onChange={(value) => setKeyType(value as InputType)}
                options={[
                  { label: 'ASCII', value: 'ASCII' },
                  { label: 'Hexadecimal', value: 'Hexadecimal' }
                ]}
                block
                style={{ marginBottom: 8 }}
              />
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.mac.cmac.cmacKey}:
                </Text>
              <TextArea
                value={keyInput}
                onChange={(e) => setKeyInput(keyType === 'Hexadecimal' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={
                  keyType === 'Hexadecimal'
                    ? (encryptionType === 'AES' ? t.mac.cmac.keyPlaceholderHex : t.mac.cmac.keyPlaceholderHex)
                    : t.mac.cmac.keyPlaceholderAscii
                }
                autoSize={{ minRows: 3, maxRows: 6 }}
                maxLength={keyType === 'Hexadecimal' ? 64 : undefined}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Data */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.mac.cmac.inputTypeLabel || 'Data Input'}:
              </Text>
              <Segmented
                value={dataType}
                onChange={(value) => setDataType(value as InputType)}
                options={[
                  { label: 'ASCII', value: 'ASCII' },
                  { label: 'Hexadecimal', value: 'Hexadecimal' }
                ]}
                block
                style={{ marginBottom: 8 }}
              />
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.mac.cmac.data}:
                </Text>
              <TextArea
                value={dataInput}
                onChange={(e) => setDataInput(dataType === 'Hexadecimal' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={dataType === 'Hexadecimal' ? t.mac.cmac.dataPlaceholderHex : t.mac.cmac.dataPlaceholderAscii}
                autoSize={{ minRows: 4, maxRows: 8 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* AES CMAC 96 Checkbox */}
            {encryptionType === 'AES' && (
              <div>
                <Checkbox
                  checked={useCMAC96}
                  onChange={(e) => setUseCMAC96(e.target.checked)}
                >
                  {t.mac.cmac.aesCmac96}
                </Checkbox>
              </div>
            )}

            {/* Calculate Button */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleCalculate}
                size="large"
              >
                {t.mac.cmac.calculate}
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
            title={t.mac.cmac.result}
            result={result}
            onCopy={() => handleCopy(result)}
            icon={<ThunderboltOutlined />}
          />
        )}
      </div>
    </div>
  );
};

export default CMACTool;
