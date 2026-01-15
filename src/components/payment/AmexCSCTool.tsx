import React, { useState } from 'react';
import { Card, Button, Tabs, Input, Segmented, message, Divider, Tag, Typography } from 'antd';
import { LockOutlined, CopyOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo, ResultCard } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;

// AMEX CSC calculation using DES
const calculateAmexCSC = (
  cscKey: string,
  pan: string,
  expDate: string,
  serviceCode: string,
  version: '1' | '2',
  csc5?: string,
  csc4?: string,
  csc3?: string
): { csc5?: string; csc4?: string; csc3?: string } => {
  const cleanKey = cscKey.replace(/\s/g, '').toUpperCase();
  const cleanPan = pan.replace(/\s/g, '');

  // Build data block: PAN (15 digits) + Exp Date (YYMM) + Service Code (3 digits)
  const panPart = cleanPan.padEnd(15, '0').substring(0, 15);
  let data = panPart + expDate + serviceCode;

  if (version === '2') {
    // CSC version 2: includes CSC-5, CSC-4, CSC-3
    if (csc5) data += csc5.padEnd(5, '0');
    if (csc4) data += csc4.padEnd(4, '0');
    if (csc3) data += csc3.padEnd(3, '0');
  }

  // Pad to 32 hex chars (16 bytes)
  if (data.length % 2 !== 0) data += '0';
  data = data.padEnd(32, '0');

  // Triple DES encryption
  const key3DES = CryptoJS.enc.Hex.parse(cleanKey);
  const dataWords = CryptoJS.enc.Hex.parse(data);

  const encrypted = CryptoJS.TripleDES.encrypt(dataWords, key3DES, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });

  const result = encrypted.ciphertext.toString().toUpperCase();

  // Extract decimal digits
  const decimals = result.replace(/[A-F]/g, '');

  if (version === '1') {
    // CSC version 1: only CSC (4 digits from magnetic stripe)
    const csc = decimals.substring(0, 4);
    return { csc4: csc };
  } else {
    // CSC version 2: CSC-5, CSC-4, CSC-3
    return {
      csc5: decimals.substring(0, 5).padStart(5, '0'),
      csc4: decimals.substring(5, 9).padStart(4, '0'),
      csc3: decimals.substring(9, 12).padStart(3, '0'),
    };
  }
};

// Validate AMEX CSC
const validateAmexCSC = (
  cscKey: string,
  pan: string,
  expDate: string,
  serviceCode: string,
  version: '1' | '2',
  inputCsc: string,
  type: 'csc' | 'csc5' | 'csc4' | 'csc3'
): boolean => {
  const calculated = calculateAmexCSC(cscKey, pan, expDate, serviceCode, version);
  
  if (version === '1' && type === 'csc4') {
    return calculated.csc4 === inputCsc;
  } else if (version === '2') {
    if (type === 'csc5') return calculated.csc5 === inputCsc;
    if (type === 'csc4') return calculated.csc4 === inputCsc;
    if (type === 'csc3') return calculated.csc3 === inputCsc;
  }
  return false;
};

const AmexCSCTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  // Generate tab state
  const [genCscKey, setGenCscKey] = useState('');
  const [genPan, setGenPan] = useState('');
  const [genExpDate, setGenExpDate] = useState('');
  const [genServiceCode, setGenServiceCode] = useState('');
  const [genVersion, setGenVersion] = useState<'1' | '2'>('1');
  const [genResults, setGenResults] = useState<{ csc5?: string; csc4?: string; csc3?: string } | null>(null);
  const [genError, setGenError] = useState('');

  // Validate tab state
  const [valCscKey, setValCscKey] = useState('');
  const [valPan, setValPan] = useState('');
  const [valExpDate, setValExpDate] = useState('');
  const [valServiceCode, setValServiceCode] = useState('');
  const [valVersion, setValVersion] = useState<'1' | '2'>('1');
  const [valCsc, setValCsc] = useState('');
  const [valType] = useState<'csc' | 'csc5' | 'csc4' | 'csc3'>('csc');
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
    setGenResults(null);

    const cleanKey = sanitizeHex(genCscKey);

    if (cleanKey.length !== 32 && cleanKey.length !== 48) {
      setGenError(t.amexCsc?.errorInvalidKey || 'CSC Key must be 32 or 48 hex characters');
      return;
    }

    const cleanPan = sanitizeDigits(genPan);
    if (cleanPan.length !== 15) {
      setGenError(t.amexCsc?.errorInvalidPan || 'AMEX PAN must be 15 digits');
      return;
    }

    if (genExpDate.length !== 4 || !/^\d{4}$/.test(genExpDate)) {
      setGenError(t.amexCsc?.errorInvalidExpDate || 'Exp. date must be 4 digits (YYMM)');
      return;
    }

    if (genServiceCode.length !== 3 || !/^\d{3}$/.test(genServiceCode)) {
      setGenError(t.amexCsc?.errorInvalidServiceCode || 'Service code must be 3 digits');
      return;
    }

    try {
      const results = calculateAmexCSC(
        cleanKey,
        cleanPan,
        genExpDate,
        genServiceCode,
        genVersion
      );
      setGenResults(results);
    } catch {
      setGenError(t.amexCsc?.errorGeneration || 'Failed to generate CSC');
    }
  };

  const handleValidate = () => {
    setValError('');
    setValResult(null);

    const cleanKey = sanitizeHex(valCscKey);

    if (cleanKey.length !== 32 && cleanKey.length !== 48) {
      setValError(t.amexCsc?.errorInvalidKey || 'CSC Key must be 32 or 48 hex characters');
      return;
    }

    const cleanPan = sanitizeDigits(valPan);
    if (cleanPan.length !== 15) {
      setValError(t.amexCsc?.errorInvalidPan || 'AMEX PAN must be 15 digits');
      return;
    }

    if (valExpDate.length !== 4 || !/^\d{4}$/.test(valExpDate)) {
      setValError(t.amexCsc?.errorInvalidExpDate || 'Exp. date must be 4 digits (YYMM)');
      return;
    }

    if (valServiceCode.length !== 3 || !/^\d{3}$/.test(valServiceCode)) {
      setValError(t.amexCsc?.errorInvalidServiceCode || 'Service code must be 3 digits');
      return;
    }

    const expectedLength = valType === 'csc5' ? 5 : valType === 'csc4' || valType === 'csc' ? 4 : 3;
    if (valCsc.length !== expectedLength || !/^\d+$/.test(valCsc)) {
      setValError(t.amexCsc?.errorInvalidCsc || `CSC must be ${expectedLength} digits`);
      return;
    }

    try {
      const isValid = validateAmexCSC(
        cleanKey,
        cleanPan,
        valExpDate,
        valServiceCode,
        valVersion,
        valCsc,
        valType
      );
      setValResult(isValid ? 'valid' : 'invalid');
    } catch {
      setValError(t.amexCsc?.errorValidation || 'Failed to validate CSC');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t.common?.copied || 'Copied to clipboard!');
    } catch {
      message.error(t.amexCsc?.copyError || 'Failed to copy');
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
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.amexCsc?.cscVersion || 'CSC version'}:
        </Text>
        <Segmented
          value={genVersion}
          onChange={(value) => setGenVersion(value as '1' | '2')}
          options={[
            { label: 'CSC ver. 1', value: '1' },
            { label: 'CSC ver. 2', value: '2' },
          ]}
          block
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>CSC Key:</Text>
        <Input
          value={genCscKey}
          onChange={e => setGenCscKey(sanitizeHex(e.target.value))}
          placeholder="0123456789ABCDEFFEDCBA9876543210"
          maxLength={48}
          suffix={lengthIndicator(sanitizeHex(genCscKey).length, 32)}
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px',
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>PAN:</Text>
        <Input
          value={genPan}
          onChange={e => setGenPan(sanitizeDigits(e.target.value))}
          placeholder="371234567890123"
          maxLength={15}
          prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
          suffix={lengthIndicator(sanitizeDigits(genPan).length, 15)}
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px',
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
            placeholder="9912"
            maxLength={4}
            suffix={lengthIndicator(genExpDate.length, 4)}
            style={{
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px',
            }}
            size="large"
          />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>Service Code:</Text>
          <Input
            value={genServiceCode}
            onChange={e => setGenServiceCode(sanitizeDigits(e.target.value))}
            placeholder="702"
            maxLength={3}
            suffix={lengthIndicator(genServiceCode.length, 3)}
            style={{
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px',
            }}
            size="large"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button type="primary" size="large" icon={<LockOutlined />} onClick={handleGenerate}>
          {t.common?.generate || 'Generate'}
        </Button>
      </div>

      {genError && (
        <div
          style={{
            padding: '12px 16px',
            background: isDark ? '#2a1215' : '#fff2f0',
            border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
            borderRadius: '6px',
          }}
        >
          <Text type="danger" style={{ fontSize: '13px' }}>
            {genError}
          </Text>
        </div>
      )}

      {genResults && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {genVersion === '2' && genResults.csc5 && (
            <ResultCard
              title="CSC-5: [5]"
              result={genResults.csc5}
              onCopy={() => handleCopy(genResults.csc5!)}
              icon={<LockOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {genResults.csc4 && (
            <ResultCard
              title="CSC-4: [4]"
              result={genResults.csc4}
              onCopy={() => handleCopy(genResults.csc4!)}
              icon={<LockOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {genVersion === '2' && genResults.csc3 && (
            <ResultCard
              title="CSC-3: [3]"
              result={genResults.csc3}
              onCopy={() => handleCopy(genResults.csc3!)}
              icon={<LockOutlined />}
            />
          )}
        </div>
      )}
    </div>
  );

  const validateTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.amexCsc?.cscVersion || 'CSC version'}:
        </Text>
        <Segmented
          value={valVersion}
          onChange={(value) => setValVersion(value as '1' | '2')}
          options={[
            { label: 'CSC ver. 1', value: '1' },
            { label: 'CSC ver. 2', value: '2' },
          ]}
          block
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>CSC Key:</Text>
        <Input
          value={valCscKey}
          onChange={e => setValCscKey(sanitizeHex(e.target.value))}
          placeholder="0123456789ABCDEFFEDCBA9876543210"
          maxLength={48}
          suffix={lengthIndicator(sanitizeHex(valCscKey).length, 32)}
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px',
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>PAN:</Text>
        <Input
          value={valPan}
          onChange={e => setValPan(sanitizeDigits(e.target.value))}
          placeholder="371234567890123"
          maxLength={15}
          prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
          suffix={lengthIndicator(sanitizeDigits(valPan).length, 15)}
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px',
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
            placeholder="9912"
            maxLength={4}
            suffix={lengthIndicator(valExpDate.length, 4)}
            style={{
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px',
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
              fontSize: '14px',
            }}
            size="large"
          />
        </div>
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>CSC:</Text>
        <Input
          value={valCsc}
          onChange={e => setValCsc(sanitizeDigits(e.target.value))}
          placeholder={valType === 'csc5' ? '70954' : valType === 'csc3' ? '283' : '4117'}
          maxLength={valType === 'csc5' ? 5 : valType === 'csc4' || valType === 'csc' ? 4 : 3}
          suffix={lengthIndicator(
            valCsc.length,
            valType === 'csc5' ? 5 : valType === 'csc4' || valType === 'csc' ? 4 : 3
          )}
          style={{
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px',
          }}
          size="large"
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button type="primary" size="large" icon={<CheckCircleOutlined />} onClick={handleValidate}>
          {t.common?.parse || 'Validate'}
        </Button>
      </div>

      {valError && (
        <div
          style={{
            padding: '12px 16px',
            background: isDark ? '#2a1215' : '#fff2f0',
            border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
            borderRadius: '6px',
          }}
        >
          <Text type="danger" style={{ fontSize: '13px' }}>
            {valError}
          </Text>
        </div>
      )}

      {valResult && (
        <div
          style={{
            padding: '16px',
            background:
              valResult === 'valid'
                ? isDark
                  ? '#162312'
                  : '#f6ffed'
                : isDark
                ? '#2a1215'
                : '#fff2f0',
            border: `1px solid ${
              valResult === 'valid'
                ? isDark
                  ? '#274916'
                  : '#b7eb8f'
                : isDark
                ? '#58181c'
                : '#ffccc7'
            }`,
            borderRadius: '6px',
            textAlign: 'center',
          }}
        >
          <Text
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: valResult === 'valid' ? '#52c41a' : '#ff4d4f',
            }}
          >
            {valResult === 'valid'
              ? t.amexCsc?.validResult || '✓ Valid - CSC is correct'
              : t.amexCsc?.invalidResult || '✗ Invalid - CSC does not match'}
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
            {t.amexCsc?.title || 'Card Security Code (AMEX)'}
          </Title>
          <CollapsibleInfo title={t.amexCsc?.infoTitle || 'About AMEX CSC'}>
            <div>
              {t.amexCsc?.info1 ||
                'AMEX CSC (Card Security Code) is a security feature similar to CVV/CVC but specific to American Express cards.'}
            </div>
            <div style={{ marginTop: 8 }}>
              {t.amexCsc?.info2 ||
                'CSC ver. 1: 4-digit code on magnetic stripe. CSC ver. 2: Enhanced with CSC-5 (5 digits), CSC-4 (4 digits), and CSC-3 (3 digits printed on card front).'}
            </div>
            <div style={{ marginTop: 8 }}>
              {t.amexCsc?.info3 ||
                'Generated using AMEX 15-digit PAN, expiry date, and service code encrypted with the issuer CSC Key.'}
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.amexCsc?.description ||
            'Generate and validate AMEX Card Security Codes (CSC) for American Express payment cards.'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs
          defaultActiveKey="generate"
          items={[
            {
              key: 'generate',
              label: t.amexCsc?.tabGenerate || 'Generate',
              children: generateTab,
            },
            {
              key: 'validate',
              label: t.amexCsc?.tabValidate || 'Validate',
              children: validateTab,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AmexCSCTool;
