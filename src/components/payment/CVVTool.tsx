import React, { useState } from 'react';
import { Card, Button, Tabs, Input, Segmented, message, Divider, Tag, Typography } from 'antd';
import { LockOutlined, CopyOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;

// CVV/CVC calculation using DES
const calculateCVV = (
  cvkA: string, 
  cvkB: string, 
  pan: string, 
  expDate: string, 
  serviceCode: string,
  atc?: string
): string => {
  const cleanCvkA = cvkA.replace(/\s/g, '').toUpperCase();
  const cleanCvkB = cvkB.replace(/\s/g, '').toUpperCase();
  const cleanPan = pan.replace(/\s/g, '');
  
  // Build data block: PAN (rightmost 16 digits, left-padded with 0) + Exp Date (YYMM) + Service Code
  let panPart = cleanPan.slice(-16).padStart(16, '0');
  let data = panPart + expDate + serviceCode;
  
  // For iCVV and dCVV, append ATC
  if (atc) {
    data += atc.padStart(4, '0');
  }
  
  // Pad to multiple of 8 bytes
  if (data.length % 16 !== 0) {
    data = data.padEnd(Math.ceil(data.length / 16) * 16, '0');
  }
  
  // Triple DES encryption
  const dataWords = CryptoJS.enc.Hex.parse(data);
  
  // Concatenate keys for 3DES
  const key3DES = CryptoJS.enc.Hex.parse(cleanCvkA + cleanCvkB);
  
  const encrypted = CryptoJS.TripleDES.encrypt(dataWords, key3DES, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  
  const result = encrypted.ciphertext.toString().toUpperCase();
  
  // Extract decimal digits from hex result
  const decimals = result.replace(/[A-F]/g, '').substring(0, 3);
  
  return decimals.padStart(3, '0');
};

// Validate CVV
const validateCVV = (
  cvkA: string,
  cvkB: string,
  pan: string,
  expDate: string,
  serviceCode: string,
  cvv: string,
  atc?: string
): boolean => {
  const calculated = calculateCVV(cvkA, cvkB, pan, expDate, serviceCode, atc);
  return calculated === cvv;
};

const CVVTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Generate tab state
  const [genCvkA, setGenCvkA] = useState('');
  const [genCvkB, setGenCvkB] = useState('');
  const [genPan, setGenPan] = useState('');
  const [genExpDate, setGenExpDate] = useState('');
  const [genServiceCode, setGenServiceCode] = useState('');
  const [genAtc, setGenAtc] = useState('');
  const [genType, setGenType] = useState<'CVV' | 'iCVV' | 'CVV2' | 'dCVV'>('CVV');
  const [genResult, setGenResult] = useState('');
  const [genError, setGenError] = useState('');
  
  // Validate tab state
  const [valCvkA, setValCvkA] = useState('');
  const [valCvkB, setValCvkB] = useState('');
  const [valPan, setValPan] = useState('');
  const [valExpDate, setValExpDate] = useState('');
  const [valServiceCode, setValServiceCode] = useState('');
  const [valAtc, setValAtc] = useState('');
  const [valType, setValType] = useState<'CVV' | 'iCVV' | 'CVV2' | 'dCVV'>('CVV');
  const [valCvv, setValCvv] = useState('');
  const [valResult, setValResult] = useState<'valid' | 'invalid' | null>(null);
  const [valError, setValError] = useState('');

  const sanitizeHex = (value: string) => {
    return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  };

  const sanitizeDigits = (value: string) => {
    return value.replace(/[^0-9]/g, '');
  };

  const handleGenerate = () => {
    setGenError('');
    setGenResult('');
    
    // Validation
    const cleanCvkA = sanitizeHex(genCvkA);
    const cleanCvkB = sanitizeHex(genCvkB);
    
    if (cleanCvkA.length !== 32) {
      setGenError(t.cvv?.errorInvalidCvkA || 'CVK A must be 32 hex characters (16 bytes)');
      return;
    }
    
    if (cleanCvkB.length !== 32) {
      setGenError(t.cvv?.errorInvalidCvkB || 'CVK B must be 32 hex characters (16 bytes)');
      return;
    }
    
    const cleanPan = sanitizeDigits(genPan);
    if (cleanPan.length < 13 || cleanPan.length > 19) {
      setGenError(t.cvv?.errorInvalidPan || 'PAN must be 13-19 digits');
      return;
    }
    
    if (genExpDate.length !== 4 || !/^\d{4}$/.test(genExpDate)) {
      setGenError(t.cvv?.errorInvalidExpDate || 'Exp. date must be 4 digits (YYMM)');
      return;
    }
    
    if (genServiceCode.length !== 3 || !/^\d{3}$/.test(genServiceCode)) {
      setGenError(t.cvv?.errorInvalidServiceCode || 'Service code must be 3 digits');
      return;
    }
    
    if ((genType === 'iCVV' || genType === 'dCVV') && genAtc.length !== 4) {
      setGenError(t.cvv?.errorInvalidAtc || 'ATC must be 4 digits for iCVV/dCVV');
      return;
    }
    
    try {
      const cvv = calculateCVV(
        cleanCvkA,
        cleanCvkB,
        cleanPan,
        genExpDate,
        genServiceCode,
        (genType === 'iCVV' || genType === 'dCVV') ? genAtc : undefined
      );
      setGenResult(cvv);
    } catch (err) {
      setGenError(t.cvv?.errorGeneration || 'Failed to generate CVV');
    }
  };

  const handleValidate = () => {
    setValError('');
    setValResult(null);
    
    // Validation
    const cleanCvkA = sanitizeHex(valCvkA);
    const cleanCvkB = sanitizeHex(valCvkB);
    
    if (cleanCvkA.length !== 32) {
      setValError(t.cvv?.errorInvalidCvkA || 'CVK A must be 32 hex characters (16 bytes)');
      return;
    }
    
    if (cleanCvkB.length !== 32) {
      setValError(t.cvv?.errorInvalidCvkB || 'CVK B must be 32 hex characters (16 bytes)');
      return;
    }
    
    const cleanPan = sanitizeDigits(valPan);
    if (cleanPan.length < 13 || cleanPan.length > 19) {
      setValError(t.cvv?.errorInvalidPan || 'PAN must be 13-19 digits');
      return;
    }
    
    if (valExpDate.length !== 4 || !/^\d{4}$/.test(valExpDate)) {
      setValError(t.cvv?.errorInvalidExpDate || 'Exp. date must be 4 digits (YYMM)');
      return;
    }
    
    if (valServiceCode.length !== 3 || !/^\d{3}$/.test(valServiceCode)) {
      setValError(t.cvv?.errorInvalidServiceCode || 'Service code must be 3 digits');
      return;
    }
    
    if ((valType === 'iCVV' || valType === 'dCVV') && valAtc.length !== 4) {
      setValError(t.cvv?.errorInvalidAtc || 'ATC must be 4 digits for iCVV/dCVV');
      return;
    }
    
    if (valCvv.length !== 3 || !/^\d{3}$/.test(valCvv)) {
      setValError(t.cvv?.errorInvalidCvv || 'CVV must be 3 digits');
      return;
    }
    
    try {
      const isValid = validateCVV(
        cleanCvkA,
        cleanCvkB,
        cleanPan,
        valExpDate,
        valServiceCode,
        valCvv,
        (valType === 'iCVV' || valType === 'dCVV') ? valAtc : undefined
      );
      setValResult(isValid ? 'valid' : 'invalid');
    } catch (err) {
      setValError(t.cvv?.errorValidation || 'Failed to validate CVV');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t.common?.copied || 'Copied to clipboard!');
    } catch {
      message.error(t.cvv?.copyError || 'Failed to copy');
    }
  };

  const lengthIndicator = (current: number, expected: number) => (
    <Text 
      style={{ 
        fontSize: '12px', 
        color: current === expected ? '#52c41a' : '#999',
        fontWeight: current > 0 ? 600 : 400
      }}
    >
      [{current}]
    </Text>
  );

  const generateTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>CVK A:</Text>
        <Input
          value={genCvkA}
          onChange={e => setGenCvkA(sanitizeHex(e.target.value))}
          placeholder="0123456789ABCDEFFEDCBA9876543210"
          maxLength={32}
          suffix={lengthIndicator(sanitizeHex(genCvkA).length, 32)}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>CVK B:</Text>
        <Input
          value={genCvkB}
          onChange={e => setGenCvkB(sanitizeHex(e.target.value))}
          placeholder="FEDCBA98765432100123456789ABCDEF"
          maxLength={32}
          suffix={lengthIndicator(sanitizeHex(genCvkB).length, 32)}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>PAN:</Text>
        <Input
          value={genPan}
          onChange={e => setGenPan(sanitizeDigits(e.target.value))}
          placeholder="4999988887777000"
          maxLength={19}
          prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
          suffix={lengthIndicator(sanitizeDigits(genPan).length, 16)}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Exp. date:</Text>
          <Input
            value={genExpDate}
            onChange={e => setGenExpDate(sanitizeDigits(e.target.value))}
            placeholder="9105"
            maxLength={4}
            suffix={lengthIndicator(genExpDate.length, 4)}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Service Code:</Text>
          <Input
            value={genServiceCode}
            onChange={e => setGenServiceCode(sanitizeDigits(e.target.value))}
            placeholder="101"
            maxLength={3}
            suffix={lengthIndicator(genServiceCode.length, 3)}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>
      </div>

      {(genType === 'iCVV' || genType === 'dCVV') && (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>ATC:</Text>
          <Input
            value={genAtc}
            onChange={e => setGenAtc(sanitizeDigits(e.target.value))}
            placeholder="1234"
            maxLength={4}
            suffix={lengthIndicator(genAtc.length, 4)}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>
      )}

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.cvv?.verificationType || 'Verification Value Type'}:
        </Text>
        <Segmented
          value={genType}
          onChange={(value) => {
            setGenType(value as 'CVV' | 'iCVV' | 'CVV2' | 'dCVV');
            if (value !== 'iCVV' && value !== 'dCVV') {
              setGenAtc('');
            }
          }}
          options={[
            { label: 'CVV/CVC', value: 'CVV' },
            { label: 'iCVV', value: 'iCVV' },
            { label: 'CVV2/CVC2', value: 'CVV2' },
            { label: 'dCVV', value: 'dCVV' },
          ]}
          block
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button
          type="primary"
          size="large"
          icon={<LockOutlined />}
          onClick={handleGenerate}
        >
          {t.common?.generate || 'Generate'}
        </Button>
      </div>

      {genError && (
        <div style={{ 
          padding: '12px 16px', 
          background: isDark ? '#2a1215' : '#fff2f0',
          border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{genError}</Text>
        </div>
      )}

      {genResult && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>Ver.Val.:</Text>
            <Tag color="green" style={{ marginLeft: 8 }}>[3]</Tag>
          </div>
          <Input
            value={genResult}
            readOnly
            size="large"
            suffix={
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => handleCopy(genResult)}
              />
            }
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '16px',
              fontWeight: 600,
              color: '#52c41a'
            }}
          />
        </div>
      )}
    </div>
  );

  const validateTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>CVK A:</Text>
        <Input
          value={valCvkA}
          onChange={e => setValCvkA(sanitizeHex(e.target.value))}
          placeholder="0123456789ABCDEFFEDCBA9876543210"
          maxLength={32}
          suffix={lengthIndicator(sanitizeHex(valCvkA).length, 32)}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>CVK B:</Text>
        <Input
          value={valCvkB}
          onChange={e => setValCvkB(sanitizeHex(e.target.value))}
          placeholder="FEDCBA98765432100123456789ABCDEF"
          maxLength={32}
          suffix={lengthIndicator(sanitizeHex(valCvkB).length, 32)}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>PAN:</Text>
        <Input
          value={valPan}
          onChange={e => setValPan(sanitizeDigits(e.target.value))}
          placeholder="4999988887777000"
          maxLength={19}
          prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
          suffix={lengthIndicator(sanitizeDigits(valPan).length, 16)}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Exp. date:</Text>
          <Input
            value={valExpDate}
            onChange={e => setValExpDate(sanitizeDigits(e.target.value))}
            placeholder="9105"
            maxLength={4}
            suffix={lengthIndicator(valExpDate.length, 4)}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Service Code:</Text>
          <Input
            value={valServiceCode}
            onChange={e => setValServiceCode(sanitizeDigits(e.target.value))}
            placeholder="101"
            maxLength={3}
            suffix={lengthIndicator(valServiceCode.length, 3)}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>
      </div>

      {(valType === 'iCVV' || valType === 'dCVV') && (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>ATC:</Text>
          <Input
            value={valAtc}
            onChange={e => setValAtc(sanitizeDigits(e.target.value))}
            placeholder="1234"
            maxLength={4}
            suffix={lengthIndicator(valAtc.length, 4)}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>
      )}

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Ver.Val.:</Text>
        <Input
          value={valCvv}
          onChange={e => setValCvv(sanitizeDigits(e.target.value))}
          placeholder="539"
          maxLength={3}
          suffix={lengthIndicator(valCvv.length, 3)}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.cvv?.verificationType || 'Verification Value Type'}:
        </Text>
        <Segmented
          value={valType}
          onChange={(value) => {
            setValType(value as 'CVV' | 'iCVV' | 'CVV2' | 'dCVV');
            if (value !== 'iCVV' && value !== 'dCVV') {
              setValAtc('');
            }
          }}
          options={[
            { label: 'CVV/CVC', value: 'CVV' },
            { label: 'iCVV', value: 'iCVV' },
            { label: 'CVV2/CVC2', value: 'CVV2' },
            { label: 'dCVV', value: 'dCVV' },
          ]}
          block
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleValidate}
        >
          {t.common?.parse || 'Validate'}
        </Button>
      </div>

      {valError && (
        <div style={{ 
          padding: '12px 16px', 
          background: isDark ? '#2a1215' : '#fff2f0',
          border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{valError}</Text>
        </div>
      )}

      {valResult && (
        <div style={{ 
          padding: '16px', 
          background: valResult === 'valid' 
            ? (isDark ? '#162312' : '#f6ffed') 
            : (isDark ? '#2a1215' : '#fff2f0'),
          border: `1px solid ${valResult === 'valid' 
            ? (isDark ? '#274916' : '#b7eb8f') 
            : (isDark ? '#58181c' : '#ffccc7')}`,
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <Text 
            style={{ 
              fontSize: '16px',
              fontWeight: 600,
              color: valResult === 'valid' ? '#52c41a' : '#ff4d4f'
            }}
          >
            {valResult === 'valid' 
              ? (t.cvv?.validResult || '✓ Valid - CVV is correct')
              : (t.cvv?.invalidResult || '✗ Invalid - CVV does not match')}
          </Text>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.cvv?.title || 'Card Verification Value'}
          </Title>
          <CollapsibleInfo title={t.cvv?.infoTitle || 'About CVV/CVC'}>
            <div>{t.cvv?.info1 || 'CVV (Card Verification Value) and CVC (Card Verification Code) are security features for card-not-present transactions.'}</div>
            <div style={{ marginTop: 8 }}>{t.cvv?.info2 || 'CVV/CVC: Printed on card (3 digits). CVV2/CVC2: Enhanced version. iCVV: Integrated chip CVV. dCVV: Dynamic CVV for contactless.'}</div>
            <div style={{ marginTop: 8 }}>{t.cvv?.info3 || 'Generated using card data (PAN, expiry, service code) encrypted with issuer CVK keys.'}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.cvv?.description || 'Generate and validate CVV/CVC, iCVV, CVV2/CVC2, and dCVV for payment card security.'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs
          defaultActiveKey="generate"
          items={[
            {
              key: 'generate',
              label: t.cvv?.tabGenerate || 'Generate',
              children: generateTab,
            },
            {
              key: 'validate',
              label: t.cvv?.tabValidate || 'Validate',
              children: validateTab,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CVVTool;
