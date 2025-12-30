import React, { useState, useCallback } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Table, Alert } from 'antd';
import { SearchOutlined, CopyOutlined, ClearOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;
const { TextArea } = Input;

type ParseMode = 'ATM_NDC' | 'ATM_WINCOR' | 'ISO_8583_1987';

interface ParsedField {
  key: string;
  field: string;
  length: number;
  value: string;
  description: string;
}

// NDC Field names for reference
const NDC_FIELD_NAMES = [
  'LUNO', 'Time Variant', 'Top of Receipt', 'Message Class', 'Message Subclass',
  'Track 2 Data', 'Track 3 Data', 'Operation Code', 'Amount', 'PIN Block',
  'Buffer B', 'Buffer C'
];

// ISO 8583:1987 Field Definitions
const ISO8583_FIELDS: { [key: number]: { name: string; format: string } } = {
  0: { name: 'MTI', format: 'n4' },
  1: { name: 'Bitmap', format: 'b64' },
  2: { name: 'PAN', format: 'n..19' },
  3: { name: 'Processing Code', format: 'n6' },
  4: { name: 'Amount, Transaction', format: 'n12' },
  5: { name: 'Amount, Settlement', format: 'n12' },
  6: { name: 'Amount, Cardholder Billing', format: 'n12' },
  7: { name: 'Transmission Date & Time', format: 'n10' },
  11: { name: 'STAN', format: 'n6' },
  12: { name: 'Time, Local Transaction', format: 'n6' },
  13: { name: 'Date, Local Transaction', format: 'n4' },
  14: { name: 'Date, Expiration', format: 'n4' },
  18: { name: 'Merchant Type', format: 'n4' },
  22: { name: 'POS Entry Mode', format: 'n3' },
  23: { name: 'Card Sequence Number', format: 'n3' },
  25: { name: 'POS Condition Code', format: 'n2' },
  26: { name: 'POS PIN Capture Code', format: 'n2' },
  32: { name: 'Acquiring Institution ID', format: 'n..11' },
  35: { name: 'Track 2 Data', format: 'z..37' },
  37: { name: 'Retrieval Reference Number', format: 'an12' },
  38: { name: 'Authorization ID Response', format: 'an6' },
  39: { name: 'Response Code', format: 'an2' },
  41: { name: 'Card Acceptor Terminal ID', format: 'ans8' },
  42: { name: 'Card Acceptor ID Code', format: 'ans15' },
  43: { name: 'Card Acceptor Name/Location', format: 'ans40' },
  48: { name: 'Additional Data', format: 'ans...999' },
  49: { name: 'Currency Code, Transaction', format: 'n3' },
  52: { name: 'PIN Data', format: 'b64' },
  53: { name: 'Security Related Control Info', format: 'n16' },
  54: { name: 'Additional Amounts', format: 'an...120' },
  55: { name: 'ICC Data', format: 'ans...999' },
  60: { name: 'Reserved (National)', format: 'ans...999' },
  61: { name: 'Reserved (National)', format: 'ans...999' },
  62: { name: 'Reserved (Private)', format: 'ans...999' },
  63: { name: 'Reserved (Private)', format: 'ans...999' },
  64: { name: 'MAC', format: 'b64' },
  128: { name: 'MAC', format: 'b64' },
};

// Parse NDC message
const parseNDC = (hexData: string): ParsedField[] => {
  const fields: ParsedField[] = [];
  const cleanHex = hexData.replace(/[\s\n\r]/g, '').toUpperCase();
  
  if (cleanHex.length < 2) {
    throw new Error('Data too short for NDC message');
  }

  let fieldIndex = 0;

  // Try to identify message type and parse accordingly
  // NDC messages use Field Separator (FS = 0x1C) to separate fields
  const FS = '1C';
  const parts = cleanHex.split(FS);
  
  for (const part of parts) {
    if (part.length === 0) continue;
    
    const hexValue = part;
    let asciiValue = '';
    try {
      for (let i = 0; i < hexValue.length; i += 2) {
        const byte = parseInt(hexValue.substr(i, 2), 16);
        if (byte >= 32 && byte <= 126) {
          asciiValue += String.fromCharCode(byte);
        } else {
          asciiValue += '.';
        }
      }
    } catch {
      asciiValue = hexValue;
    }

    const fieldName = fieldIndex < NDC_FIELD_NAMES.length ? NDC_FIELD_NAMES[fieldIndex] : `Field ${fieldIndex}`;
    fields.push({
      key: `field_${fieldIndex}`,
      field: fieldName,
      length: hexValue.length / 2,
      value: asciiValue.length <= 50 ? asciiValue : asciiValue.substring(0, 47) + '...',
      description: `Hex: ${hexValue.length <= 32 ? hexValue : hexValue.substring(0, 29) + '...'}`,
    });
    fieldIndex++;
  }

  if (fields.length === 0) {
    // If no FS separators found, try to parse as raw hex
    let asciiValue = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      const byte = parseInt(cleanHex.substr(i, 2), 16);
      if (byte >= 32 && byte <= 126) {
        asciiValue += String.fromCharCode(byte);
      } else {
        asciiValue += '.';
      }
    }
    
    fields.push({
      key: 'raw_data',
      field: 'Raw Data',
      length: cleanHex.length / 2,
      value: asciiValue.length <= 50 ? asciiValue : asciiValue.substring(0, 47) + '...',
      description: `Hex: ${cleanHex.length <= 32 ? cleanHex : cleanHex.substring(0, 29) + '...'}`,
    });
  }

  return fields;
};

