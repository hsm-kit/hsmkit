import React, { useState } from 'react';
import { Card, Button, message, Divider, Tag, Typography, Tabs, Input, Space, Alert, Segmented } from 'antd';
import { KeyOutlined, CopyOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { useLanguage } from '../hooks/useLanguage';
import { 
  calculateKCV, 
  combineKeyComponents, 
  adjustDesKeyParity, 
  adjustDesKeyParityEven,
  validateKey,
  cleanHexInput 
} from '../utils/crypto';
import { formatHexDisplay } from '../utils/format';

const { Title, Text } = Typography;
const { TextArea } = Input;

const KeyGenerator: React.FC = () => {
  const { t } = useLanguage();
  
  // Tab 1: 密钥生成
  const [length, setLength] = useState(16);
  const [generatedKey, setGeneratedKey] = useState('');
  const [checkValue, setCheckValue] = useState('');

  // Tab 2: 密钥合成
  const [components, setComponents] = useState(['', '']);
  const [combinedKey, setCombinedKey] = useState('');
  const [combineError, setCombineError] = useState('');

  // Tab 3: 奇偶校验
  const [parityInput, setParityInput] = useState('');
  const [parityType, setParityType] = useState<'odd' | 'even'>('odd');
  const [adjustedKey, setAdjustedKey] = useState('');

  // Tab 4: 密钥校验
  const [validationInput, setValidationInput] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);

  // 密钥生成
  const handleGenerate = () => {
    const randomWord = CryptoJS.lib.WordArray.random(length);
    const keyHex = randomWord.toString().toUpperCase();
    setGeneratedKey(keyHex);

    try {
      const kcv = calculateKCV(keyHex, { algorithm: 'AES' });
      setCheckValue(kcv);
    } catch(e) {
      setCheckValue("ERROR");
    }
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
      const result = combineKeyComponents(filledComponents);
      setCombinedKey(result);
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

  // 检查分量长度是否有效
  const isComponentLengthValid = (value: string): boolean => {
    if (!value.trim()) return true; // 空值不显示错误
    const clean = cleanHexInput(value);
    const validLengths = [16, 32, 48, 64];
    return validLengths.includes(clean.length);
  };

  const clearAllComponents = () => {
    setComponents(['', '']);
    setCombinedKey('');
    setCombineError('');
  };

  // 奇偶校验调整
  const handleAdjustParity = () => {
    setAdjustedKey('');
    
    try {
      const clean = cleanHexInput(parityInput);
      const result = parityType === 'odd' 
        ? adjustDesKeyParity(clean)
        : adjustDesKeyParityEven(clean);
      setAdjustedKey(result);
    } catch (err) {
      message.error('Parity adjustment failed');
    }
  };

  // 密钥校验
  const handleValidate = () => {
    setValidationResult(null);
    
    try {
      const result = validateKey(validationInput);
      setValidationResult(result);
    } catch (err) {
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
          
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleGenerate} 
              size="large"
              block
            >
              {t.keyGenerator.generateNow}
            </Button>

        {generatedKey && (
            <div style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t.keyGenerator.generatedKey}
              </Text>
              <div style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                fontSize: 'clamp(16px, 4vw, 22px)',
                letterSpacing: '1px', 
                color: '#1677ff',
                wordBreak: 'break-all',
                marginTop: '8px',
                lineHeight: '1.6'
              }}>
                {formatHexDisplay(generatedKey)}
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                <Tag color="green">{t.keyGenerator.kcv}: {checkValue}</Tag>
                <Tag color="blue">{t.keyGenerator.length}: {length} {t.keyGenerator.bytes}</Tag>
                <Tag color="purple">{t.keyGenerator.bits}: {length * 8}</Tag>
                <Button 
                  type="text" 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(generatedKey)}
                >
                  {t.common.copy}
                </Button>
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
            {components.map((comp, index) => (
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
                <Input
                  value={comp}
                  onChange={e => updateComponent(index, e.target.value)}
                  placeholder="0123456789ABCDEF..."
                  status={comp.trim() && !isComponentLengthValid(comp) ? 'error' : ''}
                  style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
                />
                {comp.trim() && !isComponentLengthValid(comp) && (
                  <Text type="danger" style={{ fontSize: '11px', marginTop: 2, display: 'block' }}>
                    {t.keyGenerator.errorComponentLength2} 16/32/48/64 {t.keyGenerator.bytes.toLowerCase()}
                  </Text>
                )}
              </div>
            ))}
          </Space>

          <Space>
            <Button 
              icon={<PlusOutlined />}
              onClick={addComponent}
              disabled={components.length >= 9}
            >
              {t.keyGenerator.addComponent}
            </Button>
            <Button 
              onClick={clearAllComponents}
            >
              {t.keyGenerator.clearAll}
            </Button>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ({components.length}/9 {t.keyGenerator.components})
            </Text>
          </Space>

          <Button 
            type="primary"
            icon={<KeyOutlined />}
            onClick={handleCombine}
            size="large"
            block
          >
            {t.keyGenerator.combineKeys}
          </Button>

          {combineError && (
            <Alert message={combineError} type="error" showIcon />
          )}

          {combinedKey && (
            <div style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t.keyGenerator.combinedKey}
              </Text>
              <div style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                fontSize: 'clamp(16px, 4vw, 22px)',
                letterSpacing: '1px', 
                color: '#1677ff',
                wordBreak: 'break-all',
                marginTop: '8px',
                lineHeight: '1.6'
              }}>
                {formatHexDisplay(combinedKey)}
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="blue">{t.keyGenerator.length}: {combinedKey.length / 2} {t.keyGenerator.bytes}</Tag>
                <Button 
                  type="text" 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(combinedKey)}
                >
                  {t.common.copy}
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '3',
      label: t.keyGenerator.tabParity,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              {t.keyGenerator.parityDesc}
            </Text>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.keyGenerator.keyInput}:
            </Text>
            <TextArea
              value={parityInput}
              onChange={e => setParityInput(e.target.value)}
              placeholder={t.keyGenerator.keyInputPlaceholder}
              autoSize={{ minRows: 2, maxRows: 4 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.keyGenerator.parityType}:
            </Text>
            <Segmented
              value={parityType}
              onChange={(value) => setParityType(value as 'odd' | 'even')}
              options={[
                { label: t.keyGenerator.odd, value: 'odd' },
                { label: t.keyGenerator.even, value: 'even' }
              ]}
              block
              size="large"
            />
          </div>

          <Button 
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleAdjustParity}
            size="large"
            block
          >
            {t.keyGenerator.adjustParity}
          </Button>

          {adjustedKey && (
            <div style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t.keyGenerator.adjustedKey}
              </Text>
              <div style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                fontSize: 'clamp(16px, 4vw, 22px)',
                letterSpacing: '1px', 
                color: '#52c41a',
                wordBreak: 'break-all',
                marginTop: '8px',
                lineHeight: '1.6'
              }}>
                {formatHexDisplay(adjustedKey)}
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="blue">{t.keyGenerator.length}: {adjustedKey.length / 2} {t.keyGenerator.bytes}</Tag>
                <Button 
                  type="text" 
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={() => copyToClipboard(adjustedKey)}
                >
                  {t.common.copy}
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: '4',
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

          <Button 
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleValidate}
            size="large"
            block
          >
            {t.keyGenerator.validateKey}
          </Button>

          {validationResult && (
            <Alert
              message={validationResult.valid ? t.keyGenerator.validKey : t.keyGenerator.invalidKey}
              type={validationResult.valid ? 'success' : 'error'}
              icon={validationResult.valid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              description={
                <div style={{ marginTop: 12 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {t.keyGenerator.keyType}:
                      </Text>
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {validationResult.keyType}
                      </Tag>
                    </div>
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {t.keyGenerator.length}:
                      </Text>
                      <Tag color="purple" style={{ marginLeft: 8 }}>
                        {validationResult.keyLength} {t.keyGenerator.bytes}
                      </Tag>
                    </div>
                    {validationResult.parityType !== 'none' && (
                      <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {t.keyGenerator.parityStatus}:
                        </Text>
                        <Tag 
                          color={validationResult.parityValid ? 'green' : 'red'} 
                          style={{ marginLeft: 8 }}
                        >
                          {validationResult.parityValid ? t.keyGenerator.parityValid : t.keyGenerator.parityInvalid}
                        </Tag>
                      </div>
                    )}
                    {validationResult.errors.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        {validationResult.errors.map((err: string, idx: number) => (
                          <div key={idx} style={{ color: '#ff4d4f', fontSize: '12px' }}>
                            • {err}
                          </div>
                        ))}
                      </div>
                    )}
                  </Space>
                </div>
              }
              showIcon
            />
        )}
      </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
          {t.keyGenerator.title}
        </Title>
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
