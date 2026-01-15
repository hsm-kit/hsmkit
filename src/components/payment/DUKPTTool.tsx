import React, { useState } from 'react';
import { Card, Button, Tabs, Input, Segmented, Checkbox, message, Typography, Divider } from 'antd';
import { LockOutlined, UnlockOutlined, KeyOutlined, CalculatorOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo, ResultCard } from '../common';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;
const { TextArea } = Input;

// DUKPT Key Derivation
const derivePEK = (bdk: string, ksn: string): string => {
  const cleanBdk = bdk.replace(/\s/g, '').toUpperCase();
  const cleanKsn = ksn.replace(/\s/g, '').toUpperCase();
  
  // Extract IPEK derivation data from KSN (first 8 bytes)
  const ksnBase = cleanKsn.substring(0, 16);
  
  // Derive IPEK from BDK
  const bdkKey = CryptoJS.enc.Hex.parse(cleanBdk);
  const ksnData = CryptoJS.enc.Hex.parse(ksnBase);
  
  // Left half: encrypt KSN with BDK
  const leftHalf = CryptoJS.TripleDES.encrypt(ksnData, bdkKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).ciphertext;
  
  // Right half: XOR KSN with mask, then encrypt
  const mask = CryptoJS.enc.Hex.parse('C0C0C0C000000000C0C0C0C000000000');
  const ksnDataWords = ksnData.words;
  const maskWords = mask.words;
  const xoredWords = ksnDataWords.map((w, i) => w ^ maskWords[i]);
  const xoredData = CryptoJS.lib.WordArray.create(xoredWords, 8);
  
  const rightHalf = CryptoJS.TripleDES.encrypt(xoredData, bdkKey, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  }).ciphertext;
  
  const ipek = leftHalf.concat(rightHalf);
  
  // Derive PEK from IPEK using KSN counter
  const counter = parseInt(cleanKsn.substring(16), 16);
  let currentKey = ipek;
  
  // Apply derivation steps based on counter bits
  for (let i = 0; i < 21; i++) {
    if ((counter >> i) & 1) {
      // Derive next key
      const curKeyData = CryptoJS.enc.Hex.parse(currentKey.toString());
      const counterData = CryptoJS.enc.Hex.parse((1 << i).toString(16).padStart(16, '0'));
      
      // XOR current key right half with counter
      const rightData = CryptoJS.lib.WordArray.create(curKeyData.words.slice(2, 4), 8);
      const xorResult = CryptoJS.lib.WordArray.create(
        rightData.words.map((w, idx) => w ^ counterData.words[idx]),
        8
      );
      
      const newRight = CryptoJS.TripleDES.encrypt(xorResult, curKeyData, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext;
      
      const newLeft = CryptoJS.lib.WordArray.create(curKeyData.words.slice(0, 2), 8);
      currentKey = newLeft.concat(newRight);
    }
  }
  
  return currentKey.toString().toUpperCase();
};

// DUKPT PIN Encryption
const encryptPIN = (pek: string, pinBlock: string): string => {
  const cleanPek = pek.replace(/\s/g, '').toUpperCase();
  const cleanPin = pinBlock.replace(/\s/g, '').toUpperCase();
  
  const key = CryptoJS.enc.Hex.parse(cleanPek);
  const data = CryptoJS.enc.Hex.parse(cleanPin);
  
  const encrypted = CryptoJS.TripleDES.encrypt(data, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  
  return encrypted.ciphertext.toString().toUpperCase();
};

// DUKPT PIN Decryption
const decryptPIN = (pek: string, encryptedPinBlock: string): string => {
  const cleanPek = pek.replace(/\s/g, '').toUpperCase();
  const cleanEncrypted = encryptedPinBlock.replace(/\s/g, '').toUpperCase();
  
  const key = CryptoJS.enc.Hex.parse(cleanPek);
  const ciphertext = CryptoJS.enc.Hex.parse(cleanEncrypted);
  
  const decrypted = CryptoJS.TripleDES.decrypt(
    { ciphertext } as CryptoJS.lib.CipherParams,
    key,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }
  );
  
  return decrypted.toString().toUpperCase();
};

