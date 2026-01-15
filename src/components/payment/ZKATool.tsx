import React, { useState } from 'react';
import { Card, Button, Tabs, Input, message, Divider, Typography } from 'antd';
import { LockOutlined, UnlockOutlined, CalculatorOutlined, CopyOutlined } from '@ant-design/icons';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { CollapsibleInfo, ResultCard } from '../common';
import CryptoJS from 'crypto-js';
import { cleanHexInput, isValidHex } from '../../utils/crypto';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ZKA SK Derivation
const deriveSessionKey = (mk: string, cm: string, rnd: string): string => {
  try {
    const cleanMk = cleanHexInput(mk);
    const cleanCm = cleanHexInput(cm);
    const cleanRnd = cleanHexInput(rnd);

    if (!isValidHex(cleanMk) || !isValidHex(cleanCm) || !isValidHex(cleanRnd)) {
      throw new Error('Invalid hex input');
    }

    if (cleanMk.length !== 32 || cleanCm.length !== 32 || cleanRnd.length !== 32) {
      throw new Error('All inputs must be 16 bytes (32 hex characters)');
    }

    // ZKA SK Derivation: SK = DES3-ECB(MK, CM XOR Rnd)
    const mkKey = CryptoJS.enc.Hex.parse(cleanMk);
    const cmData = CryptoJS.enc.Hex.parse(cleanCm);
    const rndData = CryptoJS.enc.Hex.parse(cleanRnd);

    // XOR CM with Rnd
    const xorResult = CryptoJS.lib.WordArray.create(
      cmData.words.map((w, i) => w ^ rndData.words[i]),
      16
    );

    // Encrypt with Triple DES
    const sk = CryptoJS.TripleDES.encrypt(xorResult, mkKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    }).ciphertext;

    return sk.toString().toUpperCase();
  } catch (error) {
    throw new Error('SK derivation failed: ' + (error as Error).message);
  }
};

// ZKA PIN Encryption
const encryptPIN = (skPac: string, pinBlock: string): string => {
  try {
    const cleanSk = cleanHexInput(skPac);
    const cleanPin = cleanHexInput(pinBlock);

    if (!isValidHex(cleanSk) || !isValidHex(cleanPin)) {
      throw new Error('Invalid hex input');
    }

    if (cleanSk.length !== 32) {
      throw new Error('SK-pac must be 16 bytes (32 hex characters)');
    }

    if (cleanPin.length !== 16) {
      throw new Error('PIN block must be 8 bytes (16 hex characters)');
    }

    const key = CryptoJS.enc.Hex.parse(cleanSk);
    const data = CryptoJS.enc.Hex.parse(cleanPin);

    const encrypted = CryptoJS.TripleDES.encrypt(data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding,
    });

    return encrypted.ciphertext.toString().toUpperCase();
  } catch (error) {
    throw new Error('PIN encryption failed: ' + (error as Error).message);
  }
};

// ZKA PIN Decryption
const decryptPIN = (skPac: string, encryptedPinBlock: string): string => {
  try {
    const cleanSk = cleanHexInput(skPac);
    const cleanEncrypted = cleanHexInput(encryptedPinBlock);

    if (!isValidHex(cleanSk) || !isValidHex(cleanEncrypted)) {
      throw new Error('Invalid hex input');
    }

    if (cleanSk.length !== 32) {
      throw new Error('SK-pac must be 16 bytes (32 hex characters)');
    }

    if (cleanEncrypted.length !== 16) {
      throw new Error('Encrypted PIN block must be 8 bytes (16 hex characters)');
    }

    const key = CryptoJS.enc.Hex.parse(cleanSk);
    const ciphertext = CryptoJS.enc.Hex.parse(cleanEncrypted);

    const decrypted = CryptoJS.TripleDES.decrypt(
      { ciphertext } as CryptoJS.lib.CipherParams,
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }
    );

    return decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
  } catch (error) {
    throw new Error('PIN decryption failed: ' + (error as Error).message);
  }
};

