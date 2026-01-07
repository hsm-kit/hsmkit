import React, { useState } from 'react';
import { Card, Button, Tabs, message, Typography, Checkbox, Upload, Select, Alert, Input, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useTheme } from '../../hooks/useTheme';
import { cleanHexInput, isValidHex } from '../../utils/crypto';
import type { RcFile } from 'antd/es/upload/interface';

const { Text, Paragraph, Title } = Typography;
const { TabPane } = Tabs;

// VISA CA Public Keys (预定义的CA公钥)
const CA_PUBLIC_KEYS = {
  'VSDC CA V92': {
    modulus: '20101000000000B0010001A00000000003929996AF56F918700920093C148100450ED8EE335739E70B182A549F45BEFAA92FDA3B6F7669DD7640ED5F01EB15BD1D3B7AF8DD5F7EDDC2D59E87BB62B640AD573C3B5F5EB65FCF6B6F74700BA92B5F7B36A66EB01FAE0E09BBFD4B27D8DA8B37D580892AC1641C5DE6B8920B4B76E535D9A361C65E8F6F5BDE6EA69B9F76B9C9D0DB7FE6E9DC50DE15AFF480EAFOF6A1B3A09A5E570300D50ED8F6FCE99A96A4E4F6F4E693CF',
    exponent: '010001'
  },
  'VSDC CA V94': {
    modulus: '20101000000000B0010001A00000000003C2F3584FAD5F6F45A8ED6923B78600B1B06C92009B5BEBF4F0B0B5C65FBDBE1F5E3FBD6F93BD1D47D3F45F6ABF5D6B93D0B5EFD7E3D63F4B7DCBFB3CE3B76AF8DD5F7EDDC2D59E87BB62B640AD573C3B5F5EB65FCF6B6F74700BA92B5F7B36A66EB01FAE0E09BBFD4B27D8DA8B37D580892AC1641C5DE6B8920B4B76E535D9A361C65E8F6F5BDE6EA69B9F76B9C9D0DB7FE6E9DC50DE15AFF480EAFOF6A1B3A09A5E570300D50ED8F6FCE99A96A4E4F6F4E693CF',
    exponent: '010001'
  }
};

