import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { CollapsibleInfo, ErrorCard, ExampleButton } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { webCryptoAesEncrypt, isWebCryptoAvailable } from '../../utils/webCrypto';
import { cmacAES } from '../../utils/crypto';
import { cleanHex, isValidHex, hexToWordArray, asciiToWordArray, getCryptoMode, getLengthColor } from '../../utils/hex';
import { examples } from '../../data/examples';

const { Title, Text } = Typography;
const { TextArea } = Input;

type AESAlgorithm = 'AES-128' | 'AES-192' | 'AES-256';
type AESMode = 'ECB' | 'CBC' | 'CFB' | 'OFB' | 'KCV';
type InputType = 'ASCII' | 'Hex';

// 默认 IV（16字节全0）
const DEFAULT_IV = '00000000000000000000000000000000';

// KCV 结果类型
interface KCVResult {
  sha256: string;
  cmac: string;
  aes: string;
}

const CipherTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [algorithm, setAlgorithm] = useState<AESAlgorithm>('AES-128');
  const [mode, setMode] = useState<AESMode>('ECB');
  const [inputType, setInputType] = useState<InputType>('Hex');
  const [key, setKey] = useState('');
  const [data, setData] = useState('');
  const [iv, setIv] = useState(DEFAULT_IV);
  const [result, setResult] = useState('');
  const [kcvResult, setKcvResult] = useState<KCVResult | null>(null);
  const [error, setError] = useState('');
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | 'kcv' | null>(null);

  const [useWebCrypto] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 是否需要 IV（ECB 和 KCV 模式不需要）
  const needsIv = mode !== 'ECB' && mode !== 'KCV';
  
  // KCV 模式下禁用 Data 输入
  const isKcvMode = mode === 'KCV';

  // 获取期望的密钥长度（字节数）
  const getExpectedKeyLength = (): number => {
    switch (algorithm) {
      case 'AES-128': return 16;
      case 'AES-192': return 24;
      case 'AES-256': return 32;
      default: return 16;
    }
  };

  // 获取 IV 长度（AES 块大小固定为 16 字节）
  const getExpectedIvLength = (): number => 16;

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

  // 验证输入
  const validateInputs = (forKcv: boolean = false): boolean => {
    setError('');
    
    // 验证密钥
    const cleanKey = cleanHex(key);
    if (!isValidHex(cleanKey)) {
      setError(t.cipher?.errorInvalidKeyHex || 'Key must be valid hexadecimal');
      return false;
    }
    
    const expectedKeyLen = getExpectedKeyLength();
    if (cleanKey.length / 2 !== expectedKeyLen) {
      setError((t.cipher?.errorKeyLength || 'Key length must be {length} bytes for {algorithm}')
        .replace('{length}', expectedKeyLen.toString())
        .replace('{algorithm}', algorithm));
      return false;
    }

    // KCV 模式不需要验证数据
    if (forKcv) {
      return true;
    }

    // 验证数据
    if (!data.trim()) {
      setError(t.cipher?.errorDataRequired || 'Data is required');
      return false;
    }
    
    if (inputType === 'Hex') {
      const cleanData = cleanHex(data);
      if (!isValidHex(cleanData)) {
        setError(t.cipher?.errorInvalidDataHex || 'Data must be valid hexadecimal');
        return false;
      }
      // 检查数据长度是否是 16 字节的倍数
      if (cleanData.length / 2 % 16 !== 0) {
        setError(t.cipher?.errorDataLength || 'Data length must be multiple of 16 bytes (current: ' + (cleanData.length / 2) + ' bytes)');
        return false;
      }
    }

    // 验证 IV（CBC/CFB/OFB 模式需要）
    if (needsIv) {
      const cleanIv = cleanHex(iv);
      if (!isValidHex(cleanIv)) {
        setError(t.cipher?.errorInvalidIvHex || 'IV must be valid hexadecimal');
        return false;
      }
      if (cleanIv.length / 2 !== getExpectedIvLength()) {
        setError((t.cipher?.errorIvLength || 'IV length must be {length} bytes')
          .replace('{length}', getExpectedIvLength().toString()));
        return false;
      }
    }

    return true;
  };

  // 🚀 使用 Web Crypto API 加密（硬件加速）
  const encryptWithWebCrypto = async (keyHex: string, dataHex: string, ivHex: string, cipherMode: AESMode): Promise<string | null> => {
    if (!isWebCryptoAvailable() || !useWebCrypto) return null;
    
    // Web Crypto 支持的模式映射 (ECB 不支持)
    const webCryptoModes: Record<string, 'AES-CBC' | 'AES-CTR' | 'AES-GCM'> = {
      'CBC': 'AES-CBC',
    };
    
    const webMode = webCryptoModes[cipherMode];
    if (!webMode) return null;
    
    try {
      return await webCryptoAesEncrypt(webMode, keyHex, dataHex, ivHex);
    } catch {
      return null;
    }
  };

  // 计算 KCV（三种方式）
  const handleCalculateKcv = () => {
    if (!validateInputs(true)) return;

    try {
      const cleanKey = cleanHex(key);
      const keyWordArray = hexToWordArray(cleanKey);
      const zero16 = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');

      // KCV (SHA256) - SHA256哈希前3字节
      const sha256Hash = CryptoJS.SHA256(keyWordArray);
      const kcvSha256 = sha256Hash.toString().toUpperCase().substring(0, 6);

      // KCV (CMAC) - 使用 AES-CMAC 计算
      const cmacResult = cmacAES(cleanKey, '00000000000000000000000000000000');
      const kcvCmac = cmacResult.substring(0, 6);

      // KCV (AES) - AES ECB 加密 16 字节 0
      const encryptedAes = CryptoJS.AES.encrypt(zero16, keyWordArray, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      const kcvAes = encryptedAes.ciphertext.toString().toUpperCase().substring(0, 6);

      setKcvResult({ sha256: kcvSha256, cmac: kcvCmac, aes: kcvAes });
      setResult('');
      setLastOperation('kcv');
    } catch (err) {
      setError((t.cipher?.errorKcvCalculation || 'KCV calculation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 加密
  const handleEncrypt = async () => {
    if (isKcvMode) {
      handleCalculateKcv();
      return;
    }
    
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

      // 🚀 尝试使用 Web Crypto API (CBC 模式)
      if (mode === 'CBC' && useWebCrypto && isWebCryptoAvailable()) {
        const cleanIv = cleanHex(iv);
        const webResult = await encryptWithWebCrypto(cleanKey, dataHex, cleanIv, mode);
        if (webResult) {
          setResult(webResult);
          setKcvResult(null);
          setLastOperation('encrypt');
          setIsProcessing(false);
          return;
        }
      }

      // 回退到 crypto-js
      const effectiveMode = isKcvMode ? 'ECB' : mode;
      const options: Record<string, unknown> = {
        mode: getCryptoMode(effectiveMode),
        padding: CryptoJS.pad.NoPadding,
      };

      if (needsIv) {
        options.iv = hexToWordArray(cleanHex(iv));
      }

      const encrypted = CryptoJS.AES.encrypt(dataWordArray, keyWordArray, options as object);
      setResult(encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase());
      setKcvResult(null);
      setLastOperation('encrypt');
    } catch (err) {
      setError((t.cipher?.errorEncryption || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
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
        setError(t.cipher?.errorInvalidCiphertext || 'Ciphertext must be valid hexadecimal');
        return;
      }

      const effectiveMode2 = isKcvMode ? 'ECB' : mode;
      const options: Record<string, unknown> = {
        mode: getCryptoMode(effectiveMode2),
        padding: CryptoJS.pad.NoPadding, // 使用 NoPadding
      };

      if (needsIv) {
        options.iv = hexToWordArray(cleanHex(iv));
      }

      // 创建 CipherParams 对象
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: hexToWordArray(cleanData),
      });

      const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWordArray, options as object);
      
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
      setKcvResult(null);
      setLastOperation('decrypt');
    } catch (err) {
      setError((t.cipher?.errorDecryption || 'Decryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
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
            {t.cipher?.title || 'AES Encryption/Decryption'}
          </Title>
            <CollapsibleInfo title={t.cipher?.aesInfo || 'AES Information'}>
              <div>• {t.cipher?.keyLengthInfo || `${algorithm} requires a ${getExpectedKeyLength()}-byte (${getExpectedKeyLength() * 8}-bit) key`}</div>
              {needsIv && (
                <div>• {t.cipher?.ivInfo || 'IV (Initialization Vector) must be 16 bytes'}</div>
              )}
              {mode === 'KCV' ? (
                <div>• {t.cipher?.kcvInfo || 'KCV: Encrypt zeros and take first 6 hex characters'}</div>
              ) : (
                <div>• {t.cipher?.noPaddingInfo || 'No padding - data length must be multiple of 16 bytes'}</div>
              )}
              {isWebCryptoAvailable() && mode === 'CBC' && useWebCrypto && (
                <div style={{ color: '#52c41a' }}>
                  <ThunderboltOutlined /> Web Crypto API 硬件加速已启用
                </div>
              )}
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.cipher?.description || 'Encrypt and decrypt data using AES algorithm with various modes'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* 算法选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.cipher?.algorithm || 'Algorithm'}:
              </Text>
              <Segmented
                value={algorithm}
                onChange={(value) => setAlgorithm(value as AESAlgorithm)}
                options={[
                  { label: 'AES-128', value: 'AES-128' },
                  { label: 'AES-192', value: 'AES-192' },
                  { label: 'AES-256', value: 'AES-256' },
                ]}
                block
              />
            </div>

            {/* 模式选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.cipher?.mode || 'Mode'}:
              </Text>
              <Segmented
                value={mode}
                onChange={(value) => setMode(value as AESMode)}
                options={[
                  { label: 'ECB', value: 'ECB' },
                  { label: 'CBC', value: 'CBC' },
                  { label: 'CFB', value: 'CFB' },
                  { label: 'OFB', value: 'OFB' },
                  { label: 'KCV', value: 'KCV' },
                ]}
                block
              />
            </div>

            {/* 输入类型选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8, color: isKcvMode ? '#999' : undefined }}>
                {t.cipher?.dataInput || 'Data Input'}:
              </Text>
              <Segmented
                value={inputType}
                onChange={(value) => setInputType(value as InputType)}
                options={[
                  { label: 'ASCII', value: 'ASCII' },
                  { label: t.cipher?.hexadecimal || 'Hexadecimal', value: 'Hex' },
                ]}
                block
                disabled={isKcvMode}
              />
            </div>

            {/* Key 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.cipher?.key || 'Key'}:</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ExampleButton onClick={() => {
                    setKey(examples.aes.key);
                    setData(examples.aes.data);
                  }} />
                  <Text style={{ 
                    fontSize: '12px', 
                    color: getLengthColor(getActualKeyLength(), getExpectedKeyLength()),
                    fontWeight: getActualKeyLength() > 0 ? 600 : 400
                  }}>
                    [{getActualKeyLength() || getExpectedKeyLength()}]
                  </Text>
                </div>
              </div>
              <Input
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={`${getExpectedKeyLength() * 2} ${t.cipher?.hexChars || 'hex characters'}`}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Data 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: isKcvMode ? '#999' : undefined }}>{t.cipher?.data || 'Data'}:</Text>
                {inputType === 'Hex' && !isKcvMode && (
                  <Text style={{ 
                    fontSize: '12px',
                    color: getActualDataLength() === 0 ? '#999' : 
                           (getActualDataLength() % 16 === 0 ? '#52c41a' : '#ff4d4f'),
                    fontWeight: getActualDataLength() > 0 ? 600 : 400
                  }}>
                    [{getActualDataLength()}]
                  </Text>
                )}
              </div>
              <TextArea
                value={isKcvMode ? '' : data}
                onChange={e => setData(e.target.value)}
                placeholder={isKcvMode 
                  ? (t.cipher?.kcvNoDataNeeded || 'No data needed for KCV calculation')
                  : (inputType === 'Hex' 
                    ? (t.cipher?.dataPlaceholderHex || 'Enter hexadecimal data')
                    : (t.cipher?.dataPlaceholderAscii || 'Enter ASCII text'))}
                autoSize={{ minRows: 3, maxRows: 8 }}
                style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  backgroundColor: isKcvMode ? '#f5f5f5' : undefined
                }}
                disabled={isKcvMode}
              />
              {isKcvMode && (
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                  {t.cipher?.kcvDataHint || 'KCV is calculated using zeros, no data input needed'}
                </Text>
              )}
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
                placeholder={`32 ${t.cipher?.hexChars || 'hex characters'} (16 bytes)`}
                disabled={!needsIv}
                style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  backgroundColor: needsIv ? undefined : '#f5f5f5'
                }}
              />
              {!needsIv && (
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: 4 }}>
                  {t.cipher?.ivNotRequired || 'IV is not required for ECB/KCV mode'}
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
                {mode === 'KCV' ? (t.cipher?.calculateKcv || 'Calculate KCV') : (t.cipher?.encrypt || 'Encrypt')}
              </Button>
              <Button 
                type="default" 
                icon={<UnlockOutlined />}
                onClick={handleDecrypt}
                size="large"
                disabled={mode === 'KCV'}
              >
                {t.cipher?.decrypt || 'Decrypt'}
              </Button>
            </div>
          </div>
        </Card>

        {/* 错误提示 */}
        {error && <ErrorCard error={error} />}

        {/* KCV 结果显示 */}
        {kcvResult && lastOperation === 'kcv' && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                <LockOutlined />
                {' '}
                {t.cipher?.kcvResult || 'KCV Result'}
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
          >
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10,
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 6,
                color: '#fff'
              }}>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>KCV (SHA256)</span>
                <span style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '1px'
                }}>
                  {kcvResult.sha256}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10,
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                borderRadius: 6,
                color: '#fff'
              }}>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>KCV (CMAC)</span>
                <span style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '1px'
                }}>
                  {kcvResult.cmac}
                </span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10,
                padding: '8px 14px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: 6,
                color: '#fff'
              }}>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>KCV (AES)</span>
                <span style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '1px'
                }}>
                  {kcvResult.aes}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* 加密/解密结果显示 */}
        {result && lastOperation !== 'kcv' && (
          <Card 
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                {lastOperation === 'encrypt' ? <LockOutlined /> : <UnlockOutlined />}
                {' '}
                {lastOperation === 'encrypt' 
                  ? (t.cipher?.encryptResult || 'Encrypted Result')
                  : (t.cipher?.decryptResult || 'Decrypted Result')}
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

export default CipherTool;