// ZKA MAC Calculation
const calculateMAC = (macKey: string, data: string): string => {
  try {
    const cleanKey = cleanHexInput(macKey);
    const cleanData = cleanHexInput(data);

    if (!isValidHex(cleanKey) || !isValidHex(cleanData)) {
      throw new Error('Invalid hex input');
    }

    if (cleanKey.length !== 32) {
      throw new Error('MAC Key must be 16 bytes (32 hex characters)');
    }

    if (cleanData.length === 0) {
      throw new Error('Data cannot be empty');
    }

    // Ensure data length is multiple of 8 bytes
    let paddedData = cleanData;
    if (cleanData.length % 16 !== 0) {
      // ISO/IEC 9797-1 Method 2 padding
      paddedData += '80';
      while (paddedData.length % 16 !== 0) {
        paddedData += '00';
      }
    }

    const key = CryptoJS.enc.Hex.parse(cleanKey);

    // Calculate MAC using Triple DES CBC-MAC
    let mac = CryptoJS.enc.Hex.parse('0000000000000000');

    for (let i = 0; i < paddedData.length; i += 16) {
      const block = CryptoJS.enc.Hex.parse(paddedData.substring(i, i + 16));
      
      // XOR with previous MAC
      const xorBlock = CryptoJS.lib.WordArray.create(
        block.words.map((w, idx) => w ^ mac.words[idx]),
        8
      );

      // Encrypt with Triple DES
      mac = CryptoJS.TripleDES.encrypt(xorBlock, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding,
      }).ciphertext;
    }

    return mac.toString().toUpperCase();
  } catch (error) {
    throw new Error('MAC calculation failed: ' + (error as Error).message);
  }
};

