import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, Alert, Radio } from 'antd';
import { KeyOutlined, EditOutlined, CheckCircleOutlined, CopyOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ECC 曲线定义
const ECC_CURVES = [
  { label: 'NIST P-256, P-256 (prime256v1)', value: 'P-256', keySize: 32 },
  { label: 'NIST P-384, P-384 (secp384r1)', value: 'P-384', keySize: 48 },
  { label: 'P-521 (secp521r1)', value: 'P-521', keySize: 66 },
];

type ECCCurve = 'P-256' | 'P-384' | 'P-521';
type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const ECCTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Keys Tab 状态
  const [curve, setCurve] = useState<ECCCurve>('P-256');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [publicKeyForm, setPublicKeyForm] = useState('04'); // 04 表示未压缩
  const [generating, setGenerating] = useState(false);
  
  // Sign Tab 状态
  const [signData, setSignData] = useState('');
  const [signInputFormat, setSignInputFormat] = useState<'ASCII' | 'Hex'>('ASCII');
  const [signHash, setSignHash] = useState<HashAlgorithm>('SHA-256');
  const [signature, setSignature] = useState('');
  const [signatureR, setSignatureR] = useState('');
  const [signatureS, setSignatureS] = useState('');
  const [signatureDER, setSignatureDER] = useState('');
  const [messageDigest, setMessageDigest] = useState('');
  const [signDetails, setSignDetails] = useState<{
    dataHex: string;
    dataSize: number;
  } | null>(null);
  
  // Verify Tab 状态
  const [verifyData, setVerifyData] = useState('');
  const [verifyInputFormat, setVerifyInputFormat] = useState<'ASCII' | 'Hex'>('ASCII');
  const [verifyHash, setVerifyHash] = useState<HashAlgorithm>('SHA-256');
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  
  const [error, setError] = useState('');
  const [cryptoKeyPair, setCryptoKeyPair] = useState<CryptoKeyPair | null>(null);

  // 获取曲线的密钥大小
  const getCurveKeySize = (): number => {
    const curveInfo = ECC_CURVES.find(c => c.value === curve);
    return curveInfo?.keySize || 32;
  };

  // ArrayBuffer 转 Hex
  const arrayBufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  };

  // Hex 转 ArrayBuffer
  const hexToArrayBuffer = (hex: string): ArrayBuffer => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  };

  // 清理 Hex 字符串
  const cleanHex = (hex: string): string => {
    return hex.replace(/[\s\n\r]/g, '').toUpperCase();
  };

  // 验证 Hex 格式
  const isValidHex = (hex: string): boolean => {
    return /^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0;
  };

  // Base64URL 解码
  const base64UrlDecode = (str: string): ArrayBuffer => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // 生成 ECC 密钥对
  const generateKeyPair = async () => {
    setGenerating(true);
    setError('');
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDSA',
          namedCurve: curve,
        },
        true,
        ['sign', 'verify']
      );

      setCryptoKeyPair(keyPair);

      // 导出私钥
      const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
      if (privateKeyJwk.d) {
        const dBuffer = base64UrlDecode(privateKeyJwk.d);
        setPrivateKey(arrayBufferToHex(dBuffer));
      }

      // 导出公钥 (未压缩格式: 04 || x || y)
      const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
      if (publicKeyJwk.x && publicKeyJwk.y) {
        const xBuffer = base64UrlDecode(publicKeyJwk.x);
        const yBuffer = base64UrlDecode(publicKeyJwk.y);
        const pubKeyHex = '04' + arrayBufferToHex(xBuffer) + arrayBufferToHex(yBuffer);
        setPublicKey(pubKeyHex);
        setPublicKeyForm('04');
      }

      message.success('ECC key pair generated successfully');
    } catch (err) {
      setError('Key generation failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  // 导入密钥
  const importKeys = async () => {
    setError('');
    
    const cleanPrivKey = cleanHex(privateKey);
    const cleanPubKey = cleanHex(publicKey);
    
    if (!cleanPubKey || !isValidHex(cleanPubKey)) {
      setError('Invalid public key (must be hexadecimal)');
      return;
    }

    try {
      const keySize = getCurveKeySize();
      
      // 解析公钥 (格式: 04 || x || y)
      if (!cleanPubKey.startsWith('04') || cleanPubKey.length !== (keySize * 4 + 2)) {
        setError(`Invalid public key format. Expected ${keySize * 2 + 1} bytes starting with 04`);
        return;
      }

      const xHex = cleanPubKey.substring(2, 2 + keySize * 2);
      const yHex = cleanPubKey.substring(2 + keySize * 2);

      // Base64URL 编码
      const base64UrlEncode = (buffer: ArrayBuffer): string => {
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      };

      // 导入公钥
      const publicKeyJwk: JsonWebKey = {
        kty: 'EC',
        crv: curve,
        x: base64UrlEncode(hexToArrayBuffer(xHex)),
        y: base64UrlEncode(hexToArrayBuffer(yHex)),
        ext: true,
      };

      const importedPublicKey = await window.crypto.subtle.importKey(
        'jwk',
        publicKeyJwk,
        { name: 'ECDSA', namedCurve: curve },
        true,
        ['verify']
      );

      let importedPrivateKey: CryptoKey | null = null;

      // 如果有私钥，也尝试导入
      if (cleanPrivKey && isValidHex(cleanPrivKey)) {
        const privateKeyJwk: JsonWebKey = {
          ...publicKeyJwk,
          d: base64UrlEncode(hexToArrayBuffer(cleanPrivKey)),
        };

        try {
          importedPrivateKey = await window.crypto.subtle.importKey(
            'jwk',
            privateKeyJwk,
            { name: 'ECDSA', namedCurve: curve },
            true,
            ['sign']
          );
        } catch {
          message.warning('Private key import failed, only public key imported');
        }
      }

      setCryptoKeyPair({
        publicKey: importedPublicKey,
        privateKey: importedPrivateKey!,
      });

      message.success('Keys imported successfully');
    } catch (err) {
      setError('Key import failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 清除密钥
  const clearKeys = () => {
    setPrivateKey('');
    setPublicKey('');
    setPublicKeyForm('04');
    setCryptoKeyPair(null);
    setSignData('');
    setSignature('');
    setSignatureR('');
    setSignatureS('');
    setSignatureDER('');
    setMessageDigest('');
    setSignDetails(null);
    setVerifyData('');
    setVerifySignature('');
    setVerifyResult(null);
    setError('');
    message.success('Keys cleared');
  };

  // 将整数转为 DER 格式
  const integerToDER = (hex: string): string => {
    // 去掉前导零
    let h = hex.replace(/^0+/, '') || '0';
    if (h.length % 2 !== 0) h = '0' + h;
    
    // 如果最高位是 1（负数），添加 00 前缀
    if (parseInt(h.substring(0, 2), 16) >= 0x80) {
      h = '00' + h;
    }
    
    const len = h.length / 2;
    return '02' + len.toString(16).padStart(2, '0') + h;
  };

  // 创建 DER 格式签名
  const createDERSignature = (r: string, s: string): string => {
    const rDER = integerToDER(r);
    const sDER = integerToDER(s);
    const content = rDER + sDER;
    const totalLen = content.length / 2;
    return '30' + totalLen.toString(16).padStart(2, '0') + content;
  };

  // 签名
  const handleSign = async () => {
    setError('');
    setSignature('');
    setSignatureR('');
    setSignatureS('');
    setSignatureDER('');
    setMessageDigest('');
    setSignDetails(null);

    if (!cryptoKeyPair?.privateKey) {
      setError('Please generate or import a private key first');
      return;
    }

    if (!signData.trim()) {
      setError('Data is required');
      return;
    }

    let dataBuffer: ArrayBuffer;
    let dataHex: string;
    
    if (signInputFormat === 'ASCII') {
      const encoder = new TextEncoder();
      dataBuffer = encoder.encode(signData).buffer;
      dataHex = arrayBufferToHex(dataBuffer);
    } else {
      const cleanData = cleanHex(signData);
      if (!isValidHex(cleanData)) {
        setError('Invalid data (must be hexadecimal)');
        return;
      }
      dataBuffer = hexToArrayBuffer(cleanData);
      dataHex = cleanData;
    }

    try {
      // 计算消息摘要
      const hashAlgoMap: Record<string, string> = {
        'SHA-1': 'SHA-1',
        'SHA-256': 'SHA-256',
        'SHA-384': 'SHA-384',
        'SHA-512': 'SHA-512',
      };
      const digest = await window.crypto.subtle.digest(hashAlgoMap[signHash], dataBuffer);
      const digestHex = arrayBufferToHex(digest);
      setMessageDigest(digestHex);
      
      // 签名
      const sig = await window.crypto.subtle.sign(
        { name: 'ECDSA', hash: signHash },
        cryptoKeyPair.privateKey,
        dataBuffer
      );

      const sigHex = arrayBufferToHex(sig);
      setSignature(sigHex);

      // 解析 r 和 s (IEEE P1363 格式: r || s)
      const keySize = getCurveKeySize();
      const r = sigHex.substring(0, keySize * 2);
      const s = sigHex.substring(keySize * 2);
      setSignatureR(r);
      setSignatureS(s);
      
      // 创建 DER 格式签名
      const derSig = createDERSignature(r, s);
      setSignatureDER(derSig.toUpperCase());
      
      // 保存签名详情
      setSignDetails({
        dataHex,
        dataSize: dataHex.length / 2,
      });
    } catch (err) {
      setError('Signing failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 解析 DER 格式签名，提取 r 和 s
  const parseDERSignature = (derHex: string): { r: string; s: string } | null => {
    try {
      // DER 格式: 30 <len> 02 <r_len> <r> 02 <s_len> <s>
      if (!derHex.startsWith('30')) {
        return null;
      }
      
      let pos = 2;
      const totalLen = parseInt(derHex.substring(pos, pos + 2), 16);
      pos += 2;
      
      // 检查是否是有效的 DER 格式
      if (derHex.length < (totalLen + 2) * 2) {
        return null;
      }
      
      // 解析 r
      if (derHex.substring(pos, pos + 2) !== '02') {
        return null;
      }
      pos += 2;
      
      const rLen = parseInt(derHex.substring(pos, pos + 2), 16);
      pos += 2;
      
      let r = derHex.substring(pos, pos + rLen * 2);
      pos += rLen * 2;
      
      // DER 编码中，如果整数的最高位是 1，会在前面添加 00 字节
      // 只移除这种情况下的前导 00
      if (r.length > 2 && r.startsWith('00') && parseInt(r.substring(2, 4), 16) >= 0x80) {
        r = r.substring(2);
      }
      
      // 解析 s
      if (derHex.substring(pos, pos + 2) !== '02') {
        return null;
      }
      pos += 2;
      
      const sLen = parseInt(derHex.substring(pos, pos + 2), 16);
      pos += 2;
      
      let s = derHex.substring(pos, pos + sLen * 2);
      
      // 同样处理 s 的前导 00
      if (s.length > 2 && s.startsWith('00') && parseInt(s.substring(2, 4), 16) >= 0x80) {
        s = s.substring(2);
      }
      
      return { r, s };
    } catch {
      return null;
    }
  };

  // 将 r, s 转换为 P1363 格式（固定长度）
  const toP1363Format = (r: string, s: string, keySize: number): string => {
    const hexLen = keySize * 2;
    const rPadded = r.padStart(hexLen, '0');
    const sPadded = s.padStart(hexLen, '0');
    return rPadded + sPadded;
  };

  // 验证签名
  const handleVerify = async () => {
    setError('');
    setVerifyResult(null);

    if (!cryptoKeyPair?.publicKey) {
      setError('Please generate or import a public key first');
      return;
    }

    if (!verifyData.trim()) {
      setError('Data is required');
      return;
    }

    const cleanSig = cleanHex(verifySignature);
    if (!cleanSig || !isValidHex(cleanSig)) {
      setError('Invalid signature (must be hexadecimal)');
      return;
    }

    let dataBuffer: ArrayBuffer;
    if (verifyInputFormat === 'ASCII') {
      const encoder = new TextEncoder();
      dataBuffer = encoder.encode(verifyData).buffer;
    } else {
      const cleanData = cleanHex(verifyData);
      if (!isValidHex(cleanData)) {
        setError('Invalid data (must be hexadecimal)');
        return;
      }
      dataBuffer = hexToArrayBuffer(cleanData);
    }

    try {
      let sigHex = cleanSig;
      const keySize = getCurveKeySize();
      
      // 检测是否是 DER 格式签名，如果是则转换为 P1363 格式
      if (cleanSig.startsWith('30')) {
        const parsed = parseDERSignature(cleanSig);
        if (parsed) {
          sigHex = toP1363Format(parsed.r, parsed.s, keySize);
        }
      }
      
      const sigBuffer = hexToArrayBuffer(sigHex);

      const isValid = await window.crypto.subtle.verify(
        { name: 'ECDSA', hash: verifyHash },
        cryptoKeyPair.publicKey,
        sigBuffer,
        dataBuffer
      );

      setVerifyResult(isValid);
    } catch (err) {
      setError('Verification failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setVerifyResult(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // 获取字节长度
  const getByteLength = (hex: string): number => {
    const clean = cleanHex(hex);
    return isValidHex(clean) ? clean.length / 2 : 0;
  };

  // Tab 内容
  const tabItems = [
    {
      key: 'keys',
      label: (
        <span><KeyOutlined /> Keys</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* ECC Curve 选择 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text strong>ECC curve name:</Text>
            <Select
              value={curve}
              onChange={(value) => setCurve(value)}
              style={{ width: 280 }}
              options={ECC_CURVES}
            />
          </div>

          {/* Private Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Private Key:</Text>
              <Text style={{ fontSize: '12px', color: privateKey ? '#52c41a' : '#999' }}>
                [{getByteLength(privateKey)}]
              </Text>
            </div>
            <TextArea
              value={privateKey}
              onChange={e => setPrivateKey(e.target.value)}
              placeholder="Private key (hexadecimal)"
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Public Key */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Public Key:</Text>
              <Text style={{ fontSize: '12px', color: publicKey ? '#52c41a' : '#999' }}>
                [{getByteLength(publicKey)}]
              </Text>
            </div>
            <TextArea
              value={publicKey}
              onChange={e => setPublicKey(e.target.value)}
              placeholder="Public key (hexadecimal, uncompressed format: 04 || X || Y)"
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Public key form */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text strong>Public key form:</Text>
            <Input
              value={publicKeyForm}
              onChange={e => setPublicKeyForm(e.target.value)}
              style={{ width: 80, fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
            <Text style={{ fontSize: '12px', color: '#52c41a' }}>
              [{publicKeyForm.length}]
            </Text>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={generateKeyPair}
              loading={generating}
              size="large"
            >
              Generate Keys
            </Button>
            <Button 
              icon={<KeyOutlined />}
              onClick={importKeys}
              size="large"
            >
              Import Keys
            </Button>
            <Button 
              danger 
              icon={<ClearOutlined />}
              onClick={clearKeys}
              size="large"
            >
              Clear
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'sign',
      label: (
        <span><EditOutlined /> Sign</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Data 输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Data:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                [{signInputFormat === 'Hex' ? getByteLength(signData) : signData.length}]
              </Text>
            </div>
            <TextArea
              value={signData}
              onChange={e => setSignData(e.target.value)}
              placeholder={signInputFormat === 'ASCII' ? 'Enter text data' : 'Enter hexadecimal data'}
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Input data format */}
          <div style={{ background: isDark ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: isDark ? '1px solid #0f3460' : '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Input data format:</Text>
            <Radio.Group value={signInputFormat} onChange={e => setSignInputFormat(e.target.value)}>
              <Radio value="ASCII">ASCII</Radio>
              <Radio value="Hex">Hexadecimal</Radio>
            </Radio.Group>
          </div>

          {/* Hash Algorithm */}
          <div style={{ background: isDark ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: isDark ? '1px solid #0f3460' : '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Hash Algorithm:</Text>
            <Select
              value={signHash}
              onChange={setSignHash}
              style={{ width: '100%' }}
              options={[
                { label: 'SHA-1', value: 'SHA-1' },
                { label: 'SHA-256', value: 'SHA-256' },
                { label: 'SHA-384', value: 'SHA-384' },
                { label: 'SHA-512', value: 'SHA-512' },
              ]}
            />
          </div>

          {/* 签名按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button type="primary" icon={<EditOutlined />} onClick={handleSign} size="large">
              Sign
            </Button>
          </div>

          {/* 签名结果 */}
          {signature && signDetails && (
            <div style={{ 
              background: isDark 
                ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)', 
              padding: 16, 
              borderRadius: 8, 
              border: isDark ? '1px solid #274916' : '2px solid #95de64',
              boxShadow: isDark 
                ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
                : '0 4px 16px rgba(82, 196, 26, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text strong style={{ color: isDark ? '#95de64' : '#389e0d' }}>✓ ECDSA Signature Result</Text>
                <Button 
                  type={isDark ? 'primary' : 'default'} 
                  size="small" 
                  icon={<CopyOutlined />} 
                  onClick={() => copyToClipboard(signatureDER)}
                  style={{
                    background: isDark ? '#52c41a' : undefined,
                    borderColor: '#52c41a',
                    color: isDark ? '#fff' : '#52c41a',
                  }}
                >
                  Copy DER
                </Button>
              </div>
              
              {/* 签名详情表格 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap', width: '160px' }}>Data:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all', color: isDark ? '#d9d9d9' : undefined }}>{signDetails.dataHex}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>Data size:</td>
                    <td style={{ padding: '4px 0', color: isDark ? '#d9d9d9' : undefined }}>{signDetails.dataSize}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>Hash algorithm:</td>
                    <td style={{ padding: '4px 0', color: isDark ? '#d9d9d9' : undefined }}>{signHash}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>EC Name:</td>
                    <td style={{ padding: '4px 0', color: isDark ? '#d9d9d9' : undefined }}>{ECC_CURVES.find(c => c.value === curve)?.label}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>Public Key:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all', color: isDark ? '#d9d9d9' : undefined }}>{publicKey}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>Key Conversion Form:</td>
                    <td style={{ padding: '4px 0', color: isDark ? '#d9d9d9' : undefined }}>{publicKeyForm}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>Private Key:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all', color: isDark ? '#d9d9d9' : undefined }}>{privateKey}</td>
                  </tr>
                </tbody>
              </table>
              
              {/* 分隔线 */}
              <div style={{ borderTop: isDark ? '1px dashed #3c5a24' : '1px dashed #b7eb8f', margin: '12px 0' }} />
              
              {/* 消息摘要 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap', width: '160px' }}>Message digest:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all', color: isDark ? '#d9d9d9' : undefined }}>{messageDigest}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>Message digest size:</td>
                    <td style={{ padding: '4px 0', color: isDark ? '#d9d9d9' : undefined }}>{messageDigest.length / 2}</td>
                  </tr>
                </tbody>
              </table>
              
              {/* 分隔线 */}
              <div style={{ borderTop: isDark ? '1px dashed #3c5a24' : '1px dashed #b7eb8f', margin: '12px 0' }} />
              
              {/* 签名值 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap', width: '160px' }}>Signature-&gt;r:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all', color: isDark ? '#d9d9d9' : undefined }}>{signatureR}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>Signature-&gt;s:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all', color: isDark ? '#d9d9d9' : undefined }}>{signatureS}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Signature (DER):</td>
                    <td style={{ 
                      padding: '8px 12px',
                      wordBreak: 'break-all',
                      background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
                      color: isDark ? '#95de64' : '#237804',
                      fontWeight: 600,
                      borderRadius: '4px',
                      border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f'
                    }}>
                      {signatureDER}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'verify',
      label: (
        <span><CheckCircleOutlined /> Verify</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Data 输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Data to Verify:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                [{verifyInputFormat === 'Hex' ? getByteLength(verifyData) : verifyData.length}]
              </Text>
            </div>
            <TextArea
              value={verifyData}
              onChange={e => setVerifyData(e.target.value)}
              placeholder={verifyInputFormat === 'ASCII' ? 'Enter text data' : 'Enter hexadecimal data'}
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Input data format */}
          <div style={{ background: isDark ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: isDark ? '1px solid #0f3460' : '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Input data format:</Text>
            <Radio.Group value={verifyInputFormat} onChange={e => setVerifyInputFormat(e.target.value)}>
              <Radio value="ASCII">ASCII</Radio>
              <Radio value="Hex">Hexadecimal</Radio>
            </Radio.Group>
          </div>

          {/* Hash Algorithm */}
          <div style={{ background: isDark ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: isDark ? '1px solid #0f3460' : '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Hash Algorithm:</Text>
            <Select
              value={verifyHash}
              onChange={setVerifyHash}
              style={{ width: '100%' }}
              options={[
                { label: 'SHA-1', value: 'SHA-1' },
                { label: 'SHA-256', value: 'SHA-256' },
                { label: 'SHA-384', value: 'SHA-384' },
                { label: 'SHA-512', value: 'SHA-512' },
              ]}
            />
          </div>

          {/* Signature 输入 */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Signature (Hex):</Text>
            <TextArea
              value={verifySignature}
              onChange={e => setVerifySignature(e.target.value)}
              placeholder="Enter signature in hexadecimal (r || s format)"
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* 验证按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleVerify} size="large">
              Verify
            </Button>
          </div>

          {/* 验证结果 */}
          {verifyResult !== null && (
            <div style={{ 
              background: verifyResult 
                ? 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)' 
                : 'linear-gradient(135deg, #fff2f0 0%, #fff 100%)', 
              padding: 16, 
              borderRadius: 8, 
              border: `1px solid ${verifyResult ? '#b7eb8f' : '#ffccc7'}`,
              boxShadow: `0 2px 8px ${verifyResult ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 77, 79, 0.1)'}`
            }}>
              <Text strong style={{ color: verifyResult ? '#52c41a' : '#ff4d4f', fontSize: '16px' }}>
                {verifyResult 
                  ? '✓ Signature is valid'
                  : '✗ Signature is invalid'
                }
              </Text>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
          ECC (ECDSA)
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          Elliptic Curve Cryptography - Digital Signature Algorithm
        </Text>

        <Divider style={{ margin: '16px 0' }} />

        {/* 错误提示 */}
        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} closable onClose={() => setError('')} />
        )}

        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default ECCTool;