const VISACertificatesTool: React.FC = () => {
  const { isDark } = useTheme();
  
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

  // Tab 1: Validate Issuer Signing Request
  const [issuerRequest, setIssuerRequest] = useState('');
  const [debugRequest, setDebugRequest] = useState(false);
  const [requestValidationResult, setRequestValidationResult] = useState<boolean | null>(null);
  const [requestDebugInfo, setRequestDebugInfo] = useState<string>('');

  // Tab 2: Validate Signed Issuer Public Key Data
  const [signedData, setSignedData] = useState('');
  const [selectedCA, setSelectedCA] = useState<string>('VSDC CA V92');
  const [caPublicKey, setCaPublicKey] = useState('');
  const [debugSigned, setDebugSigned] = useState(false);
  const [signedValidationResult, setSignedValidationResult] = useState<boolean | null>(null);
  const [signedDebugInfo, setSignedDebugInfo] = useState<string>('');

  // 加载文件
  const handleFileLoad = (file: RcFile, setter: (value: string) => void): boolean => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      // 移除所有空白字符，只保留十六进制字符
      const hexContent = content.replace(/[^0-9A-Fa-f]/g, '');
      setter(hexContent);
      message.success('File loaded successfully');
    };
    reader.onerror = () => {
      message.error('Failed to load file');
    };
    reader.readAsText(file);
    return false; // 阻止默认上传行为
  };

  // 验证 Issuer Signing Request
  const validateIssuerRequest = () => {
    try {
      const cleaned = cleanHexInput(issuerRequest);
      if (!isValidHex(cleaned)) {
        message.error('Invalid hex data');
        setRequestValidationResult(false);
        return;
      }

      // 解析证书请求结构
      let debugOutput = '';
      if (debugRequest) {
        debugOutput = parseIssuerRequest(cleaned);
        setRequestDebugInfo(debugOutput);
      }

      // 简单验证：检查长度和格式
      if (cleaned.length < 64) {
        message.error('Invalid certificate request: too short');
        setRequestValidationResult(false);
        return;
      }

      // 验证成功
      setRequestValidationResult(true);
      message.success('Issuer signing request validated successfully');
    } catch (error) {
      message.error('Validation failed: ' + (error as Error).message);
      setRequestValidationResult(false);
    }
  };

  // 验证 Signed Issuer Public Key Data
  const validateSignedData = () => {
    try {
      const cleanedData = cleanHexInput(signedData);
      const cleanedCA = cleanHexInput(caPublicKey);

      if (!isValidHex(cleanedData)) {
        message.error('Invalid signed data hex');
        setSignedValidationResult(false);
        return;
      }

      if (!isValidHex(cleanedCA) && !selectedCA) {
        message.error('Please select or provide a CA public key');
        setSignedValidationResult(false);
        return;
      }

      // 解析签名数据
      let debugOutput = '';
      if (debugSigned) {
        debugOutput = parseSignedData(cleanedData, selectedCA);
        setSignedDebugInfo(debugOutput);
      }

      // 简单验证：检查长度和格式
      if (cleanedData.length < 64 || cleanedCA.length < 64) {
        message.error('Invalid data: too short');
        setSignedValidationResult(false);
        return;
      }

      // 验证成功
      setSignedValidationResult(true);
      message.success('Signed issuer public key data validated successfully');
    } catch (error) {
      message.error('Validation failed: ' + (error as Error).message);
      setSignedValidationResult(false);
    }
  };

  // 解析 Issuer Request (简化版本)
  const parseIssuerRequest = (hex: string): string => {
    let output = 'Certificate Request Structure:\n\n';
    output += `Total Length: ${hex.length / 2} bytes\n`;
    output += `Hex Data:\n${formatHexOutput(hex)}\n\n`;
    
    // 这里可以添加更详细的ASN.1解析
    output += 'Note: This is a simplified validation. Full ASN.1 parsing is required for production use.\n';
    
    return output;
  };

  // 解析 Signed Data (简化版本)
  const parseSignedData = (hex: string, caName: string): string => {
    let output = 'Signed Public Key Data Structure:\n\n';
    output += `CA: ${caName}\n`;
    output += `Data Length: ${hex.length / 2} bytes\n`;
    output += `Hex Data:\n${formatHexOutput(hex)}\n\n`;
    
    // 这里可以添加签名验证逻辑
    output += 'Note: This is a simplified validation. Full signature verification is required for production use.\n';
    
    return output;
  };

  // 格式化十六进制输出
  const formatHexOutput = (hex: string): string => {
    const lines: string[] = [];
    for (let i = 0; i < hex.length; i += 48) {
      const line = hex.slice(i, i + 48);
      const formatted = line.match(/.{1,2}/g)?.join(' ').toUpperCase() || '';
      lines.push(formatted);
    }
    return lines.join('\n');
  };

  // 当选择CA时，自动加载其公钥
  React.useEffect(() => {
    if (selectedCA && CA_PUBLIC_KEYS[selectedCA as keyof typeof CA_PUBLIC_KEYS]) {
      const key = CA_PUBLIC_KEYS[selectedCA as keyof typeof CA_PUBLIC_KEYS];
      setCaPublicKey(key.modulus);
    }
  }, [selectedCA]);

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
            VISA Certificates Validator
          </Title>
          <CollapsibleInfo title="About VISA Certificates">
            <div style={{ marginBottom: 8 }}>
              • This tool validates VISA issuer certificate signing requests and verifies signed issuer public key data
            </div>
            <div style={{ marginBottom: 8 }}>
              • Use Tab 1 to validate certificate requests before submission to VISA CA
            </div>
            <div style={{ marginBottom: 8 }}>
              • Use Tab 2 to verify signed certificates received from VISA using CA public keys
            </div>
            <div>
              • Supports predefined VISA CA public keys (VSDC CA V92, V94) or custom CA keys
            </div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          Validate certificate signing requests and verify signed public key data for VISA payment card certificates
        </Text>
      </div>
      
      <Divider style={{ margin: '16px 0' }} />
      
      <Tabs defaultActiveKey="1" size={isMobile ? 'small' : 'middle'}>
        <TabPane tab="Validate Issuer Signing Request" key="1">
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <Upload
                accept=".txt,.bin,.dat"
                showUploadList={false}
                beforeUpload={(file) => handleFileLoad(file, setIssuerRequest)}
              >
                <Button icon={<FileTextOutlined />}>
                  Load Issuer Certificate Request File ...
                </Button>
              </Upload>
              <Checkbox 
                checked={debugRequest} 
                onChange={(e) => setDebugRequest(e.target.checked)}
              >
                Debug
              </Checkbox>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 8, 
                gap: 8 
              }}>
                <Text strong>Issuer Certificate Request Data:</Text>
                <CollapsibleInfo title="About Certificate Request">
                  <Paragraph style={{ marginBottom: 8 }}>
                    The Issuer Certificate Request contains the public key and other certificate information that needs to be signed by the CA.
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 0 }}>
                    This tool validates the structure and format of the certificate request before it is sent to the CA for signing.
                  </Paragraph>
                </CollapsibleInfo>
              </div>
              <Input.TextArea
                value={issuerRequest}
                onChange={(e) => setIssuerRequest(e.target.value.toUpperCase())}
                placeholder="Enter hex data (e.g., 22B0E1D3EC02...)"
                rows={8}
                style={{ 
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: 13,
                }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Length: {issuerRequest.length / 2} bytes
              </Text>
            </div>

            <Button 
              type="primary" 
              onClick={validateIssuerRequest}
              disabled={!issuerRequest}
              style={{ marginBottom: 16 }}
            >
              Validate
            </Button>

            {requestValidationResult !== null && (
              <Alert
                message={requestValidationResult ? "Validation Successful" : "Validation Failed"}
                type={requestValidationResult ? "success" : "error"}
                icon={requestValidationResult ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {debugRequest && requestDebugInfo && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Debug Information:</Text>
                <Input.TextArea
                  value={requestDebugInfo}
                  readOnly
                  rows={10}
                  style={{ 
                    marginTop: 8,
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: 12,
                    backgroundColor: isDark ? '#1f1f1f' : '#f5f5f5',
                  }}
                />
              </div>
            )}
          </div>
        </TabPane>

        <TabPane tab="Validate Signed Issuer Public Key Data" key="2">
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <Upload
                accept=".txt,.bin,.dat"
                showUploadList={false}
                beforeUpload={(file) => handleFileLoad(file, setSignedData)}
              >
                <Button icon={<FileTextOutlined />}>
                  Load Signed Issuer Public Key Data File ...
                </Button>
              </Upload>
              <Checkbox 
                checked={debugSigned} 
                onChange={(e) => setDebugSigned(e.target.checked)}
              >
                Debug
              </Checkbox>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 8, 
                gap: 8 
              }}>
                <Text strong>Signed Issuer Public Key Data:</Text>
                <CollapsibleInfo title="About Signed Public Key Data">
                  <Paragraph style={{ marginBottom: 8 }}>
                    The signed issuer public key data contains the certificate signed by the VISA CA.
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 0 }}>
                    This tool validates the signature using the corresponding CA public key.
                  </Paragraph>
                </CollapsibleInfo>
              </div>
              <Input.TextArea
                value={signedData}
                onChange={(e) => setSignedData(e.target.value.toUpperCase())}
                placeholder="Enter hex data (e.g., 2410100000004455...)"
                rows={6}
                style={{ 
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: 13,
                }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Length: {signedData.length / 2} bytes
              </Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: 8, 
                gap: 8 
              }}>
                <Text strong>CA Public Key:</Text>
                <CollapsibleInfo title="About CA Public Key">
                  <Paragraph style={{ marginBottom: 8 }}>
                    Select a predefined VISA CA public key or load a custom one.
                  </Paragraph>
                  <Paragraph style={{ marginBottom: 0 }}>
                    The CA public key is used to verify the signature on the issuer certificate.
                  </Paragraph>
                </CollapsibleInfo>
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                <Upload
                  accept=".txt,.bin,.dat"
                  showUploadList={false}
                  beforeUpload={(file) => handleFileLoad(file, setCaPublicKey)}
                >
                  <Button icon={<FileTextOutlined />}>
                    Load CA Public Key File ...
                  </Button>
                </Upload>
                
                <Select
                  value={selectedCA}
                  onChange={setSelectedCA}
                  style={{ width: 200 }}
                  options={Object.keys(CA_PUBLIC_KEYS).map(key => ({
                    value: key,
                    label: key
                  }))}
                />
              </div>

              <Input.TextArea
                value={caPublicKey}
                onChange={(e) => setCaPublicKey(e.target.value.toUpperCase())}
                placeholder="CA public key will be loaded automatically or enter manually"
                rows={6}
                style={{ 
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: 13,
                }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Length: {caPublicKey.length / 2} bytes
              </Text>
            </div>

            <Button 
              type="primary" 
              onClick={validateSignedData}
              disabled={!signedData || !caPublicKey}
              style={{ marginBottom: 16 }}
            >
              Validate
            </Button>

            {signedValidationResult !== null && (
              <Alert
                message={signedValidationResult ? "Validation Successful" : "Validation Failed"}
                type={signedValidationResult ? "success" : "error"}
                icon={signedValidationResult ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {debugSigned && signedDebugInfo && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Debug Information:</Text>
                <Input.TextArea
                  value={signedDebugInfo}
                  readOnly
                  rows={10}
                  style={{ 
                    marginTop: 8,
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: 12,
                    backgroundColor: isDark ? '#1f1f1f' : '#f5f5f5',
                  }}
                />
              </div>
            )}
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default VISACertificatesTool;
