import React, { useState } from 'react';
import { Card, Button, Tabs, Input, Segmented, message, Tag, Typography } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined, KeyOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;
const { TextArea } = Input;

type WorkingKeyType = '2TDEA' | '3TDEA' | 'AES-128' | 'AES-192' | 'AES-256';

// DUKPT AES Key Derivation
const deriveWorkingKey = (
  bdk: string,
  ksn: string,
  keyType: WorkingKeyType
): string => {
  const cleanBdk = bdk.replace(/\s/g, '').toUpperCase();
  const cleanKsn = ksn.replace(/\s/g, '').toUpperCase();
  
  // For AES DUKPT, use AES-CMAC for derivation
  // Simplified implementation - in production, use proper AES-CMAC
  
  const ksnBase = cleanKsn.substring(0, 16);
  const counter = parseInt(cleanKsn.substring(16), 16);
  
  // Initial key derivation
  const bdkKey = CryptoJS.enc.Hex.parse(cleanBdk);
  const ksnData = CryptoJS.enc.Hex.parse(ksnBase);
  
  let derivedKey: CryptoJS.lib.WordArray;
  
  if (keyType === '2TDEA' || keyType === '3TDEA') {
    // Use 3DES for TDEA
    const leftHalf = CryptoJS.TripleDES.encrypt(ksnData, bdkKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }).ciphertext;
    
    const mask = CryptoJS.enc.Hex.parse('C0C0C0C000000000C0C0C0C000000000');
    const xoredData = CryptoJS.lib.WordArray.create(
      ksnData.words.map((w, i) => w ^ mask.words[i]),
      8
    );
    
    const rightHalf = CryptoJS.TripleDES.encrypt(xoredData, bdkKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }).ciphertext;
    
    derivedKey = leftHalf.concat(rightHalf);
  } else {
    // Use AES for AES-128/192/256
    const keySize = keyType === 'AES-128' ? 16 : keyType === 'AES-192' ? 24 : 32;
    
    // AES encryption
    derivedKey = CryptoJS.AES.encrypt(ksnData, bdkKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }).ciphertext;
    
    // Truncate or extend to required key size
    if (derivedKey.sigBytes > keySize) {
      derivedKey = CryptoJS.lib.WordArray.create(
        derivedKey.words.slice(0, keySize / 4),
        keySize
      );
    } else if (derivedKey.sigBytes < keySize) {
      // Extend by concatenating encrypted counter
      const counterData = CryptoJS.enc.Hex.parse(counter.toString(16).padStart(32, '0'));
      const extension = CryptoJS.AES.encrypt(counterData, bdkKey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext;
      
      derivedKey = derivedKey.concat(extension);
      derivedKey = CryptoJS.lib.WordArray.create(
        derivedKey.words.slice(0, keySize / 4),
        keySize
      );
    }
  }
  
  // Apply counter-based derivation
  let currentKey = derivedKey;
  for (let i = 0; i < 21; i++) {
    if ((counter >> i) & 1) {
      const counterData = CryptoJS.enc.Hex.parse((1 << i).toString(16).padStart(32, '0'));
      const xorResult = CryptoJS.lib.WordArray.create(
        currentKey.words.map((w, idx) => w ^ (counterData.words[idx] || 0)),
        currentKey.sigBytes
      );
      
      if (keyType === '2TDEA' || keyType === '3TDEA') {
        currentKey = CryptoJS.TripleDES.encrypt(xorResult, CryptoJS.enc.Hex.parse(cleanBdk), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }).ciphertext;
      } else {
        currentKey = CryptoJS.AES.encrypt(xorResult, CryptoJS.enc.Hex.parse(cleanBdk), {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }).ciphertext;
      }
    }
  }
  
  return currentKey.toString().toUpperCase();
};

