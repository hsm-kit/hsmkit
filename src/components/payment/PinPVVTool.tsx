import React, { useState } from 'react';
import { Card, Input, Button, Typography, message, Divider, Tabs, InputNumber } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CollapsibleInfo from '../common/CollapsibleInfo';

const { Title, Text } = Typography;

// Helper function to sanitize hex input
const sanitizeHex = (input: string): string => {
  return input.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
};

// Helper function to sanitize digit input
const sanitizeDigits = (input: string): string => {
  return input.replace(/\D/g, '');
};

// Helper function to format hex for display
const formatHexDisplay = (hex: string, bytesPerGroup = 2): string => {
  const groups = [];
  for (let i = 0; i < hex.length; i += bytesPerGroup * 2) {
    groups.push(hex.slice(i, i + bytesPerGroup * 2));
  }
  return groups.join(' ');
};

/**
 * Calculate PVV (PIN Verification Value) using Visa PVV algorithm
 * @param pdk - PIN Derivation Key (32 hex characters, 16 bytes)
 * @param pan - Primary Account Number (12-19 digits)
 * @param pin - Customer PIN (4-12 digits)
 * @param pvki - PIN Verification Key Index (0-9)
 * @returns PVV (4 digits)
 */
const calculatePVV = (pdk: string, pan: string, pin: string, pvki: number): { pvv: string; encryptedPan: string; tsp: string } => {
  // Validate inputs
  if (!pdk || pdk.length !== 32) {
    throw new Error('PDK must be 32 hex characters (16 bytes)');
  }
  if (!pan || pan.length < 12 || pan.length > 19) {
    throw new Error('PAN must be 12-19 digits');
  }
  if (!pin || pin.length < 4 || pin.length > 12) {
    throw new Error('PIN must be 4-12 digits');
  }
  if (pvki < 0 || pvki > 9) {
    throw new Error('PVKI must be 0-9');
  }

  // Step 1: Prepare PAN block (right-align PAN, pad left with zeros to 16 hex chars)
  const panBlock = pan.padStart(16, '0');

  // Step 2: Encrypt PAN with 3DES using PDK
  const key = CryptoJS.enc.Hex.parse(pdk);
  const panWords = CryptoJS.enc.Hex.parse(panBlock);
  const encrypted = CryptoJS.TripleDES.encrypt(panWords, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  const encryptedPan = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

  // Step 3: Extract digits from encrypted result (decimalization)
  // Apply decimalization table: 0-9 stay, A-F map to 0-5
  const decTab: { [key: string]: string } = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    'A': '0', 'B': '1', 'C': '2', 'D': '3', 'E': '4', 'F': '5',
  };

  let naturalPin = '';
  for (const char of encryptedPan) {
    naturalPin += decTab[char] || '0';
  }

  // Step 4: Extract TSP (Transformed Selection Process) starting from position determined by PVKI
  // Select 4 digits starting from position PVKI
  const tsp = naturalPin.substring(pvki, pvki + 4);
  if (tsp.length < 4) {
    throw new Error('Failed to extract TSP from encrypted PAN');
  }

  // Step 5: Calculate PVV by XORing PIN with TSP (digit by digit)
  let pvv = '';
  for (let i = 0; i < 4; i++) {
    const pinDigit = parseInt(pin[i] || '0', 10);
    const tspDigit = parseInt(tsp[i], 10);
    const pvvDigit = (pinDigit + tspDigit) % 10;
    pvv += pvvDigit.toString();
  }

  return {
    pvv,
    encryptedPan,
    tsp,
  };
};

/**
 * Verify PIN using PVV
 * @param pdk - PIN Derivation Key (32 hex characters, 16 bytes)
 * @param pan - Primary Account Number (12-19 digits)
 * @param pvv - PIN Verification Value (4 digits)
 * @param pvki - PIN Verification Key Index (0-9)
 * @returns Calculated PIN (4 digits)
 */
