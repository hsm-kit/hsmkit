import React, { useState } from 'react';
import { Card, Input, Button, Segmented, Select, message, Typography, Divider } from 'antd';
import { ThunderboltOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo, ResultCard, ErrorCard, ExampleButton } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { isValidHex } from '../../utils/hex';
import { examples } from '../../data/examples';

const { TextArea } = Input;
const { Title, Text } = Typography;

type HashType =
  | 'MD5'
  | 'SHA-1'
  | 'SHA-224'
  | 'SHA-256'
  | 'SHA-384'
  | 'SHA-512'
  ;
type InputType = 'ASCII' | 'Hexadecimal';

const HMACTool: React.FC = () => {
  const { t } = useLanguage();
  useTheme();
  const [hashType, setHashType] = useState<HashType>('SHA-256');
  const [keyType, setKeyType] = useState<InputType>('Hexadecimal');
  const [keyInput, setKeyInput] = useState<string>('');
  const [dataType, setDataType] = useState<InputType>('Hexadecimal');
  const [dataInput, setDataInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Calculate HMAC
  const calculateHMAC = (
    hash: HashType,
    keyStr: string,
    keyIsHex: boolean,
    dataStr: string,
    dataIsHex: boolean
  ): string => {
    try {
      // Parse key
      const key = keyIsHex ? CryptoJS.enc.Hex.parse(keyStr) : CryptoJS.enc.Utf8.parse(keyStr);

      // Parse data
      const data = dataIsHex ? CryptoJS.enc.Hex.parse(dataStr) : CryptoJS.enc.Utf8.parse(dataStr);

      // Calculate HMAC based on hash type
      let hmac: CryptoJS.lib.WordArray;
      switch (hash) {
        case 'SHA-1':
          hmac = CryptoJS.HmacSHA1(data, key);
          break;
        case 'SHA-224':
          hmac = CryptoJS.HmacSHA224(data, key);
          break;
        case 'SHA-256':
          hmac = CryptoJS.HmacSHA256(data, key);
          break;
        case 'SHA-384':
          hmac = CryptoJS.HmacSHA384(data, key);
          break;
        case 'SHA-512':
          hmac = CryptoJS.HmacSHA512(data, key);
          break;
        case 'MD5':
          hmac = CryptoJS.HmacMD5(data, key);
          break;
        default:
          throw new Error('Selected hash algorithm is not supported in this build');
      }

      return hmac.toString().toUpperCase();
    } catch (err) {
      throw new Error('HMAC calculation failed: ' + (err as Error).message);
    }
  };

  // Handle calculate
  const handleCalculate = () => {
    setResult('');
    setError('');

    try {
      // Validate key
      if (!keyInput) {
        throw new Error(t.mac?.hmac?.error?.emptyKey);
      }
      if (keyType === 'Hexadecimal' && !isValidHex(keyInput)) {
        throw new Error(t.mac?.hmac?.error?.invalidKeyFormat);
      }

      // Validate data
      if (!dataInput) {
        throw new Error(t.mac?.hmac?.error?.emptyData);
      }
      if (dataType === 'Hexadecimal' && !isValidHex(dataInput)) {
        throw new Error(t.mac?.hmac?.error?.invalidDataFormat);
      }

      // Calculate HMAC
      const hmac = calculateHMAC(
        hashType,
        keyInput,
        keyType === 'Hexadecimal',
        dataInput,
        dataType === 'Hexadecimal'
      );
      setResult(hmac);
      message.success(t.mac?.hmac?.success);
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      message.error(errorMsg);
    }
  };

  // Handle copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.mac?.hmac?.copied);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.mac?.hmac?.title}
            </Title>
            <CollapsibleInfo title={t.mac?.hmac?.infoTitle || 'About HMAC'}>
              <div>{t.mac?.hmac?.info || 'HMAC (Hash-based Message Authentication Code) combines a cryptographic hash function with a secret key to provide data integrity and authentication.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.mac?.hmac?.description || 'Calculate Hash-based Message Authentication Code.'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

            {/* Hash Type Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.mac?.hmac?.hashType}:
                </Text>
                <Select
                  value={hashType}
                  onChange={(value) => setHashType(value as HashType)}
                  showSearch
                  optionFilterProp="children"
                  style={{ width: '100%' }}
                  options={[
                    { label: 'MD5', value: 'MD5' },
                    { label: 'SHA-1', value: 'SHA-1' },
                    { label: 'SHA-224', value: 'SHA-224' },
                    { label: 'SHA-256', value: 'SHA-256' },
                    { label: 'SHA-384', value: 'SHA-384' },
                    { label: 'SHA-512', value: 'SHA-512' },
                  ]}
                />
            </div>

            {/* Key Input Type */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.mac?.hmac?.inputTypeLabel}:</Text>
                <ExampleButton onClick={() => {
                  setKeyInput(examples.hmac.key);
                  setDataInput(examples.hmac.data);
                }} />
              </div>
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
                {t.mac?.hmac?.hmacKey}:
              </Text>
              <TextArea
                value={keyInput}
                onChange={(e) => setKeyInput(keyType === 'Hexadecimal' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={keyType === 'Hexadecimal' ? t.mac?.hmac?.keyPlaceholderHex : t.mac?.hmac?.keyPlaceholderAscii}
                autoSize={{ minRows: 3, maxRows: 6 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Data Input Type */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.mac?.hmac?.inputTypeLabel}:
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
                {t.mac?.hmac?.data}:
              </Text>
              <TextArea
                value={dataInput}
                onChange={(e) => setDataInput(dataType === 'Hexadecimal' ? e.target.value.toUpperCase() : e.target.value)}
                placeholder={dataType === 'Hexadecimal' ? t.mac?.hmac?.dataPlaceholderHex : t.mac?.hmac?.dataPlaceholderAscii}
                autoSize={{ minRows: 4, maxRows: 8 }}
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
                {t.mac?.hmac?.calculate}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && <ErrorCard error={error} />}

        {/* Result Display */}
        {result && (
          <ResultCard
            title={t.mac?.hmac?.result}
            result={result}
            onCopy={() => handleCopy(result)}
            icon={<ThunderboltOutlined />}
          />
        )}
      </div>
    </div>
  );
};

export default HMACTool;