// Encrypt/Decrypt PIN
const processPIN = (
  pek: string,
  pinBlock: string,
  keyType: WorkingKeyType,
  isEncrypt: boolean
): string => {
  const cleanPek = pek.replace(/\s/g, '').toUpperCase();
  const cleanPin = pinBlock.replace(/\s/g, '').toUpperCase();
  
  const key = CryptoJS.enc.Hex.parse(cleanPek);
  const data = CryptoJS.enc.Hex.parse(cleanPin);
  
  if (keyType === '2TDEA' || keyType === '3TDEA') {
    if (isEncrypt) {
      return CryptoJS.TripleDES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext.toString().toUpperCase();
    } else {
      const ciphertext = CryptoJS.enc.Hex.parse(cleanPin);
      return CryptoJS.TripleDES.decrypt(
        { ciphertext } as any,
        key,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }
      ).toString().toUpperCase();
    }
  } else {
    if (isEncrypt) {
      return CryptoJS.AES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext.toString().toUpperCase();
    } else {
      const ciphertext = CryptoJS.enc.Hex.parse(cleanPin);
      return CryptoJS.AES.decrypt(
        { ciphertext } as any,
        key,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }
      ).toString().toUpperCase();
    }
  }
};

// Calculate MAC
const calculateMAC = (
  macKey: string,
  data: string,
  keyType: WorkingKeyType
): string => {
  const cleanKey = macKey.replace(/\s/g, '').toUpperCase();
  const cleanData = data.replace(/\s/g, '').toUpperCase();
  
  // Pad data to block size
  let paddedData = cleanData;
  const blockSize = (keyType === '2TDEA' || keyType === '3TDEA') ? 16 : 32;
  if (paddedData.length % blockSize !== 0) {
    paddedData = paddedData.padEnd(Math.ceil(paddedData.length / blockSize) * blockSize, '0');
  }
  
  const key = CryptoJS.enc.Hex.parse(cleanKey);
  const dataWords = CryptoJS.enc.Hex.parse(paddedData);
  
  if (keyType === '2TDEA' || keyType === '3TDEA') {
    const encrypted = CryptoJS.TripleDES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    });
    
    const result = encrypted.ciphertext.toString().toUpperCase();
    return result.substring(result.length - 16);
  } else {
    // Use AES-CMAC (simplified implementation)
    const encrypted = CryptoJS.AES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('00000000000000000000000000000000'),
    });
    
    const result = encrypted.ciphertext.toString().toUpperCase();
    return result.substring(result.length - 32);
  }
};

// Process Data
const processData = (
  dek: string,
  data: string,
  keyType: WorkingKeyType,
  isEncrypt: boolean
): string => {
  const cleanDek = dek.replace(/\s/g, '').toUpperCase();
  const cleanData = data.replace(/\s/g, '').toUpperCase();
  
  const key = CryptoJS.enc.Hex.parse(cleanDek);
  
  if (keyType === '2TDEA' || keyType === '3TDEA') {
    if (isEncrypt) {
      const dataWords = CryptoJS.enc.Hex.parse(cleanData);
      return CryptoJS.TripleDES.encrypt(dataWords, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext.toString().toUpperCase();
    } else {
      const ciphertext = CryptoJS.enc.Hex.parse(cleanData);
      return CryptoJS.TripleDES.decrypt(
        { ciphertext } as any,
        key,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }
      ).toString().toUpperCase();
    }
  } else {
    if (isEncrypt) {
      const dataWords = CryptoJS.enc.Hex.parse(cleanData);
      return CryptoJS.AES.encrypt(dataWords, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext.toString().toUpperCase();
    } else {
      const ciphertext = CryptoJS.enc.Hex.parse(cleanData);
      return CryptoJS.AES.decrypt(
        { ciphertext } as any,
        key,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
        }
      ).toString().toUpperCase();
    }
  }
};

const DUKPTAESTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Working Key Derivation
  const [keyDesignation, setKeyDesignation] = useState<'BDK' | 'IK'>('BDK');
  const [workingKeyType, setWorkingKeyType] = useState<WorkingKeyType>('AES-128');
  const [bdk, setBdk] = useState('');
  const [ksn, setKsn] = useState('');
  const [derivedKey, setDerivedKey] = useState('');
  const [derivError, setDerivError] = useState('');
  
  // DUKPT PIN
  const [pinPek, setPinPek] = useState('');
  const [pinBlock, setPinBlock] = useState('');
  const [pinResult, setPinResult] = useState('');
  const [pinError, setPinError] = useState('');
  
  // DUKPT MAC
  const [macGen, setMacGen] = useState('');
  const [macData, setMacData] = useState('');
  const [macResult, setMacResult] = useState('');
  const [macError, setMacError] = useState('');
  
  // DUKPT DATA
  const [dek, setDek] = useState('');
  const [dataInputType, setDataInputType] = useState<'ASCII' | 'Hexadecimal'>('Hexadecimal');
  const [dataInput, setDataInput] = useState('');
  const [dataResult, setDataResult] = useState('');
  const [dataError, setDataError] = useState('');

  const sanitizeHex = (value: string) => {
    return value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(t.common?.copied || 'Copied to clipboard!');
    } catch {
      message.error('Failed to copy');
    }
  };

  // Get expected key length based on key type
  const getExpectedKeyLength = (keyType: WorkingKeyType): number => {
    switch (keyType) {
      case '2TDEA':
      case 'AES-128':
        return 32;
      case '3TDEA':
      case 'AES-192':
        return 48;
      case 'AES-256':
        return 64;
      default:
        return 32;
    }
  };

  // Working Key Derivation Handler
  const handleDeriveKey = () => {
    setDerivError('');
    setDerivedKey('');
    
    const cleanBdk = sanitizeHex(bdk);
    const cleanKsn = sanitizeHex(ksn);
    const expectedLength = getExpectedKeyLength(workingKeyType);
    
    if (cleanBdk.length !== expectedLength) {
      setDerivError(`${keyDesignation} must be ${expectedLength} hex characters`);
      return;
    }
    if (cleanKsn.length !== 24) {
      setDerivError('KSN must be 24 hex characters');
      return;
    }
    
    try {
      const key = deriveWorkingKey(cleanBdk, cleanKsn, workingKeyType);
      setDerivedKey(key);
    } catch (err) {
      setDerivError('Failed to derive working key');
    }
  };

  // PIN Encryption Handler
  const handleEncryptPIN = () => {
    setPinError('');
    setPinResult('');
    
    const cleanPek = sanitizeHex(pinPek);
    const cleanPin = sanitizeHex(pinBlock);
    const expectedLength = getExpectedKeyLength(workingKeyType);
    
    if (cleanPek.length !== expectedLength) {
      setPinError(`PEK must be ${expectedLength} hex characters`);
      return;
    }
    if (cleanPin.length !== 32) {
      setPinError('PIN block must be 32 hex characters');
      return;
    }
    
    try {
      const encrypted = processPIN(cleanPek, cleanPin, workingKeyType, true);
      setPinResult(encrypted);
    } catch (err) {
      setPinError('Failed to encrypt PIN block');
    }
  };

  // PIN Decryption Handler
  const handleDecryptPIN = () => {
    setPinError('');
    setPinResult('');
    
    const cleanPek = sanitizeHex(pinPek);
    const cleanPin = sanitizeHex(pinBlock);
    const expectedLength = getExpectedKeyLength(workingKeyType);
    
    if (cleanPek.length !== expectedLength) {
      setPinError(`PEK must be ${expectedLength} hex characters`);
      return;
    }
    if (cleanPin.length !== 32) {
      setPinError('PIN block must be 32 hex characters');
      return;
    }
    
    try {
      const decrypted = processPIN(cleanPek, cleanPin, workingKeyType, false);
      setPinResult(decrypted);
    } catch (err) {
      setPinError('Failed to decrypt PIN block');
    }
  };

  // MAC Calculation Handler
  const handleCalculateMAC = () => {
    setMacError('');
    setMacResult('');
    
    const cleanMac = sanitizeHex(macGen);
    const cleanData = sanitizeHex(macData);
    const expectedLength = getExpectedKeyLength(workingKeyType);
    
    if (cleanMac.length !== expectedLength) {
      setMacError(`MAC Gen. must be ${expectedLength} hex characters`);
      return;
    }
    if (cleanData.length === 0) {
      setMacError('Data is required');
      return;
    }
    
    try {
      const mac = calculateMAC(cleanMac, cleanData, workingKeyType);
      setMacResult(mac);
    } catch (err) {
      setMacError('Failed to calculate MAC');
    }
  };

  // Data Encryption Handler
  const handleEncryptData = () => {
    setDataError('');
    setDataResult('');
    
    const cleanDek = sanitizeHex(dek);
    let cleanData = dataInput;
    const expectedLength = getExpectedKeyLength(workingKeyType);
    
    if (dataInputType === 'Hexadecimal') {
      cleanData = sanitizeHex(dataInput);
    } else {
      // Convert ASCII to hex
      cleanData = dataInput.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    
    if (cleanDek.length !== expectedLength) {
      setDataError(`DEK must be ${expectedLength} hex characters`);
      return;
    }
    if (cleanData.length === 0) {
      setDataError('Data is required');
      return;
    }
    
    // Pad to block size
    const blockSize = (workingKeyType === '2TDEA' || workingKeyType === '3TDEA') ? 16 : 32;
    if (cleanData.length % blockSize !== 0) {
      cleanData = cleanData.padEnd(Math.ceil(cleanData.length / blockSize) * blockSize, '0');
    }
    
    try {
      const encrypted = processData(cleanDek, cleanData, workingKeyType, true);
      setDataResult(encrypted);
    } catch (err) {
      setDataError('Failed to encrypt data');
    }
  };

  // Data Decryption Handler
  const handleDecryptData = () => {
    setDataError('');
    setDataResult('');
    
    const cleanDek = sanitizeHex(dek);
    const cleanData = sanitizeHex(dataInput);
    const expectedLength = getExpectedKeyLength(workingKeyType);
    const blockSize = (workingKeyType === '2TDEA' || workingKeyType === '3TDEA') ? 16 : 32;
    
    if (cleanDek.length !== expectedLength) {
      setDataError(`DEK must be ${expectedLength} hex characters`);
      return;
    }
    if (cleanData.length === 0) {
      setDataError('Data is required');
      return;
    }
    if (cleanData.length % blockSize !== 0) {
      setDataError(`Encrypted data must be multiple of ${blockSize} hex characters`);
      return;
    }
    
    try {
      const decrypted = processData(cleanDek, cleanData, workingKeyType, false);
      setDataResult(decrypted);
    } catch (err) {
      setDataError('Failed to decrypt data');
    }
  };

  const derivationTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Input key designation:
        </Text>
        <Segmented
          value={keyDesignation}
          onChange={(value) => setKeyDesignation(value as 'BDK' | 'IK')}
          options={[
            { label: 'BDK', value: 'BDK' },
            { label: 'IK', value: 'IK' },
          ]}
          block
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>{keyDesignation}:</Text>
          {lengthIndicator(sanitizeHex(bdk).length, getExpectedKeyLength(workingKeyType))}
        </div>
        <Input
          value={bdk}
          onChange={e => setBdk(sanitizeHex(e.target.value))}
          placeholder="FEDCBA9876543210F1F1F1F1F1F1F1F1"
          maxLength={64}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Working key type:
        </Text>
        <Segmented
          value={workingKeyType}
          onChange={(value) => setWorkingKeyType(value as WorkingKeyType)}
          options={[
            { label: '2TDEA', value: '2TDEA' },
            { label: '3TDEA', value: '3TDEA' },
            { label: 'AES-128', value: 'AES-128' },
            { label: 'AES-192', value: 'AES-192' },
            { label: 'AES-256', value: 'AES-256' },
          ]}
          block
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>KSN:</Text>
          {lengthIndicator(sanitizeHex(ksn).length, 24)}
        </div>
        <Input
          value={ksn}
          onChange={e => setKsn(sanitizeHex(e.target.value))}
          placeholder="11111111C14017E00000"
          maxLength={24}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button
          type="primary"
          size="large"
          icon={<KeyOutlined />}
          onClick={handleDeriveKey}
        >
          Derive Key
        </Button>
      </div>

      {derivError && (
        <div style={{ 
          padding: '12px 16px', 
          background: isDark ? '#2a1215' : '#fff2f0',
          border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{derivError}</Text>
        </div>
      )}

      {derivedKey && (
        <div style={{ 
          padding: '16px', 
          background: isDark ? '#162312' : '#f6ffed',
          border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`,
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong style={{ fontSize: '14px' }}>Working Key:</Text>
            <Tag color="green">[{derivedKey.length}]</Tag>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              value={derivedKey}
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
              onClick={() => handleCopy(derivedKey)}
              size="large"
            >
              {t.common?.copy || 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const pinTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>PEK:</Text>
          {lengthIndicator(sanitizeHex(pinPek).length, getExpectedKeyLength(workingKeyType))}
        </div>
        <Input
          value={pinPek}
          onChange={e => setPinPek(sanitizeHex(e.target.value))}
          placeholder="4EC2A2974ECA53F5691E5273963EBE5C"
          maxLength={64}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>PIN block:</Text>
          {lengthIndicator(sanitizeHex(pinBlock).length, 32)}
        </div>
        <Input
          value={pinBlock}
          onChange={e => setPinBlock(sanitizeHex(e.target.value))}
          placeholder="11111111C14017E00000"
          maxLength={32}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button
          type="primary"
          size="large"
          icon={<LockOutlined />}
          onClick={handleEncryptPIN}
        >
          Encrypt
        </Button>
        <Button
          type="default"
          size="large"
          icon={<UnlockOutlined />}
          onClick={handleDecryptPIN}
        >
          Decrypt
        </Button>
      </div>

      {pinError && (
        <div style={{ 
          padding: '12px 16px', 
          background: isDark ? '#2a1215' : '#fff2f0',
          border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{pinError}</Text>
        </div>
      )}

      {pinResult && (
        <div style={{ 
          padding: '16px', 
          background: isDark ? '#162312' : '#f6ffed',
          border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`,
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong style={{ fontSize: '14px' }}>Result:</Text>
            <Tag color="green">[{pinResult.length}]</Tag>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              value={pinResult}
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
              onClick={() => handleCopy(pinResult)}
              size="large"
            >
              {t.common?.copy || 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const macTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>MAC Gen.:</Text>
          {lengthIndicator(sanitizeHex(macGen).length, getExpectedKeyLength(workingKeyType))}
        </div>
        <Input
          value={macGen}
          onChange={e => setMacGen(sanitizeHex(e.target.value))}
          placeholder="4EC2A2974ECA53F5691E5273963EBE5C"
          maxLength={64}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>Data:</Text>
          {lengthIndicator(sanitizeHex(macData).length, 0)}
        </div>
        <TextArea
          value={macData}
          onChange={e => setMacData(sanitizeHex(e.target.value))}
          placeholder="Enter hex data"
          autoSize={{ minRows: 8, maxRows: 16 }}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button
          type="primary"
          size="large"
          icon={<CalculatorOutlined />}
          onClick={handleCalculateMAC}
        >
          Calculate MAC
        </Button>
      </div>

      {macError && (
        <div style={{ 
          padding: '12px 16px', 
          background: isDark ? '#2a1215' : '#fff2f0',
          border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{macError}</Text>
        </div>
      )}

      {macResult && (
        <div style={{ 
          padding: '16px', 
          background: isDark ? '#162312' : '#f6ffed',
          border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`,
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong style={{ fontSize: '14px' }}>MAC:</Text>
            <Tag color="green">[{macResult.length}]</Tag>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Input
              value={macResult}
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
              onClick={() => handleCopy(macResult)}
              size="large"
            >
              {t.common?.copy || 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const dataTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>DEK:</Text>
          {lengthIndicator(sanitizeHex(dek).length, getExpectedKeyLength(workingKeyType))}
        </div>
        <Input
          value={dek}
          onChange={e => setDek(sanitizeHex(e.target.value))}
          placeholder="4EC2A2974ECA53F5691E5273963EBE5C"
          maxLength={64}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          Data input:
        </Text>
        <Segmented
          value={dataInputType}
          onChange={(value) => setDataInputType(value as 'ASCII' | 'Hexadecimal')}
          options={[
            { label: 'ASCII', value: 'ASCII' },
            { label: 'Hexadecimal', value: 'Hexadecimal' },
          ]}
          block
        />
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>Data:</Text>
          {lengthIndicator(
            dataInputType === 'Hexadecimal' ? sanitizeHex(dataInput).length : dataInput.length * 2,
            0
          )}
        </div>
        <TextArea
          value={dataInput}
          onChange={e => setDataInput(dataInputType === 'Hexadecimal' ? sanitizeHex(e.target.value) : e.target.value)}
          placeholder={dataInputType === 'Hexadecimal' ? 'Enter hex data' : 'Enter ASCII text'}
          autoSize={{ minRows: 8, maxRows: 16 }}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
        <Button
          type="primary"
          size="large"
          icon={<LockOutlined />}
          onClick={handleEncryptData}
        >
          Encrypt
        </Button>
        <Button
          type="default"
          size="large"
          icon={<UnlockOutlined />}
          onClick={handleDecryptData}
        >
          Decrypt
        </Button>
      </div>

      {dataError && (
        <div style={{ 
          padding: '12px 16px', 
          background: isDark ? '#2a1215' : '#fff2f0',
          border: `1px solid ${isDark ? '#58181c' : '#ffccc7'}`,
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{dataError}</Text>
        </div>
      )}

      {dataResult && (
        <div style={{ 
          padding: '16px', 
          background: isDark ? '#162312' : '#f6ffed',
          border: `1px solid ${isDark ? '#274916' : '#b7eb8f'}`,
          borderRadius: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong style={{ fontSize: '14px' }}>Result:</Text>
            <Tag color="green">[{dataResult.length}]</Tag>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <TextArea
              value={dataResult}
              readOnly
              autoSize={{ minRows: 3, maxRows: 10 }}
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                fontSize: '14px',
                fontWeight: 600,
                color: '#52c41a',
                flex: 1
              }}
            />
            <Button
              icon={<CopyOutlined />}
              onClick={() => handleCopy(dataResult)}
              size="large"
            >
              {t.common?.copy || 'Copy'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            DUKPT (AES)
          </Title>
          <CollapsibleInfo title="About DUKPT (AES)">
            <div>
              DUKPT (Derived Unique Key Per Transaction) with AES support extends the original DUKPT standard to use AES encryption algorithms.
            </div>
            <div style={{ marginTop: 8 }}>
              It supports 2TDEA, 3TDEA, AES-128, AES-192, and AES-256 encryption, providing enhanced security for modern payment systems while maintaining backward compatibility.
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16, fontSize: '13px' }}>
          Derive keys and encrypt/decrypt data using DUKPT with AES support.
        </Text>

        <Tabs
          defaultActiveKey="derivation"
          items={[
            {
              key: 'derivation',
              label: 'Working key derivation',
              children: derivationTab,
            },
            {
              key: 'pin',
              label: 'DUKPT PIN',
              children: pinTab,
            },
            {
              key: 'mac',
              label: 'DUKPT MAC',
              children: macTab,
            },
            {
              key: 'data',
              label: 'DUKPT DATA',
              children: dataTab,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default DUKPTAESTool;
