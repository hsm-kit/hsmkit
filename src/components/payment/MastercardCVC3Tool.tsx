import React, { useState } from 'react';
import { Card, Button, Tabs, Input, Segmented, message, Tag, Typography } from 'antd';
import { LockOutlined, CopyOutlined, CreditCardOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;

// MasterCard CVC3 calculation using 3DES
const calculateCVC3 = (
  imk: string,
  pan: string,
  panSeq: string,
  track12Data: string,
  unpredictableNum: string,
  atc: string
): string => {
  const cleanImk = imk.replace(/\s/g, '').toUpperCase();
  const cleanPan = pan.replace(/\s/g, '');
  const cleanPanSeq = panSeq.padStart(2, '0');
  const cleanTrack = track12Data.replace(/\s/g, '').toUpperCase();
  const cleanUN = unpredictableNum.replace(/\s/g, '').toUpperCase();
  const cleanAtc = atc.replace(/\s/g, '').toUpperCase();

  // Derive MK-CVC3 from IMK
  // MK-CVC3 = 3DES(IMK, PAN || PAN_SEQ || '01')
  const derivationData = cleanPan.padEnd(16, '0').substring(0, 16) + cleanPanSeq + '01';
  const derivationDataHex = derivationData.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  
  const imkKey = CryptoJS.enc.Hex.parse(cleanImk);
  const derivationWords = CryptoJS.enc.Hex.parse(derivationDataHex.padEnd(32, '0').substring(0, 32));
  
  const mkCvc3Encrypted = CryptoJS.TripleDES.encrypt(derivationWords, imkKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  
  const mkCvc3 = mkCvc3Encrypted.ciphertext.toString().toUpperCase().substring(0, 32);

  // Calculate CVC3
  // Input data: Track1/2 Data (64 bytes) + UN (4 bytes) + ATC (2 bytes)
  // For dynamic CVC3: use first 64 bytes of track data
  // For PIN-CVC3: different derivation
  
  let inputData = cleanTrack.padEnd(128, '0').substring(0, 128) + cleanUN.padStart(8, '0') + cleanAtc.padStart(4, '0');
  
  // Take first 16 bytes for encryption
  const inputBlock = inputData.substring(0, 32);
  
  const mkKey = CryptoJS.enc.Hex.parse(mkCvc3);
  const inputWords = CryptoJS.enc.Hex.parse(inputBlock);
  
  const encrypted = CryptoJS.TripleDES.encrypt(inputWords, mkKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  
  const result = encrypted.ciphertext.toString().toUpperCase();
  
  // Extract decimal digits from hex result (CVC3 is 3 digits)
  const decimals = result.replace(/[A-F]/g, '').substring(0, 3);
  
  return decimals.padStart(3, '0');
};

// Validate CVC3
const validateCVC3 = (
  imk: string,
  pan: string,
  panSeq: string,
  track12Data: string,
  unpredictableNum: string,
  atc: string,
  cvc3: string
): boolean => {
  const calculated = calculateCVC3(imk, pan, panSeq, track12Data, unpredictableNum, atc);
  return calculated === cvc3;
};

const MastercardCVC3Tool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Generate tab state
  const [genImk, setGenImk] = useState('');
  const [genPan, setGenPan] = useState('');
  const [genPanSeq, setGenPanSeq] = useState('');
  const [genTrack, setGenTrack] = useState('');
  const [genUN, setGenUN] = useState('');
  const [genAtc, setGenAtc] = useState('');
  const [genType, setGenType] = useState<'dynamic' | 'pin'>('dynamic');
  const [genResult, setGenResult] = useState('');
  const [genError, setGenError] = useState('');
  
  // Validate tab state
  const [valImk, setValImk] = useState('');
  const [valPan, setValPan] = useState('');
  const [valPanSeq, setValPanSeq] = useState('');
  const [valTrack, setValTrack] = useState('');
  const [valUN, setValUN] = useState('');
  const [valAtc, setValAtc] = useState('');
  const [valType, setValType] = useState<'dynamic' | 'pin'>('dynamic');
  const [valCvc3, setValCvc3] = useState('');
  const [valResult, setValResult] = useState<'valid' | 'invalid' | null>(null);
  const [valError, setValError] = useState('');

  const sanitizeHex = (value: string) => {
    return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  };

  const sanitizeDigits = (value: string) => {
    return value.replace(/[^0-9]/g, '');
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

  // Generate CVC3
  const handleGenerate = () => {
    setGenError('');
    setGenResult('');

    const cleanImk = sanitizeHex(genImk);
    const cleanPan = sanitizeDigits(genPan);
    const cleanPanSeq = sanitizeDigits(genPanSeq);
    const cleanTrack = sanitizeHex(genTrack);
    const cleanUN = sanitizeHex(genUN);
    const cleanAtc = sanitizeHex(genAtc);

    // Validation
    if (cleanImk.length !== 32) {
      setGenError(t.mastercardCvc3?.errorInvalidImk || 'IMK must be 32 hex characters');
      return;
    }
    if (cleanPan.length < 13 || cleanPan.length > 19) {
      setGenError(t.mastercardCvc3?.errorInvalidPan || 'PAN must be 13-19 digits');
      return;
    }
    if (cleanPanSeq.length !== 2) {
      setGenError(t.mastercardCvc3?.errorInvalidPanSeq || 'PAN Seq. Num. must be 2 digits');
      return;
    }
    if (cleanTrack.length > 128) {
      setGenError(t.mastercardCvc3?.errorInvalidTrack || 'Track 1/2 Data must be max 128 hex characters');
      return;
    }
    if (cleanUN.length !== 8) {
      setGenError(t.mastercardCvc3?.errorInvalidUN || 'Unpredictable Number must be 8 hex characters');
      return;
    }
    if (cleanAtc.length !== 4) {
      setGenError(t.mastercardCvc3?.errorInvalidAtc || 'ATC must be 4 hex characters');
      return;
    }

    try {
      const cvc3 = calculateCVC3(cleanImk, cleanPan, cleanPanSeq, cleanTrack, cleanUN, cleanAtc);
      setGenResult(cvc3);
    } catch (err) {
      setGenError(t.mastercardCvc3?.errorGeneration || 'Failed to generate CVC3');
    }
  };

  // Validate CVC3
  const handleValidate = () => {
    setValError('');
    setValResult(null);

    const cleanImk = sanitizeHex(valImk);
    const cleanPan = sanitizeDigits(valPan);
    const cleanPanSeq = sanitizeDigits(valPanSeq);
    const cleanTrack = sanitizeHex(valTrack);
    const cleanUN = sanitizeHex(valUN);
    const cleanAtc = sanitizeHex(valAtc);
    const cleanCvc3 = sanitizeDigits(valCvc3);

    // Validation
    if (cleanImk.length !== 32) {
      setValError(t.mastercardCvc3?.errorInvalidImk || 'IMK must be 32 hex characters');
      return;
    }
    if (cleanPan.length < 13 || cleanPan.length > 19) {
      setValError(t.mastercardCvc3?.errorInvalidPan || 'PAN must be 13-19 digits');
      return;
    }
    if (cleanPanSeq.length !== 2) {
      setValError(t.mastercardCvc3?.errorInvalidPanSeq || 'PAN Seq. Num. must be 2 digits');
      return;
    }
    if (cleanTrack.length > 128) {
      setValError(t.mastercardCvc3?.errorInvalidTrack || 'Track 1/2 Data must be max 128 hex characters');
      return;
    }
    if (cleanUN.length !== 8) {
      setValError(t.mastercardCvc3?.errorInvalidUN || 'Unpredictable Number must be 8 hex characters');
      return;
    }
    if (cleanAtc.length !== 4) {
      setValError(t.mastercardCvc3?.errorInvalidAtc || 'ATC must be 4 hex characters');
      return;
    }
    if (cleanCvc3.length !== 3) {
      setValError(t.mastercardCvc3?.errorInvalidCvc3 || 'CVC3 must be 3 digits');
      return;
    }

    try {
      const isValid = validateCVC3(cleanImk, cleanPan, cleanPanSeq, cleanTrack, cleanUN, cleanAtc, cleanCvc3);
      setValResult(isValid ? 'valid' : 'invalid');
    } catch (err) {
      setValError(t.mastercardCvc3?.errorValidation || 'Failed to validate CVC3');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t.common?.copied || 'Copied to clipboard!');
    } catch {
      message.error(t.mastercardCvc3?.copyError || 'Failed to copy');
    }
  };

  const generateTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>IMK:</Text>
          {lengthIndicator(sanitizeHex(genImk).length, 32)}
        </div>
        <Input
          value={genImk}
          onChange={e => setGenImk(sanitizeHex(e.target.value))}
          placeholder="0123456789ABCDEFFEDCBA9876543210"
          maxLength={32}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>PAN:</Text>
          {lengthIndicator(sanitizeDigits(genPan).length, 16)}
        </div>
        <Input
          value={genPan}
          onChange={e => setGenPan(sanitizeDigits(e.target.value))}
          placeholder="5413123456784808"
          maxLength={19}
          prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>PAN Seq. Num.:</Text>
            {lengthIndicator(genPanSeq.length, 2)}
          </div>
          <Input
            value={genPanSeq}
            onChange={e => setGenPanSeq(sanitizeDigits(e.target.value))}
            placeholder="00"
            maxLength={2}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>ATC:</Text>
            {lengthIndicator(genAtc.length, 4)}
          </div>
          <Input
            value={genAtc}
            onChange={e => setGenAtc(sanitizeHex(e.target.value))}
            placeholder="005E"
            maxLength={4}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>Track 1/2 Data:</Text>
          {lengthIndicator(sanitizeHex(genTrack).length, 128)}
        </div>
        <Input
          value={genTrack}
          onChange={e => setGenTrack(sanitizeHex(e.target.value))}
          placeholder="00"
          maxLength={128}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>Unpredictable Num.:</Text>
          {lengthIndicator(sanitizeHex(genUN).length, 8)}
        </div>
        <Input
          value={genUN}
          onChange={e => setGenUN(sanitizeHex(e.target.value))}
          placeholder="00000899"
          maxLength={8}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.mastercardCvc3?.cvc3Type || 'CVC3 type'}:
        </Text>
        <Segmented
          value={genType}
          onChange={(value) => setGenType(value as 'dynamic' | 'pin')}
          options={[
            { label: 'dynamic CVC3', value: 'dynamic' },
            { label: 'PIN-CVC3', value: 'pin' },
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
        <div style={{ 
          padding: '16px', 
          background: isDark ? '#162312' : '#f6ffed',
          border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`,
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong style={{ fontSize: '14px' }}>
              {genType === 'dynamic' ? 'dynamic CVC3:' : 'PIN-CVC3:'}
            </Text>
            <Tag color="green">[3]</Tag>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              value={genResult}
              readOnly
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '16px',
                fontWeight: 600,
                color: '#52c41a',
                flex: 1
              }}
              size="large"
            />
            <Button
              icon={<CopyOutlined />}
              onClick={() => handleCopy(genResult)}
              size="large"
            >
              {t.common?.copy || 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const validateTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>IMK:</Text>
          {lengthIndicator(sanitizeHex(valImk).length, 32)}
        </div>
        <Input
          value={valImk}
          onChange={e => setValImk(sanitizeHex(e.target.value))}
          placeholder="0123456789ABCDEFFEDCBA9876543210"
          maxLength={32}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>PAN:</Text>
          {lengthIndicator(sanitizeDigits(valPan).length, 16)}
        </div>
        <Input
          value={valPan}
          onChange={e => setValPan(sanitizeDigits(e.target.value))}
          placeholder="5413123456784808"
          maxLength={19}
          prefix={<CreditCardOutlined style={{ color: '#bfbfbf' }} />}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>PAN Seq. Num.:</Text>
            {lengthIndicator(valPanSeq.length, 2)}
          </div>
          <Input
            value={valPanSeq}
            onChange={e => setValPanSeq(sanitizeDigits(e.target.value))}
            placeholder="00"
            maxLength={2}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>ATC:</Text>
            {lengthIndicator(valAtc.length, 4)}
          </div>
          <Input
            value={valAtc}
            onChange={e => setValAtc(sanitizeHex(e.target.value))}
            placeholder="005E"
            maxLength={4}
            style={{ 
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px'
            }}
            size="large"
          />
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>Track 1/2 Data:</Text>
          {lengthIndicator(sanitizeHex(valTrack).length, 128)}
        </div>
        <Input
          value={valTrack}
          onChange={e => setValTrack(sanitizeHex(e.target.value))}
          placeholder="00"
          maxLength={128}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>Unpredictable Num.:</Text>
          {lengthIndicator(sanitizeHex(valUN).length, 8)}
        </div>
        <Input
          value={valUN}
          onChange={e => setValUN(sanitizeHex(e.target.value))}
          placeholder="00000899"
          maxLength={8}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>CVC3:</Text>
          {lengthIndicator(valCvc3.length, 3)}
        </div>
        <Input
          value={valCvc3}
          onChange={e => setValCvc3(sanitizeDigits(e.target.value))}
          placeholder="587"
          maxLength={3}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.mastercardCvc3?.cvc3Type || 'CVC3 type'}:
        </Text>
        <Segmented
          value={valType}
          onChange={(value) => setValType(value as 'dynamic' | 'pin')}
          options={[
            { label: 'dynamic CVC3', value: 'dynamic' },
            { label: 'PIN-CVC3', value: 'pin' },
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
              ? (t.mastercardCvc3?.validResult || '✓ Valid - CVC3 is correct')
              : (t.mastercardCvc3?.invalidResult || '✗ Invalid - CVC3 does not match')}
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
            {t.mastercardCvc3?.title || 'Card Verification Code (MasterCard)'}
          </Title>
          <CollapsibleInfo title={t.mastercardCvc3?.infoTitle || 'About MasterCard CVC3'}>
            <div>
              {t.mastercardCvc3?.info1 || 'MasterCard dynamic CVC3 is a 3-digit security code generated dynamically for contactless EMV transactions.'}
            </div>
            <div style={{ marginTop: 8 }}>
              {t.mastercardCvc3?.info2 || 'The CVC3 is derived from the ICC Master Key (IMK) and includes PAN, Track Data, Unpredictable Number, and ATC to ensure each transaction is unique.'}
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '13px' }}>
          {t.mastercardCvc3?.subtitle || 'Generate and validate MasterCard dynamic CVC3 for contactless EMV payment cards.'}
        </Text>

        <Tabs
          defaultActiveKey="generate"
          items={[
            {
              key: 'generate',
              label: t.common?.generate || 'Generate',
              children: generateTab,
            },
            {
              key: 'validate',
              label: t.common?.parse || 'Validate',
              children: validateTab,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default MastercardCVC3Tool;
