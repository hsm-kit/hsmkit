import React, { useState, useEffect } from 'react';
import { Card, Button, Checkbox, Input, message, Divider, Typography, Row, Col } from 'antd';
import { CopyOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import { CollapsibleInfo } from '../common';

const { Title, Text } = Typography;

const BitmapTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [bitmapHex, setBitmapHex] = useState('');
  const [primaryBits, setPrimaryBits] = useState<boolean[]>(new Array(64).fill(false));
  const [secondaryBits, setSecondaryBits] = useState<boolean[]>(new Array(64).fill(false));
  const [hasSecondary, setHasSecondary] = useState(false);

  // Parse bitmap hex to bits
  useEffect(() => {
    if (!bitmapHex) {
      setPrimaryBits(new Array(64).fill(false));
      setSecondaryBits(new Array(64).fill(false));
      setHasSecondary(false);
      return;
    }

    const cleanHex = bitmapHex.replace(/\s/g, '').toUpperCase();
    if (!/^[0-9A-F]*$/.test(cleanHex)) {
      return;
    }

    try {
      // Parse primary bitmap (first 16 hex chars = 64 bits)
      const primaryHex = cleanHex.substring(0, 16);
      const newPrimaryBits = new Array(64).fill(false);
      
      for (let i = 0; i < primaryHex.length && i < 16; i++) {
        const hexDigit = parseInt(primaryHex[i], 16);
        for (let bit = 0; bit < 4; bit++) {
          const bitIndex = i * 4 + bit;
          if (bitIndex < 64) {
            newPrimaryBits[bitIndex] = (hexDigit & (8 >> bit)) !== 0;
          }
        }
      }

      setPrimaryBits(newPrimaryBits);
      const hasSecondaryBitmap = newPrimaryBits[0]; // Bit 1 indicates secondary bitmap
      setHasSecondary(hasSecondaryBitmap);

      // Parse secondary bitmap if present
      if (hasSecondaryBitmap && cleanHex.length > 16) {
        const secondaryHex = cleanHex.substring(16, 32);
        const newSecondaryBits = new Array(64).fill(false);
        
        for (let i = 0; i < secondaryHex.length && i < 16; i++) {
          const hexDigit = parseInt(secondaryHex[i], 16);
          for (let bit = 0; bit < 4; bit++) {
            const bitIndex = i * 4 + bit;
            if (bitIndex < 64) {
              newSecondaryBits[bitIndex] = (hexDigit & (8 >> bit)) !== 0;
            }
          }
        }
        setSecondaryBits(newSecondaryBits);
      } else {
        setSecondaryBits(new Array(64).fill(false));
      }
    } catch (err) {
      console.error('Error parsing bitmap:', err);
    }
  }, [bitmapHex]);

  // Generate bitmap hex from bits
  const generateBitmapHex = (primary: boolean[], secondary: boolean[]) => {
    let hex = '';
    
    // Generate primary bitmap
    for (let i = 0; i < 16; i++) {
      let byte = 0;
      for (let bit = 0; bit < 4; bit++) {
        const bitIndex = i * 4 + bit;
        if (bitIndex < 64 && primary[bitIndex]) {
          byte |= (8 >> bit);
        }
      }
      hex += byte.toString(16).toUpperCase();
    }

    // Generate secondary bitmap if bit 1 is set
    if (primary[0]) {
      for (let i = 0; i < 16; i++) {
        let byte = 0;
        for (let bit = 0; bit < 4; bit++) {
          const bitIndex = i * 4 + bit;
          if (bitIndex < 64 && secondary[bitIndex]) {
            byte |= (8 >> bit);
          }
        }
        hex += byte.toString(16).toUpperCase();
      }
    }

    return hex;
  };

  const handlePrimaryBitChange = (index: number, checked: boolean) => {
    const newPrimaryBits = [...primaryBits];
    newPrimaryBits[index] = checked;
    
    // If toggling bit 1, update hasSecondary
    if (index === 0) {
      setHasSecondary(checked);
      if (!checked) {
        setSecondaryBits(new Array(64).fill(false));
      }
    }
    
    setPrimaryBits(newPrimaryBits);
    setBitmapHex(generateBitmapHex(newPrimaryBits, index === 0 && !checked ? new Array(64).fill(false) : secondaryBits));
  };

  const handleSecondaryBitChange = (index: number, checked: boolean) => {
    const newSecondaryBits = [...secondaryBits];
    newSecondaryBits[index] = checked;
    setSecondaryBits(newSecondaryBits);
    setBitmapHex(generateBitmapHex(primaryBits, newSecondaryBits));
  };

  const handleBitmapHexChange = (value: string) => {
    const cleanValue = value.replace(/\s/g, '').toUpperCase();
    if (cleanValue === '' || /^[0-9A-F]*$/.test(cleanValue)) {
      setBitmapHex(cleanValue);
    }
  };

  const handleCopy = async () => {
    if (!bitmapHex) {
      message.warning(t.bitmap?.errorNoBitmap || 'Please enter or generate a bitmap');
      return;
    }
    try {
      await navigator.clipboard.writeText(bitmapHex);
      message.success(t.bitmap?.copySuccess || 'Copied to clipboard');
    } catch {
      message.error(t.bitmap?.copyError || 'Failed to copy');
    }
  };

  const renderBitmapGrid = (bits: boolean[], startBit: number, onChange: (index: number, checked: boolean) => void, disabled: boolean = false) => {
    return (
      <Row gutter={[8, 8]}>
        {bits.map((checked, index) => {
          const bitNumber = startBit + index + 1;
          return (
            <Col key={index} xs={6} sm={4} md={3} lg={3} xl={3}>
              <div
                style={{
                  padding: '4px',
                  borderRadius: '4px',
                  backgroundColor: checked ? (isDark ? '#1668dc' : '#e6f4ff') : (isDark ? '#1f1f1f' : '#fafafa'),
                  border: `1px solid ${checked ? (isDark ? '#1668dc' : '#91caff') : (isDark ? '#424242' : '#d9d9d9')}`,
                  transition: 'all 0.2s',
                }}
              >
                <Checkbox
                  checked={checked}
                  onChange={(e) => onChange(index, e.target.checked)}
                  disabled={disabled}
                  style={{ width: '100%' }}
                >
                  <span style={{ fontSize: '12px', fontWeight: checked ? 600 : 400 }}>
                    {bitNumber}
                  </span>
                </Checkbox>
              </div>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
              {t.bitmap?.title || 'ISO8583 Bitmap'}
            </Title>
            <CollapsibleInfo title={t.bitmap?.infoTitle || 'About ISO8583 Bitmap'}>
              <div>{t.bitmap?.info1 || 'ISO 8583 bitmap indicates which data fields are present in the message.'}</div>
              <div style={{ marginTop: 8 }}>{t.bitmap?.info2 || 'Primary bitmap (64 bits) covers fields 1-64. If bit 1 is set, secondary bitmap (65-128) is present.'}</div>
              <div style={{ marginTop: 8 }}>{t.bitmap?.info3 || 'Each bit position corresponds to a data field number in the ISO8583 message.'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.bitmap?.description || 'Parse bitmap (hexadecimal data) into bits and construct a bitmap back from binary data provided.'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.bitmap?.bitmapLabel || 'Bitmap'}:
              </Text>
              <Input
                value={bitmapHex}
                onChange={(e) => handleBitmapHexChange(e.target.value)}
                placeholder={t.bitmap?.bitmapPlaceholder || 'e.g., B0300054020000000000000010000001'}
                prefix={<AppstoreOutlined style={{ color: '#bfbfbf' }} />}
                suffix={
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={handleCopy}
                    disabled={!bitmapHex}
                  />
                }
                style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                  fontSize: '14px',
                  textTransform: 'uppercase'
                }}
                size="large"
              />
              <Text type="secondary" style={{ fontSize: '11px', marginTop: 4, display: 'block' }}>
                {t.bitmap?.bitmapHint || 'Enter hexadecimal bitmap or select bits below. Bit 1 indicates secondary bitmap presence (ISO8583 standard).'}
              </Text>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: '14px' }}>
                  {t.bitmap?.primaryBitmap || 'Primary Bitmap'}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {t.bitmap?.bits || 'Bits'} 1-64
                </Text>
              </div>
              {renderBitmapGrid(primaryBits, 0, handlePrimaryBitChange)}
            </div>

            {hasSecondary && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text strong style={{ fontSize: '14px' }}>
                    {t.bitmap?.secondaryBitmap || 'Secondary Bitmap'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t.bitmap?.bits || 'Bits'} 65-128
                  </Text>
                </div>
                {renderBitmapGrid(secondaryBits, 64, handleSecondaryBitChange)}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BitmapTool;
