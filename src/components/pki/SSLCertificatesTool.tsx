import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Select, InputNumber, Alert, Spin } from 'antd';
import { KeyOutlined, FileTextOutlined, SafetyCertificateOutlined, CopyOutlined, ClearOutlined, LockOutlined, SearchOutlined, CheckOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import * as forge from 'node-forge';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 工具函数
const getByteLength = (hex: string): number => {
  const clean = hex.replace(/[\s\n\r]/g, '').replace(/[^0-9A-Fa-f]/g, '');
  return clean.length / 2;
};

// 样式函数
const getResultContainerStyle = (isDark: boolean): React.CSSProperties => ({
  background: isDark 
    ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
    : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
  border: isDark ? '1px solid #274916' : '2px solid #95de64',
  borderRadius: '8px',
  padding: '16px',
  boxShadow: isDark 
    ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
    : '0 4px 16px rgba(82, 196, 26, 0.2)',
});

const getResultTextStyle = (isDark: boolean): React.CSSProperties => ({
  background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
  borderRadius: '8px',
  border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
  color: isDark ? '#95de64' : '#237804',
});

// Copy All 按钮组件
const CopyAllButton: React.FC<{
  isDark: boolean;
  t: Record<string, unknown>;
  onCopy: () => void;
}> = ({ isDark, t, onCopy }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      type={isDark ? 'primary' : 'default'}
      icon={copied ? <CheckOutlined /> : <CopyOutlined />}
      onClick={handleCopy}
      size="small"
      style={{
        background: isDark ? '#52c41a' : undefined,
        borderColor: '#52c41a',
        color: isDark ? '#fff' : '#52c41a',
      }}
    >
      {copied ? ((t.common as Record<string, string>)?.copied || 'Copied!') : ((t.common as Record<string, string>)?.copyAll || 'Copy All')}
    </Button>
  );
};

// 密钥结果块组件
const KeyResultBlock: React.FC<{
  label?: string;
  value: string;
  isDark: boolean;
  t: Record<string, unknown>;
  onCopy: () => void;
  color?: 'green' | 'blue';
  style?: React.CSSProperties;
}> = ({ label, value, isDark, t, onCopy, color = 'green', style }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textColor = color === 'green' 
    ? (isDark ? '#95de64' : '#237804')
    : (isDark ? '#69b1ff' : '#1677ff');

  return (
    <div style={style}>
      <div style={{ 
        display: 'flex', 
        justifyContent: label ? 'space-between' : 'flex-end', 
        alignItems: 'center', 
        marginBottom: 8 
      }}>
        {label && (
          <Text strong style={{ color: isDark ? '#8c8c8c' : '#595959', fontSize: 13 }}>
            {label}
          </Text>
        )}
        <Button
          type={isDark ? 'primary' : 'default'}
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          size="small"
          style={{
            background: isDark ? '#52c41a' : undefined,
            borderColor: '#52c41a',
            color: isDark ? '#fff' : '#52c41a',
          }}
        >
          {copied ? ((t.common as Record<string, string>)?.copied || 'Copied!') : ((t.common as Record<string, string>)?.copy || 'Copy')}
        </Button>
      </div>
      <div style={{
        background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
        padding: 12,
        borderRadius: 6,
        border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
        fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
        fontSize: 12,
        lineHeight: 1.6,
        color: textColor,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        maxHeight: 300,
        overflow: 'auto',
      }}>
        {value}
      </div>
    </div>
  );
};

