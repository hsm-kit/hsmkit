import React, { useState } from 'react';
import { Card, Button, message, Divider, Tag, Typography, Tabs, Input, Space, Alert, Segmented } from 'antd';
import { KeyOutlined, CopyOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, ClearOutlined, ThunderboltOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';
import { 
  calculateKCV, 
  combineKeyComponents, 
  validateKey,
  cleanHexInput 
} from '../../utils/crypto';
import { formatHexDisplay } from '../../utils/format';
import { webCryptoRandomBytes, isWebCryptoAvailable } from '../../utils/webCrypto';

const { Title, Text } = Typography;
const { TextArea } = Input;

const KeyGenerator: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Tab 1: 密钥生成
  const [length, setLength] = useState(16);
  const [generatedKey, setGeneratedKey] = useState('');
  const [checkValue, setCheckValue] = useState<{des?: string; aes?: string}>({});

  // Tab 2: 密钥合成
  const [components, setComponents] = useState(['', '']);
  const [combinedKey, setCombinedKey] = useState('');
  const [combineError, setCombineError] = useState('');
  const [componentKCVs, setComponentKCVs] = useState<Array<{des?: string; aes?: string}>>([]);
  const [combinedKCV, setCombinedKCV] = useState<{des?: string; aes?: string}>({});

  // Tab 3: 密钥校验
  const [validationInput, setValidationInput] = useState('');
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateKey> | null>(null);

  // Note: Results are now cleared when length changes via the onChange handler

  // 密钥生成
  const handleGenerate = () => {
    let keyHex: string;
    
    // 🚀 优先使用 Web Crypto API 生成随机数（更安全更快）
    if (isWebCryptoAvailable()) {
      keyHex = webCryptoRandomBytes(length);
    } else {
      const randomWord = CryptoJS.lib.WordArray.random(length);
      keyHex = randomWord.toString().toUpperCase();
    }
    
    setGeneratedKey(keyHex);

    const kcvResult: {des?: string; aes?: string} = {};
    
    // 16或24字节：同时计算DES和AES
    if (length === 16 || length === 24) {
      try {
        kcvResult.des = calculateKCV(keyHex, { algorithm: 'DES' });
      } catch {
        kcvResult.des = 'ERROR';
      }
      try {
        kcvResult.aes = calculateKCV(keyHex, { algorithm: 'AES' });
      } catch {
        kcvResult.aes = 'ERROR';
      }
    } 
    // 32字节：只计算AES
    else if (length === 32) {
      try {
        kcvResult.aes = calculateKCV(keyHex, { algorithm: 'AES' });
      } catch {
        kcvResult.aes = 'ERROR';
      }
    }
    
    setCheckValue(kcvResult);
  };

  const copyToClipboard = (text: string) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // 密钥合成
  const handleCombine = () => {
    setCombineError('');
    setCombinedKey('');
    setComponentKCVs([]);
    setCombinedKCV({});
    
    const filledComponents = components.filter(c => c.trim() !== '');
    
    if (filledComponents.length < 2) {
      setCombineError(t.keyGenerator.errorMinComponents);
      return;
    }

    // 验证每个分量的长度
    const validLengths = [16, 32, 48, 64];
    for (let i = 0; i < filledComponents.length; i++) {
      const cleanComp = cleanHexInput(filledComponents[i]);
      if (!validLengths.includes(cleanComp.length)) {
        setCombineError(`${t.keyGenerator.component} ${i + 1}: ${t.keyGenerator.errorComponentLength2} (16/32/48/64)`);
        return;
      }
    }

    try {
      // 计算每个分量的KCV (16和24字节同时计算DES和AES，32字节只计算AES)
      const kcvs = filledComponents.map(comp => {
        const cleaned = cleanHexInput(comp);
        const keyBytes = cleaned.length / 2;
        const kcvResult: {des?: string; aes?: string} = {};
        
        // 16或24字节：同时计算DES和AES
        if (keyBytes === 16 || keyBytes === 24) {
          try {
            kcvResult.des = calculateKCV(cleaned, { algorithm: 'DES' });
          } catch {
            kcvResult.des = 'ERROR';
          }
          try {
            kcvResult.aes = calculateKCV(cleaned, { algorithm: 'AES' });
          } catch {
            kcvResult.aes = 'ERROR';
          }
        } 
        // 32字节：只计算AES
        else if (keyBytes === 32) {
          try {
            kcvResult.aes = calculateKCV(cleaned, { algorithm: 'AES' });
          } catch {
            kcvResult.aes = 'ERROR';
          }
        }
        
        return kcvResult;
      });
      setComponentKCVs(kcvs);

      // 合成密钥
      const result = combineKeyComponents(filledComponents);
      setCombinedKey(result);

      // 计算合成密钥的KCV
      const resultBytes = result.length / 2;
      const combinedKcvResult: {des?: string; aes?: string} = {};
      
      if (resultBytes === 16 || resultBytes === 24) {
        try {
          combinedKcvResult.des = calculateKCV(result, { algorithm: 'DES' });
        } catch {
          combinedKcvResult.des = 'ERROR';
        }
        try {
          combinedKcvResult.aes = calculateKCV(result, { algorithm: 'AES' });
        } catch {
          combinedKcvResult.aes = 'ERROR';
        }
      } else if (resultBytes === 32) {
        try {
          combinedKcvResult.aes = calculateKCV(result, { algorithm: 'AES' });
        } catch {
          combinedKcvResult.aes = 'ERROR';
        }
      }
      
      setCombinedKCV(combinedKcvResult);
    } catch (err) {
      setCombineError(err instanceof Error ? err.message : 'Combination failed');
    }
  };

  const addComponent = () => {
    if (components.length >= 9) {
      message.warning(t.keyGenerator.errorMaxComponents);
      return;
    }
    setComponents([...components, '']);
  };

  const removeComponent = (index: number) => {
    if (components.length <= 2) return;
    const newComponents = components.filter((_, i) => i !== index);
    setComponents(newComponents);
  };

  const updateComponent = (index: number, value: string) => {
    const newComponents = [...components];
    newComponents[index] = value;
    setComponents(newComponents);
  };

  const clearAllComponents = () => {
    setComponents(['', '']);
    setCombinedKey('');
    setCombineError('');
    setComponentKCVs([]);
    setCombinedKCV({});
  };

  // 获取分量长度和状态
  const getComponentLengthInfo = (value: string) => {
    if (!value.trim()) return { length: 0, valid: false, show: false };
    const clean = cleanHexInput(value);
    const hexLength = clean.length;
    const validLengths = [16, 32, 48, 64];
    return {
      length: hexLength,
      valid: validLengths.includes(hexLength),
      show: true
    };
  };

  // 密钥校验
  const handleValidate = () => {
    setValidationResult(null);
    
    try {
      const result = validateKey(validationInput);
      setValidationResult(result);
    } catch {
      message.error('Validation failed');
    }
  };

  const tabItems = [
    {
      key: '1',
      label: t.keyGenerator.tabKeyGen,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.keyGenerator.keyLength}:
              </Text>
            <Segmented
              value={length}
              onChange={(value) => setLength(value as number)}
              options={[
                { 
                  label: (
                    <div style={{ padding: '8px 0', lineHeight: '1.4' }}>
                      <div>16 {t.keyGenerator.bytes}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>(128-{t.keyGenerator.bits})</div>
                    </div>
                  ), 
                  value: 16 
                },
                { 
                  label: (
                    <div style={{ padding: '8px 0', lineHeight: '1.4' }}>
                      <div>24 {t.keyGenerator.bytes}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>(192-{t.keyGenerator.bits})</div>
                    </div>
                  ), 
                  value: 24 
                },
                { 
                  label: (
                    <div style={{ padding: '8px 0', lineHeight: '1.4' }}>
                      <div>32 {t.keyGenerator.bytes}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>(256-{t.keyGenerator.bits})</div>
                    </div>
                  ), 
                  value: 32 
                }
              ]}
              block
              size="large"
            />
                    </div>
          
            <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={handleGenerate} 
                size="large"
              >
                {t.keyGenerator.generateNow}
              </Button>
            </div>

        {generatedKey && (
            <div style={{ 
              background: isDark 
                ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              padding: '20px', 
              borderRadius: '12px', 
              border: isDark ? '1px solid #274916' : '2px solid #95de64',
              boxShadow: isDark 
                ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
                : '0 4px 16px rgba(82, 196, 26, 0.2)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: '13px', color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  {t.keyGenerator.generatedKey}
                </Text>
                <Button 
                  type={isDark ? 'primary' : 'default'}
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(generatedKey)}
                  style={{
                    background: isDark ? '#52c41a' : undefined,
                    borderColor: '#52c41a',
                    color: isDark ? '#fff' : '#52c41a',
                  }}
                >
                  {t.common.copy}
                </Button>
              </div>
              <div style={{ 
                background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                padding: '16px',
                borderRadius: '8px',
                border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                fontSize: 'clamp(16px, 4vw, 22px)',
                letterSpacing: '1px', 
                color: isDark ? '#95de64' : '#237804',
                wordBreak: 'break-all',
                lineHeight: '1.6',
                fontWeight: 600,
              }}>
                {formatHexDisplay(generatedKey)}
              </div>
              
              <Divider style={{ margin: '16px 0', borderColor: isDark ? '#3c5a24' : '#b7eb8f' }} />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                {checkValue.des && (
                  <Tag color="green">3DES KCV: {checkValue.des}</Tag>
                )}
                {checkValue.aes && (
                  <Tag color="blue">AES KCV: {checkValue.aes}</Tag>
                )}
                <Tag color="purple">{t.keyGenerator.length}: {length} {t.keyGenerator.bytes}</Tag>
                <Tag color="cyan">{t.keyGenerator.bits}: {length * 8}</Tag>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '2',
      label: t.keyGenerator.tabCombination,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {t.keyGenerator.combinationDesc}
            </Text>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {components.map((comp, index) => {
              const lengthInfo = getComponentLengthInfo(comp);
              return (
                <div key={index}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                    <Text strong style={{ minWidth: 80 }}>
                      {t.keyGenerator.component} {index + 1}:
                    </Text>
                    {components.length > 2 && (
                      <Button 
                        type="text" 
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeComponent(index)}
                      />
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Input
                      value={comp}
                      onChange={e => updateComponent(index, e.target.value)}
                      placeholder="0123456789ABCDEF..."
                      status={comp.trim() && !lengthInfo.valid ? 'error' : ''}
                      style={{ 
                        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                        paddingRight: lengthInfo.show ? 50 : undefined
                      }}
                    />
                    {lengthInfo.show && (
                      <div style={{ 
                        position: 'absolute', 
                        right: 12, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: lengthInfo.valid ? '#52c41a' : '#ff4d4f'
                      }}>
                        {lengthInfo.length}
                      </div>
                    )}
                  </div>
                  {comp.trim() && !lengthInfo.valid && (
                    <Text type="danger" style={{ fontSize: '11px', marginTop: 2, display: 'block' }}>
                      {t.keyGenerator.errorComponentLength2} 16/32/48/64
                    </Text>
                  )}
                </div>
              );
            })}
          </Space>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4, alignItems: 'center' }}>
            <Button 
              icon={<PlusOutlined />}
              onClick={addComponent}
              disabled={components.length >= 9}
              size="large"
            >
              {t.keyGenerator.addComponent}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearAllComponents}
              danger
              size="large"
            >
              {t.keyGenerator.clearAll || 'Clear All'}
            </Button>
            <Button 
              type="primary"
              icon={<KeyOutlined />}
              onClick={handleCombine}
              size="large"
            >
              {t.keyGenerator.combineKeys}
            </Button>
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
              ({components.length}/9 {t.keyGenerator.components})
            </Text>
          </div>

          {combineError && (
            <Alert message={combineError} type="error" showIcon />
          )}

          {combinedKey && (
            <div style={{ 
              background: isDark 
                ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              padding: '20px', 
              borderRadius: '12px', 
              border: isDark ? '1px solid #274916' : '2px solid #95de64',
              boxShadow: isDark 
                ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
                : '0 4px 16px rgba(82, 196, 26, 0.2)',
            }}>
              <div style={{ marginBottom: 16 }}>
                {components.filter(c => c.trim() !== '').map((comp, index) => (
                  <div key={index} style={{ 
                    marginBottom: 12, 
                    paddingBottom: 12,
                    borderBottom: index < components.filter(c => c.trim() !== '').length - 1 
                      ? `1px solid ${isDark ? '#3c5a24' : '#b7eb8f'}` 
                      : 'none'
                  }}>
                    <Text style={{ fontSize: '11px', display: 'block', marginBottom: 4, color: isDark ? '#8c8c8c' : '#666' }}>
                      {t.keyGenerator.component} #{index + 1}
                    </Text>
                    <div style={{ 
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                      fontSize: 'clamp(14px, 3vw, 18px)',
                      letterSpacing: '1px',
                      color: isDark ? '#69b1ff' : '#1677ff',
                      wordBreak: 'break-all',
                      marginBottom: 8,
                      lineHeight: '1.6'
                    }}>
                      {formatHexDisplay(cleanHexInput(comp))}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {componentKCVs[index]?.des && (
                        <Tag color="green" style={{ fontSize: '11px' }}>
                          3DES KCV: {componentKCVs[index].des}
                        </Tag>
                      )}
                      {componentKCVs[index]?.aes && (
                        <Tag color="blue" style={{ fontSize: '11px' }}>
                          AES KCV: {componentKCVs[index].aes}
                        </Tag>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Divider style={{ margin: '16px 0', borderColor: isDark ? '#52c41a' : '#52c41a', borderWidth: 2 }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text strong style={{ fontSize: '13px', color: isDark ? '#52c41a' : '#389e0d' }}>
                    {t.keyGenerator.combinedKey}
                  </Text>
                  <Button 
                    type={isDark ? 'primary' : 'default'}
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(combinedKey)}
                    style={{
                      background: isDark ? '#52c41a' : undefined,
                      borderColor: '#52c41a',
                      color: isDark ? '#fff' : '#52c41a',
                    }}
                  >
                    {t.common.copy}
                  </Button>
                </div>
                <div style={{ 
                  background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                  fontSize: 'clamp(16px, 4vw, 22px)',
                  letterSpacing: '1px', 
                  color: isDark ? '#95de64' : '#237804',
                  wordBreak: 'break-all',
                  marginBottom: '12px',
                  lineHeight: '1.6',
                  fontWeight: 600
                }}>
                  {formatHexDisplay(combinedKey)}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  {combinedKCV.des && (
                    <Tag color="green" style={{ fontSize: '12px' }}>
                      3DES KCV: {combinedKCV.des}
                    </Tag>
                  )}
                  {combinedKCV.aes && (
                    <Tag color="blue" style={{ fontSize: '12px' }}>
                      AES KCV: {combinedKCV.aes}
                    </Tag>
                  )}
                  <Tag color="purple">{t.keyGenerator.length}: {combinedKey.length / 2} {t.keyGenerator.bytes}</Tag>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '3',
      label: t.keyGenerator.tabValidation,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {t.keyGenerator.validationDesc}
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.keyGenerator.keyInput}:
            </Text>
            <TextArea
              value={validationInput}
              onChange={e => setValidationInput(e.target.value)}
              placeholder={t.keyGenerator.keyInputPlaceholder}
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleValidate}
              size="large"
            >
              {t.keyGenerator.validateKey}
            </Button>
          </div>

          {validationResult && (
            <div style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Key
                  </Text>
                  <div style={{ 
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                    fontSize: 'clamp(16px, 4vw, 22px)',
                    letterSpacing: '1px', 
                    color: '#1677ff',
                    wordBreak: 'break-all',
                    marginTop: '4px',
                    lineHeight: '1.6'
                  }}>
                    {formatHexDisplay(validationResult.key)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <Tag color="purple">Key length: {validationResult.keyLength}</Tag>
                  <Tag color="blue">Parity detected: {validationResult.parityDetected}</Tag>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 8 }}>
                  <div>
                    <Tag color="green" style={{ width: '100%', marginBottom: 4 }}>KCV (VISA): {validationResult.kcvVisa}</Tag>
                  </div>
                  <div>
                    <Tag color="green" style={{ width: '100%', marginBottom: 4 }}>KCV (IBM): {validationResult.kcvIbm}</Tag>
                  </div>
                  <div>
                    <Tag color="green" style={{ width: '100%', marginBottom: 4 }}>KCV (ATALLA): {validationResult.kcvAtalla}</Tag>
                  </div>
                  <div>
                    <Tag color="green" style={{ width: '100%', marginBottom: 4 }}>KCV (FUTUREX): {validationResult.kcvFuturex}</Tag>
                  </div>
                  <div>
                    <Tag color="green" style={{ width: '100%', marginBottom: 4 }}>KCV (ATALLA R): {validationResult.kcvAtallaR}</Tag>
                  </div>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 8 }}>
                  <div>
                    <Tag color="blue" style={{ width: '100%', marginBottom: 4 }}>KCV (SHA256): {validationResult.kcvSha256}</Tag>
                  </div>
                  <div>
                    <Tag color="blue" style={{ width: '100%', marginBottom: 4 }}>KCV (CMAC): {validationResult.kcvCmac}</Tag>
                  </div>
                  <div>
                    <Tag color="blue" style={{ width: '100%', marginBottom: 4 }}>KCV (AES): {validationResult.kcvAes}</Tag>
                  </div>
                </div>

                {validationResult.errors.length > 0 && (
                  <>
                    <Divider style={{ margin: '16px 0' }} />
                    <Alert type="error" message={
                      <div>
                        {validationResult.errors.map((err: string, idx: number) => (
                          <div key={idx}>• {err}</div>
                        ))}
                      </div>
                    } />
                  </>
                )}
              </div>
            </div>
        )}
      </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
          {t.keyGenerator.title}
        </Title>
          <CollapsibleInfo title={t.keyGenerator.infoTitle || 'About Key Generator'}>
            <div>• {t.keyGenerator.infoContent1 || 'Generate cryptographically secure random keys using Web Crypto API'}</div>
            <div>• {t.keyGenerator.infoContent2 || 'Supports DES (8 bytes), 3DES (16/24 bytes), and AES (16/24/32 bytes)'}</div>
            <div>• {t.keyGenerator.infoContent3 || 'KCV (Key Check Value) is calculated for key verification'}</div>
            {isWebCryptoAvailable() && (
              <div style={{ color: '#52c41a', marginTop: 8 }}>
                <ThunderboltOutlined /> Web Crypto API 安全随机数已启用
              </div>
            )}
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.keyGenerator.description}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default KeyGenerator;
