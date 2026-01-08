import React, { useState, useCallback } from 'react';
import { Card, Divider, Typography, Input, Segmented, Button, message, Modal, Tabs } from 'antd';
import { UnlockOutlined, LockOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { 
  calculateKCV, 
  isValidHex,
  cleanHexInput,
  adjustDesKeyParity
} from '../../utils/crypto';

const { Title, Text } = Typography;

type ParityOption = 'ignore' | 'forceOdd';
type ModeOption = 'insecure' | 'secure';

interface KeyPartState {
  value: string;
  kcv: string;
  pin: string;
}

const KeyshareGenerator: React.FC = () => {
  const { t } = useLanguage();
  useTheme(); // Keep hook for potential future theme-dependent styles
  
  // Mode: Insecure or Secure
  const [mode, setMode] = useState<ModeOption>('insecure');
  
  // Parity: Ignore or Force Odd
  const [parity, setParity] = useState<ParityOption>('ignore');
  
  // Combined key input
  const [combinedKeyInput, setCombinedKeyInput] = useState('');
  const [combinedKcv, setCombinedKcv] = useState('');
  
  // Three-part key states (generated)
  const [threeParts, setThreeParts] = useState<KeyPartState[]>([
    { value: '', kcv: '', pin: '' },
    { value: '', kcv: '', pin: '' },
    { value: '', kcv: '', pin: '' },
  ]);
  
  // Two-part key states (generated)
  const [twoParts, setTwoParts] = useState<KeyPartState[]>([
    { value: '', kcv: '', pin: '' },
    { value: '', kcv: '', pin: '' },
  ]);

  // Modal state for PIN verification
  const [unlockModal, setUnlockModal] = useState<{
    visible: boolean;
    type: 'three' | 'two';
    index: number;
    inputPin: string;
  }>({
    visible: false,
    type: 'three',
    index: 0,
    inputPin: '',
  });

  // Calculate KCV for a key with optional parity adjustment
  const calculateKeyKcv = useCallback((keyHex: string): string => {
    if (!keyHex.trim()) return '';
    
    const cleaned = cleanHexInput(keyHex);
    if (!isValidHex(cleaned)) return '';
    
    const keyBytes = cleaned.length / 2;
    if (![8, 16, 24, 32].includes(keyBytes)) return '';
    
    try {
      let processedKey = cleaned;
      if (parity === 'forceOdd' && keyBytes <= 24) {
        processedKey = adjustDesKeyParity(cleaned);
      }
      
      // For keys <= 24 bytes, use DES KCV; for 32 bytes, use AES KCV
      const algorithm = keyBytes <= 24 ? 'DES' : 'AES';
      return calculateKCV(processedKey, { algorithm });
    } catch {
      return '';
    }
  }, [parity]);

  // XOR two hex strings
  const xorHex = (hex1: string, hex2: string): string => {
    const words1 = CryptoJS.enc.Hex.parse(hex1);
    const words2 = CryptoJS.enc.Hex.parse(hex2);
    
    for (let i = 0; i < words1.words.length; i++) {
      words1.words[i] ^= words2.words[i];
    }
    
    return words1.toString().toUpperCase();
  };

  // Generate random hex key of specified byte length
  const generateRandomHex = useCallback((bytes: number): string => {
    const randomWord = CryptoJS.lib.WordArray.random(bytes);
    let keyHex = randomWord.toString().toUpperCase();
    
    // Apply parity if needed
    if (parity === 'forceOdd' && bytes <= 24) {
      keyHex = adjustDesKeyParity(keyHex);
    }
    
    return keyHex;
  }, [parity]);

  // Generate key shares from combined key
  const generateShares = useCallback((combinedKey: string) => {
    if (!combinedKey.trim()) {
      setThreeParts([
        { value: '', kcv: '', pin: '' },
        { value: '', kcv: '', pin: '' },
        { value: '', kcv: '', pin: '' },
      ]);
      setTwoParts([
        { value: '', kcv: '', pin: '' },
        { value: '', kcv: '', pin: '' },
      ]);
      return;
    }

    const cleaned = cleanHexInput(combinedKey);
    if (!isValidHex(cleaned)) return;
    
    const keyBytes = cleaned.length / 2;
    if (![8, 16, 24, 32].includes(keyBytes)) return;

    // Process combined key with parity if needed
    let processedKey = cleaned;
    if (parity === 'forceOdd' && keyBytes <= 24) {
      processedKey = adjustDesKeyParity(cleaned);
    }

    // Generate three-part shares
    // part1 and part2 are random, part3 = combinedKey XOR part1 XOR part2
    const threePart1 = generateRandomHex(keyBytes);
    const threePart2 = generateRandomHex(keyBytes);
    const threePart3 = xorHex(xorHex(processedKey, threePart1), threePart2);
    
    setThreeParts([
      { value: threePart1, kcv: calculateKeyKcv(threePart1), pin: '' },
      { value: threePart2, kcv: calculateKeyKcv(threePart2), pin: '' },
      { value: threePart3, kcv: calculateKeyKcv(threePart3), pin: '' },
    ]);

    // Generate two-part shares
    // part1 is random, part2 = combinedKey XOR part1
    const twoPart1 = generateRandomHex(keyBytes);
    const twoPart2 = xorHex(processedKey, twoPart1);
    
    setTwoParts([
      { value: twoPart1, kcv: calculateKeyKcv(twoPart1), pin: '' },
      { value: twoPart2, kcv: calculateKeyKcv(twoPart2), pin: '' },
    ]);
  }, [parity, calculateKeyKcv, generateRandomHex]);

  // Handle mode change - clear shares when switching modes
  const handleModeChange = (newMode: ModeOption) => {
    setMode(newMode);
    // Clear all data when switching modes
    setCombinedKeyInput('');
    setCombinedKcv('');
    setThreeParts([
      { value: '', kcv: '', pin: '' },
      { value: '', kcv: '', pin: '' },
      { value: '', kcv: '', pin: '' },
    ]);
    setTwoParts([
      { value: '', kcv: '', pin: '' },
      { value: '', kcv: '', pin: '' },
    ]);
  };

  // Handle combined key input change
  const handleCombinedKeyChange = (value: string) => {
    setCombinedKeyInput(value);
    
    const cleaned = cleanHexInput(value);
    if (cleaned && isValidHex(cleaned)) {
      const keyBytes = cleaned.length / 2;
      if ([8, 16, 24, 32].includes(keyBytes)) {
        // Calculate KCV for combined key
        setCombinedKcv(calculateKeyKcv(cleaned));
        // Generate shares
        generateShares(cleaned);
        return;
      }
    }
    
    setCombinedKcv('');
    setThreeParts([
      { value: '', kcv: '', pin: '' },
      { value: '', kcv: '', pin: '' },
      { value: '', kcv: '', pin: '' },
    ]);
    setTwoParts([
      { value: '', kcv: '', pin: '' },
      { value: '', kcv: '', pin: '' },
    ]);
  };

  // Update PIN for three-part key
  const updateThreePartPin = (index: number, pin: string) => {
    // Only allow 4 digits
    const cleanedPin = pin.replace(/\D/g, '').slice(0, 4);
    const newParts = [...threeParts];
    newParts[index] = { ...newParts[index], pin: cleanedPin };
    setThreeParts(newParts);
  };

  // Update PIN for two-part key
  const updateTwoPartPin = (index: number, pin: string) => {
    // Only allow 4 digits
    const cleanedPin = pin.replace(/\D/g, '').slice(0, 4);
    const newParts = [...twoParts];
    newParts[index] = { ...newParts[index], pin: cleanedPin };
    setTwoParts(newParts);
  };

  // Open unlock modal
  const openUnlockModal = (type: 'three' | 'two', index: number) => {
    const parts = type === 'three' ? threeParts : twoParts;
    if (!parts[index].pin || parts[index].pin.length !== 4) {
      message.warning(t.keyshareGenerator?.setPinFirst || 'Please set a 4-digit PIN first');
      return;
    }
    setUnlockModal({
      visible: true,
      type,
      index,
      inputPin: '',
    });
  };

  // Verify PIN and show key
  const verifyPinAndShowKey = () => {
    const parts = unlockModal.type === 'three' ? threeParts : twoParts;
    const correctPin = parts[unlockModal.index].pin;
    
    if (unlockModal.inputPin === correctPin) {
      const keyValue = parts[unlockModal.index].value;
      Modal.success({
        title: t.keyshareGenerator?.keyRevealed || 'Key Share Revealed',
        content: (
          <div style={{ marginTop: 16 }}>
            <Input.TextArea
              value={keyValue}
              readOnly
              autoSize={{ minRows: 2 }}
              style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                marginBottom: 12
              }}
            />
            <Button 
              type="primary" 
              block
              onClick={() => {
                navigator.clipboard.writeText(keyValue);
                message.success(t.common.copied);
              }}
            >
              {t.common.copy}
            </Button>
          </div>
        ),
        okText: t.common.close || 'Close',
      });
      setUnlockModal({ ...unlockModal, visible: false, inputPin: '' });
    } else {
      message.error(t.keyshareGenerator?.wrongPin || 'Incorrect PIN');
      setUnlockModal({ ...unlockModal, inputPin: '' });
    }
  };

  // Note: KCV is now calculated inline when needed, shares are regenerated via onChange handlers

  // Get key length info for display
  const getKeyLengthInfo = (value: string) => {
    if (!value.trim()) return null;
    const cleaned = cleanHexInput(value);
    const hexLength = cleaned.length;
    const validLengths = [16, 32, 48, 64]; // 8, 16, 24, 32 bytes
    const isValid = isValidHex(cleaned) && validLengths.includes(hexLength);
    return { hexLength, isValid };
  };

  // Get length indicator color
  const getLengthColor = (value: string): string => {
    if (!value.trim()) return '#999';
    const info = getKeyLengthInfo(value);
    if (!info) return '#999';
    return info.isValid ? '#52c41a' : '#ff4d4f';
  };

  // Generate masked display
  const getMaskedValue = (value: string): string => {
    if (!value) return '';
    return '●'.repeat(Math.min(value.length, 32));
  };

  // Check if PIN is complete (4 digits)
  const isPinComplete = (pin: string): boolean => {
    return pin.length === 4;
  };

  // Render key part row for Insecure mode
  const renderInsecureKeyPartRow = (
    label: string,
    part: KeyPartState
  ) => {
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto 1fr auto', 
        gap: 12,
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text style={{ minWidth: 50 }}>{label}:</Text>
        <Input
          value={part.value}
          readOnly
          placeholder="0123456789ABCDEF..."
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace'
          }}
        />
        <Input
          value={part.kcv}
          readOnly
          placeholder="KCV"
          style={{ 
            width: 100,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            textAlign: 'center',
            fontWeight: 600
          }}
        />
      </div>
    );
  };

  // Render key part row for Secure mode
  const renderSecureKeyPartRow = (
    label: string,
    part: KeyPartState,
    type: 'three' | 'two',
    index: number,
    onPinChange: (pin: string) => void
  ) => {
    const pinComplete = isPinComplete(part.pin);
    return (
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'auto 1fr auto auto auto', 
        gap: 12,
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text style={{ minWidth: 50 }}>{label}:</Text>
        <Input
          value={getMaskedValue(part.value)}
          readOnly
          placeholder="●●●●●●●●●●●●●●●●"
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace'
          }}
        />
        <Input
          value={part.kcv}
          readOnly
          placeholder="KCV"
          style={{ 
            width: 80,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            textAlign: 'center',
            fontWeight: 600
          }}
        />
        <Input
          value={part.pin}
          onChange={(e) => onPinChange(e.target.value)}
          placeholder="●●●●"
          type="password"
          maxLength={4}
          style={{ 
            width: 80,
            fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
            textAlign: 'center',
            borderColor: pinComplete ? '#52c41a' : undefined,
            boxShadow: pinComplete ? '0 0 0 2px rgba(82, 196, 26, 0.2)' : undefined
          }}
        />
        <Button
          icon={<UnlockOutlined />}
          onClick={() => openUnlockModal(type, index)}
          disabled={!part.value}
          style={{ 
            borderColor: '#52c41a',
            color: '#52c41a',
            background: '#fff'
          }}
        />
      </div>
    );
  };

  const combinedLengthInfo = getKeyLengthInfo(combinedKeyInput);

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Input Card */}
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.keyshareGenerator?.title || 'Keyshare Generator'}
            </Title>
            <CollapsibleInfo title={t.keyshareGenerator?.infoTitle || 'About Keyshare Generator'}>
              <div>• {t.keyshareGenerator?.infoContent || 'Generate key shares from a combined key using XOR operation.'}</div>
              <div>• {t.keyshareGenerator?.infoContent2 || 'Each share can be held by different custodians for enhanced security.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.keyshareGenerator?.description || 'Enter a key to generate key shares with KCV verification'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* Mode Selection - Tabs style */}
            <Tabs
              activeKey={mode}
              onChange={(key) => handleModeChange(key as ModeOption)}
              items={[
                {
                  key: 'insecure',
                  label: (
                    <span>
                      <UnlockOutlined /> {t.keyshareGenerator?.insecure || 'Insecure'}
                    </span>
                  ),
                },
                {
                  key: 'secure',
                  label: (
                    <span>
                      <LockOutlined /> {t.keyshareGenerator?.secure || 'Secure'}
                    </span>
                  ),
                },
              ]}
            />

            {/* Parity Selection - Segmented style */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.keyshareGenerator?.parity || 'Parity'}:
              </Text>
              <Segmented
                value={parity}
                onChange={(value) => setParity(value as ParityOption)}
                options={[
                  { label: t.keyshareGenerator?.ignore || 'Ignore', value: 'ignore' },
                  { label: t.keyshareGenerator?.forceOdd || 'Force Odd', value: 'forceOdd' },
                ]}
                block
              />
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Combined Key Input */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center',
                gap: 24,
                marginBottom: 12
              }}>
                <Text strong>{t.keyshareGenerator?.combinedKey || 'Combined Key'}</Text>
                <Text strong>KCV</Text>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr auto', 
                gap: 12,
                alignItems: 'center'
              }}>
                <div style={{ position: 'relative' }}>
                  <Input
                    value={combinedKeyInput}
                    onChange={(e) => handleCombinedKeyChange(e.target.value)}
                    placeholder="0123456789ABCDEF..."
                    status={combinedLengthInfo && !combinedLengthInfo.isValid ? 'error' : ''}
                    style={{ 
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                      paddingRight: combinedLengthInfo ? 50 : undefined
                    }}
                  />
                  {combinedLengthInfo && (
                    <div style={{ 
                      position: 'absolute', 
                      right: 12, 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: getLengthColor(combinedKeyInput)
                    }}>
                      {combinedLengthInfo.hexLength}
                    </div>
                  )}
                </div>
                <Input
                  value={combinedKcv}
                  readOnly
                  placeholder="KCV"
                  style={{ 
                    width: 100,
                    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                    textAlign: 'center',
                    fontWeight: 600
                  }}
                />
              </div>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Three Part Key Section */}
            <div>
              {mode === 'secure' ? (
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'auto 1fr auto auto auto', 
                    gap: 12,
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <div style={{ minWidth: 50 }}></div>
                    <Text strong style={{ textAlign: 'center' }}>
                      {t.keyshareGenerator?.threePartKey || 'Three Part Key'}
                    </Text>
                    <Text strong style={{ width: 80, textAlign: 'center' }}>KCV</Text>
                    <Text strong style={{ width: 80, textAlign: 'center' }}>PIN</Text>
                    <div style={{ width: 32 }}></div>
                  </div>
                  {[0, 1, 2].map((index) => (
                    <React.Fragment key={`three-${index}`}>
                      {renderSecureKeyPartRow(
                        `Part ${index + 1}`,
                        threeParts[index],
                        'three',
                        index,
                        (pin) => updateThreePartPin(index, pin)
                      )}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <>
                  <Text strong style={{ display: 'block', marginBottom: 12, textAlign: 'center' }}>
                    {t.keyshareGenerator?.threePartKey || 'Three Part Key'}
                  </Text>
                  {[0, 1, 2].map((index) => (
                    <React.Fragment key={`three-${index}`}>
                      {renderInsecureKeyPartRow(
                        `Part ${index + 1}`,
                        threeParts[index]
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Two Part Key Section */}
            <div>
              {mode === 'secure' ? (
                <>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'auto 1fr auto auto auto', 
                    gap: 12,
                    alignItems: 'center',
                    marginBottom: 12
                  }}>
                    <div style={{ minWidth: 50 }}></div>
                    <Text strong style={{ textAlign: 'center' }}>
                      {t.keyshareGenerator?.twoPartKey || 'Two Part Key'}
                    </Text>
                    <Text strong style={{ width: 80, textAlign: 'center' }}>KCV</Text>
                    <Text strong style={{ width: 80, textAlign: 'center' }}>PIN</Text>
                    <div style={{ width: 32 }}></div>
                  </div>
                  {[0, 1].map((index) => (
                    <React.Fragment key={`two-${index}`}>
                      {renderSecureKeyPartRow(
                        `Part ${index + 1}`,
                        twoParts[index],
                        'two',
                        index,
                        (pin) => updateTwoPartPin(index, pin)
                      )}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                <>
                  <Text strong style={{ display: 'block', marginBottom: 12, textAlign: 'center' }}>
                    {t.keyshareGenerator?.twoPartKey || 'Two Part Key'}
                  </Text>
                  {[0, 1].map((index) => (
                    <React.Fragment key={`two-${index}`}>
                      {renderInsecureKeyPartRow(
                        `Part ${index + 1}`,
                        twoParts[index]
                      )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* PIN Verification Modal */}
      <Modal
        title={t.keyshareGenerator?.enterPin || 'Enter PIN'}
        open={unlockModal.visible}
        onOk={verifyPinAndShowKey}
        onCancel={() => setUnlockModal({ ...unlockModal, visible: false, inputPin: '' })}
        okText={t.keyshareGenerator?.unlock || 'Unlock'}
        cancelText={t.common.cancel}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text style={{ display: 'block', marginBottom: 16 }}>
            {t.keyshareGenerator?.enterPinToReveal || 'Enter 4-digit PIN to reveal key share'}
          </Text>
          <Input
            value={unlockModal.inputPin}
            onChange={(e) => setUnlockModal({ 
              ...unlockModal, 
              inputPin: e.target.value.replace(/\D/g, '').slice(0, 4) 
            })}
            placeholder="●●●●"
            type="password"
            maxLength={4}
            style={{ 
              width: 120,
              fontSize: 24,
              textAlign: 'center',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace'
            }}
            onPressEnter={verifyPinAndShowKey}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
};

export default KeyshareGenerator;
