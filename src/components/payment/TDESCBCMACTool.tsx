import React, { useState } from 'react';
import { Card, Input, Button, Segmented, message, Typography, Divider } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo, ResultCard } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { TextArea } = Input;
const { Title, Text } = Typography;

const TDESCBCMACTool: React.FC = () => {
  const { t } = useLanguage();
  const [algorithm, setAlgorithm] = useState<string>('TDES-CBC-MAC');
  const [keyK, setKeyK] = useState<string>('');
  const [padding, setPadding] = useState<string>('ISO9797-1-2');
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

  // Apply padding
  const applyPadding = (dataHex: string, method: string): string => {
    const dataBytes = CryptoJS.enc.Hex.parse(dataHex);
    const blockSize = 8; // DES block size in bytes
    const dataLength = dataBytes.sigBytes;
    const paddingLength = blockSize - (dataLength % blockSize);

    if (paddingLength === 0 || paddingLength === blockSize) {
      if (method === 'ISO9797-1-1') {
        // Method 1: Add full block of zeros
        const padding = CryptoJS.lib.WordArray.create(new Array(blockSize).fill(0), blockSize);
        return dataBytes.concat(padding).toString();
      } else if (method === 'ISO9797-1-2') {
        // Method 2: Add 0x80 followed by zeros
        const paddingBytes = new Uint8Array(blockSize);
        paddingBytes[0] = 0x80;
        const padding = CryptoJS.lib.WordArray.create(Array.from(paddingBytes) as number[], blockSize);
        return dataBytes.concat(padding).toString();
      }
    }

    if (method === 'ISO9797-1-1') {
      // Method 1: Pad with zeros
      const paddingBytes = new Uint8Array(paddingLength).fill(0);
      const padding = CryptoJS.lib.WordArray.create(Array.from(paddingBytes) as number[], paddingLength);
      return dataBytes.concat(padding).toString();
    } else if (method === 'ISO9797-1-2') {
      // Method 2: Pad with 0x80 followed by zeros
      const paddingBytes = new Uint8Array(paddingLength);
      paddingBytes[0] = 0x80;
      const padding = CryptoJS.lib.WordArray.create(Array.from(paddingBytes) as number[], paddingLength);
      return dataBytes.concat(padding).toString();
    }

    return dataHex;
  };

  // Calculate TDES CBC-MAC
  const calculateTDESCBCMAC = (
    keyHex: string,
    dataHex: string,
    paddingMethod: string,
    truncateBytes: number
  ): string => {
    try {
      // Apply padding
      const paddedData = applyPadding(dataHex, paddingMethod);
      
      // Parse key and data
      const key = CryptoJS.enc.Hex.parse(keyHex);
      const plaintext = CryptoJS.enc.Hex.parse(paddedData);

      // Perform Triple DES encryption in CBC mode with zero IV
      const iv = CryptoJS.lib.WordArray.create([0, 0], 8);
      const encrypted = CryptoJS.TripleDES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.NoPadding
      });

      // Get the last block (8 bytes = 16 hex characters)
      const ciphertext = encrypted.ciphertext.toString();
      const lastBlock = ciphertext.slice(-16);

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
      // Validate key (48 hex chars for 3DES, or 32 for 2DES)
      if (!isValidHex(keyK)) {
        throw new Error(t.mac.tdescbc.error.invalidKeyFormat);
      }
      if (keyK.length !== 32 && keyK.length !== 48) {
        throw new Error(t.mac.tdescbc.error.invalidKeyLength);
      }

      // Validate data
      if (!isValidHex(data)) {
        throw new Error(t.mac.tdescbc.error.invalidDataFormat);
      }
      if (data.length === 0) {
        throw new Error(t.mac.tdescbc.error.emptyData);
      }

      // Validate truncation
      if (truncation < 1 || truncation > 8) {
        throw new Error(t.mac.tdescbc.error.invalidTruncation);
      }

      // Calculate MAC
      const mac = calculateTDESCBCMAC(keyK, data, padding, truncation);
      setResult(mac);
      message.success(t.mac.tdescbc.success);
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  // Handle copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.mac.tdescbc.copied);
  };

  useTheme();

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.mac.tdescbc.title}
            </Title>
            <CollapsibleInfo title={t.mac.tdescbc.infoTitle || 'About TDES CBC-MAC'}>
              <div>{t.mac.tdescbc.info || 'Calculate MAC using Triple DES in CBC mode with ISO 9797-1 padding'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.mac.tdescbc.description}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

            {/* Algorithm Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.tdescbc.algorithm}:
              </Text>
              <Segmented
                value={algorithm}
                onChange={(value) => setAlgorithm(value as string)}
                options={[
                  { label: 'TDES CBC-MAC', value: 'TDES-CBC-MAC' }
                ]}
                block
              />
            </div>

            {/* Key Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.mac.tdescbc.keyK}:</Text>
              <Input
                value={keyK}
                onChange={(e) => setKeyK(e.target.value.toUpperCase())}
                placeholder="Enter 48 hex characters (3DES) or 32 hex characters (2DES)"
                maxLength={48}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Padding Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.tdescbc.padding}:
              </Text>
              <Segmented
                value={padding}
                onChange={(value) => setPadding(value as string)}
                options={[
                  { label: 'ISO9797-1 Method 1', value: 'ISO9797-1-1' },
                  { label: 'ISO9797-1 Method 2', value: 'ISO9797-1-2' }
                ]}
                block
              />
            </div>

            {/* Data Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.tdescbc.data}:
              </Text>
              <TextArea
                value={data}
                onChange={(e) => setData(e.target.value.toUpperCase())}
                placeholder="Enter hex data"
                autoSize={{ minRows: 4, maxRows: 8 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Truncation Input */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac.tdescbc.truncation}:
              </Text>
              <Input
                type="number"
                value={truncation}
                onChange={(e) => setTruncation(parseInt(e.target.value) || 8)}
                min={1}
                max={8}
                placeholder="1-8 bytes"
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
                {t.mac.tdescbc.calculate}
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
            title={t.mac.tdescbc.result}
            result={result}
            onCopy={() => handleCopy(result)}
            icon={<ThunderboltOutlined />}
          />
        )}
      </div>
    </div>
  );
};

export default TDESCBCMACTool;
