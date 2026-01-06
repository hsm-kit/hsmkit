import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Select } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { workerDesEncrypt, isWorkerAvailable } from '../../utils/cryptoWorker';

const { Title, Text } = Typography;
const { TextArea } = Input;

type DESAlgorithm = 'DES' | '3DES';
type DESMode = 'ECB' | 'CBC' | 'CFB' | 'OFB';
type InputType = 'ASCII' | 'Hex';
type PaddingType = 'None' | 'Zeros' | 'Spaces' | 'PKCS5' | 'PKCS7' | 'ISO10126' | 'ANSIX923' | 'ISO7816' | 'Rijndael' | 'ISO9797M1' | 'ISO9797M2';

// 默认 IV（8字节全0，DES 块大小为 8 字节）
const DEFAULT_IV = '0000000000000000';

const DESTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [algorithm, setAlgorithm] = useState<DESAlgorithm>('3DES');
  const [mode, setMode] = useState<DESMode>('ECB');
  const [inputType, setInputType] = useState<InputType>('Hex');
  const [padding, setPadding] = useState<PaddingType>('ISO9797M1');
  const [key, setKey] = useState('');
  const [data, setData] = useState('');
  const [iv, setIv] = useState(DEFAULT_IV);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | null>(null);
  const [useWorker] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 是否需要 IV（ECB 模式不需要）
  const needsIv = mode !== 'ECB';

  // 获取期望的密钥长度（字节数）
  const getExpectedKeyLength = (): number => {
    if (algorithm === 'DES') return 8;
    return 16; // 3DES 使用 16 或 24 字节，这里默认 16
  };

  // 获取有效的密钥长度列表
  const getValidKeyLengths = (): number[] => {
    if (algorithm === 'DES') return [8];
    return [16, 24]; // 3DES
  };

  // 获取 IV 长度（DES 块大小固定为 8 字节）
  const getExpectedIvLength = (): number => 8;

  // 获取当前 Key 的实际字节数
  const getActualKeyLength = (): number => {
    const clean = cleanHex(key);
    return isValidHex(clean) ? clean.length / 2 : 0;
  };

  // 获取当前 Data 的实际字节数（仅 Hex 模式）
  const getActualDataLength = (): number => {
    if (inputType !== 'Hex') return 0;
    const clean = cleanHex(data);
    return isValidHex(clean) ? clean.length / 2 : 0;
  };

  // 获取当前 IV 的实际字节数
  const getActualIvLength = (): number => {
    const clean = cleanHex(iv);
    return isValidHex(clean) ? clean.length / 2 : 0;
  };

  // 获取长度指示器的颜色
  const getLengthColor = (actual: number, expected: number | number[], disabled: boolean = false): string => {
    if (disabled) return '#999';
    if (actual === 0) return '#999';
    if (Array.isArray(expected)) {
      if (expected.includes(actual)) return '#52c41a';
    } else {
      if (actual === expected) return '#52c41a';
    }
    return '#ff4d4f';
  };

  // 清理十六进制输入
  const cleanHex = (hex: string): string => {
    return hex.replace(/[\s\n\r]/g, '').toUpperCase();
  };

  // 验证十六进制
  const isValidHex = (hex: string): boolean => {
    return /^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0;
  };

  // 十六进制转 WordArray
  const hexToWordArray = (hex: string): CryptoJS.lib.WordArray => {
    return CryptoJS.enc.Hex.parse(hex);
  };

  // ASCII 转 WordArray
  const asciiToWordArray = (ascii: string): CryptoJS.lib.WordArray => {
    return CryptoJS.enc.Utf8.parse(ascii);
  };

  // 获取 CryptoJS 模式
  const getCryptoMode = () => {
    switch (mode) {
      case 'ECB': return CryptoJS.mode.ECB;
      case 'CBC': return CryptoJS.mode.CBC;
      case 'CFB': return CryptoJS.mode.CFB;
      case 'OFB': return CryptoJS.mode.OFB;
      default: return CryptoJS.mode.ECB;
    }
  };

  // 自定义 Spaces padding（用空格 0x20 填充）
  const SpacesPadding = {
    pad: function (data: CryptoJS.lib.WordArray, blockSize: number) {
      const blockSizeBytes = blockSize * 4;
      const nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
      const paddingWord = 0x20202020;
      const paddingWords = [];
      for (let i = 0; i < nPaddingBytes; i += 4) {
        paddingWords.push(paddingWord);
      }
      const padding = CryptoJS.lib.WordArray.create(paddingWords, nPaddingBytes);
      data.concat(padding);
    },
    unpad: function (data: CryptoJS.lib.WordArray) {
      const sigBytes = data.sigBytes;
      const dataWords = data.words;
      let i = sigBytes - 1;
      while (i >= 0) {
        const byte = (dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        if (byte !== 0x20) break;
        i--;
      }
      data.sigBytes = i + 1;
    }
  };

  // ISO 9797-1 Method 1 padding（用 0x00 填充）
  const ISO9797M1Padding = {
    pad: function (data: CryptoJS.lib.WordArray, blockSize: number) {
      const blockSizeBytes = blockSize * 4;
      const nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
      if (nPaddingBytes < blockSizeBytes) {
        const padding = CryptoJS.lib.WordArray.create([], nPaddingBytes);
        data.concat(padding);
      }
    },
    unpad: function (data: CryptoJS.lib.WordArray) {
      // Method 1 的 unpad 需要知道原始长度，这里简化处理
      const sigBytes = data.sigBytes;
      const dataWords = data.words;
      let i = sigBytes - 1;
      while (i >= 0) {
        const byte = (dataWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        if (byte !== 0x00) break;
        i--;
      }
      data.sigBytes = i + 1;
    }
  };

  // ISO 9797-1 Method 2 padding（先加 0x80，然后用 0x00 填充）- 与 ISO 7816-4 相同
  const ISO9797M2Padding = CryptoJS.pad.Iso97971;

  // Rijndael padding（与 Zero padding 相同，但在解密时不移除）
  const RijndaelPadding = CryptoJS.pad.ZeroPadding;

  // 获取 CryptoJS padding
  const getCryptoPadding = () => {
    switch (padding) {
      case 'None': return CryptoJS.pad.NoPadding;
      case 'Zeros': return CryptoJS.pad.ZeroPadding;
      case 'Spaces': return SpacesPadding;
      case 'PKCS5': return CryptoJS.pad.Pkcs7; // PKCS5 和 PKCS7 在实现上相同
      case 'PKCS7': return CryptoJS.pad.Pkcs7;
      case 'ISO10126': return CryptoJS.pad.Iso10126;
      case 'ANSIX923': return CryptoJS.pad.AnsiX923;
      case 'ISO7816': return CryptoJS.pad.Iso97971;
      case 'Rijndael': return RijndaelPadding;
      case 'ISO9797M1': return ISO9797M1Padding;
      case 'ISO9797M2': return ISO9797M2Padding;
      default: return CryptoJS.pad.Pkcs7;
    }
  };

  // Padding 选项
  const paddingOptions = [
    { label: 'None', value: 'None' },
    { label: 'Zeros', value: 'Zeros' },
    { label: 'Spaces', value: 'Spaces' },
    { label: 'ANSI X9.23', value: 'ANSIX923' },
    { label: 'ISO 10126', value: 'ISO10126' },
    { label: 'PKCS#5', value: 'PKCS5' },
    { label: 'PKCS#7', value: 'PKCS7' },
    { label: 'ISO 7816-4', value: 'ISO7816' },
    { label: 'Rijndael', value: 'Rijndael' },
    { label: 'ISO9797-1 (Padding method 1)', value: 'ISO9797M1' },
    { label: 'ISO9797-1 (Padding method 2)', value: 'ISO9797M2' },
  ];

  // Padding 说明
  const getPaddingDescription = (): string => {
    switch (padding) {
      case 'None': return t.des?.paddingNone || 'No padding';
      case 'Zeros': return t.des?.paddingZeros || 'Pad with 0x00';
      case 'Spaces': return t.des?.paddingSpaces || 'Pad with space 0x20';
      case 'ANSIX923': return t.des?.paddingANSIX923 || 'Last byte is padding length, rest filled with 0x00';
      case 'ISO10126': return t.des?.paddingISO10126 || 'Last byte is padding length, rest filled with random bytes';
      case 'PKCS5': return t.des?.paddingPKCS5 || 'Each padding byte value equals the padding length';
      case 'PKCS7': return t.des?.paddingPKCS7 || 'Same as PKCS#5';
      case 'ISO7816': return t.des?.paddingISO7816 || 'Add 0x80, then pad with 0x00';
      case 'Rijndael': return t.des?.paddingRijndael || 'Same as Zero padding';
      case 'ISO9797M1': return t.des?.paddingISO9797M1 || 'Pad with 0x00 to block size';
      case 'ISO9797M2': return t.des?.paddingISO9797M2 || 'Same as ISO 7816-4';
      default: return '';
    }
  };

  // 验证输入
  const validateInputs = (): boolean => {
    setError('');
    
    // 验证密钥
    const cleanKey = cleanHex(key);
    if (!isValidHex(cleanKey)) {
      setError(t.des?.errorInvalidKeyHex || 'Key must be valid hexadecimal');
      return false;
    }
    
    const validLengths = getValidKeyLengths();
    const keyLen = cleanKey.length / 2;
    if (!validLengths.includes(keyLen)) {
      if (algorithm === 'DES') {
        setError(t.des?.errorKeyLengthDes || 'DES key length must be 8 bytes');
      } else {
        setError(t.des?.errorKeyLength3Des || '3DES key length must be 16 or 24 bytes');
      }
      return false;
    }

    // 验证数据
    if (!data.trim()) {
      setError(t.des?.errorDataRequired || 'Data is required');
      return false;
    }
    
    if (inputType === 'Hex') {
      const cleanData = cleanHex(data);
      if (!isValidHex(cleanData)) {
        setError(t.des?.errorInvalidDataHex || 'Data must be valid hexadecimal');
        return false;
      }
      // 如果是 NoPadding，检查数据长度是否是 8 字节的倍数
      if (padding === 'None' && cleanData.length / 2 % 8 !== 0) {
        setError(t.des?.errorDataLength || 'Data length must be multiple of 8 bytes when using no padding');
        return false;
      }
    }

    // 验证 IV（CBC/CFB/OFB 模式需要）
    if (needsIv) {
      const cleanIv = cleanHex(iv);
      if (!isValidHex(cleanIv)) {
        setError(t.des?.errorInvalidIvHex || 'IV must be valid hexadecimal');
        return false;
      }
      if (cleanIv.length / 2 !== getExpectedIvLength()) {
        setError((t.des?.errorIvLength || 'IV length must be {length} bytes').replace('{length}', '8'));
        return false;
      }
    }

    return true;
  };

  // 加密
  const handleEncrypt = async () => {
    if (!validateInputs()) return;

    setIsProcessing(true);
    try {
      const cleanKey = cleanHex(key);
      const keyWordArray = hexToWordArray(cleanKey);
      
      let dataWordArray: CryptoJS.lib.WordArray;
      let dataHex: string;
      if (inputType === 'Hex') {
        dataHex = cleanHex(data);
        dataWordArray = hexToWordArray(dataHex);
      } else {
        dataWordArray = asciiToWordArray(data);
        dataHex = dataWordArray.toString(CryptoJS.enc.Hex);
      }

      // 🚀 尝试使用 Web Worker 后台计算 (ECB/CBC 模式, NoPadding)
      if (useWorker && isWorkerAvailable() && padding === 'None' && (mode === 'ECB' || mode === 'CBC')) {
        try {
          const cleanIv = needsIv ? cleanHex(iv) : undefined;
          const workerResult = await workerDesEncrypt(cleanKey, dataHex, mode, cleanIv);
          setResult(workerResult);
          setLastOperation('encrypt');
          setIsProcessing(false);
          return;
        } catch {
          // Worker 失败，回退到主线程
        }
      }

      // 回退到 crypto-js
      const options: Record<string, unknown> = {
        mode: getCryptoMode(),
        padding: getCryptoPadding(),
      };

      if (needsIv) {
        options.iv = hexToWordArray(cleanHex(iv));
      }

      let encrypted;
      if (algorithm === 'DES') {
        encrypted = CryptoJS.DES.encrypt(dataWordArray, keyWordArray, options as object);
      } else {
        encrypted = CryptoJS.TripleDES.encrypt(dataWordArray, keyWordArray, options as object);
      }
      
      setResult(encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase());
      setLastOperation('encrypt');
    } catch (err) {
      setError((t.des?.errorEncryption || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // 解密
  const handleDecrypt = () => {
    if (!validateInputs()) return;

    try {
      const cleanKey = cleanHex(key);
      const keyWordArray = hexToWordArray(cleanKey);
      
      // 解密时数据必须是十六进制
      const cleanData = cleanHex(data);
      if (!isValidHex(cleanData)) {
        setError(t.des?.errorInvalidCiphertext || 'Ciphertext must be valid hexadecimal');
        return;
      }

      const options: Record<string, unknown> = {
        mode: getCryptoMode(),
        padding: getCryptoPadding(),
      };

      if (needsIv) {
        options.iv = hexToWordArray(cleanHex(iv));
      }

      // 创建 CipherParams 对象
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: hexToWordArray(cleanData),
      });

      let decrypted;
      if (algorithm === 'DES') {
        decrypted = CryptoJS.DES.decrypt(cipherParams, keyWordArray, options as object);
      } else {
        decrypted = CryptoJS.TripleDES.decrypt(cipherParams, keyWordArray, options as object);
      }
      
      // 根据输入类型输出结果
      if (inputType === 'Hex') {
        setResult(decrypted.toString(CryptoJS.enc.Hex).toUpperCase());
      } else {
        try {
          setResult(decrypted.toString(CryptoJS.enc.Utf8));
        } catch {
          // 如果 UTF-8 解码失败，显示十六进制
          setResult(decrypted.toString(CryptoJS.enc.Hex).toUpperCase());
        }
      }
      setLastOperation('decrypt');
    } catch (err) {
      setError((t.des?.errorDecryption || 'Decryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 复制结果
  const copyResult = () => {
    navigator.clipboard.writeText(result);
    message.success(t.common.copied);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.des?.title || 'DES / 3DES Encryption/Decryption'}
          </Title>
            <CollapsibleInfo title={t.des?.desInfo || 'DES/3DES Information'}>
              <div>• {algorithm === 'DES' 
                ? (t.des?.keyLengthInfoDes || 'DES requires an 8-byte (64-bit) key')
                : (t.des?.keyLengthInfo3Des || '3DES requires a 16 or 24-byte key')
              }</div>
              {needsIv && (
                <div>• {t.des?.ivInfo || 'IV (Initialization Vector) must be 8 bytes'}</div>
              )}
              <div>• {t.des?.blockSizeInfo || 'Block size is 8 bytes'}</div>
              {isWorkerAvailable() && useWorker && padding === 'None' && (mode === 'ECB' || mode === 'CBC') && (
                <div style={{ color: '#52c41a', marginTop: 8 }}>
                  <ThunderboltOutlined /> Web Worker 后台计算已启用
                </div>
              )}
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.des?.description || 'Encrypt and decrypt data using DES or 3DES algorithm with various modes'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* 算法选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.des?.algorithm || 'Algorithm'}:
              </Text>
              <Segmented
                value={algorithm}
                onChange={(value) => {
                  setAlgorithm(value as DESAlgorithm);
                  setKey(''); // 切换算法时清空密钥
                }}
                options={[
                  { label: 'DES', value: 'DES' },
                  { label: '3DES', value: '3DES' },
                ]}
                block
              />
            </div>

            {/* 模式选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.des?.mode || 'Mode'}:
              </Text>
              <Segmented
                value={mode}
                onChange={(value) => setMode(value as DESMode)}
                options={[
                  { label: 'ECB', value: 'ECB' },
                  { label: 'CBC', value: 'CBC' },
                  { label: 'CFB', value: 'CFB' },
                  { label: 'OFB', value: 'OFB' },
                ]}
                block
              />
            </div>

            {/* 输入类型选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.des?.dataInput || 'Data Input'}:
              </Text>
              <Segmented
                value={inputType}
                onChange={(value) => setInputType(value as InputType)}
                options={[
                  { label: 'ASCII', value: 'ASCII' },
                  { label: t.des?.hexadecimal || 'Hexadecimal', value: 'Hex' },
                ]}
                block
              />
            </div>

            {/* Padding 选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.des?.padding || 'Padding'}:
              </Text>
              <Select
                value={padding}
                onChange={(value) => setPadding(value as PaddingType)}
                options={paddingOptions}
                style={{ width: '100%' }}
              />
              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                {getPaddingDescription()}
              </Text>
            </div>

            {/* Key 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.des?.key || 'Key'}:</Text>
                <Text style={{ 
                  fontSize: '12px', 
                  color: getLengthColor(getActualKeyLength(), getValidKeyLengths()),
                  fontWeight: getActualKeyLength() > 0 ? 600 : 400
                }}>
                  [{getActualKeyLength() || getExpectedKeyLength()}]
                </Text>
              </div>
              <Input
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={algorithm === 'DES' 
                  ? `16 ${t.des?.hexChars || 'hex characters'} (8 bytes)`
                  : `32/48 ${t.des?.hexChars || 'hex characters'} (16/24 bytes)`
                }
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Data 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.des?.data || 'Data'}:</Text>
                {inputType === 'Hex' && (
                  <Text style={{ 
                    fontSize: '12px',
                    color: getActualDataLength() === 0 ? '#999' : 
                           (padding === 'None' ? (getActualDataLength() % 8 === 0 ? '#52c41a' : '#ff4d4f') : '#52c41a'),
                    fontWeight: getActualDataLength() > 0 ? 600 : 400
                  }}>
                    [{getActualDataLength()}]
                  </Text>
                )}
              </div>
              <TextArea
                value={data}
                onChange={e => setData(e.target.value)}
                placeholder={inputType === 'Hex' 
                  ? (t.des?.dataPlaceholderHex || 'Enter hexadecimal data')
                  : (t.des?.dataPlaceholderAscii || 'Enter ASCII text')}
                autoSize={{ minRows: 3, maxRows: 8 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* IV 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: needsIv ? undefined : '#999' }}>IV:</Text>
                <Text style={{ 
                  fontSize: '12px',
                  color: getLengthColor(getActualIvLength(), getExpectedIvLength(), !needsIv),
                  fontWeight: needsIv && getActualIvLength() > 0 ? 600 : 400
                }}>
                  [{needsIv ? (getActualIvLength() || getExpectedIvLength()) : getExpectedIvLength()}]
                </Text>
              </div>
              <Input
                value={iv}
                onChange={e => setIv(e.target.value)}
                placeholder={`16 ${t.des?.hexChars || 'hex characters'} (8 bytes)`}
                disabled={!needsIv}
                style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  backgroundColor: needsIv ? undefined : '#f5f5f5'
                }}
              />
              {!needsIv && (
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                  {t.des?.ivNotRequired || 'IV is not required for ECB mode'}
                </Text>
              )}
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<LockOutlined />}
                onClick={handleEncrypt}
                size="large"
                loading={isProcessing}
              >
                {t.des?.encrypt || 'Encrypt'}
              </Button>
              <Button 
                type="default" 
                icon={<UnlockOutlined />}
                onClick={handleDecrypt}
                size="large"
              >
                {t.des?.decrypt || 'Decrypt'}
              </Button>
            </div>
          </div>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* 结果显示 */}
        {result && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                {lastOperation === 'encrypt' ? <LockOutlined /> : <UnlockOutlined />}
                {' '}
                {lastOperation === 'encrypt' 
                  ? (t.des?.encryptResult || 'Encrypted Result')
                  : (t.des?.decryptResult || 'Decrypted Result')}
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
                onClick={copyResult}
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

export default DESTool;