// DUKPT MAC Calculation
const calculateMAC = (pek: string, data: string, use3DES: boolean): string => {
  const cleanPek = pek.replace(/\s/g, '').toUpperCase();
  const cleanData = data.replace(/\s/g, '').toUpperCase();
  
  // Pad data to multiple of 8 bytes
  let paddedData = cleanData;
  if (paddedData.length % 16 !== 0) {
    paddedData = paddedData.padEnd(Math.ceil(paddedData.length / 16) * 16, '0');
  }
  
  const key = CryptoJS.enc.Hex.parse(cleanPek.substring(0, use3DES ? 48 : 16));
  const dataWords = CryptoJS.enc.Hex.parse(paddedData);
  
  if (use3DES) {
    const encrypted = CryptoJS.TripleDES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    });
    
    // Take last 8 bytes
    const result = encrypted.ciphertext.toString().toUpperCase();
    return result.substring(result.length - 16);
  } else {
    const encrypted = CryptoJS.DES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.NoPadding,
      iv: CryptoJS.enc.Hex.parse('0000000000000000'),
    });
    
    // Take last 8 bytes
    const result = encrypted.ciphertext.toString().toUpperCase();
    return result.substring(result.length - 16);
  }
};

// DUKPT Data Encryption/Decryption
const processData = (
  pek: string,
  data: string,
  useVariant: boolean,
  isEncrypt: boolean
): string => {
  const cleanPek = pek.replace(/\s/g, '').toUpperCase();
  const cleanData = data.replace(/\s/g, '').toUpperCase();
  
  let workingKey = cleanPek;
  
  // Apply data key variant if needed
  if (useVariant) {
    const keyWords = CryptoJS.enc.Hex.parse(cleanPek);
    const variant = CryptoJS.enc.Hex.parse('00000000000000FF00000000000000FF');
    const variantKey = CryptoJS.lib.WordArray.create(
      keyWords.words.map((w, i) => w ^ variant.words[i]),
      16
    );
    workingKey = variantKey.toString().toUpperCase();
  }
  
  const key = CryptoJS.enc.Hex.parse(workingKey);
  
  if (isEncrypt) {
    const dataWords = CryptoJS.enc.Hex.parse(cleanData);
    const encrypted = CryptoJS.TripleDES.encrypt(dataWords, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    });
    return encrypted.ciphertext.toString().toUpperCase();
  } else {
    const ciphertext = CryptoJS.enc.Hex.parse(cleanData);
    const decrypted = CryptoJS.TripleDES.decrypt(
      { ciphertext } as CryptoJS.lib.CipherParams,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }
    );
    return decrypted.toString().toUpperCase();
  }
};

