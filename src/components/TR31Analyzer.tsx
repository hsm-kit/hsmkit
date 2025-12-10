import React, { useState } from 'react';
import { Card, Button, Divider, Tag, Typography, Input } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const { Title, Text } = Typography;

const TR31Analyzer: React.FC = () => {
  const { t } = useLanguage();
  const [keyBlock, setKeyBlock] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const parseKeyBlock = () => {
    setError('');
    setResult(null);

    const clean = keyBlock.replace(/\s/g, '').toUpperCase();

    if (clean.length < 16) {
      setError(t.tr31.errorTooShort);
      return;
    }

    try {
      const version = clean[0];
      const length = parseInt(clean.substring(1, 5), 10);
      const keyUsage = clean.substring(5, 7);
      const algorithm = clean[7];
      const mode = clean[8];
      const keyVersion = clean.substring(9, 11);
      const exportability = clean[11];

      const keyUsageMap: Record<string, string> = {
        'B0': 'BDK - Base Derivation Key',
        'D0': 'Data Encryption',
        'D1': 'Asymmetric Data',
        'K0': 'KEK - Key Encryption',
        'K1': 'TR-31 KBPK',
        'M0': 'MAC Generation',
        'M1': 'ISO 16609 MAC',
        'P0': 'PIN Encryption',
        'V0': 'PIN Verification (KPV)',
        'V1': 'CVV/CSC Verification',
        'S0': 'Signature Key'
      };

      const algorithmMap: Record<string, string> = {
        'D': 'DES',
        'T': '3DES',
        'A': 'AES',
        'R': 'RSA',
        'E': 'ECC'
      };

      const exportMap: Record<string, string> = {
        'E': t.tr31.exportable,
        'N': t.tr31.nonExportable,
        'S': t.tr31.sensitive
      };

      setResult({
        version: version === 'B' ? 'Version B (Baseline)' : version === 'C' ? 'Version C' : version === 'D' ? 'Version D' : 'Unknown',
        length,
        keyUsage: keyUsageMap[keyUsage] || keyUsage,
        algorithm: algorithmMap[algorithm] || algorithm,
        mode: mode === 'B' ? 'CBC' : mode === 'E' ? 'ECB' : mode,
        keyVersion,
        exportability: exportMap[exportability] || exportability,
        header: clean.substring(0, 16),
        raw: clean
      });
    } catch (err) {
      setError(t.tr31.errorParsing);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
            {t.tr31.title}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.tr31.description}
          </Text>

          <Divider style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.tr31.keyBlock}:
              </Text>
              <Input.TextArea
                value={keyBlock}
                onChange={e => setKeyBlock(e.target.value)}
                placeholder={t.tr31.keyBlockPlaceholder}
                autoSize={{ minRows: 3, maxRows: 6 }}
                style={{ fontFamily: 'monospace', fontSize: '14px' }}
              />
            </div>

            <Button 
              type="primary"
              icon={<SafetyCertificateOutlined />}
              onClick={parseKeyBlock}
              size="large"
              block
            >
              {t.tr31.parseKeyBlock}
            </Button>
          </div>
        </Card>

        {error && (
          <Card bordered={false} style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {result && (
          <Card 
            title={<><SafetyCertificateOutlined /> {t.common.result}</>}
            bordered={false}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {t.tr31.header}
                </Text>
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '16px',
                  color: '#1677ff',
                  background: '#f5f7fa',
                  padding: '8px',
                  borderRadius: '4px',
                  marginTop: '4px',
                  wordBreak: 'break-all'
                }}>
                  {result.header}
                </div>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                      {t.tr31.version}
                    </Text>
                    <Tag color="blue" style={{ marginTop: 4 }}>{result.version}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                      {t.tr31.keyLength}
                    </Text>
                    <Tag color="purple" style={{ marginTop: 4 }}>
                      {result.length} {t.tr31.characters}
                    </Tag>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                      {t.tr31.keyUsage}
                    </Text>
                    <Tag color="green" style={{ marginTop: 4 }}>{result.keyUsage}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                      {t.kcvCalculator.algorithm}
                    </Text>
                    <Tag color="orange" style={{ marginTop: 4 }}>{result.algorithm}</Tag>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                      {t.tr31.mode}
                    </Text>
                    <Tag color="cyan" style={{ marginTop: 4 }}>{result.mode}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                      {t.tr31.keyVersion}
                    </Text>
                    <Tag style={{ marginTop: 4 }}>{result.keyVersion}</Tag>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                      {t.tr31.exportability}
                    </Text>
                    <Tag color="red" style={{ marginTop: 4 }}>{result.exportability}</Tag>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TR31Analyzer;