const SSLCertificatesTool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  
  // Keys Tab 状态
  const [publicExponent, setPublicExponent] = useState('010001');
  const [keyLength, setKeyLength] = useState<number>(2048);
  const [keysPassPhrase, setKeysPassPhrase] = useState('');
  const [generatedPrivateKey, setGeneratedPrivateKey] = useState('');
  const [generatedPublicKey, setGeneratedPublicKey] = useState('');
  const [generatingKeys, setGeneratingKeys] = useState(false);
  
  // CSRs Tab 状态
  const [csrPrivateKey, setCsrPrivateKey] = useState('');
  const [csrVersion, setCsrVersion] = useState<number>(2);
  const [csrCountry, setCsrCountry] = useState('AU');
  const [csrState, setCsrState] = useState('Queensland');
  const [csrLocality, setCsrLocality] = useState('Brisbane');
  const [csrOrganization, setCsrOrganization] = useState('');
  const [csrUnit, setCsrUnit] = useState('');
  const [csrCommonName, setCsrCommonName] = useState('');
  const [csrEmail, setCsrEmail] = useState('');
  const [csrPassPhrase, setCsrPassPhrase] = useState('');
  const [generatedCSR, setGeneratedCSR] = useState('');
  const [generatingCSR, setGeneratingCSR] = useState(false);
  
  // Read CSR Tab 状态
  const [inputCSR, setInputCSR] = useState('');
  const [parsedCSRInfo, setParsedCSRInfo] = useState<{
    version: number;
    subject: Record<string, string>;
    subjectString: string;
    publicKey: string;
    publicKeyAlgorithm: string;
    keySize: number;
    modulus: string;
    exponent: string;
    signatureAlgorithm: string;
  } | null>(null);
  
  // Self-signed Certificate Tab 状态
  const [certPrivateKey, setCertPrivateKey] = useState('');
  const [certVersion, setCertVersion] = useState<number>(3);
  const [certValidityBefore, setCertValidityBefore] = useState<number>(0);
  const [certValidityAfter, setCertValidityAfter] = useState<number>(365);
  const [certSerialNumber, setCertSerialNumber] = useState('42');
  const [certCountry, setCertCountry] = useState('AU');
  const [certState, setCertState] = useState('Queensland');
  const [certLocality, setCertLocality] = useState('Brisbane');
  const [certOrganization, setCertOrganization] = useState('');
  const [certUnit, setCertUnit] = useState('');
  const [certCommonName, setCertCommonName] = useState('');
  const [certEmail, setCertEmail] = useState('');
  const [certPassPhrase, setCertPassPhrase] = useState('');
  const [generatedCert, setGeneratedCert] = useState('');
  const [generatingCert, setGeneratingCert] = useState(false);
  
  // Read Certificate Tab 状态
  const [inputCert, setInputCert] = useState('');
  const [parsedCertInfo, setParsedCertInfo] = useState<{
    version: number;
    serialNumber: string;
    serialNumberHex: string;
    signatureAlgorithm: string;
    issuer: Record<string, string>;
    issuerString: string;
    subject: Record<string, string>;
    subjectString: string;
    validFrom: string;
    validTo: string;
    publicKeyAlgorithm: string;
    keySize: number;
    modulus: string;
    exponent: string;
    publicKey: string;
    extensions: Array<{
      name: string;
      value: string;
      critical?: boolean;
    }>;
    signature: string;
  } | null>(null);
  
  const [error, setError] = useState('');

  // 生成 RSA 密钥对
  const generateKeyPair = async () => {
    setGeneratingKeys(true);
    setError('');
    setGeneratedPrivateKey('');
    setGeneratedPublicKey('');
    
    try {
      if (!keysPassPhrase) {
        setError(t.sslCert?.errorPassPhraseRequired || 'Pass phrase is required');
        setGeneratingKeys(false);
        return;
      }

      // 解析公钥指数
      const e = parseInt(publicExponent, 16);
      
      // 生成密钥对
      const keypair = forge.pki.rsa.generateKeyPair({ bits: keyLength, e });
      
      // 使用 PKCS#8 格式加密私钥
      const privateKeyAsn1 = forge.pki.privateKeyToAsn1(keypair.privateKey);
      const privateKeyInfo = forge.pki.wrapRsaPrivateKey(privateKeyAsn1);
      const encryptedPrivateKeyInfo = forge.pki.encryptPrivateKeyInfo(privateKeyInfo, keysPassPhrase, {
        algorithm: '3des'
      });
      const encryptedPem = forge.pki.encryptedPrivateKeyToPem(encryptedPrivateKeyInfo);
      
      // 公钥 PEM
      const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
      
      setGeneratedPrivateKey(encryptedPem);
      setGeneratedPublicKey(publicKeyPem);
      message.success(t.sslCert?.keyGenerated || 'Key pair generated successfully');
    } catch (err) {
      setError((t.sslCert?.errorKeyGen || 'Key generation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setGeneratingKeys(false);
    }
  };

  // 生成 CSR
  const generateCSR = async () => {
    setGeneratingCSR(true);
    setError('');
    setGeneratedCSR('');
    
    try {
      if (!csrPrivateKey) {
        setError(t.sslCert?.errorPrivateKeyRequired || 'Private key is required');
        setGeneratingCSR(false);
        return;
      }
      if (!csrPassPhrase) {
        setError(t.sslCert?.errorPassPhraseRequired || 'Pass phrase is required');
        setGeneratingCSR(false);
        return;
      }
      if (!csrCommonName) {
        setError(t.sslCert?.errorCommonNameRequired || 'Common Name is required');
        setGeneratingCSR(false);
        return;
      }

      // 解密私钥
      let privateKey;
      try {
        privateKey = forge.pki.decryptRsaPrivateKey(csrPrivateKey, csrPassPhrase);
        if (!privateKey) {
          throw new Error('Invalid pass phrase or key format');
        }
      } catch {
        setError(t.sslCert?.errorInvalidPrivateKey || 'Invalid private key or pass phrase');
        setGeneratingCSR(false);
        return;
      }

      // 创建 CSR
      const csr = forge.pki.createCertificationRequest();
      csr.publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);
      
      // 设置主体属性
      const attrs: forge.pki.CertificateField[] = [];
      if (csrCountry) attrs.push({ shortName: 'C', value: csrCountry });
      if (csrState) attrs.push({ shortName: 'ST', value: csrState });
      if (csrLocality) attrs.push({ shortName: 'L', value: csrLocality });
      if (csrOrganization) attrs.push({ shortName: 'O', value: csrOrganization });
      if (csrUnit) attrs.push({ shortName: 'OU', value: csrUnit });
      if (csrCommonName) attrs.push({ shortName: 'CN', value: csrCommonName });
      if (csrEmail) attrs.push({ shortName: 'E', value: csrEmail });
      
      csr.setSubject(attrs);
      
      // 签名 CSR
      csr.sign(privateKey, forge.md.sha256.create());
      
      // 转换为 PEM 格式
      const csrPem = forge.pki.certificationRequestToPem(csr);
      
      setGeneratedCSR(csrPem);
      message.success(t.sslCert?.csrGenerated || 'CSR generated successfully');
    } catch (err) {
      setError((t.sslCert?.errorCSRGen || 'CSR generation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setGeneratingCSR(false);
    }
  };

  // 解析 CSR
  const parseCSR = () => {
    setError('');
    setParsedCSRInfo(null);
    
    try {
      if (!inputCSR.trim()) {
        setError(t.sslCert?.errorCSRRequired || 'CSR is required');
        return;
      }

      const csr = forge.pki.certificationRequestFromPem(inputCSR);
      
      // 提取主体信息
      const subject: Record<string, string> = {};
      const subjectParts: string[] = [];
      csr.subject.attributes.forEach((attr) => {
        const name = attr.shortName || attr.name || 'Unknown';
        subject[name] = attr.value as string;
        subjectParts.push(`${name}=${attr.value}`);
      });
      
      // 提取公钥信息
      if (!csr.publicKey) {
        setError(t.sslCert?.errorCSRParse || 'Failed to parse CSR: no public key');
        return;
      }
      const publicKeyPem = forge.pki.publicKeyToPem(csr.publicKey);
      const rsaPublicKey = csr.publicKey as forge.pki.rsa.PublicKey;
      
      // 获取 modulus（十六进制格式，带冒号分隔）
      const modulusHex = rsaPublicKey.n.toString(16);
      const modulusFormatted = modulusHex.match(/.{1,2}/g)?.join(':') || modulusHex;
      
      // 获取 exponent
      const exponentDec = rsaPublicKey.e.toString(10);
      const exponentHex = rsaPublicKey.e.toString(16);
      
      // 获取 key size
      const keySize = rsaPublicKey.n.bitLength();
      
      // 获取签名算法 OID 并转换为名称
      const signatureOid = (csr as unknown as { signatureOid: string }).signatureOid || '';
      const signatureAlgorithmMap: Record<string, string> = {
        '1.2.840.113549.1.1.4': 'md5WithRSAEncryption',
        '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
        '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
        '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
        '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
      };
      const signatureAlgorithm = signatureAlgorithmMap[signatureOid] || signatureOid || 'Unknown';
      
      setParsedCSRInfo({
        version: (csr as unknown as { version: number }).version + 1,
        subject,
        subjectString: subjectParts.join(', '),
        publicKey: publicKeyPem,
        publicKeyAlgorithm: 'rsaEncryption',
        keySize,
        modulus: modulusFormatted,
        exponent: `${exponentDec} (0x${exponentHex})`,
        signatureAlgorithm
      });
      
      message.success(t.sslCert?.csrParsed || 'CSR parsed successfully');
    } catch (err) {
      setError((t.sslCert?.errorCSRParse || 'CSR parsing failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 生成自签名证书
  const generateSelfSignedCert = async () => {
    setGeneratingCert(true);
    setError('');
    setGeneratedCert('');
    
    try {
      if (!certPrivateKey) {
        setError(t.sslCert?.errorPrivateKeyRequired || 'Private key is required');
        setGeneratingCert(false);
        return;
      }
      if (!certPassPhrase) {
        setError(t.sslCert?.errorPassPhraseRequired || 'Pass phrase is required');
        setGeneratingCert(false);
        return;
      }
      if (!certCommonName) {
        setError(t.sslCert?.errorCommonNameRequired || 'Common Name is required');
        setGeneratingCert(false);
        return;
      }

      // 解密私钥
      let privateKey;
      try {
        privateKey = forge.pki.decryptRsaPrivateKey(certPrivateKey, certPassPhrase);
        if (!privateKey) {
          throw new Error('Invalid pass phrase or key format');
        }
      } catch {
        setError(t.sslCert?.errorInvalidPrivateKey || 'Invalid private key or pass phrase');
        setGeneratingCert(false);
        return;
      }

      // 创建证书
      const cert = forge.pki.createCertificate();
      cert.publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e);
      cert.serialNumber = certSerialNumber;
      
      // 设置有效期
      const now = new Date();
      const notBefore = new Date(now);
      notBefore.setDate(notBefore.getDate() - certValidityBefore);
      const notAfter = new Date(now);
      notAfter.setDate(notAfter.getDate() + certValidityAfter);
      
      cert.validity.notBefore = notBefore;
      cert.validity.notAfter = notAfter;
      
      // 设置主体和颁发者属性（自签名，所以相同）
      const attrs: forge.pki.CertificateField[] = [];
      if (certCountry) attrs.push({ shortName: 'C', value: certCountry });
      if (certState) attrs.push({ shortName: 'ST', value: certState });
      if (certLocality) attrs.push({ shortName: 'L', value: certLocality });
      if (certOrganization) attrs.push({ shortName: 'O', value: certOrganization });
      if (certUnit) attrs.push({ shortName: 'OU', value: certUnit });
      if (certCommonName) attrs.push({ shortName: 'CN', value: certCommonName });
      if (certEmail) attrs.push({ shortName: 'E', value: certEmail });
      
      cert.setSubject(attrs);
      cert.setIssuer(attrs);
      
      // 添加扩展
      cert.setExtensions([
        {
          name: 'basicConstraints',
          cA: true
        },
        {
          name: 'keyUsage',
          keyCertSign: true,
          digitalSignature: true,
          keyEncipherment: true
        },
        {
          name: 'subjectAltName',
          altNames: [
            { type: 2, value: certCommonName } // DNS name
          ]
        }
      ]);
      
      // 签名证书
      cert.sign(privateKey, forge.md.sha256.create());
      
      // 转换为 PEM 格式
      const certPem = forge.pki.certificateToPem(cert);
      
      setGeneratedCert(certPem);
      message.success(t.sslCert?.certGenerated || 'Certificate generated successfully');
    } catch (err) {
      setError((t.sslCert?.errorCertGen || 'Certificate generation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setGeneratingCert(false);
    }
  };

  // 解析证书
  const parseCertificate = () => {
    setError('');
    setParsedCertInfo(null);
    
    try {
      if (!inputCert.trim()) {
        setError(t.sslCert?.errorCertRequired || 'Certificate is required');
        return;
      }

      const cert = forge.pki.certificateFromPem(inputCert);
      
      // 提取主体信息
      const subject: Record<string, string> = {};
      const subjectParts: string[] = [];
      cert.subject.attributes.forEach((attr) => {
        const name = attr.shortName || attr.name || 'Unknown';
        subject[name] = attr.value as string;
        subjectParts.push(`${name}=${attr.value}`);
      });
      
      // 提取颁发者信息
      const issuer: Record<string, string> = {};
      const issuerParts: string[] = [];
      cert.issuer.attributes.forEach((attr) => {
        const name = attr.shortName || attr.name || 'Unknown';
        issuer[name] = attr.value as string;
        issuerParts.push(`${name}=${attr.value}`);
      });
      
      // 提取公钥信息
      if (!cert.publicKey) {
        setError(t.sslCert?.errorCertParse || 'Failed to parse certificate: no public key');
        return;
      }
      const publicKeyPem = forge.pki.publicKeyToPem(cert.publicKey);
      const rsaPublicKey = cert.publicKey as forge.pki.rsa.PublicKey;
      
      // 获取 modulus（十六进制格式，带冒号分隔，每行格式化）
      const modulusHex = rsaPublicKey.n.toString(16);
      // 确保偶数长度
      const paddedModulus = modulusHex.length % 2 === 0 ? modulusHex : '0' + modulusHex;
      const modulusPairs = paddedModulus.match(/.{1,2}/g) || [];
      // 格式化为每行20字节，带缩进
      const modulusLines: string[] = [];
      for (let i = 0; i < modulusPairs.length; i += 15) {
        modulusLines.push(modulusPairs.slice(i, i + 15).join(':'));
      }
      const modulusFormatted = modulusLines.join('\n                    ');
      
      // 获取 exponent
      const exponentDec = rsaPublicKey.e.toString(10);
      const exponentHex = rsaPublicKey.e.toString(16);
      
      // 获取 key size
      const keySize = rsaPublicKey.n.bitLength();
      
      // 获取签名算法 OID 并转换为名称
      const signatureOid = (cert as unknown as { signatureOid: string }).signatureOid || '';
      const signatureAlgorithmMap: Record<string, string> = {
        '1.2.840.113549.1.1.4': 'md5WithRSAEncryption',
        '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
        '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
        '1.2.840.113549.1.1.12': 'sha384WithRSAEncryption',
        '1.2.840.113549.1.1.13': 'sha512WithRSAEncryption',
        '1.2.840.113549.1.1.14': 'sha224WithRSAEncryption',
        '1.2.840.10045.4.1': 'ecdsa-with-SHA1',
        '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
        '1.2.840.10045.4.3.3': 'ecdsa-with-SHA384',
        '1.2.840.10045.4.3.4': 'ecdsa-with-SHA512',
      };
      const signatureAlgorithm = signatureAlgorithmMap[signatureOid] || signatureOid || 'Unknown';
      
      // 提取扩展信息（详细）
      const extensions: Array<{ name: string; value: string; critical?: boolean }> = [];
      if (cert.extensions) {
        cert.extensions.forEach((ext: forge.pki.Certificate['extensions'][number]) => {
          const extName = ext.name || ext.id || 'Unknown extension';
          let extValue = '';
          
          // 根据扩展类型提取值
          if (ext.name === 'subjectAltName' && (ext as { altNames?: Array<{ type: number; value: string }> }).altNames) {
            const altNames = (ext as { altNames: Array<{ type: number; value: string }> }).altNames;
            const altNameParts: string[] = [];
            altNames.forEach(an => {
              if (an.type === 2) { // DNS
                altNameParts.push(`DNS:${an.value}`);
              } else if (an.type === 7) { // IP
                altNameParts.push(`IP:${an.value}`);
              } else if (an.type === 1) { // Email
                altNameParts.push(`email:${an.value}`);
              } else if (an.type === 6) { // URI
                altNameParts.push(`URI:${an.value}`);
              } else {
                altNameParts.push(an.value);
              }
            });
            extValue = altNameParts.join(', ');
          } else if (ext.name === 'basicConstraints') {
            const bc = ext as { cA?: boolean; pathLenConstraint?: number };
            extValue = `CA:${bc.cA ? 'TRUE' : 'FALSE'}`;
            if (bc.pathLenConstraint !== undefined) {
              extValue += `, pathlen:${bc.pathLenConstraint}`;
            }
          } else if (ext.name === 'keyUsage') {
            const ku = ext as { 
              digitalSignature?: boolean;
              nonRepudiation?: boolean;
              keyEncipherment?: boolean;
              dataEncipherment?: boolean;
              keyAgreement?: boolean;
              keyCertSign?: boolean;
              cRLSign?: boolean;
              encipherOnly?: boolean;
              decipherOnly?: boolean;
            };
            const usages: string[] = [];
            if (ku.digitalSignature) usages.push('Digital Signature');
            if (ku.nonRepudiation) usages.push('Non Repudiation');
            if (ku.keyEncipherment) usages.push('Key Encipherment');
            if (ku.dataEncipherment) usages.push('Data Encipherment');
            if (ku.keyAgreement) usages.push('Key Agreement');
            if (ku.keyCertSign) usages.push('Certificate Sign');
            if (ku.cRLSign) usages.push('CRL Sign');
            if (ku.encipherOnly) usages.push('Encipher Only');
            if (ku.decipherOnly) usages.push('Decipher Only');
            extValue = usages.join(', ');
          } else if (ext.name === 'extKeyUsage') {
            const eku = ext as {
              serverAuth?: boolean;
              clientAuth?: boolean;
              codeSigning?: boolean;
              emailProtection?: boolean;
              timeStamping?: boolean;
            };
            const usages: string[] = [];
            if (eku.serverAuth) usages.push('TLS Web Server Authentication');
            if (eku.clientAuth) usages.push('TLS Web Client Authentication');
            if (eku.codeSigning) usages.push('Code Signing');
            if (eku.emailProtection) usages.push('E-mail Protection');
            if (eku.timeStamping) usages.push('Time Stamping');
            extValue = usages.join(', ');
          } else if (ext.name === 'nsCertType') {
            const nsType = ext as {
              client?: boolean;
              server?: boolean;
              email?: boolean;
              objsign?: boolean;
              sslCA?: boolean;
              emailCA?: boolean;
              objCA?: boolean;
            };
            const types: string[] = [];
            if (nsType.client) types.push('SSL Client');
            if (nsType.server) types.push('SSL Server');
            if (nsType.email) types.push('S/MIME');
            if (nsType.objsign) types.push('Object Signing');
            if (nsType.sslCA) types.push('SSL CA');
            if (nsType.emailCA) types.push('S/MIME CA');
            if (nsType.objCA) types.push('Object Signing CA');
            extValue = types.join(', ');
          } else if (ext.name === 'subjectKeyIdentifier') {
            // Subject Key Identifier - 二进制数据转换为十六进制
            const ski = ext as { subjectKeyIdentifier?: string; value?: string };
            const skiValue = ski.subjectKeyIdentifier || ski.value;
            if (skiValue) {
              // 检查是否已经是十六进制字符串（只包含hex字符）
              const isHexString = /^[0-9a-fA-F]+$/.test(skiValue);
              let hexStr: string;
              if (isHexString) {
                hexStr = skiValue;
              } else {
                // 二进制数据，需要转换
                hexStr = forge.util.bytesToHex(skiValue);
              }
              extValue = hexStr.match(/.{1,2}/g)?.join(':').toUpperCase() || hexStr;
            }
          } else if (ext.name === 'authorityKeyIdentifier') {
            // Authority Key Identifier - 二进制数据转换为十六进制
            const aki = ext as { 
              keyIdentifier?: string;
              authorityCertIssuer?: Array<{ type: number; value: string }>;
              serialNumber?: string;
              value?: string;
            };
            const parts: string[] = [];
            // keyIdentifier 可能存储在 keyIdentifier 属性或需要从 value 解析
            let keyId = aki.keyIdentifier;
            if (keyId) {
              // 检查是否已经是十六进制字符串
              const isHexString = /^[0-9a-fA-F]+$/.test(keyId);
              let hexStr: string;
              if (isHexString) {
                hexStr = keyId;
              } else {
                hexStr = forge.util.bytesToHex(keyId);
              }
              parts.push('keyid:' + (hexStr.match(/.{1,2}/g)?.join(':').toUpperCase() || hexStr));
            } else if (aki.value) {
              // 尝试从 value 属性解析（可能是 ASN.1 编码）
              try {
                // value 可能是原始的二进制 KeyIdentifier
                const isHexString = /^[0-9a-fA-F]+$/.test(aki.value);
                let hexStr: string;
                if (isHexString) {
                  hexStr = aki.value;
                } else {
                  hexStr = forge.util.bytesToHex(aki.value);
                }
                // 跳过 ASN.1 tag 和 length（通常前4个字符是 tag+length）
                // 对于 OCTET STRING [0]，tag 是 80，后面是长度
                if (hexStr.startsWith('80')) {
                  // 跳过 tag (80) 和 length byte
                  const lenByte = parseInt(hexStr.substring(2, 4), 16);
                  if (lenByte < 128) {
                    hexStr = hexStr.substring(4);
                  } else {
                    // 长格式长度
                    const lenBytes = lenByte - 128;
                    hexStr = hexStr.substring(4 + lenBytes * 2);
                  }
                }
                parts.push('keyid:' + (hexStr.match(/.{1,2}/g)?.join(':').toUpperCase() || hexStr));
              } catch {
                // 解析失败，直接显示原始值
                const hexStr = forge.util.bytesToHex(aki.value);
                parts.push('keyid:' + (hexStr.match(/.{1,2}/g)?.join(':').toUpperCase() || hexStr));
              }
            }
            if (aki.authorityCertIssuer && aki.authorityCertIssuer.length > 0) {
              const issuerParts = aki.authorityCertIssuer.map(iss => {
                if (iss.type === 4) { // directoryName
                  return `DirName:${iss.value}`;
                }
                return iss.value;
              });
              parts.push(issuerParts.join(', '));
            }
            if (aki.serialNumber) {
              parts.push('serial:' + aki.serialNumber);
            }
            extValue = parts.join('\n');
          } else if (ext.name === 'certificatePolicies') {
            // Certificate Policies
            const cp = ext as { certificatePolicies?: Array<{ policyIdentifier: string }> };
            if (cp.certificatePolicies) {
              extValue = cp.certificatePolicies.map(p => `Policy: ${p.policyIdentifier}`).join(', ');
            }
          } else if (ext.name === 'cRLDistributionPoints') {
            // CRL Distribution Points
            const cdp = ext as { 
              cRLDistributionPoints?: Array<{ 
                fullName?: Array<{ type: number; value: string }>;
              }>;
            };
            if (cdp.cRLDistributionPoints) {
              const points: string[] = [];
              cdp.cRLDistributionPoints.forEach(dp => {
                if (dp.fullName) {
                  dp.fullName.forEach(fn => {
                    if (fn.type === 6) { // URI
                      points.push(`URI:${fn.value}`);
                    } else {
                      points.push(fn.value);
                    }
                  });
                }
              });
              extValue = points.join(', ');
            }
          } else if (ext.name === 'authorityInfoAccess') {
            // Authority Information Access
            const aia = ext as {
              accessDescriptions?: Array<{
                accessMethod: string;
                accessLocation: { type: number; value: string };
              }>;
            };
            if (aia.accessDescriptions) {
              const descs: string[] = [];
              aia.accessDescriptions.forEach(desc => {
                const methodName = desc.accessMethod === '1.3.6.1.5.5.7.48.1' ? 'OCSP' :
                                   desc.accessMethod === '1.3.6.1.5.5.7.48.2' ? 'CA Issuers' :
                                   desc.accessMethod;
                const locType = desc.accessLocation.type === 6 ? 'URI' : 'other';
                descs.push(`${methodName} - ${locType}:${desc.accessLocation.value}`);
              });
              extValue = descs.join(', ');
            }
          } else if ((ext as { value?: string }).value) {
            // 其他扩展，尝试将二进制数据转换为十六进制
            const rawValue = (ext as { value: string }).value;
            // 检查是否为可打印字符串
            const isPrintable = /^[\x20-\x7E\r\n\t]*$/.test(rawValue);
            if (isPrintable && rawValue.length > 0) {
              extValue = rawValue;
            } else if (rawValue.length > 0) {
              // 非可打印字符，转换为十六进制
              const hexStr = forge.util.bytesToHex(rawValue);
              extValue = hexStr.match(/.{1,2}/g)?.join(':').toUpperCase() || hexStr;
            }
          }
          
          extensions.push({
            name: extName,
            value: extValue,
            critical: (ext as { critical?: boolean }).critical
          });
        });
      }
      
      // 提取签名值
      const signatureHex = (cert as unknown as { signature: string }).signature;
      let signatureFormatted = '';
      if (signatureHex) {
        // 将签名转换为十六进制字符串
        const sigBytes = forge.util.bytesToHex(signatureHex);
        const sigPairs = sigBytes.match(/.{1,2}/g) || [];
        const sigLines: string[] = [];
        for (let i = 0; i < sigPairs.length; i += 18) {
          sigLines.push(sigPairs.slice(i, i + 18).join(':'));
        }
        signatureFormatted = sigLines.join('\n         ');
      }
      
      // 格式化日期为 GMT 格式
      const formatDate = (date: Date): string => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[date.getUTCMonth()];
        const day = date.getUTCDate().toString().padStart(2, ' ');
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');
        const seconds = date.getUTCSeconds().toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month} ${day} ${hours}:${minutes}:${seconds} ${year} GMT`;
      };
      
      // 处理序列号（可能很长）
      const serialNumber = cert.serialNumber;
      const serialNumberDec = parseInt(serialNumber, 16);
      const serialNumberDisplay = isNaN(serialNumberDec) || serialNumber.length > 8 
        ? serialNumber 
        : `${serialNumberDec} (0x${serialNumber.toLowerCase()})`;
      
      setParsedCertInfo({
        version: (cert as unknown as { version: number }).version + 1,
        serialNumber: serialNumberDisplay,
        serialNumberHex: serialNumber,
        signatureAlgorithm,
        issuer,
        issuerString: issuerParts.join(', '),
        subject,
        subjectString: subjectParts.join(', '),
        validFrom: formatDate(cert.validity.notBefore),
        validTo: formatDate(cert.validity.notAfter),
        publicKeyAlgorithm: 'rsaEncryption',
        keySize,
        modulus: modulusFormatted,
        exponent: `${exponentDec} (0x${exponentHex})`,
        publicKey: publicKeyPem,
        extensions,
        signature: signatureFormatted
      });
      
      message.success(t.sslCert?.certParsed || 'Certificate parsed successfully');
    } catch (err) {
      setError((t.sslCert?.errorCertParse || 'Certificate parsing failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common?.copied || 'Copied to clipboard!');
  };

  // 清除密钥tab
  const clearKeysTab = () => {
    setPublicExponent('010001');
    setKeyLength(2048);
    setKeysPassPhrase('');
    setGeneratedPrivateKey('');
    setGeneratedPublicKey('');
    setError('');
  };

  // 清除CSR tab
  const clearCSRTab = () => {
    setCsrPrivateKey('');
    setCsrVersion(2);
    setCsrCountry('AU');
    setCsrState('Queensland');
    setCsrLocality('Brisbane');
    setCsrOrganization('');
    setCsrUnit('');
    setCsrCommonName('');
    setCsrEmail('');
    setCsrPassPhrase('');
    setGeneratedCSR('');
    setError('');
  };

  // 输入框样式
  const inputStyle: React.CSSProperties = {
    fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
    fontSize: '14px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  };

  // Tab 内容
  const tabItems = [
    {
      key: 'keys',
      label: <span><KeyOutlined /> {t.sslCert?.tabKeys || 'Keys'}</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Public Exponent */}
          <div>
            <div style={labelStyle}>
              <Text strong>{t.sslCert?.publicExponent || 'Public Exp.(e)'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{getByteLength(publicExponent)}]</Text>
            </div>
            <Input
              value={publicExponent}
              onChange={e => setPublicExponent(e.target.value)}
              placeholder="010001"
              style={inputStyle}
            />
          </div>

          {/* Key Length */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.sslCert?.keyLength || 'Key Length'}:
            </Text>
            <Select
              value={keyLength}
              onChange={setKeyLength}
              style={{ width: '100%' }}
              options={[
                { label: '1024', value: 1024 },
                { label: '2048', value: 2048 },
                { label: '3072', value: 3072 },
                { label: '4096', value: 4096 },
              ]}
            />
          </div>

          {/* Pass Phrase */}
          <div>
            <div style={labelStyle}>
              <Text strong>{t.sslCert?.passPhrase || 'Pass phrase'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{keysPassPhrase.length}]</Text>
            </div>
            <Input.Password
              value={keysPassPhrase}
              onChange={e => setKeysPassPhrase(e.target.value)}
              placeholder={t.sslCert?.passPhrasePlaceholder || 'Enter pass phrase to encrypt private key'}
              style={inputStyle}
            />
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              type="primary" 
              icon={<LockOutlined />}
              onClick={generateKeyPair}
              loading={generatingKeys}
              size="large"
            >
              {t.sslCert?.generateKeys || 'Generate Keys'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearKeysTab}
              danger
              size="large"
            >
              {t.common?.clear || 'Clear'}
            </Button>
          </div>

          {/* 加载状态 */}
          {generatingKeys && (
            <div style={{ 
              ...getResultContainerStyle(isDark),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 48,
              gap: 16
            }}>
              <Spin size="large" />
              <Text style={{ color: isDark ? '#95de64' : '#389e0d' }}>
                {t.sslCert?.generating || 'Generating RSA key pair...'}
              </Text>
            </div>
          )}

          {/* 生成的密钥对 */}
          {!generatingKeys && generatedPrivateKey && generatedPublicKey && (
            <div style={getResultContainerStyle(isDark)}>
              {/* 标题栏 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckOutlined style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 18 }} />
                  <Text strong style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 16 }}>
                    {t.sslCert?.keyGenerated || 'Key pair generated successfully'}
                  </Text>
                </div>
                <CopyAllButton 
                  isDark={isDark}
                  t={t}
                  onCopy={() => copyToClipboard(
                    ` Private Key generated\n ****************************************\n Key length:\t\t${keyLength}\n Public Exponent:\t${parseInt(publicExponent, 16)}\n ----------------------------------------\n${generatedPrivateKey}\n${generatedPublicKey}`
                  )}
                />
              </div>

              {/* 密钥信息摘要 */}
              <div style={{
                ...getResultTextStyle(isDark),
                marginBottom: 16,
                padding: 12,
                fontSize: 13,
              }}>
                <div style={{ display: 'flex', gap: 32 }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{t.sslCert?.keyLength || 'Key Length'}:</Text>
                    <Text strong style={{ marginLeft: 8, color: isDark ? '#95de64' : '#237804' }}>{keyLength} bits</Text>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>{t.sslCert?.publicExponent || 'Public Exponent'}:</Text>
                    <Text strong style={{ marginLeft: 8, color: isDark ? '#95de64' : '#237804' }}>{parseInt(publicExponent, 16)}</Text>
                  </div>
                </div>
              </div>

              {/* 私钥 */}
              <KeyResultBlock
                label={t.sslCert?.privateKey || 'Private Key'}
                value={generatedPrivateKey}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(generatedPrivateKey)}
                color="green"
              />

              {/* 公钥 */}
              <KeyResultBlock
                label={t.sslCert?.publicKey || 'Public Key'}
                value={generatedPublicKey}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(generatedPublicKey)}
                color="blue"
                style={{ marginTop: 12 }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'csrs',
      label: <span><FileTextOutlined /> {t.sslCert?.tabCSRs || 'CSRs'}</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Private Key */}
          <div>
            <div style={labelStyle}>
              <Text strong>{t.sslCert?.privateKey || 'Private Key'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrPrivateKey.length}]</Text>
            </div>
            <TextArea
              value={csrPrivateKey}
              onChange={e => setCsrPrivateKey(e.target.value)}
              placeholder={t.sslCert?.privateKeyPlaceholder || 'Paste encrypted PEM private key'}
              autoSize={{ minRows: 6, maxRows: 10 }}
              style={inputStyle}
            />
          </div>

          {/* Version */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.sslCert?.version || 'Version'}:
            </Text>
            <Select
              value={csrVersion}
              onChange={setCsrVersion}
              style={{ width: '100%' }}
              options={[
                { label: '1', value: 1 },
                { label: '2', value: 2 },
                { label: '3', value: 3 },
              ]}
            />
          </div>

          {/* Subject Information */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.country || 'Country Name'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrCountry.length}]</Text>
              </div>
              <Input value={csrCountry} onChange={e => setCsrCountry(e.target.value)} placeholder="AU" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.state || 'State (Province)'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrState.length}]</Text>
              </div>
              <Input value={csrState} onChange={e => setCsrState(e.target.value)} placeholder="Queensland" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.locality || 'Locality Name'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrLocality.length}]</Text>
              </div>
              <Input value={csrLocality} onChange={e => setCsrLocality(e.target.value)} placeholder="Brisbane" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.organization || 'Organization'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrOrganization.length}]</Text>
              </div>
              <Input value={csrOrganization} onChange={e => setCsrOrganization(e.target.value)} placeholder="My Company PTY" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.unit || 'Unit'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrUnit.length}]</Text>
              </div>
              <Input value={csrUnit} onChange={e => setCsrUnit(e.target.value)} placeholder="DEV team" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.commonName || 'Common Name'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrCommonName.length}]</Text>
              </div>
              <Input value={csrCommonName} onChange={e => setCsrCommonName(e.target.value)} placeholder="example.com" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.email || 'Email address'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrEmail.length}]</Text>
              </div>
              <Input value={csrEmail} onChange={e => setCsrEmail(e.target.value)} placeholder="info@example.com" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.passPhrase || 'Pass phrase'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{csrPassPhrase.length}]</Text>
              </div>
              <Input.Password value={csrPassPhrase} onChange={e => setCsrPassPhrase(e.target.value)} placeholder="Private key password" style={inputStyle} />
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              type="primary" 
              icon={<LockOutlined />}
              onClick={generateCSR}
              loading={generatingCSR}
              size="large"
            >
              {t.sslCert?.generateCSR || 'Generate CSR'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearCSRTab}
              danger
              size="large"
            >
              {t.common?.clear || 'Clear'}
            </Button>
          </div>

          {/* 加载状态 */}
          {generatingCSR && (
            <div style={{ 
              ...getResultContainerStyle(isDark),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 48,
              gap: 16
            }}>
              <Spin size="large" />
              <Text style={{ color: isDark ? '#95de64' : '#389e0d' }}>
                {t.sslCert?.generatingCSR || 'Generating CSR...'}
              </Text>
            </div>
          )}

          {/* 生成的 CSR */}
          {!generatingCSR && generatedCSR && (
            <div style={getResultContainerStyle(isDark)}>
              {/* 标题栏 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckOutlined style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 18 }} />
                  <Text strong style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 16 }}>
                    {t.sslCert?.csrGenerated || 'Certificate Signing Request generated'}
                  </Text>
                </div>
                <CopyAllButton 
                  isDark={isDark}
                  t={t}
                  onCopy={() => copyToClipboard(
                    ` Certificate Signing Request generated\n ****************************************\n Country Name:\t\t${csrCountry}\n State (Province):\t${csrState}\n Locality Name:\t\t${csrLocality}\n Organization:\t\t${csrOrganization}\n Unit:\t\t\t${csrUnit}\n Common Name:\t\t${csrCommonName}\n Email address:\t\t${csrEmail}\n ----------------------------------------\n Input PK:\n${csrPrivateKey}\n\n Certificate Signing Request:\n${generatedCSR}`
                  )}
                />
              </div>

              {/* 主体信息摘要 */}
              <div style={{
                ...getResultTextStyle(isDark),
                marginBottom: 16,
                padding: 12,
                fontSize: 13,
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  <tbody>
                    {csrCountry && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap', width: '150px' }}>{t.sslCert?.country || 'Country Name'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{csrCountry}</td>
                      </tr>
                    )}
                    {csrState && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.state || 'State (Province)'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{csrState}</td>
                      </tr>
                    )}
                    {csrLocality && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.locality || 'Locality Name'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{csrLocality}</td>
                      </tr>
                    )}
                    {csrOrganization && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.organization || 'Organization'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{csrOrganization}</td>
                      </tr>
                    )}
                    {csrUnit && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.unit || 'Unit'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{csrUnit}</td>
                      </tr>
                    )}
                    {csrCommonName && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.commonName || 'Common Name'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{csrCommonName}</td>
                      </tr>
                    )}
                    {csrEmail && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.email || 'Email address'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{csrEmail}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 输入的私钥 */}
              <KeyResultBlock
                label={t.sslCert?.inputPK || 'Input PK'}
                value={csrPrivateKey}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(csrPrivateKey)}
                color="green"
              />

              {/* 生成的 CSR */}
              <KeyResultBlock
                label={t.sslCert?.certificateSigningRequest || 'Certificate Signing Request'}
                value={generatedCSR}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(generatedCSR)}
                color="green"
                style={{ marginTop: 12 }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'readcsr',
      label: <span><SearchOutlined /> {t.sslCert?.tabReadCSR || 'Read CSR'}</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Input CSR */}
          <div>
            <div style={labelStyle}>
              <Text strong>{t.sslCert?.inputCSR || 'Input CSR'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{inputCSR.length}]</Text>
            </div>
            <TextArea
              value={inputCSR}
              onChange={e => setInputCSR(e.target.value)}
              placeholder={t.sslCert?.csrPlaceholder || 'Paste PEM encoded CSR (-----BEGIN CERTIFICATE REQUEST-----)'}
              autoSize={{ minRows: 10, maxRows: 20 }}
              style={inputStyle}
            />
          </div>

          {/* 解析按钮 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={parseCSR}
              size="large"
            >
              {t.sslCert?.parseCSR || 'Parse CSR'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={() => { setInputCSR(''); setParsedCSRInfo(null); setError(''); }}
              danger
              size="large"
            >
              {t.common?.clear || 'Clear'}
            </Button>
          </div>

          {/* 解析结果 */}
          {parsedCSRInfo && (
            <div style={getResultContainerStyle(isDark)}>
              {/* 标题 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckOutlined style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 18 }} />
                  <Text strong style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 16 }}>
                    {t.sslCert?.csrRead || 'Certificate Signing Request Read'}
                  </Text>
                </div>
                <CopyAllButton 
                  isDark={isDark}
                  t={t}
                  onCopy={() => copyToClipboard(
                    ` Certificate Signing Request Read\n ****************************************\n PEM Data:\n${inputCSR}\n\n Certificate Signing Request:\n Version: ${parsedCSRInfo.version} (0x${(parsedCSRInfo.version - 1).toString(16)})\n Subject: ${parsedCSRInfo.subjectString}\n Public Key Algorithm: ${parsedCSRInfo.publicKeyAlgorithm}\n RSA Public-Key: (${parsedCSRInfo.keySize} bit)\n Modulus:\n    ${parsedCSRInfo.modulus}\n Exponent: ${parsedCSRInfo.exponent}\n Signature Algorithm: ${parsedCSRInfo.signatureAlgorithm}`
                  )}
                />
              </div>

              {/* PEM Data */}
              <KeyResultBlock
                label={t.sslCert?.pemData || 'PEM Data'}
                value={inputCSR}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(inputCSR)}
                color="green"
              />

              {/* Certificate Signing Request 详细信息 */}
              <div style={{ marginTop: 16 }}>
                <Text strong style={{ color: isDark ? '#8c8c8c' : '#595959', fontSize: 13, display: 'block', marginBottom: 8 }}>
                  {t.sslCert?.certificateSigningRequest || 'Certificate Signing Request'}:
                </Text>
                <div style={getResultTextStyle(isDark)}>
                  <div style={{ marginBottom: 8 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Version: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCSRInfo.version} (0x{(parsedCSRInfo.version - 1).toString(16)})</Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Subject: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCSRInfo.subjectString}</Text>
                  </div>
                  <div style={{ marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Subject Public Key Info:</Text>
                  </div>
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Public Key Algorithm: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCSRInfo.publicKeyAlgorithm}</Text>
                  </div>
                  <div style={{ marginLeft: 24, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>RSA Public-Key: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>({parsedCSRInfo.keySize} bit)</Text>
                  </div>
                  <div style={{ marginLeft: 24, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Modulus:</Text>
                    <pre style={{ 
                      margin: '4px 0 0 24px', 
                      fontSize: 11, 
                      color: isDark ? '#95de64' : '#237804',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      lineHeight: 1.4
                    }}>
                      {parsedCSRInfo.modulus}
                    </pre>
                  </div>
                  <div style={{ marginLeft: 24, marginBottom: 8 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Exponent: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCSRInfo.exponent}</Text>
                  </div>
                  <div>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Signature Algorithm: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCSRInfo.signatureAlgorithm}</Text>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'selfsigned',
      label: <span><SafetyCertificateOutlined /> {t.sslCert?.tabSelfSigned || 'Self-signed Certificates'}</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Private Key */}
          <div>
            <div style={labelStyle}>
              <Text strong>{t.sslCert?.privateKey || 'Private Key'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certPrivateKey.length}]</Text>
            </div>
            <TextArea
              value={certPrivateKey}
              onChange={e => setCertPrivateKey(e.target.value)}
              placeholder={t.sslCert?.privateKeyPlaceholder || 'Paste encrypted PEM private key'}
              autoSize={{ minRows: 6, maxRows: 10 }}
              style={inputStyle}
            />
          </div>

          {/* Certificate Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.sslCert?.version || 'Version'}:
              </Text>
              <Select
                value={certVersion}
                onChange={setCertVersion}
                style={{ width: '100%' }}
                options={[
                  { label: '1', value: 1 },
                  { label: '2', value: 2 },
                  { label: '3', value: 3 },
                ]}
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.sslCert?.validityBefore || 'Validity Before'} ({t.sslCert?.days || 'days'}):
              </Text>
              <InputNumber
                value={certValidityBefore}
                onChange={v => setCertValidityBefore(v || 0)}
                min={0}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.sslCert?.validityAfter || 'Validity After'} ({t.sslCert?.days || 'days'}):
              </Text>
              <InputNumber
                value={certValidityAfter}
                onChange={v => setCertValidityAfter(v || 365)}
                min={1}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.serialNumber || 'Serial Number'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certSerialNumber.length}]</Text>
              </div>
              <Input value={certSerialNumber} onChange={e => setCertSerialNumber(e.target.value)} placeholder="42" style={inputStyle} />
            </div>
          </div>

          {/* Subject Information */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.country || 'Country Name'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certCountry.length}]</Text>
              </div>
              <Input value={certCountry} onChange={e => setCertCountry(e.target.value)} placeholder="AU" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.state || 'State (Province)'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certState.length}]</Text>
              </div>
              <Input value={certState} onChange={e => setCertState(e.target.value)} placeholder="Queensland" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.locality || 'Locality Name'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certLocality.length}]</Text>
              </div>
              <Input value={certLocality} onChange={e => setCertLocality(e.target.value)} placeholder="Brisbane" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.organization || 'Organization'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certOrganization.length}]</Text>
              </div>
              <Input value={certOrganization} onChange={e => setCertOrganization(e.target.value)} placeholder="My Company PTY" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.unit || 'Unit'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certUnit.length}]</Text>
              </div>
              <Input value={certUnit} onChange={e => setCertUnit(e.target.value)} placeholder="DEV team" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.commonName || 'Common Name'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certCommonName.length}]</Text>
              </div>
              <Input value={certCommonName} onChange={e => setCertCommonName(e.target.value)} placeholder="example.com" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.email || 'Email address'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certEmail.length}]</Text>
              </div>
              <Input value={certEmail} onChange={e => setCertEmail(e.target.value)} placeholder="info@example.com" style={inputStyle} />
            </div>
            <div>
              <div style={labelStyle}>
                <Text strong>{t.sslCert?.passPhrase || 'Pass phrase'}:</Text>
                <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{certPassPhrase.length}]</Text>
              </div>
              <Input.Password value={certPassPhrase} onChange={e => setCertPassPhrase(e.target.value)} placeholder="Private key password" style={inputStyle} />
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              type="primary" 
              icon={<SafetyCertificateOutlined />}
              onClick={generateSelfSignedCert}
              loading={generatingCert}
              size="large"
            >
              {t.sslCert?.generateCert || 'Generate Certificate'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={() => {
                setCertPrivateKey('');
                setCertVersion(3);
                setCertValidityBefore(0);
                setCertValidityAfter(365);
                setCertSerialNumber('42');
                setCertCountry('AU');
                setCertState('Queensland');
                setCertLocality('Brisbane');
                setCertOrganization('');
                setCertUnit('');
                setCertCommonName('');
                setCertEmail('');
                setCertPassPhrase('');
                setGeneratedCert('');
                setError('');
              }}
              danger
              size="large"
            >
              {t.common?.clear || 'Clear'}
            </Button>
          </div>

          {/* 加载状态 */}
          {generatingCert && (
            <div style={{ 
              ...getResultContainerStyle(isDark),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 48,
              gap: 16
            }}>
              <Spin size="large" />
              <Text style={{ color: isDark ? '#95de64' : '#389e0d' }}>
                {t.sslCert?.generatingCert || 'Generating certificate...'}
              </Text>
            </div>
          )}

          {/* 生成的证书 */}
          {!generatingCert && generatedCert && (
            <div style={getResultContainerStyle(isDark)}>
              {/* 标题栏 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckOutlined style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 18 }} />
                  <Text strong style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 16 }}>
                    {t.sslCert?.certGenerated || 'Certificate generated'}
                  </Text>
                </div>
                <CopyAllButton 
                  isDark={isDark}
                  t={t}
                  onCopy={() => copyToClipboard(
                    ` Certificate generated\n ****************************************\n Serial Number:\t\t${certSerialNumber}\n Country Name:\t\t${certCountry}\n State (Province):\t${certState}\n Locality Name:\t\t${certLocality}\n Organization:\t\t${certOrganization}\n Unit:\t\t\t${certUnit}\n Common Name:\t\t${certCommonName}\n Email address:\t\t${certEmail}\n ----------------------------------------\n Input PK:\n${certPrivateKey}\n\n Certificate:\n${generatedCert}`
                  )}
                />
              </div>

              {/* 主体信息摘要 */}
              <div style={{
                ...getResultTextStyle(isDark),
                marginBottom: 16,
                padding: 12,
                fontSize: 13,
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap', width: '150px' }}>{t.sslCert?.serialNumber || 'Serial Number'}:</td>
                      <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certSerialNumber}</td>
                    </tr>
                    {certCountry && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.country || 'Country Name'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certCountry}</td>
                      </tr>
                    )}
                    {certState && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.state || 'State (Province)'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certState}</td>
                      </tr>
                    )}
                    {certLocality && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.locality || 'Locality Name'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certLocality}</td>
                      </tr>
                    )}
                    {certOrganization && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.organization || 'Organization'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certOrganization}</td>
                      </tr>
                    )}
                    {certUnit && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.unit || 'Unit'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certUnit}</td>
                      </tr>
                    )}
                    {certCommonName && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.commonName || 'Common Name'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certCommonName}</td>
                      </tr>
                    )}
                    {certEmail && (
                      <tr>
                        <td style={{ padding: '4px 16px 4px 0', color: isDark ? '#8c8c8c' : '#666', whiteSpace: 'nowrap' }}>{t.sslCert?.email || 'Email address'}:</td>
                        <td style={{ padding: '4px 0', color: isDark ? '#95de64' : '#237804' }}>{certEmail}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 输入的私钥 */}
              <KeyResultBlock
                label={t.sslCert?.inputPK || 'Input PK'}
                value={certPrivateKey}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(certPrivateKey)}
                color="green"
              />

              {/* 生成的证书 */}
              <KeyResultBlock
                label={t.sslCert?.certificate || 'Certificate'}
                value={generatedCert}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(generatedCert)}
                color="green"
                style={{ marginTop: 12 }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'readcert',
      label: <span><FileTextOutlined /> {t.sslCert?.tabReadCert || 'Read Certificate'}</span>,
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Input Certificate */}
          <div>
            <div style={labelStyle}>
              <Text strong>{t.sslCert?.inputCert || 'Input Cert.'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>[{inputCert.length}]</Text>
            </div>
            <TextArea
              value={inputCert}
              onChange={e => setInputCert(e.target.value)}
              placeholder={t.sslCert?.certPlaceholder || 'Paste PEM encoded certificate (-----BEGIN CERTIFICATE-----)'}
              autoSize={{ minRows: 10, maxRows: 20 }}
              style={inputStyle}
            />
          </div>

          {/* 解析按钮 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={parseCertificate}
              size="large"
            >
              {t.sslCert?.parseCert || 'Parse Certificate'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={() => { setInputCert(''); setParsedCertInfo(null); setError(''); }}
              danger
              size="large"
            >
              {t.common?.clear || 'Clear'}
            </Button>
          </div>

          {/* 解析结果 */}
          {parsedCertInfo && (
            <div style={getResultContainerStyle(isDark)}>
              {/* 标题栏 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckOutlined style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 18 }} />
                  <Text strong style={{ color: isDark ? '#52c41a' : '#389e0d', fontSize: 16 }}>
                    {t.sslCert?.certParsed || 'Certificate Read'}
                  </Text>
                </div>
                <CopyAllButton 
                  isDark={isDark}
                  t={t}
                  onCopy={() => copyToClipboard(
                    ` Certificate Read\n ****************************************\n ----------------------------------------\n PEM Data:\n${inputCert}\n\nCertificate:\n    Data:\n        Version: ${parsedCertInfo.version} (0x${(parsedCertInfo.version - 1).toString(16)})\n        Serial Number: ${parsedCertInfo.serialNumber}\n        Signature Algorithm: ${parsedCertInfo.signatureAlgorithm}\n        Issuer: ${parsedCertInfo.issuerString}\n        Validity\n            Not Before: ${parsedCertInfo.validFrom}\n            Not After : ${parsedCertInfo.validTo}\n        Subject: ${parsedCertInfo.subjectString}\n        Subject Public Key Info:\n            Public Key Algorithm: ${parsedCertInfo.publicKeyAlgorithm}\n                RSA Public-Key: (${parsedCertInfo.keySize} bit)\n                Modulus:\n                    ${parsedCertInfo.modulus}\n                Exponent: ${parsedCertInfo.exponent}\n        X509v3 extensions:\n${parsedCertInfo.extensions.map(ext => `            ${ext.name}${ext.critical ? ' (critical)' : ''}:\n                ${ext.value}`).join('\n')}\n    Signature Algorithm: ${parsedCertInfo.signatureAlgorithm}\n         ${parsedCertInfo.signature}`
                  )}
                />
              </div>

              {/* PEM Data */}
              <KeyResultBlock
                label={t.sslCert?.pemData || 'PEM Data'}
                value={inputCert}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(inputCert)}
                color="green"
              />

              {/* Certificate 详细信息 */}
              <div style={{ marginTop: 16 }}>
                <Text strong style={{ color: isDark ? '#8c8c8c' : '#595959', fontSize: 13, display: 'block', marginBottom: 8 }}>
                  {t.sslCert?.certificate || 'Certificate'}:
                </Text>
              <div style={getResultTextStyle(isDark)}>
                  {/* Data Section */}
                  <div style={{ marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666', fontWeight: 600 }}>Data:</Text>
                  </div>
                  
                  {/* Version */}
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Version: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.version} (0x{(parsedCertInfo.version - 1).toString(16)})</Text>
                  </div>
                  
                  {/* Serial Number */}
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Serial Number: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.serialNumber}</Text>
                  </div>
                  
                  {/* Signature Algorithm */}
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Signature Algorithm: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.signatureAlgorithm}</Text>
                  </div>
                  
                  {/* Issuer */}
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Issuer: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804', wordBreak: 'break-word' }}>{parsedCertInfo.issuerString}</Text>
                  </div>
                  
                  {/* Validity */}
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Validity</Text>
                  </div>
                  <div style={{ marginLeft: 32, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Not Before: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.validFrom}</Text>
                  </div>
                  <div style={{ marginLeft: 32, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Not After : </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.validTo}</Text>
                  </div>
                  
                  {/* Subject */}
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Subject: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804', wordBreak: 'break-word' }}>{parsedCertInfo.subjectString}</Text>
                  </div>
                  
                  {/* Subject Public Key Info */}
                  <div style={{ marginLeft: 16, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Subject Public Key Info:</Text>
                  </div>
                  <div style={{ marginLeft: 32, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Public Key Algorithm: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.publicKeyAlgorithm}</Text>
                  </div>
                  <div style={{ marginLeft: 48, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>RSA Public-Key: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>({parsedCertInfo.keySize} bit)</Text>
                  </div>
                  <div style={{ marginLeft: 48, marginBottom: 4 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Modulus:</Text>
                    <pre style={{ 
                      margin: '4px 0 0 24px', 
                      fontSize: 11, 
                      color: isDark ? '#95de64' : '#237804',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace'
                    }}>
                      {parsedCertInfo.modulus}
                    </pre>
                  </div>
                  <div style={{ marginLeft: 48, marginBottom: 8 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Exponent: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.exponent}</Text>
                  </div>
                  
                  {/* X509v3 extensions */}
                    {parsedCertInfo.extensions.length > 0 && (
                      <>
                      <div style={{ marginLeft: 16, marginBottom: 4 }}>
                        <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>X509v3 extensions:</Text>
                      </div>
                        {parsedCertInfo.extensions.map((ext, idx) => (
                        <div key={`ext-${idx}`} style={{ marginLeft: 32, marginBottom: 4 }}>
                          <div>
                            <Text style={{ color: isDark ? '#69b1ff' : '#1677ff' }}>
                              {ext.name}{ext.critical ? ' (critical)' : ''}:
                            </Text>
                          </div>
                          {ext.value && (
                            <div style={{ marginLeft: 16 }}>
                              <Text style={{ color: isDark ? '#95de64' : '#237804', wordBreak: 'break-word' }}>{ext.value}</Text>
                            </div>
                          )}
                        </div>
                        ))}
                      </>
                    )}
                  
                  {/* Signature Algorithm (final) */}
                  <div style={{ marginTop: 8 }}>
                    <Text style={{ color: isDark ? '#8c8c8c' : '#666' }}>Signature Algorithm: </Text>
                    <Text style={{ color: isDark ? '#95de64' : '#237804' }}>{parsedCertInfo.signatureAlgorithm}</Text>
              </div>
                  
                  {/* Signature */}
                  {parsedCertInfo.signature && (
                    <pre style={{ 
                      margin: '4px 0 0 24px', 
                      fontSize: 11, 
                      color: isDark ? '#95de64' : '#237804',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      lineHeight: 1.4,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace'
                    }}>
                      {parsedCertInfo.signature}
                    </pre>
                  )}
                </div>
              </div>

              {/* 公钥 PEM 单独显示 */}
              <KeyResultBlock
                label={t.sslCert?.publicKey || 'Public Key (PEM)'}
                value={parsedCertInfo.publicKey}
                isDark={isDark}
                t={t}
                onCopy={() => copyToClipboard(parsedCertInfo.publicKey)}
                color="blue"
                style={{ marginTop: 12 }}
              />
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.sslCert?.title || 'SSL Certificates (X509)'}
          </Title>
          <CollapsibleInfo title={t.sslCert?.infoTitle || 'X.509 Certificate Information'}>
            <div>• {t.sslCert?.info1 || 'X.509 is the standard format for public key certificates'}</div>
            <div>• {t.sslCert?.info2 || 'Used in TLS/SSL, email signing, and code signing'}</div>
            <div>• {t.sslCert?.info3 || 'CSR (Certificate Signing Request) is used to request a certificate from a CA'}</div>
          </CollapsibleInfo>
        </div>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.sslCert?.description || 'Generate RSA keys, create CSRs, self-signed certificates, and parse X.509 certificates'}
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

export default SSLCertificatesTool;

