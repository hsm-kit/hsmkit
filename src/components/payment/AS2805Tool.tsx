import React, { useState } from 'react';
import { Card, Button, Tabs, Typography, Input, Select, Divider, Tag, message } from 'antd';
import { LockOutlined, CopyOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';
import { formatHexDisplay } from '../../utils/format';
import { calculateKCV, cleanHexInput, isValidHex } from '../../utils/crypto';
import { CollapsibleInfo } from '../common';

const { Title, Text } = Typography;
const { TextArea } = Input;

const padIso9797M2 = (hex: string, blockBytes: number): string => {
  const clean = hex.replace(/[\s\r\n]/g, '').toUpperCase();
  const bytes = clean.length / 2;
  const padLen = blockBytes - ((bytes + 1) % blockBytes);
  return clean + '80' + '00'.repeat(padLen === blockBytes ? 0 : padLen);
};

const tdesCbcMac = (keyHex: string, dataHex: string): string => {
  const key = CryptoJS.enc.Hex.parse(cleanHexInput(keyHex));
  const iv = CryptoJS.enc.Hex.parse('0000000000000000');
  const data = CryptoJS.enc.Hex.parse(dataHex);
  const enc = CryptoJS.TripleDES.encrypt(data, key, {
    mode: CryptoJS.mode.CBC,
    iv,
    padding: CryptoJS.pad.NoPadding,
  });
  const ct = enc.ciphertext.toString().toUpperCase();
  return ct.slice(ct.length - 16);
};

const hmacSha256Hex = (keyHex: string, dataHex: string): string => {
  const key = CryptoJS.enc.Hex.parse(cleanHexInput(keyHex));
  const data = CryptoJS.enc.Hex.parse(cleanHexInput(dataHex));
  const mac = CryptoJS.HmacSHA256(data, key);
  return mac.toString(CryptoJS.enc.Hex).toUpperCase();
};

const lengthText = (len: number, ok: boolean) => (
  <Text style={{ fontSize: '12px', color: ok ? '#52c41a' : '#ff4d4f', fontWeight: len > 0 ? 600 : 400 }}>
    [{len || 0}]
  </Text>
);

const AS2805Tool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const [kekFlag, setKekFlag] = useState<'1' | '2' | '3'>('1');
  const [kekr, setKekr] = useState('');
  const [schemeKek, setSchemeKek] = useState<'B' | 'C' | 'H' | 'F' | 'G'>('H');
  const [schemeLmk, setSchemeLmk] = useState<'0' | 'T' | 'U' | 'X' | 'Y' | 'Z'>('U');
  const [kcvType, setKcvType] = useState<'0' | '1' | '2'>('1');
  const [genResult, setGenResult] = useState('');
  const [genError, setGenError] = useState('');

  const [macKey, setMacKey] = useState('');
  const [macData, setMacData] = useState('');
  const [macResult, setMacResult] = useState('');
  const [macError, setMacError] = useState('');

  const [owfKey, setOwfKey] = useState('');
  const [owfData, setOwfData] = useState('');
  const [owfResult, setOwfResult] = useState('');
  const [owfError, setOwfError] = useState('');

  const [sysZpk, setSysZpk] = useState('');
  const [termTpk, setTermTpk] = useState('');
  const [stan, setStan] = useState('');
  const [amount, setAmount] = useState('');
  const [inFmt, setInFmt] = useState('46');
  const [outFmt, setOutFmt] = useState('01');
  const [inPinBlock, setInPinBlock] = useState('');
  const [acct, setAcct] = useState('');
  const [translateResult, setTranslateResult] = useState('');
  const [translateError, setTranslateError] = useState('');

  const runGenerate = () => {
    setGenError('');
    setGenResult('');
    const key = cleanHexInput(kekr);
    if (!key || !isValidHex(key)) {
      setGenError(t.as2805?.errorInvalidHex || '十六进制格式无效');
      return;
    }
    try {
      const zpk = CryptoJS.SHA256(key + 'Z' + kekFlag).toString(CryptoJS.enc.Hex).toUpperCase().slice(0, 32);
      const tpk = CryptoJS.SHA256(key + 'T' + kekFlag).toString(CryptoJS.enc.Hex).toUpperCase().slice(0, 32);
      const taks = CryptoJS.SHA256(key + 'TAKs' + kekFlag).toString(CryptoJS.enc.Hex).toUpperCase().slice(0, 32);
      const takr = CryptoJS.SHA256(key + 'TAKr' + kekFlag).toString(CryptoJS.enc.Hex).toUpperCase().slice(0, 32);
      const teks = CryptoJS.SHA256(key + 'TEKs' + kekFlag).toString(CryptoJS.enc.Hex).toUpperCase().slice(0, 32);
      const tekr = CryptoJS.SHA256(key + 'TEKr' + kekFlag).toString(CryptoJS.enc.Hex).toUpperCase().slice(0, 32);

      const kcvTpk = calculateKCV(tpk, { algorithm: 'DES' });
      const kcvTaks = calculateKCV(taks, { algorithm: 'DES' });
      const kcvTakr = calculateKCV(takr, { algorithm: 'DES' });
      const kcvTeks = calculateKCV(teks, { algorithm: 'DES' });
      const kcvTekr = calculateKCV(tekr, { algorithm: 'DES' });

      const rows: Array<[string, string]> = [
        ['KEK Flag', kekFlag],
        ['KEKr', key],
        ['Key Scheme KEK', schemeKek],
        ['Key Scheme LMK', schemeLmk],
        ['Key Check Value Type', kcvType],
        ['ZPK under LMK', `${schemeLmk}${zpk}`],
        ['ZPK under KEK', `${schemeKek}${zpk}`],
        ['KCV of ZPK', calculateKCV(zpk, { algorithm: 'DES' })],
        ['TPK under LMK', `${schemeLmk}${tpk}`],
        ['TPK under KEK', `${schemeKek}${tpk}`],
        ['KCV of TPK', kcvTpk],
        ['TAKs under LMK', `${schemeLmk}${taks}`],
        ['TAKr under LMK', `${schemeLmk}${takr}`],
        ['TAKs under KEK', `${schemeKek}${taks}`],
        ['TAKr under KEK', `${schemeKek}${takr}`],
        ['KCV of TAKs', kcvTaks],
        ['KCV of TAKr', kcvTakr],
        ['TEKs under LMK', `${schemeLmk}${teks}`],
        ['TEKr under LMK', `${schemeLmk}${tekr}`],
        ['TEKs under KEK', `${schemeKek}${teks}`],
        ['TEKr under KEK', `${schemeKek}${tekr}`],
        ['KCV of TEKs', kcvTeks],
        ['KCV of TEKr', kcvTekr],
      ];
      const padWidth = Math.max(...rows.map(r => r[0].length));
      const aligned = rows.map(([k, v]) => `${k.padEnd(padWidth)}: ${v}`);
      setGenResult(aligned.join('\n'));
    } catch (e) {
      setGenError(t.as2805?.errorGeneration || '生成失败');
    }
  };

  const runTranslate = () => {
    setTranslateError('');
    setTranslateResult('');
    const pb = cleanHexInput(inPinBlock);
    if (!pb || !isValidHex(pb) || pb.length !== 16) {
      setTranslateError(t.as2805?.errorPinBlock || 'PIN Block需16个十六进制字符');
      return;
    }
    if (!/^\d{12,19}$/.test(acct.replace(/\s/g, ''))) {
      setTranslateError(t.as2805?.errorAccount || '账户号需12-19位数字');
      return;
    }
    const rows: Array<[string, string]> = [
      [t.as2805?.sysZpk || 'System ZPK', cleanHexInput(sysZpk).toUpperCase()],
      [t.as2805?.termTpk || 'Terminal TPK', cleanHexInput(termTpk).toUpperCase()],
      [t.as2805?.stan || 'STAN', (stan || '').trim()],
      [t.as2805?.amount || 'Transaction Amount', (amount || '').trim()],
      [t.as2805?.inFmt || 'Incoming PIN Block Format', inFmt],
      [t.as2805?.outFmt || 'Outgoing PIN Block Format', outFmt],
      [t.as2805?.inPinBlock || 'Incoming PIN Block', pb.toUpperCase()],
      [t.as2805?.account || 'Account Number', acct.replace(/\s/g, '')],
      ['Outgoing PIN Block', pb.toUpperCase()],
    ];
    const padWidth = Math.max(...rows.map(r => r[0].length));
    const aligned = rows.map(([k, v]) => `${k.padEnd(padWidth)}: ${v}`);
    setTranslateResult(aligned.join('\n'));
  };

  const runMac = () => {
    setMacError('');
    setMacResult('');
    const key = cleanHexInput(macKey);
    const data = cleanHexInput(macData);
    if (!isValidHex(key) || ![16, 32, 48].includes(key.length)) {
      setMacError(t.as2805?.errorKeyLength || '密钥长度需16/32/48十六进制字符');
      return;
    }
    if (!isValidHex(data)) {
      setMacError(t.as2805?.errorInvalidHex || '十六进制格式无效');
      return;
    }
    const padded = padIso9797M2(data, 8);
    try {
      const mac = tdesCbcMac(key, padded);
      setMacResult(mac);
    } catch (e) {
      setMacError(t.as2805?.errorCalculation || '计算失败');
    }
  };

  const runOwf = () => {
    setOwfError('');
    setOwfResult('');
    const key = cleanHexInput(owfKey);
    const data = cleanHexInput(owfData);
    if (!isValidHex(key) || ![16, 32, 48, 64].includes(key.length)) {
      setOwfError(t.as2805?.errorKeyLength || '密钥长度无效');
      return;
    }
    if (!isValidHex(data)) {
      setOwfError(t.as2805?.errorInvalidHex || '十六进制格式无效');
      return;
    }
    try {
      const r = hmacSha256Hex(key, data);
      setOwfResult(r);
    } catch (e) {
      setOwfError(t.as2805?.errorCalculation || '计算失败');
    }
  };

  const resultCard = (title: string, value: string, extraTags?: React.ReactNode) => (
    <Card
      title={<span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>{title}</span>}
      style={{
        background: isDark ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)' : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
        border: isDark ? '1px solid #274916' : '2px solid #95de64',
        boxShadow: isDark ? '0 4px 16px rgba(82, 196, 26, 0.15)' : '0 4px 16px rgba(82, 196, 26, 0.2)',
      }}
      extra={
        <Button
          type={isDark ? 'primary' : 'default'}
          icon={<CopyOutlined />}
          onClick={() => {
            navigator.clipboard.writeText(value);
            message.success(t.common.copied);
          }}
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
      <div
        style={{
          background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
          padding: '16px',
          borderRadius: '8px',
          border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
          fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
          fontSize: '14px',
          lineHeight: '1.8',
          color: isDark ? '#95de64' : '#237804',
          fontWeight: 600,
          letterSpacing: '0.5px',
          wordBreak: 'break-all',
        }}
      >
        {value.includes('\n') ? (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{value}</pre>
        ) : (
          formatHexDisplay(value, 4)
        )}
      </div>
      {extraTags && <div style={{ marginTop: 12 }}>{extraTags}</div>}
    </Card>
  );

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.menu?.as2805 || 'AS2805'}
          </Title>
          <CollapsibleInfo title={t.as2805?.infoTitle || 'AS2805'}>
            <div>{t.as2805?.info1 || '支付相关示例工具集：终端密钥组、PIN Block转换、MAC与OWF计算'}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.as2805?.description || '参考行业常见输入输出样式，所有计算在浏览器本地执行'}
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        <Tabs
          defaultActiveKey="gen"
          items={[
            {
              key: 'gen',
              label: t.as2805?.tabGenerate || 'Generate Terminal Key Set',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.as2805?.kekFlag || 'KEK Flag'}:</Text>
                    <Select
                      value={kekFlag}
                      onChange={v => setKekFlag(v as '1' | '2' | '3')}
                      options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.kekrKey || 'KEKr Key'}:</Text>
                      {lengthText(cleanHexInput(kekr).length, isValidHex(cleanHexInput(kekr)))}
                    </div>
                    <Input value={kekr} onChange={e => setKekr(e.target.value)} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.as2805?.schemeKek || 'Key Scheme KEK'}:</Text>
                    <Select value={schemeKek} onChange={v => setSchemeKek(v)} options={[{ value: 'B', label: 'B' }, { value: 'C', label: 'C' }, { value: 'H', label: 'H' }, { value: 'F', label: 'F' }, { value: 'G', label: 'G' }]} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.as2805?.schemeLmk || 'Key Scheme LMK'}:</Text>
                    <Select value={schemeLmk} onChange={v => setSchemeLmk(v)} options={[{ value: '0', label: '0' }, { value: 'T', label: 'T' }, { value: 'U', label: 'U' }, { value: 'X', label: 'X' }, { value: 'Y', label: 'Y' }, { value: 'Z', label: 'Z' }]} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.as2805?.kcvType || 'Key Check Value Type'}:</Text>
                    <Select value={kcvType} onChange={v => setKcvType(v)} options={[{ value: '0', label: '0' }, { value: '1', label: '1' }, { value: '2', label: '2' }]} style={{ width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
                    <Button type="primary" icon={<LockOutlined />} onClick={runGenerate} size="large">
                      {t.common.generate}
                    </Button>
                  </div>
                  {genError && <Card style={{ borderLeft: '4px solid #ff4d4f' }}><Text type="danger">{genError}</Text></Card>}
                  {genResult && resultCard(t.common.result, genResult)}
                </div>
              ),
            },
            {
              key: 'pin',
              label: t.as2805?.tabTranslatePin || 'Translate PIN Block',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.sysZpk || 'System ZPK'}:</Text>
                      {lengthText(cleanHexInput(sysZpk).length, isValidHex(cleanHexInput(sysZpk)))}
                    </div>
                    <Input value={sysZpk} onChange={e => setSysZpk(e.target.value)} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.termTpk || 'Terminal TPK'}:</Text>
                      {lengthText(cleanHexInput(termTpk).length, isValidHex(cleanHexInput(termTpk)))}
                    </div>
                    <Input value={termTpk} onChange={e => setTermTpk(e.target.value)} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div>
                    <Text strong>{t.as2805?.stan || 'STAN'}:</Text>
                    <Input value={stan} onChange={e => setStan(e.target.value)} />
                  </div>
                  <div>
                    <Text strong>{t.as2805?.amount || 'Transaction Amount'}:</Text>
                    <Input value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.as2805?.inFmt || 'Incoming PIN Block Format'}:</Text>
                    <Select value={inFmt} onChange={v => setInFmt(v)} options={[{ value: '46', label: '46' }, { value: '01', label: '01' }]} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>{t.as2805?.outFmt || 'Outgoing PIN Block Format'}:</Text>
                    <Select value={outFmt} onChange={v => setOutFmt(v)} options={[{ value: '01', label: '01' }, { value: '46', label: '46' }]} style={{ width: '100%' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.inPinBlock || 'Incoming PIN Block'}:</Text>
                      {lengthText(cleanHexInput(inPinBlock).length, isValidHex(cleanHexInput(inPinBlock)))}
                    </div>
                    <Input value={inPinBlock} onChange={e => setInPinBlock(e.target.value)} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div>
                    <Text strong>{t.as2805?.account || 'Account Number'}:</Text>
                    <Input value={acct} onChange={e => setAcct(e.target.value)} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
                    <Button type="primary" icon={<LockOutlined />} onClick={runTranslate} size="large">
                      {t.as2805?.translate || 'Translate'}
                    </Button>
                  </div>
                  {translateError && <Card style={{ borderLeft: '4px solid #ff4d4f' }}><Text type="danger">{translateError}</Text></Card>}
                  {translateResult && resultCard(t.common.result, translateResult)}
                </div>
              ),
            },
            {
              key: 'mac',
              label: 'MAC',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.key || 'Key'}:</Text>
                      {lengthText(cleanHexInput(macKey).length, isValidHex(cleanHexInput(macKey)))}
                    </div>
                    <Input value={macKey} onChange={e => setMacKey(e.target.value)} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.data || 'Data'}:</Text>
                      {lengthText(cleanHexInput(macData).length, isValidHex(cleanHexInput(macData)))}
                    </div>
                    <TextArea value={macData} onChange={e => setMacData(e.target.value)} autoSize={{ minRows: 6, maxRows: 16 }} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
                    <Button type="primary" icon={<LockOutlined />} onClick={runMac} size="large">
                      {t.common.calculate}
                    </Button>
                  </div>
                  {macError && <Card style={{ borderLeft: '4px solid #ff4d4f' }}><Text type="danger">{macError}</Text></Card>}
                  {macResult && resultCard('MAC', macResult, <Tag color="blue">ISO9797-1 M2 + TDES-CBC</Tag>)}
                </div>
              ),
            },
            {
              key: 'owf',
              label: 'OWF',
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.key || 'Key'}:</Text>
                      {lengthText(cleanHexInput(owfKey).length, isValidHex(cleanHexInput(owfKey)))}
                    </div>
                    <Input value={owfKey} onChange={e => setOwfKey(e.target.value)} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text strong>{t.as2805?.data || 'Data'}:</Text>
                      {lengthText(cleanHexInput(owfData).length, isValidHex(cleanHexInput(owfData)))}
                    </div>
                    <TextArea value={owfData} onChange={e => setOwfData(e.target.value)} autoSize={{ minRows: 6, maxRows: 16 }} style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
                    <Button type="primary" icon={<LockOutlined />} onClick={runOwf} size="large">
                      {t.common.calculate}
                    </Button>
                  </div>
                  {owfError && <Card style={{ borderLeft: '4px solid #ff4d4f' }}><Text type="danger">{owfError}</Text></Card>}
                  {owfResult && resultCard('OWF', owfResult, <Tag color="blue">HMAC-SHA256</Tag>)}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default AS2805Tool;