const verifyPinWithPVV = (pdk: string, pan: string, pvv: string, pvki: number): { pin: string; encryptedPan: string; tsp: string } => {
  // Validate inputs
  if (!pdk || pdk.length !== 32) {
    throw new Error('PDK must be 32 hex characters (16 bytes)');
  }
  if (!pan || pan.length < 12 || pan.length > 19) {
    throw new Error('PAN must be 12-19 digits');
  }
  if (!pvv || pvv.length !== 4) {
    throw new Error('PVV must be 4 digits');
  }
  if (pvki < 0 || pvki > 9) {
    throw new Error('PVKI must be 0-9');
  }

  // Step 1: Prepare PAN block
  const panBlock = pan.padStart(16, '0');

  // Step 2: Encrypt PAN with 3DES using PDK
  const key = CryptoJS.enc.Hex.parse(pdk);
  const panWords = CryptoJS.enc.Hex.parse(panBlock);
  const encrypted = CryptoJS.TripleDES.encrypt(panWords, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding,
  });
  const encryptedPan = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase();

  // Step 3: Decimalization
  const decTab: { [key: string]: string } = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    'A': '0', 'B': '1', 'C': '2', 'D': '3', 'E': '4', 'F': '5',
  };

  let naturalPin = '';
  for (const char of encryptedPan) {
    naturalPin += decTab[char] || '0';
  }

  // Step 4: Extract TSP
  const tsp = naturalPin.substring(pvki, pvki + 4);
  if (tsp.length < 4) {
    throw new Error('Failed to extract TSP from encrypted PAN');
  }

  // Step 5: Calculate PIN by reversing the PVV calculation
  // PIN = (PVV - TSP) mod 10
  let pin = '';
  for (let i = 0; i < 4; i++) {
    const pvvDigit = parseInt(pvv[i], 10);
    const tspDigit = parseInt(tsp[i], 10);
    const pinDigit = (pvvDigit - tspDigit + 10) % 10;
    pin += pinDigit.toString();
  }

  return {
    pin,
    encryptedPan,
    tsp,
  };
};

const PinPVVTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('pvv');

  // PVV Calculation State
  const [pdkPVV, setPdkPVV] = useState('0123456789ABCDEFFEDCBA9876543210');
  const [panPVV, setPanPVV] = useState('1234567899876543');
  const [pinPVV, setPinPVV] = useState('1234');
  const [pvkiPVV, setPvkiPVV] = useState(1);
  const [pvvResult, setPvvResult] = useState<{ pvv: string; encryptedPan: string; tsp: string } | null>(null);

  // PIN Verification State
  const [pdkPIN, setPdkPIN] = useState('0123456789ABCDEFFEDCBA9876543210');
  const [panPIN, setPanPIN] = useState('123456789123456');
  const [pvvPIN, setPvvPIN] = useState('9365');
  const [pvkiPIN, setPvkiPIN] = useState(1);
  const [pinResult, setPinResult] = useState<{ pin: string; encryptedPan: string; tsp: string } | null>(null);

  const handleCalculatePVV = () => {
    try {
      const cleanPdk = sanitizeHex(pdkPVV);
      const cleanPan = sanitizeDigits(panPVV);
      const cleanPin = sanitizeDigits(pinPVV);

      if (cleanPdk.length !== 32) {
        message.error(t.pinPvv?.errorInvalidPdk || 'PDK must be 32 hex characters');
        return;
      }
      if (cleanPan.length < 12 || cleanPan.length > 19) {
        message.error(t.pinPvv?.errorInvalidPan || 'PAN must be 12-19 digits');
        return;
      }
      if (cleanPin.length < 4 || cleanPin.length > 12) {
        message.error(t.pinPvv?.errorInvalidPin || 'PIN must be 4-12 digits');
        return;
      }

      const result = calculatePVV(cleanPdk, cleanPan, cleanPin, pvkiPVV);
      setPvvResult(result);
      message.success(t.pinPvv?.pvvCalculated || 'PVV calculated successfully');
    } catch (error) {
      message.error(t.pinPvv?.errorProcessing || `Error: ${(error as Error).message}`);
      setPvvResult(null);
    }
  };

  const handleCalculatePIN = () => {
    try {
      const cleanPdk = sanitizeHex(pdkPIN);
      const cleanPan = sanitizeDigits(panPIN);
      const cleanPvv = sanitizeDigits(pvvPIN);

      if (cleanPdk.length !== 32) {
        message.error(t.pinPvv?.errorInvalidPdk || 'PDK must be 32 hex characters');
        return;
      }
      if (cleanPan.length < 12 || cleanPan.length > 19) {
        message.error(t.pinPvv?.errorInvalidPan || 'PAN must be 12-19 digits');
        return;
      }
      if (cleanPvv.length !== 4) {
        message.error(t.pinPvv?.errorInvalidPvv || 'PVV must be 4 digits');
        return;
      }

      const result = verifyPinWithPVV(cleanPdk, cleanPan, cleanPvv, pvkiPIN);
      setPinResult(result);
      message.success(t.pinPvv?.pinCalculated || 'PIN calculated successfully');
    } catch (error) {
      message.error(t.pinPvv?.errorProcessing || `Error: ${(error as Error).message}`);
      setPinResult(null);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} ${t.pinPvv?.copied || 'copied to clipboard'}`);
  };

  const tabItems = [
    {
      key: 'pvv',
      label: t.pinPvv?.tabPvv || 'PVV',
      children: (
        <div>
          {/* PDK Input */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.pdkLabel || 'PDK:'}
            </Text>
            <Input
              value={pdkPVV}
              onChange={(e) => setPdkPVV(sanitizeHex(e.target.value))}
              placeholder="0123456789ABCDEFFEDCBA9876543210"
              maxLength={32}
              suffix={<Text type="success">[{sanitizeHex(pdkPVV).length}]</Text>}
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.pdkHint || '32 hex characters (16 bytes) - PIN Derivation Key'}
            </Text>
          </div>

          {/* PAN Input */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.panLabel || 'PAN:'}
            </Text>
            <Input
              value={panPVV}
              onChange={(e) => setPanPVV(sanitizeDigits(e.target.value))}
              placeholder="1234567899876543"
              maxLength={19}
              suffix={<Text type="success">[{sanitizeDigits(panPVV).length}]</Text>}
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.panHint || '12-19 digits - Primary Account Number'}
            </Text>
          </div>

          {/* PIN Input */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.pinLabel || 'PIN:'}
            </Text>
            <Input
              value={pinPVV}
              onChange={(e) => setPinPVV(sanitizeDigits(e.target.value))}
              placeholder="1234"
              maxLength={12}
              suffix={<Text type="success">[{sanitizeDigits(pinPVV).length}]</Text>}
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.pinHint || '4-12 digits - Customer PIN'}
            </Text>
          </div>

          {/* PVKI Input */}
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.pvkiLabel || 'PVKI:'}
            </Text>
            <div>
              <InputNumber
                min={0}
                max={9}
                value={pvkiPVV}
                onChange={(value) => setPvkiPVV(value || 0)}
                style={{ width: 100 }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.pvkiHint || '0-9 - PIN Verification Key Index'}
            </Text>
          </div>

          {/* Calculate Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              onClick={handleCalculatePVV}
              size="large"
            >
              {t.pinPvv?.calculatePvv || 'Calculate PVV'}
            </Button>
          </div>

          {/* Result */}
          {pvvResult && (
            <Card
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #1a4d2e 0%, #2d5a3d 100%)'
                  : 'linear-gradient(135deg, #d4f4dd 0%, #c8e6c9 100%)',
                border: 'none',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16, color: isDark ? '#e6e6e6' : '#1a4d2e' }}>
                    {t.pinPvv?.pvvResult || 'PVV:'}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(pvvResult.pvv, 'PVV')}
                    style={{ color: isDark ? '#52c41a' : '#2d5a3d' }}
                  />
                </div>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: isDark ? '#fff' : '#1a4d2e',
                    fontWeight: 600,
                  }}
                >
                  {pvvResult.pvv}
                </Text>
              </div>

              <Divider style={{ margin: '16px 0', borderColor: isDark ? '#3a6e4a' : '#a5d6a7' }} />

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ color: isDark ? '#b8e6c3' : '#2d5a3d' }}>
                    {t.pinPvv?.encryptedPan || 'Encrypted PAN:'}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(pvvResult.encryptedPan, 'Encrypted PAN')}
                    style={{ color: isDark ? '#52c41a' : '#2d5a3d' }}
                  />
                </div>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: isDark ? '#d9f2df' : '#1a4d2e',
                  }}
                >
                  {formatHexDisplay(pvvResult.encryptedPan, 2)}
                </Text>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ color: isDark ? '#b8e6c3' : '#2d5a3d' }}>
                    {t.pinPvv?.tsp || 'TSP (Transformed Selection):'}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(pvvResult.tsp, 'TSP')}
                    style={{ color: isDark ? '#52c41a' : '#2d5a3d' }}
                  />
                </div>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: isDark ? '#d9f2df' : '#1a4d2e',
                  }}
                >
                  {pvvResult.tsp}
                </Text>
              </div>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'pin',
      label: t.pinPvv?.tabPin || 'PIN',
      children: (
        <div>
          {/* PDK Input */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.pdkLabel || 'PDK:'}
            </Text>
            <Input
              value={pdkPIN}
              onChange={(e) => setPdkPIN(sanitizeHex(e.target.value))}
              placeholder="0123456789ABCDEFFEDCBA9876543210"
              maxLength={32}
              suffix={<Text type="success">[{sanitizeHex(pdkPIN).length}]</Text>}
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.pdkHint || '32 hex characters (16 bytes) - PIN Derivation Key'}
            </Text>
          </div>

          {/* PAN Input */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.panLabel || 'PAN:'}
            </Text>
            <Input
              value={panPIN}
              onChange={(e) => setPanPIN(sanitizeDigits(e.target.value))}
              placeholder="123456789123456"
              maxLength={19}
              suffix={<Text type="success">[{sanitizeDigits(panPIN).length}]</Text>}
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.panHint || '12-19 digits - Primary Account Number'}
            </Text>
          </div>

          {/* PVV Input */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.pvvLabel || 'PVV:'}
            </Text>
            <Input
              value={pvvPIN}
              onChange={(e) => setPvvPIN(sanitizeDigits(e.target.value))}
              placeholder="9365"
              maxLength={4}
              suffix={<Text type="success">[{sanitizeDigits(pvvPIN).length}]</Text>}
              style={{ fontFamily: 'Monaco, Consolas, monospace' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.pvvHint || '4 digits - PIN Verification Value'}
            </Text>
          </div>

          {/* PVKI Input */}
          <div style={{ marginBottom: 24 }}>
            <Text strong style={{ display: 'block', marginBottom: 8, color: isDark ? '#e6e6e6' : '#333' }}>
              {t.pinPvv?.pvkiLabel || 'PVKI:'}
            </Text>
            <div>
              <InputNumber
                min={0}
                max={9}
                value={pvkiPIN}
                onChange={(value) => setPvkiPIN(value || 0)}
                style={{ width: 100 }}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.pinPvv?.pvkiHint || '0-9 - PIN Verification Key Index'}
            </Text>
          </div>

          {/* Calculate Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button
              type="primary"
              onClick={handleCalculatePIN}
              size="large"
            >
              {t.pinPvv?.calculatePin || 'Calculate PIN'}
            </Button>
          </div>

          {/* Result */}
          {pinResult && (
            <Card
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #1a4d2e 0%, #2d5a3d 100%)'
                  : 'linear-gradient(135deg, #d4f4dd 0%, #c8e6c9 100%)',
                border: 'none',
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ fontSize: 16, color: isDark ? '#e6e6e6' : '#1a4d2e' }}>
                    {t.pinPvv?.pinResult || 'PIN:'}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(pinResult.pin, 'PIN')}
                    style={{ color: isDark ? '#52c41a' : '#2d5a3d' }}
                  />
                </div>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: isDark ? '#fff' : '#1a4d2e',
                    fontWeight: 600,
                  }}
                >
                  {pinResult.pin}
                </Text>
              </div>

              <Divider style={{ margin: '16px 0', borderColor: isDark ? '#3a6e4a' : '#a5d6a7' }} />

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ color: isDark ? '#b8e6c3' : '#2d5a3d' }}>
                    {t.pinPvv?.encryptedPan || 'Encrypted PAN:'}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(pinResult.encryptedPan, 'Encrypted PAN')}
                    style={{ color: isDark ? '#52c41a' : '#2d5a3d' }}
                  />
                </div>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: isDark ? '#d9f2df' : '#1a4d2e',
                  }}
                >
                  {formatHexDisplay(pinResult.encryptedPan, 2)}
                </Text>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong style={{ color: isDark ? '#b8e6c3' : '#2d5a3d' }}>
                    {t.pinPvv?.tsp || 'TSP (Transformed Selection):'}
                  </Text>
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(pinResult.tsp, 'TSP')}
                    style={{ color: isDark ? '#52c41a' : '#2d5a3d' }}
                  />
                </div>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'Monaco, Consolas, monospace',
                    color: isDark ? '#d9f2df' : '#1a4d2e',
                  }}
                >
                  {pinResult.tsp}
                </Text>
              </div>
            </Card>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.pinPvv?.title || 'PIN PVV Calculator'}
          </Title>
          <CollapsibleInfo title={t.pinPvv?.infoTitle || 'About PIN PVV'}>
            <div>
              {t.pinPvv?.info1 ||
                'PIN Verification Value (PVV) is a Visa standard for PIN verification. It uses a PIN Derivation Key (PDK) to encrypt the card number (PAN), applies decimalization, and calculates a 4-digit verification value.'}
            </div>
            <div style={{ marginTop: 8 }}>
              {t.pinPvv?.info2 ||
                'The PVV tab calculates the PVV from a PIN. The PIN tab verifies a PIN by calculating it from a known PVV.'}
            </div>
            <div style={{ marginTop: 8 }}>
              {t.pinPvv?.info3 ||
                'PVKI (PIN Verification Key Index) determines which position in the encrypted result to use for verification.'}
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.pinPvv?.description || 'Calculate and verify PIN Verification Values (PVV) using Visa standard with decimalization.'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>
    </div>
  );
};

export default PinPVVTool;