// Parse Wincor message (similar to NDC but with different separators)
const parseWincor = (hexData: string): ParsedField[] => {
  const fields: ParsedField[] = [];
  const cleanHex = hexData.replace(/[\s\n\r]/g, '').toUpperCase();
  
  if (cleanHex.length < 2) {
    throw new Error('Data too short for Wincor message');
  }

  // Wincor often uses different field separators
  const separators = ['1C', '1D', '1E'];
  let parts = [cleanHex];
  
  for (const sep of separators) {
    const newParts: string[] = [];
    for (const part of parts) {
      newParts.push(...part.split(sep));
    }
    parts = newParts;
  }

  let fieldIndex = 0;
  for (const part of parts) {
    if (part.length === 0) continue;
    
    const hexValue = part;
    let asciiValue = '';
    try {
      for (let i = 0; i < hexValue.length; i += 2) {
        const byte = parseInt(hexValue.substr(i, 2), 16);
        if (byte >= 32 && byte <= 126) {
          asciiValue += String.fromCharCode(byte);
        } else {
          asciiValue += '.';
        }
      }
    } catch {
      asciiValue = hexValue;
    }

    fields.push({
      key: `field_${fieldIndex}`,
      field: `Field ${fieldIndex}`,
      length: hexValue.length / 2,
      value: asciiValue.length <= 50 ? asciiValue : asciiValue.substring(0, 47) + '...',
      description: `Hex: ${hexValue.length <= 32 ? hexValue : hexValue.substring(0, 29) + '...'}`,
    });
    fieldIndex++;
  }

  return fields;
};

// Parse ISO 8583:1987 message
const parseISO8583 = (hexData: string): ParsedField[] => {
  const fields: ParsedField[] = [];
  const cleanHex = hexData.replace(/[\s\n\r]/g, '').toUpperCase();
  
  if (cleanHex.length < 4) {
    throw new Error('Data too short for ISO 8583 message');
  }

  let pos = 0;

  // MTI (Message Type Indicator) - 4 digits
  const mti = cleanHex.substring(pos, pos + 4);
  fields.push({
    key: 'mti',
    field: 'MTI',
    length: 2,
    value: mti,
    description: ISO8583_FIELDS[0]?.name || 'Message Type Indicator',
  });
  pos += 4;

  // Primary Bitmap - 16 hex digits (64 bits)
  if (pos + 16 > cleanHex.length) {
    return fields;
  }
  
  const primaryBitmap = cleanHex.substring(pos, pos + 16);
  const primaryBits = BigInt('0x' + primaryBitmap);
  
  fields.push({
    key: 'bitmap_primary',
    field: 'Bitmap (Primary)',
    length: 8,
    value: primaryBitmap,
    description: 'Primary Bitmap (Fields 1-64)',
  });
  pos += 16;

  // Check for secondary bitmap (bit 1 of primary bitmap)
  let secondaryBits = BigInt(0);
  if ((primaryBits >> BigInt(63)) & BigInt(1)) {
    if (pos + 16 <= cleanHex.length) {
      const secondaryBitmap = cleanHex.substring(pos, pos + 16);
      secondaryBits = BigInt('0x' + secondaryBitmap);
      
      fields.push({
        key: 'bitmap_secondary',
        field: 'Bitmap (Secondary)',
        length: 8,
        value: secondaryBitmap,
        description: 'Secondary Bitmap (Fields 65-128)',
      });
      pos += 16;
    }
  }

  // Parse fields based on bitmap
  for (let i = 2; i <= 128; i++) {
    let isSet = false;
    if (i <= 64) {
      isSet = Boolean((primaryBits >> BigInt(64 - i)) & BigInt(1));
    } else {
      isSet = Boolean((secondaryBits >> BigInt(128 - i)) & BigInt(1));
    }

    if (isSet && pos < cleanHex.length) {
      const fieldDef = ISO8583_FIELDS[i];
      const fieldName = fieldDef?.name || `Field ${i}`;
      
      // Simplified field extraction (actual implementation would need proper length handling)
      // For demo purposes, we'll extract remaining data for known fields
      let fieldLength = 0;
      let fieldValue = '';
      
      // Variable length fields
      if (fieldDef?.format.includes('..')) {
        // Read 2 or 3 digit length prefix
        const lenDigits = fieldDef.format.includes('...') ? 6 : 4;
        if (pos + lenDigits <= cleanHex.length) {
          const lenHex = cleanHex.substring(pos, pos + lenDigits);
          fieldLength = parseInt(lenHex, 16) || parseInt(lenHex, 10) || 0;
          pos += lenDigits;
          
          if (pos + fieldLength * 2 <= cleanHex.length) {
            fieldValue = cleanHex.substring(pos, pos + fieldLength * 2);
            pos += fieldLength * 2;
          }
        }
      } else {
        // Fixed length fields
        const match = fieldDef?.format.match(/\d+/);
        if (match) {
          fieldLength = parseInt(match[0], 10);
          if (fieldDef?.format.startsWith('b')) {
            fieldLength = fieldLength / 8; // bits to bytes
          }
          if (pos + fieldLength * 2 <= cleanHex.length) {
            fieldValue = cleanHex.substring(pos, pos + fieldLength * 2);
            pos += fieldLength * 2;
          }
        }
      }

      if (fieldValue) {
        let displayValue = fieldValue;
        // Try to convert to ASCII if applicable
        if (!fieldDef?.format.startsWith('b')) {
          let ascii = '';
          for (let j = 0; j < fieldValue.length; j += 2) {
            const byte = parseInt(fieldValue.substr(j, 2), 16);
            if (byte >= 32 && byte <= 126) {
              ascii += String.fromCharCode(byte);
            } else {
              ascii += '.';
            }
          }
          displayValue = ascii;
        }

        fields.push({
          key: `field_${i}`,
          field: `Field ${i}`,
          length: fieldLength,
          value: displayValue.length <= 40 ? displayValue : displayValue.substring(0, 37) + '...',
          description: fieldName,
        });
      }
    }
  }

  return fields;
};

const MessageParserTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [parseMode, setParseMode] = useState<ParseMode>('ATM_NDC');
  const [hexData, setHexData] = useState<string>('');
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [error, setError] = useState('');

  const isValidHex = (hex: string): boolean => {
    const cleaned = hex.replace(/[\s\n\r]/g, '').toUpperCase();
    return /^[0-9A-F]*$/.test(cleaned);
  };

  const handleParse = useCallback(() => {
    setError('');
    setParsedFields([]);

    if (!hexData.trim()) {
      setError(t.messageParser?.errorNoInput || 'Please enter hex data');
      return;
    }

    if (!isValidHex(hexData)) {
      setError(t.messageParser?.errorInvalidHex || 'Invalid hexadecimal input');
      return;
    }

    try {
      let fields: ParsedField[] = [];
      
      switch (parseMode) {
        case 'ATM_NDC':
          fields = parseNDC(hexData);
          break;
        case 'ATM_WINCOR':
          fields = parseWincor(hexData);
          break;
        case 'ISO_8583_1987':
          fields = parseISO8583(hexData);
          break;
      }

      if (fields.length === 0) {
        setError(t.messageParser?.errorParseFailed || 'Failed to parse message');
        return;
      }

      setParsedFields(fields);
    } catch (err) {
      console.error('Parse error:', err);
      setError((t.messageParser?.errorParseFailed || 'Parse failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }, [hexData, parseMode, t]);

  const handleClear = useCallback(() => {
    setHexData('');
    setParsedFields([]);
    setError('');
  }, []);

  const copyResult = useCallback(() => {
    if (parsedFields.length > 0) {
      const text = parsedFields.map(f => `${f.field}: ${f.value} (${f.description})`).join('\n');
      navigator.clipboard.writeText(text);
      message.success(t.common.copied);
    }
  }, [parsedFields, t]);

  const getInputLength = (): number => {
    return hexData.replace(/[\s\n\r]/g, '').length / 2;
  };

  const getModeDescription = (mode: ParseMode): string => {
    switch (mode) {
      case 'ATM_NDC':
        return t.messageParser?.ndcDesc || 'NCR NDC/DDC protocol for ATM communication';
      case 'ATM_WINCOR':
        return t.messageParser?.wincorDesc || 'Wincor Nixdorf protocol for ATM communication';
      case 'ISO_8583_1987':
        return t.messageParser?.iso8583Desc || 'ISO 8583:1987 financial transaction message format';
      default:
        return '';
    }
  };

  const columns = [
    {
      title: t.messageParser?.fieldName || 'Field',
      dataIndex: 'field',
      key: 'field',
      width: 140,
      render: (text: string) => (
        <span style={{ fontWeight: 600, color: '#1677ff' }}>{text}</span>
      ),
    },
    {
      title: t.messageParser?.length || 'Length',
      dataIndex: 'length',
      key: 'length',
      width: 80,
      render: (text: number) => (
        <span style={{ 
          background: '#f0f5ff', 
          padding: '2px 8px', 
          borderRadius: '4px',
          color: '#597ef7',
          fontWeight: 500
        }}>{text}</span>
      ),
    },
    {
      title: t.messageParser?.value || 'Value',
      dataIndex: 'value',
      key: 'value',
      ellipsis: true,
      render: (text: string) => (
        <span style={{ 
          color: '#52c41a', 
          fontWeight: 600,
          background: '#f6ffed',
          padding: '2px 8px',
          borderRadius: '4px'
        }}>{text}</span>
      ),
    },
    {
      title: t.messageParser?.description || 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => (
        <span style={{ color: '#666', fontSize: '12px' }}>{text}</span>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.messageParser?.title || 'Message Parser'}
          </Title>
          <CollapsibleInfo title={t.messageParser?.info || 'Parse Mode Information'}>
            <div>• {getModeDescription(parseMode)}</div>
            <div>• {t.messageParser?.hexInputInfo || 'Input must be valid hexadecimal data'}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.messageParser?.description || 'Parse ATM and financial transaction messages'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {/* Parse Mode Selection */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.messageParser?.parseMode || 'Parse Mode'}:
            </Text>
            <Segmented
              value={parseMode}
              onChange={(val) => {
                setParseMode(val as ParseMode);
                setParsedFields([]);
                setError('');
              }}
              options={[
                { label: 'ATM_NDC', value: 'ATM_NDC' },
                { label: 'ATM_WINCOR', value: 'ATM_WINCOR' },
                { label: 'ISO_8583_1987', value: 'ISO_8583_1987' },
              ]}
              block
              size="large"
            />
          </div>

          {/* Hex Data Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>
                {t.messageParser?.hexData || 'Hex Data'}:
              </Text>
              <Text style={{ 
                fontSize: '12px',
                color: getInputLength() > 0 ? '#52c41a' : '#999',
                fontWeight: getInputLength() > 0 ? 600 : 400
              }}>
                [{getInputLength()} bytes]
              </Text>
            </div>
            <TextArea
              value={hexData}
              onChange={e => setHexData(e.target.value)}
              placeholder={t.messageParser?.placeholder || 'Enter hexadecimal message data to parse...'}
              autoSize={{ minRows: 6, maxRows: 12 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '14px' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={handleParse}
              size="large"
            >
              {t.common.parse || 'Parse'}
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

          {/* Error Display */}
          {error && (
            <Alert message={error} type="error" showIcon closable onClose={() => setError('')} />
          )}

          {/* Parsed Result */}
          {parsedFields.length > 0 && (
            <Card 
              title={
                <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                  <SearchOutlined style={{ marginRight: 8 }} />
                  {t.messageParser?.parsedResult || 'Parsed Result'}
                  <span style={{ 
                    marginLeft: 8, 
                    fontSize: '12px', 
                    fontWeight: 400, 
                    color: isDark ? '#95de64' : '#52c41a',
                    background: isDark ? 'rgba(82, 196, 26, 0.2)' : '#f6ffed',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {parsedFields.length} {t.messageParser?.fields || 'fields'}
                  </span>
                </span>
              }
              bordered={false}
              style={{ 
                background: isDark 
                  ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                  : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                border: isDark ? '1px solid #274916' : '2px solid #95de64',
                boxShadow: isDark 
                  ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
                  : '0 4px 16px rgba(82, 196, 26, 0.2)',
                borderRadius: '8px'
              }}
              headStyle={{
                borderBottom: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
                background: 'transparent'
              }}
              extra={
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
              }
            >
              <Table
                dataSource={parsedFields}
                columns={columns}
                pagination={false}
                size="small"
                scroll={{ x: true }}
                rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
                style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  fontSize: '13px'
                }}
              />
              <style>{`
                .table-row-light { background: ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)'}; }
                .table-row-dark { background: ${isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.5)'}; }
                .ant-table-thead > tr > th {
                  background: ${isDark 
                    ? 'linear-gradient(135deg, #1a2e1a 0%, #162312 100%)' 
                    : 'linear-gradient(135deg, #d9f7be 0%, #f6ffed 100%)'} !important;
                  color: ${isDark ? '#95de64' : '#237804'} !important;
                  font-weight: 600 !important;
                }
                .ant-table-cell { color: ${isDark ? '#b0b0b0' : '#333'} !important; }
              `}</style>
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MessageParserTool;

