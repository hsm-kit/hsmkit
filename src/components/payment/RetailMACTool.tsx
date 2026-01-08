import React, { useState } from 'react';
import { Card, Input, Button, Segmented, message, Typography, Divider } from 'antd';
import { CopyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { TextArea } = Input;
const { Title, Text } = Typography;

type Algorithm = 'DES' | '3DES';
type FinalizeMethod = 'None' | '3DES';

const RetailMACTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [algorithm, setAlgorithm] = useState<Algorithm>('DES');
  const [finalizeMethod, setFinalizeMethod] = useState<FinalizeMethod>('None');
  const [keyK, setKeyK] = useState<string>('');
  const [keyKPrime, setKeyKPrime] = useState<string>('');
  const [data, setData] = useState<string>('');
  const [truncation, setTruncation] = useState<number>(8);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Validate hex string
  const isValidHex = (str: string, expectedLength?: number): boolean => {
    if (!str) return false;
    const hexRegex = /^[0-9A-Fa-f]+$/;
    if (!hexRegex.test(str)) return false;
    if (expectedLength && str.length !== expectedLength) return false;
    return true;
  };

  // Apply ISO 9797-1 Method 2 padding (0x80 followed by zeros)
  const applyPadding = (dataHex: string): string => {
    const dataBytes = CryptoJS.enc.Hex.parse(dataHex);
    const blockSize = 8; // DES block size in bytes
    const dataLength = dataBytes.sigBytes;
    const paddingLength = blockSize - (dataLength % blockSize);

    if (paddingLength === blockSize) {
      // Full block of padding
      const paddingBytes = new Uint8Array(blockSize);
      paddingBytes[0] = 0x80;
      const padding = CryptoJS.lib.WordArray.create(Array.from(paddingBytes) as number[], blockSize);
      return dataBytes.concat(padding).toString();
    } else {
      // Partial padding
      const paddingBytes = new Uint8Array(paddingLength);
      paddingBytes[0] = 0x80;
      const padding = CryptoJS.lib.WordArray.create(Array.from(paddingBytes) as number[], paddingLength);
      return dataBytes.concat(padding).toString();
    }
  };

  // Calculate Retail MAC
  const calculateRetailMAC = (
    algo: Algorithm,
    finalize: FinalizeMethod,
    key1Hex: string,
    key2Hex: string,
    dataHex: string,
    truncateBytes: number
  ): string => {
    try {
      // Apply padding
      const paddedData = applyPadding(dataHex);
      
      // Parse data
      const plaintext = CryptoJS.enc.Hex.parse(paddedData);

      let mac: string;

      if (algo === 'DES') {
        // Single DES encryption
        const key = CryptoJS.enc.Hex.parse(key1Hex);
        const iv = CryptoJS.lib.WordArray.create([0, 0], 8);
        
        const encrypted = CryptoJS.DES.encrypt(plaintext, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.NoPadding
        });

        mac = encrypted.ciphertext.toString();
      } else {
        // Triple DES encryption
        const key = key2Hex 
          ? CryptoJS.enc.Hex.parse(key1Hex + key2Hex) 
          : CryptoJS.enc.Hex.parse(key1Hex);
        const iv = CryptoJS.lib.WordArray.create([0, 0], 8);
        
        const encrypted = CryptoJS.TripleDES.encrypt(plaintext, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.NoPadding
        });

        mac = encrypted.ciphertext.toString();
      }

      // Get the last block (8 bytes = 16 hex characters)
      let lastBlock = mac.slice(-16);

      // Apply finalization if needed
      if (finalize === '3DES' && algo === 'DES') {
        // Decrypt with key1, then encrypt with key2 (if provided) or key1
        const blockToFinalize = CryptoJS.enc.Hex.parse(lastBlock);
        const key1 = CryptoJS.enc.Hex.parse(key1Hex);
        
        // Decrypt
        const decrypted = CryptoJS.DES.decrypt(
          { ciphertext: blockToFinalize } as CryptoJS.lib.CipherParams,
          key1,
          {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
          }
        );

        // Encrypt with second key
        const key2 = key2Hex 
          ? CryptoJS.enc.Hex.parse(key2Hex) 
          : CryptoJS.enc.Hex.parse(key1Hex);
        
        const finalEncrypted = CryptoJS.DES.encrypt(decrypted, key2, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding
        });

        lastBlock = finalEncrypted.ciphertext.toString();
      }

      // Apply truncation
      return lastBlock.slice(0, truncateBytes * 2).toUpperCase();
    } catch (err) {
      throw new Error('MAC calculation failed: ' + (err as Error).message);
    }
  };

  // Handle calculate
  const handleCalculate = () => {
    setResult('');
    setError('');

    try {
      // Validate key K (16 hex chars for DES/3DES)
      if (!isValidHex(keyK, 16)) {
        throw new Error(t.mac.retail.error.invalidKeyK);
      }

      // Validate key K' if finalization is enabled or algorithm is 3DES
      if ((finalizeMethod === '3DES' || algorithm === '3DES') && keyKPrime) {
        if (!isValidHex(keyKPrime, 16)) {
          throw new Error(t.mac.retail.error.invalidKeyKPrime);
        }
      }

      // Validate data
      if (!isValidHex(data)) {
        throw new Error(t.mac.retail.error.invalidDataFormat);
      }
      if (data.length === 0) {
        throw new Error(t.mac.retail.error.emptyData);
      }

      // Validate truncation
      if (truncation < 1 || truncation > 8) {
        throw new Error(t.mac.retail.error.invalidTruncation);
      }

      // Calculate MAC
      const mac = calculateRetailMAC(algorithm, finalizeMethod, keyK, keyKPrime, data, truncation);
      setResult(mac);
      message.success(t.mac.retail.success);
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  // Handle copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.mac.retail.copied);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.mac.retail.title}
            </Title>
            <CollapsibleInfo title={t.mac.retail.title}>
              <div>{t.mac.retail.description}</div>
            </CollapsibleInfo>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

            {/* Algorithm Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.retail.algorithm}:
              </Text>
              <Segmented
                value={algorithm}
                onChange={(value) => setAlgorithm(value as 'DES' | '3DES')}
                options={[
                  { label: 'DES', value: 'DES' },
                  { label: '3DES', value: '3DES' }
                ]}
                block
              />
            </div>

            {/* Finalize Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.retail.finalize}:
              </Text>
              <Segmented
                value={finalizeMethod}
                onChange={(value) => setFinalizeMethod(value as 'None' | '3DES')}
                options={[
                  { label: 'None', value: 'None' },
                  { label: '3DES', value: '3DES' }
                ]}
                block
              />
            </div>

            {/* Key K Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.retail.keyK}:</Text>
              <Input
                value={keyK}
                onChange={(e) => setKeyK(e.target.value.toUpperCase())}
                placeholder={t.mac.retail.keyKPlaceholder || "0123456789ABCDEF"}
                maxLength={16}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Key K' Input (optional) */}
            {(finalizeMethod === '3DES' || algorithm === '3DES') && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.retail.keyKPrime}:</Text>
                <Input
                  value={keyKPrime}
                  onChange={(e) => setKeyKPrime(e.target.value.toUpperCase())}
                  placeholder={t.mac.retail.keyKPrimePlaceholder || "FEDCBA9876543210"}
                  maxLength={16}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
                />
              </div>
            )}

            {/* Data Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.retail.data}:
              </Text>
              <TextArea
                value={data}
                onChange={(e) => setData(e.target.value.toUpperCase())}
                placeholder={t.mac.retail.dataPlaceholder || "Enter hex data"}
                autoSize={{ minRows: 4, maxRows: 8 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Truncation Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.retail.truncation}:
              </Text>
              <Input
                type="number"
                value={truncation}
                onChange={(e) => setTruncation(parseInt(e.target.value) || 8)}
                min={1}
                max={8}
                placeholder={t.mac.retail.truncationPlaceholder || "1-8 bytes"}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Calculate Button */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />}
                onClick={handleCalculate}
                size="large"
              >
                {t.mac.retail.calculate}
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
                <ThunderboltOutlined />
                {' '}
                {t.mac.retail.result}
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
                onClick={() => handleCopy(result)}
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
              wordBreak: 'break-all',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              color: isDark ? '#95de64' : '#237804',
              fontWeight: 600
            }}>
              {result}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RetailMACTool;
