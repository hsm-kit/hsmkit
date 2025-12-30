import React, { useState, useCallback } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Select } from 'antd';
import { CheckCircleOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;

type Operation = 'check' | 'generate';
type HashType = 'luhn' | 'amex';

// Luhn algorithm (MOD 10)
const luhnCheck = (number: string): boolean => {
  const digits = number.replace(/\D/g, '').split('').map(Number);
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

const luhnGenerate = (number: string): string => {
  const digits = number.replace(/\D/g, '');
  // Try each digit 0-9 as check digit
  for (let i = 0; i <= 9; i++) {
    const testNumber = digits + i.toString();
    if (luhnCheck(testNumber)) {
      return i.toString();
    }
  }
  return '0';
};

// Amex SE Number (MOD 9)
const amexMod9Check = (number: string): boolean => {
  const digits = number.replace(/\D/g, '');
  if (digits.length < 2) return false;
  
  const payload = digits.slice(0, -1);
  const checkDigit = parseInt(digits.slice(-1), 10);
  
  let sum = 0;
  for (const char of payload) {
    sum += parseInt(char, 10);
  }
  
  const calculatedCheck = sum % 9;
  return calculatedCheck === checkDigit;
};

const amexMod9Generate = (number: string): string => {
  const digits = number.replace(/\D/g, '');
  
  let sum = 0;
  for (const char of digits) {
    sum += parseInt(char, 10);
  }
  
  return (sum % 9).toString();
};

const HASH_TYPES = [
  { value: 'luhn', label: "Luhn's number (MOD 10)" },
  { value: 'amex', label: 'Amex SE Number (MOD 9)' },
];

const CheckDigitsTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [operation, setOperation] = useState<Operation>('check');
  const [hashType, setHashType] = useState<HashType>('luhn');
  const [inputData, setInputData] = useState<string>('');
  const [result, setResult] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Main function
  const performOperation = useCallback(() => {
    setError('');
    setResult('');
    setIsValid(null);

    const cleanInput = inputData.replace(/\D/g, '');
    
    if (!cleanInput) {
      setError(t.checkDigits?.errorNoInput || 'Please enter a number');
      return;
    }

    try {
      if (operation === 'check') {
        // Check if the number is valid
        let valid = false;
        if (hashType === 'luhn') {
          valid = luhnCheck(cleanInput);
        } else {
          valid = amexMod9Check(cleanInput);
        }
        setIsValid(valid);
        setResult(valid 
          ? (t.checkDigits?.validResult || 'Valid - Check digit is correct')
          : (t.checkDigits?.invalidResult || 'Invalid - Check digit is incorrect')
        );
      } else {
        // Generate check digit
        let checkDigit = '';
        if (hashType === 'luhn') {
          checkDigit = luhnGenerate(cleanInput);
        } else {
          checkDigit = amexMod9Generate(cleanInput);
        }
        setResult(checkDigit);
        setIsValid(true);
      }
    } catch (err) {
      console.error('Check digit error:', err);
      setError((t.checkDigits?.errorCalculation || 'Calculation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [inputData, operation, hashType, t]);

  // Clear all
  const handleClear = () => {
    setInputData('');
    setResult('');
    setIsValid(null);
    setError('');
  };

  // Copy result
  const copyResult = () => {
    navigator.clipboard.writeText(result);
    message.success(t.common.copied);
  };

  // Get input length
  const getInputLength = (): number => {
    return inputData.replace(/\D/g, '').length;
  };

  // Get placeholder
  const getPlaceholder = (): string => {
    if (operation === 'check') {
      return t.checkDigits?.placeholderCheck || 'Enter number with check digit (e.g., 79927398713)';
    } else {
      return t.checkDigits?.placeholderGenerate || 'Enter number without check digit (e.g., 7992739871)';
    }
  };

  // Get algorithm info
  const getAlgorithmInfo = (): string => {
    if (hashType === 'luhn') {
      return t.checkDigits?.luhnInfo || "Luhn algorithm (MOD 10) - Used for credit cards, IMEI, etc.";
    } else {
      return t.checkDigits?.amexInfo || "Amex SE Number (MOD 9) - Sum of digits modulo 9";
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.checkDigits?.title || 'Check Digits'}
            </Title>
            <CollapsibleInfo title={t.checkDigits?.info || 'Algorithm Information'}>
              <div>• {getAlgorithmInfo()}</div>
              {operation === 'check' ? (
                <div>• {t.checkDigits?.checkInfo || 'Enter the complete number including the check digit'}</div>
              ) : (
                <div>• {t.checkDigits?.generateInfo || 'Enter the number without the check digit'}</div>
              )}
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.checkDigits?.description || 'Verify or generate check digits using various algorithms'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Operation Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.checkDigits?.operation || 'Operation'}:
              </Text>
              <Segmented
                value={operation}
                onChange={(val) => {
                  setOperation(val as Operation);
                  setResult('');
                  setIsValid(null);
                  setError('');
                }}
                options={[
                  { label: t.checkDigits?.check || 'Check', value: 'check' },
                  { label: t.checkDigits?.generate || 'Generate', value: 'generate' },
                ]}
                block
                size="large"
              />
            </div>

            {/* Hash Type Selection */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.checkDigits?.hashType || 'Hash type'}:
              </Text>
              <Select
                value={hashType}
                onChange={(val) => {
                  setHashType(val);
                  setResult('');
                  setIsValid(null);
                  setError('');
                }}
                style={{ width: '100%' }}
                size="large"
                options={HASH_TYPES}
              />
            </div>

            {/* Input Data */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>
                {t.checkDigits?.input || 'Input'}:
              </Text>
                <Text style={{ 
                  fontSize: '12px',
                  color: getInputLength() > 0 ? '#52c41a' : '#999',
                  fontWeight: getInputLength() > 0 ? 600 : 400
                }}>
                  [{getInputLength()}]
                </Text>
              </div>
              <Input
                value={inputData}
                onChange={e => setInputData(e.target.value)}
                placeholder={getPlaceholder()}
                size="large"
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={performOperation}
                size="large"
              >
                {operation === 'check' ? (t.checkDigits?.check || 'Check') : (t.checkDigits?.generate || 'Generate')}
              </Button>
              <Button 
                icon={<ClearOutlined />}
                onClick={handleClear}
                danger
                size="large"
              >
                {t.common.clear || 'Clear'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* Result Display */}
        {result && (
          <Card 
            title={
              <span style={{ color: isValid ? (isDark ? '#52c41a' : '#389e0d') : '#ff4d4f', fontWeight: 600 }}>
                <CheckCircleOutlined />
                {' '}
                {operation === 'check' 
                  ? (t.checkDigits?.checkResult || 'Verification Result')
                  : (t.checkDigits?.generateResult || 'Generated Check Digit')
                }
              </span>
            }
            bordered={false}
            style={{ 
              background: isValid 
                ? (isDark 
                    ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                    : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)')
                : (isDark 
                    ? 'linear-gradient(135deg, #2a1215 0%, #3a1a1a 100%)'
                    : 'linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)'),
              border: isValid 
                ? (isDark ? '1px solid #274916' : '2px solid #95de64')
                : (isDark ? '1px solid #58181c' : '2px solid #ff7875'),
              boxShadow: isValid 
                ? (isDark ? '0 4px 16px rgba(82, 196, 26, 0.15)' : '0 4px 16px rgba(82, 196, 26, 0.2)')
                : (isDark ? '0 4px 16px rgba(255, 77, 79, 0.15)' : '0 4px 16px rgba(255, 77, 79, 0.2)'),
            }}
            extra={
              operation === 'generate' && (
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
              )
            }
          >
            <div style={{ 
              background: isValid 
                ? (isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)')
                : (isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'),
              padding: '16px', 
              borderRadius: '8px', 
              border: isValid 
                ? (isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f')
                : (isDark ? '1px solid #58181c' : '1px solid #ffccc7'),
              wordBreak: 'break-all',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: operation === 'generate' ? '24px' : '14px',
              lineHeight: '1.8',
              color: isValid ? (isDark ? '#95de64' : '#237804') : (isDark ? '#ff7875' : '#cf1322'),
              fontWeight: 600,
              letterSpacing: '0.5px',
              textAlign: operation === 'generate' ? 'center' : 'left'
            }}>
              {result}
            </div>
            {operation === 'generate' && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {t.checkDigits?.fullNumber || 'Full number'}: {inputData.replace(/\D/g, '')}{result}
                </Text>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckDigitsTool;