const DUKPTTool: React.FC = () => {
  const { t } = useLanguage();
  useTheme();
  
  // PEK Derivation
  const [keyType, setKeyType] = useState<'BDK' | 'IPEK'>('BDK');
  const [bdk, setBdk] = useState('');
  const [ksn, setKsn] = useState('');
  const [derivedPek, setDerivedPek] = useState('');
  const [derivError, setDerivError] = useState('');
  
  // DUKPT PIN
  const [pinPek, setPinPek] = useState('');
  const [pinBlock, setPinBlock] = useState('');
  const [pinResult, setPinResult] = useState('');
  const [pinError, setPinError] = useState('');
  
  // DUKPT MAC
  const [macPek, setMacPek] = useState('');
  const [macAlgo, setMacAlgo] = useState<'DES' | '3DES'>('DES');
  const [macData, setMacData] = useState('');
  const [macResult, setMacResult] = useState('');
  const [macError, setMacError] = useState('');
  
  // DUKPT DATA
  const [dataPek, setDataPek] = useState('');
  const [dataVariant, setDataVariant] = useState(false);
  const [dataInputType, setDataInputType] = useState<'ASCII' | 'Hex'>('Hex');
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
      message.error(t.common?.copyFailed || 'Failed to copy');
    }
  };

  // PEK Derivation Handler
  const handleDerivePEK = () => {
    setDerivError('');
    setDerivedPek('');
    
    const cleanBdk = sanitizeHex(bdk);
    const cleanKsn = sanitizeHex(ksn);
    
    if (cleanBdk.length !== 32) {
      setDerivError(keyType === 'BDK' ? (t.dukpt?.errorInvalidBdk || 'BDK must be 32 hex characters') : (t.dukpt?.errorInvalidIpek || 'IPEK must be 32 hex characters'));
      return;
    }
    if (cleanKsn.length !== 20) {
      setDerivError(t.dukpt?.errorInvalidKsn || 'KSN must be 20 hex characters');
      return;
    }
    
    try {
      const pek = derivePEK(cleanBdk, cleanKsn);
      setDerivedPek(pek);
    } catch {
      setDerivError(t.dukpt?.errorDerivation || 'Failed to derive PEK');
    }
  };

  // PIN Encryption Handler
  const handleEncryptPIN = () => {
    setPinError('');
    setPinResult('');
    
    const cleanPek = sanitizeHex(pinPek);
    const cleanPin = sanitizeHex(pinBlock);
    
    if (cleanPek.length !== 32) {
      setPinError(t.dukpt?.errorInvalidPek || 'PEK must be 32 hex characters');
      return;
    }
    if (cleanPin.length !== 16) {
      setPinError(t.dukpt?.errorInvalidPinBlock || 'PIN block must be 16 hex characters');
      return;
    }
    
    try {
      const encrypted = encryptPIN(cleanPek, cleanPin);
      setPinResult(encrypted);
    } catch {
      setPinError(t.dukpt?.errorEncryption || 'Failed to encrypt PIN block');
    }
  };

  // PIN Decryption Handler
  const handleDecryptPIN = () => {
    setPinError('');
    setPinResult('');
    
    const cleanPek = sanitizeHex(pinPek);
    const cleanPin = sanitizeHex(pinBlock);
    
    if (cleanPek.length !== 32) {
      setPinError(t.dukpt?.errorInvalidPek || 'PEK must be 32 hex characters');
      return;
    }
    if (cleanPin.length !== 16) {
      setPinError(t.dukpt?.errorInvalidPinBlock || 'PIN block must be 16 hex characters');
      return;
    }
    
    try {
      const decrypted = decryptPIN(cleanPek, cleanPin);
      setPinResult(decrypted);
    } catch {
      setPinError(t.dukpt?.errorDecryption || 'Failed to decrypt PIN block');
    }
  };

  // MAC Calculation Handler
  const handleCalculateMAC = () => {
    setMacError('');
    setMacResult('');
    
    const cleanPek = sanitizeHex(macPek);
    const cleanData = sanitizeHex(macData);
    
    if (cleanPek.length !== 32 && cleanPek.length !== 48) {
      setMacError(t.dukpt?.errorInvalidPekMac || 'PEK must be 32 or 48 hex characters');
      return;
    }
    if (cleanData.length === 0) {
      setMacError(t.dukpt?.errorInvalidData || 'Data is required');
      return;
    }
    
    try {
      const mac = calculateMAC(cleanPek, cleanData, macAlgo === '3DES');
      setMacResult(mac);
    } catch {
      setMacError(t.dukpt?.errorMacCalculation || 'Failed to calculate MAC');
    }
  };

  // Data Encryption Handler
  const handleEncryptData = () => {
    setDataError('');
    setDataResult('');
    
    const cleanPek = sanitizeHex(dataPek);
    let cleanData = dataInput;
    
    if (dataInputType === 'Hex') {
      cleanData = sanitizeHex(dataInput);
    } else {
      // Convert ASCII to hex
      cleanData = dataInput.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    
    if (cleanPek.length !== 32) {
      setDataError(t.dukpt?.errorInvalidPekData || 'PEK must be 32 hex characters');
      return;
    }
    if (cleanData.length === 0) {
      setDataError(t.dukpt?.errorInvalidData || 'Data is required');
      return;
    }
    
    // Pad to multiple of 16 bytes
    if (cleanData.length % 16 !== 0) {
      cleanData = cleanData.padEnd(Math.ceil(cleanData.length / 16) * 16, '0');
    }
    
    try {
      const encrypted = processData(cleanPek, cleanData, dataVariant, true);
      setDataResult(encrypted);
    } catch {
      setDataError(t.dukpt?.errorDataEncryption || 'Failed to encrypt data');
    }
  };

  // Data Decryption Handler
  const handleDecryptData = () => {
    setDataError('');
    setDataResult('');
    
    const cleanPek = sanitizeHex(dataPek);
    const cleanData = sanitizeHex(dataInput);
    
    if (cleanPek.length !== 32) {
      setDataError(t.dukpt?.errorInvalidPekData || 'PEK must be 32 hex characters');
      return;
    }
    if (cleanData.length === 0) {
      setDataError(t.dukpt?.errorInvalidData || 'Data is required');
      return;
    }
    if (cleanData.length % 16 !== 0) {
      setDataError(t.dukpt?.errorInvalidEncryptedData || 'Encrypted data must be multiple of 16 hex characters');
      return;
    }
    
    try {
      const decrypted = processData(cleanPek, cleanData, dataVariant, false);
      setDataResult(decrypted);
    } catch {
      setDataError(t.dukpt?.errorDataDecryption || 'Failed to decrypt data');
    }
  };

  const derivationTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.dukpt?.inputKeyDesignation || 'Input key designation'}:
        </Text>
        <Segmented
          value={keyType}
          onChange={(value) => setKeyType(value as 'BDK' | 'IPEK')}
          options={[
            { label: t.dukpt?.bdk || 'BDK', value: 'BDK' },
            { label: t.dukpt?.ipek || 'IPEK', value: 'IPEK' },
          ]}
          block
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{keyType}:</Text>
        <Input
          value={bdk}
          onChange={e => setBdk(sanitizeHex(e.target.value))}
          placeholder="C1D0F8FB4958670DBA40AB1F3752EF0D"
          maxLength={32}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.dukpt?.ksn || 'KSN'}:</Text>
        <Input
          value={ksn}
          onChange={e => setKsn(sanitizeHex(e.target.value))}
          placeholder="11111111C14017E00000"
          maxLength={20}
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
          onClick={handleDerivePEK}
        >
          {t.dukpt?.derivePek || 'Derive PEK'}
        </Button>
      </div>

      {derivError && (
        <div style={{ 
          padding: '12px 16px', 
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{derivError}</Text>
        </div>
      )}

      {derivedPek && (
        <ResultCard
          title={`${t.dukpt?.pek || 'PEK'}: [32]`}
          result={derivedPek}
          onCopy={() => handleCopy(derivedPek)}
          icon={<KeyOutlined />}
        />
      )}
    </div>
  );

  const pinTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>PEK:</Text>
        <Input
          value={pinPek}
          onChange={e => setPinPek(sanitizeHex(e.target.value))}
          placeholder="6AC292FAA1315B4D858AB3A3D7D5933A"
          maxLength={32}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>PIN block:</Text>
        <Input
          value={pinBlock}
          onChange={e => setPinBlock(sanitizeHex(e.target.value))}
          placeholder="89D63FA012D10F11"
          maxLength={16}
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
          {t.dukpt?.encrypt || 'Encrypt'}
        </Button>
        <Button
          type="default"
          size="large"
          icon={<UnlockOutlined />}
          onClick={handleDecryptPIN}
        >
          {t.dukpt?.decrypt || 'Decrypt'}
        </Button>
      </div>

      {pinError && (
        <div style={{ 
          padding: '12px 16px', 
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{pinError}</Text>
        </div>
      )}

      {pinResult && (
        <ResultCard
          title={t.common?.result || 'Result'}
          result={pinResult}
          onCopy={() => handleCopy(pinResult)}
          icon={<LockOutlined />}
        />
      )}
    </div>
  );

  const macTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>PEK:</Text>
          {lengthIndicator(sanitizeHex(macPek).length, 32)}
        </div>
        <Input
          value={macPek}
          onChange={e => setMacPek(sanitizeHex(e.target.value))}
          placeholder="4EC2A2974ECA53F5691E5273963EBE5C"
          maxLength={48}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.dukpt?.algorithm || 'Algorithm'}:
        </Text>
        <Segmented
          value={macAlgo}
          onChange={(value) => setMacAlgo(value as 'DES' | '3DES')}
          options={[
            { label: t.dukpt?.des || 'DES', value: 'DES' },
            { label: t.dukpt?.threeDes || '3DES', value: '3DES' },
          ]}
          block
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Data:</Text>
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
          {t.dukpt?.calculateMac || 'Calculate MAC'}
        </Button>
      </div>

      {macError && (
        <div style={{ 
          padding: '12px 16px', 
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{macError}</Text>
        </div>
      )}

      {macResult && (
        <ResultCard
          title={t.dukpt?.mac || 'MAC'}
          result={macResult}
          onCopy={() => handleCopy(macResult)}
          icon={<CalculatorOutlined />}
        />
      )}
    </div>
  );

  const dataTab = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text strong>PEK:</Text>
          {lengthIndicator(sanitizeHex(dataPek).length, 32)}
        </div>
        <Input
          value={dataPek}
          onChange={e => setDataPek(sanitizeHex(e.target.value))}
          placeholder="4EC2A2974ECA53F5691E5273963EBE5C"
          maxLength={32}
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            fontSize: '14px'
          }}
          size="large"
        />
      </div>

      <div>
        <Checkbox 
          checked={dataVariant}
          onChange={e => setDataVariant(e.target.checked)}
        >
          <Text strong>{t.dukpt?.dataVariant || 'Data Variant'}</Text>
        </Checkbox>
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t.dukpt?.dataInput || 'Data input'}:
        </Text>
        <Segmented
          value={dataInputType}
          onChange={(value) => setDataInputType(value as 'ASCII' | 'Hex')}
          options={[
            { label: t.dukpt?.ascii || 'ASCII', value: 'ASCII' },
            { label: t.dukpt?.hexadecimal || 'Hex', value: 'Hex' },
          ]}
          block
        />
      </div>

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>Data:</Text>
        <TextArea
          value={dataInput}
          onChange={e => setDataInput(dataInputType === 'Hex' ? sanitizeHex(e.target.value) : e.target.value)}
          placeholder={dataInputType === 'Hex' ? 'Enter hex data' : 'Enter ASCII text'}
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
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '6px'
        }}>
          <Text type="danger" style={{ fontSize: '13px' }}>{dataError}</Text>
        </div>
      )}

      {dataResult && (
        <ResultCard
          title={t.common?.result || 'Result'}
          result={dataResult}
          onCopy={() => handleCopy(dataResult)}
          icon={<UnlockOutlined />}
        />
      )}
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.dukpt?.title || 'DUKPT (ISO 9797)'}
          </Title>
          <CollapsibleInfo title={t.dukpt?.infoTitle || 'About DUKPT'}>
            <div>
              {t.dukpt?.info1 || 'DUKPT (Derived Unique Key Per Transaction) is a key management scheme used in POS and ATM systems.'}
            </div>
            <div style={{ marginTop: 8 }}>
              {t.dukpt?.info2 || 'It derives a unique encryption key for each transaction from a Base Derivation Key (BDK) and Key Serial Number (KSN), ensuring that compromised keys cannot be used to decrypt past transactions.'}
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.dukpt?.subtitle || 'Derive keys and encrypt/decrypt data using DUKPT (ISO 9797) standard.'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs
          defaultActiveKey="derivation"
          items={[
            {
              key: 'derivation',
              label: t.dukpt?.tabPekDerivation || 'PEK derivation',
              children: derivationTab,
            },
            {
              key: 'pin',
              label: t.dukpt?.tabDukptPin || 'DUKPT PIN',
              children: pinTab,
            },
            {
              key: 'mac',
              label: t.dukpt?.tabDukptMac || 'DUKPT MAC',
              children: macTab,
            },
            {
              key: 'data',
              label: t.dukpt?.tabDukptData || 'DUKPT DATA',
              children: dataTab,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default DUKPTTool;
