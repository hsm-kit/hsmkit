import React, { useState } from 'react';
import { Card, Button, Radio, message, Divider, Tag, Typography } from 'antd';
import { KeyOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import CryptoJS from 'crypto-js';
import { useLanguage } from '../hooks/useLanguage';

const { Title, Text } = Typography;

const KeyGenerator: React.FC = () => {
  const { t } = useLanguage();
  const [length, setLength] = useState(16);
  const [generatedKey, setGeneratedKey] = useState('');
  const [checkValue, setCheckValue] = useState('');

  const handleGenerate = () => {
    const randomWord = CryptoJS.lib.WordArray.random(length);
    const keyHex = randomWord.toString().toUpperCase();
    setGeneratedKey(keyHex);

    try {
      const zero = CryptoJS.enc.Hex.parse("0000000000000000");
      const encrypted = CryptoJS.AES.encrypt(zero, randomWord, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.NoPadding
      });
      setCheckValue(encrypted.ciphertext.toString().toUpperCase().substring(0, 6));
    } catch(e) {
      setCheckValue("ERROR");
    }
  };

  const copyToClipboard = () => {
    if(!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    message.success(t.common.copied);
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
            {t.keyGenerator.title}
          </Title>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.keyGenerator.description}
          </Text>
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ width: '100%' }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.keyGenerator.keyLength}:
              </Text>
              <Radio.Group 
                value={length} 
                onChange={e => setLength(e.target.value)} 
                buttonStyle="solid"
                style={{ width: '100%', display: 'block' }}
              >
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <Radio.Button value={8} style={{ 
                    width: 'calc(50% - 4px)',
                    minWidth: 'calc(50% - 4px)',
                    maxWidth: 'calc(50% - 4px)',
                    height: '56px',
                    lineHeight: '18px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}>
                    <div>
                      8 {t.keyGenerator.bytes}<br/>
                      <span style={{ fontSize: '11px' }}>(64-{t.keyGenerator.bits})</span>
                    </div>
                  </Radio.Button>
                  <Radio.Button value={16} style={{ 
                    width: 'calc(50% - 4px)',
                    minWidth: 'calc(50% - 4px)',
                    maxWidth: 'calc(50% - 4px)',
                    height: '56px',
                    lineHeight: '18px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}>
                    <div>
                      16 {t.keyGenerator.bytes}<br/>
                      <span style={{ fontSize: '11px' }}>(128-{t.keyGenerator.bits})</span>
                    </div>
                  </Radio.Button>
                  <Radio.Button value={24} style={{ 
                    width: 'calc(50% - 4px)',
                    minWidth: 'calc(50% - 4px)',
                    maxWidth: 'calc(50% - 4px)',
                    height: '56px',
                    lineHeight: '18px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}>
                    <div>
                      24 {t.keyGenerator.bytes}<br/>
                      <span style={{ fontSize: '11px' }}>(192-{t.keyGenerator.bits})</span>
                    </div>
                  </Radio.Button>
                  <Radio.Button value={32} style={{ 
                    width: 'calc(50% - 4px)',
                    minWidth: 'calc(50% - 4px)',
                    maxWidth: 'calc(50% - 4px)',
                    height: '56px',
                    lineHeight: '18px',
                    textAlign: 'center',
                    boxSizing: 'border-box',
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px'
                  }}>
                    <div>
                      32 {t.keyGenerator.bytes}<br/>
                      <span style={{ fontSize: '11px' }}>(256-{t.keyGenerator.bits})</span>
                    </div>
                  </Radio.Button>
                </div>
              </Radio.Group>
            </div>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleGenerate} 
              size="large"
              block
              style={{ marginTop: '8px' }}
            >
              {t.keyGenerator.generateNow}
            </Button>
          </div>
        </Card>

        {generatedKey && (
          <Card 
            title={<><KeyOutlined /> {t.common.result}</>} 
            bordered={false} 
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.08)', width: '100%' }}
            extra={
              <Button 
                type="text" 
                icon={<CopyOutlined />} 
                onClick={copyToClipboard}
                size="small"
              >
                {t.common.copy}
              </Button>
            }
          >
            <div style={{ background: '#f5f7fa', padding: '16px', borderRadius: '8px', border: '1px solid #e1e4e8' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t.keyGenerator.generatedKey}
              </Text>
              <div style={{ 
                fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace', 
                fontSize: 'clamp(16px, 4vw, 22px)',
                letterSpacing: '1px', 
                color: '#1677ff',
                wordBreak: 'break-all',
                marginTop: '8px',
                lineHeight: '1.6'
              }}>
                {generatedKey.match(/.{1,4}/g)?.join(' ')}
              </div>
              
              <Divider style={{ margin: '12px 0' }} />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Tag color="green">{t.keyGenerator.kcv}: {checkValue}</Tag>
                <Tag color="blue">{t.keyGenerator.length}: {length} {t.keyGenerator.bytes}</Tag>
                <Tag color="purple">{t.keyGenerator.bits}: {length * 8}</Tag>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KeyGenerator;