const ZKATool: React.FC = () => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // 检测移动端
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // SK Derivation State
  const [mk, setMk] = useState('');
  const [cm, setCm] = useState('');
  const [rnd, setRnd] = useState('');
  const [derivedSK, setDerivedSK] = useState('');

  // PIN State
  const [skPac, setSkPac] = useState('');
  const [pinBlock, setPinBlock] = useState('');
  const [pinResult, setPinResult] = useState('');

  // MAC State
  const [macKey, setMacKey] = useState('');
  const [macData, setMacData] = useState('');
  const [macResult, setMacResult] = useState('');

  // Handle SK Derivation
  const handleDeriveSK = () => {
    try {
      const sk = deriveSessionKey(mk, cm, rnd);
      setDerivedSK(sk);
      message.success(t.mac?.zka?.skDerivedSuccess || 'Session key derived successfully');
    } catch (error) {
      message.error((error as Error).message);
      setDerivedSK('');
    }
  };

  // Handle PIN Encryption
  const handleEncryptPIN = () => {
    try {
      const encrypted = encryptPIN(skPac, pinBlock);
      setPinResult(encrypted);
      message.success(t.mac?.zka?.pinEncryptedSuccess || 'PIN encrypted successfully');
    } catch (error) {
      message.error((error as Error).message);
      setPinResult('');
    }
  };

  // Handle PIN Decryption
  const handleDecryptPIN = () => {
    try {
      const decrypted = decryptPIN(skPac, pinBlock);
      setPinResult(decrypted);
      message.success(t.mac?.zka?.pinDecryptedSuccess || 'PIN decrypted successfully');
    } catch (error) {
      message.error((error as Error).message);
      setPinResult('');
    }
  };

  // Handle MAC Calculation
  const handleCalculateMAC = () => {
    try {
      const mac = calculateMAC(macKey, macData);
      setMacResult(mac);
      message.success(t.mac?.zka?.macCalculatedSuccess || 'MAC calculated successfully');
    } catch (error) {
      message.error((error as Error).message);
      setMacResult('');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, labelKey: 'sessionKey' | 'result' | 'mac') => {
    navigator.clipboard.writeText(text);
    const messages = {
      sessionKey: t.mac?.zka?.sessionKeyCopied || 'Session Key copied to clipboard',
      result: t.mac?.zka?.resultCopied || 'Result copied to clipboard',
      mac: t.mac?.zka?.macCopied || 'MAC copied to clipboard',
    };
    message.success(messages[labelKey]);
  };

  return (
    <Card
      style={{
        borderRadius: 8,
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.45)' : '0 2px 8px rgba(0,0,0,0.09)',
      }}
    >
      {/* 标题和说明 */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.mac?.zka?.title || 'ZKA (German Banking Standard)'}
          </Title>
          <CollapsibleInfo title={t.mac?.zka?.infoTitle || 'About ZKA'}>
            <div style={{ marginBottom: 8 }}>
              • {t.mac?.zka?.info1 || 'German banking standard for key management and cryptographic operations'}
            </div>
            <div>
              • {t.mac?.zka?.info2 || 'Includes SK derivation, PIN encryption, and MAC calculation'}
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.mac?.zka?.description || 'ZKA cryptographic operations for German banking systems'}
        </Text>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <Tabs defaultActiveKey="1" size={isMobile ? 'small' : 'middle'}>
        {/* Tab 1: SK Derivation */}
        <Tabs.TabPane tab={t.mac?.zka?.tabSKDerivation || 'SK derivation'} key="1">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{t.mac?.zka?.mk || 'MK:'}</Text>
                <CollapsibleInfo title={t.mac?.zka?.mkInfo || 'Master Key'}>
                  <div>{t.mac?.zka?.mkInfoDesc || 'The master key used for session key derivation. Must be 16 bytes (32 hex characters).'}</div>
                </CollapsibleInfo>
              </div>
              <Input
                value={mk}
                onChange={(e) => setMk(e.target.value.toUpperCase())}
                placeholder={t.mac?.zka?.mkPlaceholder || 'Enter master key (32 hex characters)'}
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    [{mk.length}]
                  </Text>
                }
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{t.mac?.zka?.cm || 'CM:'}</Text>
                <CollapsibleInfo title={t.mac?.zka?.cmInfo || 'Command Data'}>
                  <div>{t.mac?.zka?.cmInfoDesc || 'Command data used in the derivation process. Must be 16 bytes (32 hex characters).'}</div>
                </CollapsibleInfo>
              </div>
              <Input
                value={cm}
                onChange={(e) => setCm(e.target.value.toUpperCase())}
                placeholder={t.mac?.zka?.cmPlaceholder || 'Enter command data (32 hex characters)'}
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    [{cm.length}]
                  </Text>
                }
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{t.mac?.zka?.rnd || 'Rnd:'}</Text>
                <CollapsibleInfo title={t.mac?.zka?.rndInfo || 'Random Number'}>
                  <div>{t.mac?.zka?.rndInfoDesc || 'Random number used in the derivation process. Must be 16 bytes (32 hex characters).'}</div>
                </CollapsibleInfo>
              </div>
              <Input
                value={rnd}
                onChange={(e) => setRnd(e.target.value.toUpperCase())}
                placeholder={t.mac?.zka?.rndPlaceholder || 'Enter random number (32 hex characters)'}
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    [{rnd.length}]
                  </Text>
                }
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4, marginBottom: 24 }}>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={handleDeriveSK}
                disabled={!mk || !cm || !rnd}
                size="large"
              >
                {t.mac?.zka?.deriveSK || 'Derive SK'}
              </Button>
            </div>

            {derivedSK && (
              <ResultCard
                title={t.mac?.zka?.derivedSessionKey || 'Derived Session Key'}
                result={derivedSK}
                onCopy={() => copyToClipboard(derivedSK, 'sessionKey')}
                icon={<LockOutlined />}
              />
            )}
          </div>
        </Tabs.TabPane>

        {/* Tab 2: PIN */}
        <Tabs.TabPane tab={t.mac?.zka?.tabPIN || 'PIN'} key="2">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{t.mac?.zka?.skPac || 'SK-pac:'}</Text>
                <CollapsibleInfo title={t.mac?.zka?.skPacInfo || 'Session Key for PIN/PAC'}>
                  <div>{t.mac?.zka?.skPacInfoDesc || 'The session key used for PIN encryption/decryption. Must be 16 bytes (32 hex characters).'}</div>
                </CollapsibleInfo>
              </div>
              <Input
                value={skPac}
                onChange={(e) => setSkPac(e.target.value.toUpperCase())}
                placeholder={t.mac?.zka?.skPacPlaceholder || 'Enter session key (32 hex characters)'}
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    [{skPac.length}]
                  </Text>
                }
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{t.mac?.zka?.pinBlock || 'PIN block:'}</Text>
                <CollapsibleInfo title={t.mac?.zka?.pinBlockInfo || 'PIN Block'}>
                  <div>{t.mac?.zka?.pinBlockInfoDesc || 'The PIN block to encrypt or decrypt. Must be 8 bytes (16 hex characters).'}</div>
                </CollapsibleInfo>
              </div>
              <Input
                value={pinBlock}
                onChange={(e) => setPinBlock(e.target.value.toUpperCase())}
                placeholder={t.mac?.zka?.pinBlockPlaceholder || 'Enter PIN block (16 hex characters)'}
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    [{pinBlock.length}]
                  </Text>
                }
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4, marginBottom: 24 }}>
              <Button
                size="large"
                type="primary"
                icon={<LockOutlined />}
                onClick={handleEncryptPIN}
                disabled={!skPac || !pinBlock}
              >
                {t.mac?.zka?.encrypt || 'Encrypt'}
              </Button>
              <Button
                size="large"
                icon={<UnlockOutlined />}
                onClick={handleDecryptPIN}
                disabled={!skPac || !pinBlock}
              >
                {t.mac?.zka?.decrypt || 'Decrypt'}
              </Button>
            </div>

            {pinResult && (
              <ResultCard
                title={t.mac?.zka?.result || 'Result'}
                result={pinResult}
                onCopy={() => copyToClipboard(pinResult, 'result')}
                icon={<LockOutlined />}
              />
            )}
          </div>
        </Tabs.TabPane>

        {/* Tab 3: MAC */}
        <Tabs.TabPane tab={t.mac?.zka?.tabMAC || 'MAC'} key="3">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{t.mac?.zka?.macKey || 'MAC Key:'}</Text>
                <CollapsibleInfo title={t.mac?.zka?.macKeyInfo || 'MAC Key'}>
                  <div>{t.mac?.zka?.macKeyInfoDesc || 'The key used for MAC calculation. Must be 16 bytes (32 hex characters).'}</div>
                </CollapsibleInfo>
              </div>
              <Input
                value={macKey}
                onChange={(e) => setMacKey(e.target.value.toUpperCase())}
                placeholder={t.mac?.zka?.macKeyPlaceholder || 'Enter MAC key (32 hex characters)'}
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    [{macKey.length}]
                  </Text>
                }
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <Text strong>{t.mac?.zka?.data || 'Data:'}</Text>
                <CollapsibleInfo title={t.mac?.zka?.dataInfo || 'Data for MAC'}>
                  <div>{t.mac?.zka?.dataInfoDesc || 'The data for which to calculate the MAC. Can be any length in hex format.'}</div>
                </CollapsibleInfo>
              </div>
              <TextArea
                value={macData}
                onChange={(e) => setMacData(e.target.value.toUpperCase())}
                placeholder={t.mac?.zka?.dataPlaceholder || 'Enter data in hex format'}
                rows={6}
                style={{ fontFamily: 'Consolas, Monaco, monospace' }}
              />
              <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                [{macData.length}]
              </Text>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4, marginBottom: 24 }}>
              <Button
                size="large"
                type="primary"
                icon={<CalculatorOutlined />}
                onClick={handleCalculateMAC}
                disabled={!macKey || !macData}
              >
                {t.mac?.zka?.calculateMAC || 'Calculate MAC'}
              </Button>
            </div>

            {macResult && (
              <ResultCard
                title={t.mac?.zka?.macResult || 'MAC Result'}
                result={macResult}
                onCopy={() => copyToClipboard(macResult, 'mac')}
                icon={<CalculatorOutlined />}
              />
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
};

export default ZKATool;
