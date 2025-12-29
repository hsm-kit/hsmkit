import React, { useState } from 'react';
import { Card, Button, Tabs, message, Divider, Typography, Input, Alert, Select, Radio } from 'antd';
import { KeyOutlined, LockOutlined, UnlockOutlined, EditOutlined, CheckCircleOutlined, CopyOutlined, InfoCircleOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons';
import { useLanguage } from '../../hooks/useLanguage';
import * as forge from 'node-forge';

const { Title, Text } = Typography;
const { TextArea } = Input;

type RSAKeyLength = 1024 | 2048 | 3072 | 4096;
type PaddingScheme = 'PKCS1' | 'OAEP' | 'NoPadding';
type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

// 将 ArrayBuffer 转换为 Hex 字符串
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

// 将 Hex 字符串转换为 ArrayBuffer
const hexToArrayBuffer = (hex: string): ArrayBuffer => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

// 清理十六进制输入
const cleanHex = (hex: string): string => {
  return hex.replace(/[\s\n\r]/g, '').toUpperCase();
};

// 验证十六进制
const isValidHex = (hex: string): boolean => {
  return /^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0;
};

// Base64 URL 解码
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

const RSATool: React.FC = () => {
  const { t } = useLanguage();
  
  // Keys Tab 状态
  const [modulus, setModulus] = useState('');
  const [publicExponent, setPublicExponent] = useState('010001');
  const [privateExponent, setPrivateExponent] = useState('');
  const [keyLength, setKeyLength] = useState<RSAKeyLength>(2048);
  const [generating, setGenerating] = useState(false);
  
  // Encrypt/Decrypt Tab 状态
  const [encryptData, setEncryptData] = useState('');
  const [encryptResult, setEncryptResult] = useState('');
  const [encryptDetails, setEncryptDetails] = useState<{
    keyLength: number;
    method: string;
    originalData: string;
    modulus: string;
    publicExp: string;
    privateExp: string;
    padding: string;
    resultLength: number;
  } | null>(null);
  const [decryptData, setDecryptData] = useState('');
  const [decryptResult, setDecryptResult] = useState('');
  const [decryptDetails, setDecryptDetails] = useState<{
    keyLength: number;
    method: string;
    cipherData: string;
    modulus: string;
    publicExp: string;
    privateExp: string;
    padding: string;
    resultLength: number;
  } | null>(null);
  const [encPadding, setEncPadding] = useState<PaddingScheme>('PKCS1');
  const [decPadding, setDecPadding] = useState<PaddingScheme>('PKCS1');
  const [encodingMethod, setEncodingMethod] = useState<'Private' | 'Public'>('Private');
  const [decodingMethod, setDecodingMethod] = useState<'Private' | 'Public'>('Private');
  const [inputFormat, setInputFormat] = useState<'ASCII' | 'Hex'>('ASCII');
  
  // Sign/Verify Tab 状态
  const [signData, setSignData] = useState('');
  const [signature, setSignature] = useState('');
  const [signInputFormat, setSignInputFormat] = useState<'ASCII' | 'Hex'>('ASCII');
  const [signDetails, setSignDetails] = useState<{
    keyLength: number;
    stringToSign: string;
    stringLength: number;
    digestType: string;
    digestLength: number;
    hashValue: string;
  } | null>(null);
  const [verifyData, setVerifyData] = useState('');
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyInputFormat, setVerifyInputFormat] = useState<'ASCII' | 'Hex'>('ASCII');
  const [verifyInputType, setVerifyInputType] = useState<'Data' | 'Hash'>('Data');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [signHash, setSignHash] = useState<HashAlgorithm>('SHA-256');
  const [verifyHash, setVerifyHash] = useState<HashAlgorithm>('SHA-256');
  
  // OAEP Tab 状态
  const [oaepData, setOaepData] = useState('');
  const [oaepLabel, setOaepLabel] = useState('');
  const [oaepMethod, setOaepMethod] = useState<'Encode' | 'Decode'>('Encode');
  const [oaepResultLength, setOaepResultLength] = useState(2048);
  const [oaepHash, setOaepHash] = useState<'SHA-1' | 'SHA-224' | 'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256');
  const [oaepResult, setOaepResult] = useState('');
  
  const [error, setError] = useState('');

  // 生成 RSA 密钥对
  const generateKeyPair = async () => {
    setGenerating(true);
    setError('');
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: keyLength,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );

      // 导出公钥
      const publicKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
      // 导出私钥
      const privateKeyJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);

      // 设置模数 (n)
      if (publicKeyJwk.n) {
        const nBuffer = base64UrlDecode(publicKeyJwk.n);
        setModulus(arrayBufferToHex(nBuffer));
      }
      
      // 设置公钥指数 (e)
      if (publicKeyJwk.e) {
        const eBuffer = base64UrlDecode(publicKeyJwk.e);
        setPublicExponent(arrayBufferToHex(eBuffer));
      }
      
      // 设置私钥指数 (d)
      if (privateKeyJwk.d) {
        const dBuffer = base64UrlDecode(privateKeyJwk.d);
        setPrivateExponent(arrayBufferToHex(dBuffer));
      }

      message.success(t.rsa?.keyGenerated || 'Key pair generated successfully');
    } catch (err) {
      setError((t.rsa?.errorKeyGen || 'Key generation failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setGenerating(false);
    }
  };

  // 从输入的参数导入密钥
  const importKeys = async () => {
    setError('');
    try {
      const cleanModulus = cleanHex(modulus);
      const cleanPubExp = cleanHex(publicExponent);
      const cleanPrivExp = cleanHex(privateExponent);

      if (!isValidHex(cleanModulus) || !cleanModulus) {
        setError(t.rsa?.errorInvalidModulus || 'Invalid modulus');
        return;
      }
      if (!isValidHex(cleanPubExp) || !cleanPubExp) {
        setError(t.rsa?.errorInvalidPublicExp || 'Invalid public exponent');
        return;
      }

      // 验证输入格式
      try {
        hexToArrayBuffer(cleanModulus);
        hexToArrayBuffer(cleanPubExp);
      } catch {
        setError(t.rsa?.errorKeyImport || 'Invalid key format');
        return;
      }

      // 如果有私钥指数，提示用户
      if (cleanPrivExp && isValidHex(cleanPrivExp)) {
        // 注意：仅有 n, e, d 无法完整导入私钥，需要所有 CRT 参数
        message.info(t.rsa?.privateKeyImportNote || 'Private key import requires full CRT parameters. Use "Generate Keys" for full functionality.');
      }
      message.success(t.rsa?.keyImported || 'Public key imported successfully');
    } catch (err) {
      setError((t.rsa?.errorKeyImport || 'Key import failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // Hex 字符串转 forge bytes
  const hexToForgeBytes = (hex: string): string => {
    let bytes = '';
    for (let i = 0; i < hex.length; i += 2) {
      bytes += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  };

  // forge bytes 转 Hex 字符串
  const forgeBytesToHex = (bytes: string): string => {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes.charCodeAt(i).toString(16).padStart(2, '0');
    }
    return hex.toUpperCase();
  };

  // 加密
  const handleEncrypt = async () => {
    setError('');
    setEncryptResult('');
    
    // 检查密钥参数
    if (!modulus || !publicExponent) {
      setError(t.rsa?.errorNoPublicKey || 'Please generate or import a public key first');
      return;
    }

    if (encodingMethod === 'Private' && !privateExponent) {
      setError(t.rsa?.errorNoPrivateKey || 'Please generate a key pair first (private key required)');
      return;
    }

    if (!encryptData.trim()) {
      setError(t.rsa?.errorDataRequired || 'Data is required');
      return;
    }

    // 根据输入格式处理数据
    let dataBytes: string;
    let originalDataHex: string;
    
    if (inputFormat === 'ASCII') {
      dataBytes = encryptData;
      originalDataHex = forgeBytesToHex(encryptData);
    } else {
      const cleanData = cleanHex(encryptData);
      if (!isValidHex(cleanData)) {
        setError(t.rsa?.errorInvalidData || 'Invalid data (must be hexadecimal)');
        return;
      }
      dataBytes = hexToForgeBytes(cleanData);
      originalDataHex = cleanData;
    }

    try {
      let encryptedHex: string;
      
      // 使用 node-forge 进行加密
      const n = new forge.jsbn.BigInteger(cleanHex(modulus), 16);
      const e = new forge.jsbn.BigInteger(cleanHex(publicExponent), 16);
      
      // 创建公钥
      const publicKey = forge.pki.setRsaPublicKey(n, e);
      
      if (encodingMethod === 'Private' && privateExponent) {
        // 使用私钥加密 (raw RSA with private exponent)
        const d = new forge.jsbn.BigInteger(cleanHex(privateExponent), 16);
        
        // 私钥"加密"使用 raw RSA: C = M^d mod n
        // 先对数据进行 PKCS#1 v1.5 填充（如果选择了 PKCS1）
        let paddedData: string;
        if (encPadding === 'PKCS1') {
          // PKCS#1 v1.5 Type 1 填充 (用于私钥操作)
          const keyBytes = cleanHex(modulus).length / 2;
          const dataLen = dataBytes.length;
          const padLen = keyBytes - dataLen - 3;
          if (padLen < 8) {
            throw new Error('Data too long for key size');
          }
          // 0x00 || 0x01 || PS (0xFF bytes) || 0x00 || Data
          paddedData = '0001' + 'FF'.repeat(padLen) + '00' + forgeBytesToHex(dataBytes);
        } else {
          paddedData = forgeBytesToHex(dataBytes);
        }
        
        const dataBI = new forge.jsbn.BigInteger(paddedData, 16);
        const encryptedBI = dataBI.modPow(d, n);
        encryptedHex = encryptedBI.toString(16).toUpperCase().padStart(cleanHex(modulus).length, '0');
      } else {
        // 使用公钥加密
        if (encPadding === 'PKCS1') {
          // PKCS#1 v1.5 加密
          const encrypted = publicKey.encrypt(dataBytes, 'RSAES-PKCS1-V1_5');
          encryptedHex = forgeBytesToHex(encrypted);
        } else if (encPadding === 'OAEP') {
          // OAEP 加密
          const encrypted = publicKey.encrypt(dataBytes, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: { md: forge.md.sha256.create() }
          });
          encryptedHex = forgeBytesToHex(encrypted);
        } else {
          // No Padding (raw RSA)
          const dataBI = new forge.jsbn.BigInteger(forge.util.bytesToHex(dataBytes), 16);
          const encryptedBI = dataBI.modPow(e, n);
          encryptedHex = encryptedBI.toString(16).toUpperCase().padStart(modulus.length, '0');
        }
      }
      
      setEncryptResult(encryptedHex);
      
      // 保存加密详情
      setEncryptDetails({
        keyLength: keyLength,
        method: encodingMethod,
        originalData: originalDataHex,
        modulus: modulus,
        publicExp: publicExponent,
        privateExp: privateExponent,
        padding: encPadding,
        resultLength: encryptedHex.length / 2,
      });
    } catch (err) {
      setError((t.rsa?.errorEncryption || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
      setEncryptDetails(null);
    }
  };

  // 解密
  const handleDecrypt = async () => {
    setError('');
    setDecryptResult('');
    setDecryptDetails(null);
    
    // 检查密钥参数
    if (!modulus || !publicExponent) {
      setError(t.rsa?.errorNoPublicKey || 'Please generate or import a public key first');
      return;
    }

    if (decodingMethod === 'Private' && !privateExponent) {
      setError(t.rsa?.errorNoPrivateKey || 'Please generate a key pair first (private key required)');
      return;
    }

    const cleanData = cleanHex(decryptData);
    if (!cleanData || !isValidHex(cleanData)) {
      setError(t.rsa?.errorInvalidCiphertext || 'Invalid ciphertext (must be hexadecimal)');
      return;
    }

    try {
      const n = new forge.jsbn.BigInteger(cleanHex(modulus), 16);
      const cipherBI = new forge.jsbn.BigInteger(cleanData, 16);
      let decryptedBI: forge.jsbn.BigInteger;
      
      if (decodingMethod === 'Private') {
        // 使用私钥解密: M = C^d mod n
        const d = new forge.jsbn.BigInteger(cleanHex(privateExponent), 16);
        decryptedBI = cipherBI.modPow(d, n);
      } else {
        // 使用公钥解密: M = C^e mod n
        const e = new forge.jsbn.BigInteger(cleanHex(publicExponent), 16);
        decryptedBI = cipherBI.modPow(e, n);
      }
      
      let decryptedHex = decryptedBI.toString(16).toUpperCase();
      
      // 确保长度为偶数
      if (decryptedHex.length % 2 !== 0) {
        decryptedHex = '0' + decryptedHex;
      }
      
      let resultHex: string;
      
      if (decPadding === 'PKCS1') {
        // 移除 PKCS#1 v1.5 填充
        // 格式: 0x00 || 0x02 || PS (非零随机字节) || 0x00 || Data (Type 2)
        // 或: 0x00 || 0x01 || PS (0xFF 字节) || 0x00 || Data (Type 1)
        const padded = decryptedHex.padStart(cleanHex(modulus).length, '0');
        
        // 检查是否是有效的 PKCS#1 v1.5 填充
        if (padded.substring(0, 2) === '00' && (padded.substring(2, 4) === '01' || padded.substring(2, 4) === '02')) {
          // 从位置 4 开始，在字节边界（偶数位置）查找 00 分隔符
          let separatorPos = -1;
          for (let i = 4; i < padded.length - 2; i += 2) {
            if (padded.substring(i, i + 2) === '00') {
              separatorPos = i;
              break;
            }
          }
          if (separatorPos !== -1) {
            resultHex = padded.substring(separatorPos + 2);
          } else {
            resultHex = decryptedHex;
          }
        } else {
          resultHex = decryptedHex;
        }
      } else {
        resultHex = decryptedHex;
      }
      
      setDecryptResult(resultHex);
      
      // 保存解密详情
      setDecryptDetails({
        keyLength: keyLength,
        method: decodingMethod,
        cipherData: cleanData,
        modulus: modulus,
        publicExp: publicExponent,
        privateExp: privateExponent,
        padding: decPadding,
        resultLength: resultHex.length / 2,
      });
    } catch (err) {
      setError((t.rsa?.errorDecryption || 'Decryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
      setDecryptDetails(null);
    }
  };

  // 签名 (使用 node-forge 实现 PKCS#1 v1.5 签名)
  const handleSign = async () => {
    setError('');
    setSignature('');
    
    // 检查密钥参数
    if (!modulus || !publicExponent || !privateExponent) {
      setError(t.rsa?.errorNoPrivateKey || 'Please generate a key pair first (private key required)');
      return;
    }

    if (!signData.trim()) {
      setError(t.rsa?.errorDataRequired || 'Data is required');
      return;
    }

    let dataBytes: string;
    if (signInputFormat === 'ASCII') {
      dataBytes = signData;
    } else {
      const cleanData = cleanHex(signData);
      if (!isValidHex(cleanData)) {
        setError(t.rsa?.errorInvalidData || 'Invalid data (must be hexadecimal)');
        return;
      }
      dataBytes = hexToForgeBytes(cleanData);
    }

    try {
      // 选择哈希算法
      let md: forge.md.MessageDigest;
      switch (signHash) {
        case 'SHA-1':
          md = forge.md.sha1.create();
          break;
        case 'SHA-256':
          md = forge.md.sha256.create();
          break;
        case 'SHA-384':
          md = forge.md.sha384.create();
          break;
        case 'SHA-512':
          md = forge.md.sha512.create();
          break;
        default:
          md = forge.md.sha256.create();
      }
      
      // 计算哈希
      md.update(dataBytes);
      
      // 创建私钥参数
      const n = new forge.jsbn.BigInteger(cleanHex(modulus), 16);
      const d = new forge.jsbn.BigInteger(cleanHex(privateExponent), 16);
      
      // 使用 PKCS#1 v1.5 签名
      // 签名 = (DigestInfo)^d mod n
      // DigestInfo = DER(AlgorithmIdentifier || Hash)
      const digestInfo = md.digest().bytes();
      
      // 构建 PKCS#1 v1.5 签名填充
      // EM = 0x00 || 0x01 || PS || 0x00 || T
      // T = DigestInfo (包含算法标识和哈希值)
      const keyBytes = cleanHex(modulus).length / 2;
      
      // 获取 DigestInfo (带算法标识的哈希)
      let algorithmOid: string;
      switch (signHash) {
        case 'SHA-1':
          algorithmOid = '3021300906052b0e03021a05000414'; // SHA-1 OID
          break;
        case 'SHA-256':
          algorithmOid = '3031300d060960864801650304020105000420'; // SHA-256 OID
          break;
        case 'SHA-384':
          algorithmOid = '3041300d060960864801650304020205000430'; // SHA-384 OID
          break;
        case 'SHA-512':
          algorithmOid = '3051300d060960864801650304020305000440'; // SHA-512 OID
          break;
        default:
          algorithmOid = '3031300d060960864801650304020105000420';
      }
      
      const hashHex = forgeBytesToHex(digestInfo);
      const digestInfoHex = algorithmOid + hashHex;
      const tLen = digestInfoHex.length / 2;
      const psLen = keyBytes - tLen - 3;
      
      if (psLen < 8) {
        throw new Error('Message too long for key size');
      }
      
      // EM = 00 01 [FF...FF] 00 [DigestInfo]
      const emHex = '0001' + 'FF'.repeat(psLen) + '00' + digestInfoHex;
      
      // 签名: S = EM^d mod n
      const emBI = new forge.jsbn.BigInteger(emHex, 16);
      const sigBI = emBI.modPow(d, n);
      const sigHex = sigBI.toString(16).toUpperCase().padStart(cleanHex(modulus).length, '0');
      
      // 保存签名详情
      const hashLengths: Record<string, number> = {
        'SHA-1': 20,
        'SHA-256': 32,
        'SHA-384': 48,
        'SHA-512': 64,
      };
      
      setSignDetails({
        keyLength: keyBytes * 8,
        stringToSign: signInputFormat === 'ASCII' ? signData : cleanHex(signData),
        stringLength: signInputFormat === 'ASCII' ? signData.length : cleanHex(signData).length / 2,
        digestType: signHash,
        digestLength: hashLengths[signHash] || 32,
        hashValue: hashHex.toUpperCase(),
      });
      
      setSignature(sigHex);
    } catch (err) {
      setSignDetails(null);
      setError((t.rsa?.errorSign || 'Signing failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 验证签名 (使用 node-forge 实现 PKCS#1 v1.5 验证)
  const handleVerify = async () => {
    setError('');
    setVerifyResult(null);
    
    // 检查密钥参数
    if (!modulus || !publicExponent) {
      setError(t.rsa?.errorNoPublicKey || 'Please generate or import a public key first');
      return;
    }

    if (!verifyData.trim()) {
      setError(verifyInputType === 'Hash' 
        ? 'Hash value is required'
        : (t.rsa?.errorDataRequired || 'Data is required'));
      return;
    }

    const cleanSig = cleanHex(verifySignature);
    if (!cleanSig || !isValidHex(cleanSig)) {
      setError(t.rsa?.errorInvalidSignature || 'Invalid signature (must be hexadecimal)');
      return;
    }

    let expectedHashHex: string;

    if (verifyInputType === 'Hash') {
      // 直接使用输入的哈希值
      const inputHash = cleanHex(verifyData);
      if (!isValidHex(inputHash)) {
        setError('Invalid hash value (must be hexadecimal)');
        return;
      }
      expectedHashHex = inputHash.toUpperCase();
    } else {
      // 计算数据的哈希
      let dataBytes: string;
      if (verifyInputFormat === 'ASCII') {
        dataBytes = verifyData;
      } else {
        const cleanData = cleanHex(verifyData);
        if (!isValidHex(cleanData)) {
          setError(t.rsa?.errorInvalidData || 'Invalid data (must be hexadecimal)');
          return;
        }
        dataBytes = hexToForgeBytes(cleanData);
      }

      // 选择哈希算法
      let md: forge.md.MessageDigest;
      switch (verifyHash) {
        case 'SHA-1':
          md = forge.md.sha1.create();
          break;
        case 'SHA-256':
          md = forge.md.sha256.create();
          break;
        case 'SHA-384':
          md = forge.md.sha384.create();
          break;
        case 'SHA-512':
          md = forge.md.sha512.create();
          break;
        default:
          md = forge.md.sha256.create();
      }
      
      md.update(dataBytes);
      expectedHashHex = forgeBytesToHex(md.digest().bytes()).toUpperCase();
    }

    try {
      // 使用公钥解密签名: M = S^e mod n
      const n = new forge.jsbn.BigInteger(cleanHex(modulus), 16);
      const e = new forge.jsbn.BigInteger(cleanHex(publicExponent), 16);
      const sigBI = new forge.jsbn.BigInteger(cleanSig, 16);
      const decryptedBI = sigBI.modPow(e, n);
      let decryptedHex = decryptedBI.toString(16).toUpperCase().padStart(cleanHex(modulus).length, '0');
      
      // 验证 PKCS#1 v1.5 格式: 00 01 [FF...] 00 [DigestInfo]
      if (!decryptedHex.startsWith('0001')) {
        setVerifyResult(false);
        return;
      }
      
      // 跳过 FF 填充，找到 00 分隔符
      // 格式: 00 01 FF FF ... FF 00 [DigestInfo]
      let i = 4; // 跳过 "0001"
      // 跳过所有 FF
      while (i < decryptedHex.length - 2 && decryptedHex.substring(i, i + 2) === 'FF') {
        i += 2;
      }
      
      // 下一个应该是 00
      if (decryptedHex.substring(i, i + 2) !== '00') {
        setVerifyResult(false);
        return;
      }
      
      // 提取 DigestInfo (00 之后的部分)
      const digestInfoHex = decryptedHex.substring(i + 2);
      
      // 从 DigestInfo 中提取哈希值（跳过算法标识）
      // 哈希值在 DigestInfo 的末尾
      let hashLen: number;
      switch (verifyHash) {
        case 'SHA-1': hashLen = 40; break;    // 20 bytes = 40 hex
        case 'SHA-256': hashLen = 64; break;  // 32 bytes = 64 hex
        case 'SHA-384': hashLen = 96; break;  // 48 bytes = 96 hex
        case 'SHA-512': hashLen = 128; break; // 64 bytes = 128 hex
        default: hashLen = 64;
      }
      
      const extractedHashHex = digestInfoHex.substring(digestInfoHex.length - hashLen);
      
      // 比较哈希值
      setVerifyResult(extractedHashHex.toUpperCase() === expectedHashHex.toUpperCase());
    } catch (err) {
      setError((t.rsa?.errorVerify || 'Verification failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
      setVerifyResult(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success(t.common.copied);
  };

  // 清除密钥
  const clearKeys = () => {
    setModulus('');
    setPublicExponent('010001');
    setPrivateExponent('');
    setEncryptData('');
    setEncryptResult('');
    setDecryptData('');
    setDecryptResult('');
    setSignData('');
    setSignature('');
    setVerifyData('');
    setVerifySignature('');
    setVerifyResult(null);
    setError('');
    message.success(t.rsa?.keysCleared || 'Keys cleared');
  };

  // 获取字节长度
  const getByteLength = (hex: string): number => {
    const clean = cleanHex(hex);
    return isValidHex(clean) ? clean.length / 2 : 0;
  };

  // OAEP MGF1 (Mask Generation Function)
  const mgf1 = (seed: Uint8Array, length: number, hashAlgo: string): Uint8Array => {
    const hashLengths: Record<string, number> = {
      'SHA-1': 20,
      'SHA-224': 28,
      'SHA-256': 32,
      'SHA-384': 48,
      'SHA-512': 64,
    };
    const hLen = hashLengths[hashAlgo] || 32;
    const mask = new Uint8Array(length);
    let counter = 0;
    let offset = 0;
    
    while (offset < length) {
      const counterBytes = new Uint8Array(4);
      counterBytes[0] = (counter >> 24) & 0xff;
      counterBytes[1] = (counter >> 16) & 0xff;
      counterBytes[2] = (counter >> 8) & 0xff;
      counterBytes[3] = counter & 0xff;
      
      const input = new Uint8Array(seed.length + 4);
      input.set(seed);
      input.set(counterBytes, seed.length);
      
      // 使用 forge 计算哈希
      let md: forge.md.MessageDigest;
      switch (hashAlgo) {
        case 'SHA-1': md = forge.md.sha1.create(); break;
        case 'SHA-256': md = forge.md.sha256.create(); break;
        case 'SHA-384': md = forge.md.sha384.create(); break;
        case 'SHA-512': md = forge.md.sha512.create(); break;
        default: md = forge.md.sha256.create();
      }
      
      const inputStr = String.fromCharCode(...input);
      md.update(inputStr);
      const hashBytes = md.digest().bytes();
      
      for (let i = 0; i < hLen && offset < length; i++) {
        mask[offset++] = hashBytes.charCodeAt(i);
      }
      counter++;
    }
    return mask;
  };

  // 计算标签哈希
  const computeLabelHash = (label: string, hashAlgo: string): Uint8Array => {
    let md: forge.md.MessageDigest;
    switch (hashAlgo) {
      case 'SHA-1': md = forge.md.sha1.create(); break;
      case 'SHA-256': md = forge.md.sha256.create(); break;
      case 'SHA-384': md = forge.md.sha384.create(); break;
      case 'SHA-512': md = forge.md.sha512.create(); break;
      default: md = forge.md.sha256.create();
    }
    md.update(label);
    const hashBytes = md.digest().bytes();
    const result = new Uint8Array(hashBytes.length);
    for (let i = 0; i < hashBytes.length; i++) {
      result[i] = hashBytes.charCodeAt(i);
    }
    return result;
  };

  // OAEP 编码/解码
  const handleOaep = () => {
    setError('');
    setOaepResult('');
    
    const hashLengths: Record<string, number> = {
      'SHA-1': 20,
      'SHA-224': 28,
      'SHA-256': 32,
      'SHA-384': 48,
      'SHA-512': 64,
    };
    const hLen = hashLengths[oaepHash] || 32;
    const k = oaepResultLength / 8; // key size in bytes
    
    if (oaepMethod === 'Encode') {
      // OAEP Encode
      const cleanData = cleanHex(oaepData);
      if (!cleanData) {
        setError('Data is required');
        return;
      }
      if (!isValidHex(cleanData)) {
        setError('Invalid data (must be hexadecimal)');
        return;
      }
      
      const mLen = cleanData.length / 2;
      const maxLen = k - 2 * hLen - 2;
      
      if (mLen > maxLen) {
        setError(`Message too long. Max: ${maxLen} bytes, Got: ${mLen} bytes`);
        return;
      }
      
      // Convert data to bytes
      const M = new Uint8Array(mLen);
      for (let i = 0; i < mLen; i++) {
        M[i] = parseInt(cleanData.substr(i * 2, 2), 16);
      }
      
      // lHash = Hash(L)
      const lHash = computeLabelHash(oaepLabel, oaepHash);
      
      // PS = zero padding
      const psLen = k - mLen - 2 * hLen - 2;
      const PS = new Uint8Array(psLen);
      
      // DB = lHash || PS || 0x01 || M
      const DB = new Uint8Array(k - hLen - 1);
      DB.set(lHash);
      DB.set(PS, hLen);
      DB[hLen + psLen] = 0x01;
      DB.set(M, hLen + psLen + 1);
      
      // Generate random seed
      const seed = new Uint8Array(hLen);
      crypto.getRandomValues(seed);
      
      // dbMask = MGF(seed, k - hLen - 1)
      const dbMask = mgf1(seed, k - hLen - 1, oaepHash);
      
      // maskedDB = DB XOR dbMask
      const maskedDB = new Uint8Array(DB.length);
      for (let i = 0; i < DB.length; i++) {
        maskedDB[i] = DB[i] ^ dbMask[i];
      }
      
      // seedMask = MGF(maskedDB, hLen)
      const seedMask = mgf1(maskedDB, hLen, oaepHash);
      
      // maskedSeed = seed XOR seedMask
      const maskedSeed = new Uint8Array(hLen);
      for (let i = 0; i < hLen; i++) {
        maskedSeed[i] = seed[i] ^ seedMask[i];
      }
      
      // EM = 0x00 || maskedSeed || maskedDB
      const EM = new Uint8Array(k);
      EM[0] = 0x00;
      EM.set(maskedSeed, 1);
      EM.set(maskedDB, 1 + hLen);
      
      // Convert to hex
      let result = '';
      for (let i = 0; i < EM.length; i++) {
        result += EM[i].toString(16).padStart(2, '0').toUpperCase();
      }
      setOaepResult(result);
      
    } else {
      // OAEP Decode
      const cleanData = cleanHex(oaepData);
      if (!cleanData) {
        setError('Encoded data is required');
        return;
      }
      if (!isValidHex(cleanData)) {
        setError('Invalid data (must be hexadecimal)');
        return;
      }
      
      if (cleanData.length / 2 !== k) {
        setError(`Encoded message length must be ${k} bytes, got ${cleanData.length / 2} bytes`);
        return;
      }
      
      // Convert to bytes
      const EM = new Uint8Array(k);
      for (let i = 0; i < k; i++) {
        EM[i] = parseInt(cleanData.substr(i * 2, 2), 16);
      }
      
      // Check first byte
      if (EM[0] !== 0x00) {
        setError('Decoding error: first byte is not 0x00');
        return;
      }
      
      // Extract maskedSeed and maskedDB
      const maskedSeed = EM.slice(1, 1 + hLen);
      const maskedDB = EM.slice(1 + hLen);
      
      // seedMask = MGF(maskedDB, hLen)
      const seedMask = mgf1(maskedDB, hLen, oaepHash);
      
      // seed = maskedSeed XOR seedMask
      const seed = new Uint8Array(hLen);
      for (let i = 0; i < hLen; i++) {
        seed[i] = maskedSeed[i] ^ seedMask[i];
      }
      
      // dbMask = MGF(seed, k - hLen - 1)
      const dbMask = mgf1(seed, k - hLen - 1, oaepHash);
      
      // DB = maskedDB XOR dbMask
      const DB = new Uint8Array(maskedDB.length);
      for (let i = 0; i < maskedDB.length; i++) {
        DB[i] = maskedDB[i] ^ dbMask[i];
      }
      
      // lHash' = Hash(L)
      const lHash = computeLabelHash(oaepLabel, oaepHash);
      
      // Verify lHash
      for (let i = 0; i < hLen; i++) {
        if (DB[i] !== lHash[i]) {
          setError('Decoding error: label hash mismatch');
          return;
        }
      }
      
      // Find 0x01 separator
      let separatorIndex = -1;
      for (let i = hLen; i < DB.length; i++) {
        if (DB[i] === 0x01) {
          separatorIndex = i;
          break;
        } else if (DB[i] !== 0x00) {
          setError('Decoding error: invalid padding');
          return;
        }
      }
      
      if (separatorIndex === -1) {
        setError('Decoding error: separator not found');
        return;
      }
      
      // Extract message
      const M = DB.slice(separatorIndex + 1);
      let result = '';
      for (let i = 0; i < M.length; i++) {
        result += M[i].toString(16).padStart(2, '0').toUpperCase();
      }
      setOaepResult(result);
    }
  };

  // Tab 内容
  const tabItems = [
    {
      key: 'keys',
      label: (
        <span><KeyOutlined /> {t.rsa?.tabKeys || 'Keys'}</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Modulus */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Modulus (n):</Text>
              <Text style={{ fontSize: '12px', color: getByteLength(modulus) > 0 ? '#52c41a' : '#999' }}>
                [{getByteLength(modulus)}]
              </Text>
            </div>
            <TextArea
              value={modulus}
              onChange={e => setModulus(e.target.value)}
              placeholder={t.rsa?.modulusPlaceholder || 'RSA modulus in hexadecimal'}
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}
            />
          </div>

          {/* Public Exponent */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Public Exp. (e):</Text>
              <Text style={{ fontSize: '12px', color: getByteLength(publicExponent) > 0 ? '#52c41a' : '#999' }}>
                [{getByteLength(publicExponent)}]
              </Text>
            </div>
            <Input
              value={publicExponent}
              onChange={e => setPublicExponent(e.target.value)}
              placeholder="010001"
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Private Exponent */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Private Exp. (d):</Text>
              <Text style={{ fontSize: '12px', color: getByteLength(privateExponent) > 0 ? '#52c41a' : '#999' }}>
                [{getByteLength(privateExponent)}]
              </Text>
            </div>
            <TextArea
              value={privateExponent}
              onChange={e => setPrivateExponent(e.target.value)}
              placeholder={t.rsa?.privateExpPlaceholder || 'RSA private exponent in hexadecimal'}
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '12px' }}
            />
          </div>

          {/* Key Length */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.keyLength || 'Key Length'}:
            </Text>
            <Select
              value={keyLength}
              onChange={setKeyLength}
              style={{ width: '100%' }}
              options={[
                { label: '1024 bits', value: 1024 },
                { label: '2048 bits', value: 2048 },
                { label: '3072 bits', value: 3072 },
                { label: '4096 bits', value: 4096 },
              ]}
            />
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
              {t.rsa?.generateKeys || 'Generate Keys'}
            </Button>
            <Button 
              icon={<KeyOutlined />}
              onClick={importKeys}
              size="large"
            >
              {t.rsa?.importKeys || 'Import Keys'}
            </Button>
            <Button 
              icon={<ClearOutlined />}
              onClick={clearKeys}
              danger
              size="large"
            >
              {t.rsa?.clearKeys || 'Clear'}
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: 'encrypt',
      label: (
        <span><LockOutlined /> {t.rsa?.tabEncrypt || 'Encrypt'}</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Data 输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.rsa?.data || 'Data'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                [{inputFormat === 'Hex' ? getByteLength(encryptData) : encryptData.length}]
              </Text>
            </div>
            <TextArea
              value={encryptData}
              onChange={e => setEncryptData(e.target.value)}
              placeholder={inputFormat === 'ASCII' 
                ? (t.rsa?.dataPlaceholderAscii || 'Enter text data') 
                : (t.rsa?.dataPlaceholder || 'Enter hexadecimal data')}
              autoSize={{ minRows: 8, maxRows: 12 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* 选项区域 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Encoding method */}
            <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.rsa?.encodingMethod || 'Encoding method'}:
              </Text>
              <Radio.Group value={encodingMethod} onChange={e => setEncodingMethod(e.target.value)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Radio value="Private">{t.rsa?.private || 'Private'}</Radio>
                  <Radio value="Public">{t.rsa?.public || 'Public'}</Radio>
                </div>
              </Radio.Group>
            </div>

            {/* Input data format */}
            <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.rsa?.inputDataFormat || 'Input data format'}:
              </Text>
              <Radio.Group value={inputFormat} onChange={e => setInputFormat(e.target.value)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Radio value="ASCII">ASCII</Radio>
                  <Radio value="Hex">{t.rsa?.hexadecimal || 'Hexadecimal'}</Radio>
                </div>
              </Radio.Group>
            </div>
          </div>

          {/* Padding method */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.paddingMethod || 'Padding method'}:
            </Text>
            <Radio.Group value={encPadding} onChange={e => setEncPadding(e.target.value)}>
              <Radio value="PKCS1">PKCS1</Radio>
              <Radio value="NoPadding">{t.rsa?.noPadding || 'No Padding'}</Radio>
            </Radio.Group>
          </div>

          {/* 加密按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button type="primary" icon={<LockOutlined />} onClick={handleEncrypt} size="large">
              {t.rsa?.encrypt || 'Encrypt'}
            </Button>
          </div>

          {encryptResult && encryptDetails && (
            <div style={{ background: 'linear-gradient(135deg, #fafcff 0%, #fff 100%)', padding: 20, borderRadius: 8, border: '1px solid #e6f0ff', boxShadow: '0 2px 8px rgba(22, 119, 255, 0.05)' }}>
              {/* 标题 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '2px solid #1677ff'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <LockOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15, color: '#1677ff' }}>
                    RSA: {t.rsa?.encryptionFinished || 'Data encryption operation finished'}
                  </Text>
                </div>
                <Button type="primary" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(encryptResult)}>
                  {t.rsa?.copyResult || 'Copy Result'}
                </Button>
              </div>
              
              {/* 详细信息 - 使用表格布局 */}
              <div style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                fontSize: '12px',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top', width: '180px' }}>Key length:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{encryptDetails.keyLength}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Encryption method:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{encryptDetails.method}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Padding Method:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{encryptDetails.padding}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Original data:</td>
                      <td style={{ padding: '6px 0', wordBreak: 'break-all' }}>{encryptDetails.originalData}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Public modulus [n]:</td>
                      <td style={{ padding: '6px 0', wordBreak: 'break-all', lineHeight: '1.6' }}>{encryptDetails.modulus}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Public exponent [e]:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{encryptDetails.publicExp}</td>
                    </tr>
                    {encryptDetails.privateExp && (
                      <tr>
                        <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Private exponent [d]:</td>
                        <td style={{ padding: '6px 0', wordBreak: 'break-all', lineHeight: '1.6' }}>{encryptDetails.privateExp}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* 分隔线 */}
                <div style={{ 
                  margin: '16px 0', 
                  borderTop: '1px dashed #d9d9d9',
                  position: 'relative'
                }}>
                  <span style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    padding: '0 12px',
                    color: '#1677ff',
                    fontSize: '11px'
                  }}>
                    {t.rsa?.result || 'RESULT'}
                  </span>
                </div>
                
                {/* 加密结果 */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top', width: '180px' }}>Encoded data:</td>
                      <td style={{ 
                        wordBreak: 'break-all', 
                        lineHeight: '1.6',
                        color: '#1677ff', 
                        fontWeight: 600,
                        background: '#e6f4ff',
                        padding: '8px 12px',
                        borderRadius: '4px'
                      }}>
                        {encryptResult}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Encoded data length:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{encryptDetails.resultLength} bytes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'decrypt',
      label: (
        <span><UnlockOutlined /> {t.rsa?.tabDecrypt || 'Decrypt'}</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Data 输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.rsa?.data || 'Data'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                [{getByteLength(decryptData)}]
              </Text>
            </div>
            <TextArea
              value={decryptData}
              onChange={e => setDecryptData(e.target.value)}
              placeholder={t.rsa?.ciphertextPlaceholder || 'Enter encrypted hexadecimal data'}
              autoSize={{ minRows: 8, maxRows: 12 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Decoding method */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.decodingMethod || 'Decoding method'}:
            </Text>
            <Radio.Group value={decodingMethod} onChange={e => setDecodingMethod(e.target.value)}>
              <Radio value="Private">{t.rsa?.private || 'Private'}</Radio>
              <Radio value="Public">{t.rsa?.public || 'Public'}</Radio>
            </Radio.Group>
          </div>

          {/* Padding method */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.paddingMethod || 'Padding method'}:
            </Text>
            <Radio.Group value={decPadding} onChange={e => setDecPadding(e.target.value)}>
              <Radio value="PKCS1">PKCS1</Radio>
              <Radio value="NoPadding">{t.rsa?.noPadding || 'No Padding'}</Radio>
            </Radio.Group>
          </div>

          {/* 解密按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button type="primary" icon={<UnlockOutlined />} onClick={handleDecrypt} size="large">
              {t.rsa?.decrypt || 'Decrypt'}
            </Button>
          </div>

          {decryptResult && decryptDetails && (
            <div style={{ background: 'linear-gradient(135deg, #fafcff 0%, #fff 100%)', padding: 20, borderRadius: 8, border: '1px solid #e6f0ff', boxShadow: '0 2px 8px rgba(22, 119, 255, 0.05)' }}>
              {/* 标题 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: '2px solid #52c41a'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UnlockOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                  <Text strong style={{ fontSize: 15, color: '#52c41a' }}>
                    RSA: {t.rsa?.decryptionFinished || 'Data decryption operation finished'}
                  </Text>
                </div>
                <Button type="primary" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(decryptResult)} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                  {t.rsa?.copyResult || 'Copy Result'}
                </Button>
              </div>
              
              {/* 详细信息 */}
              <div style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                fontSize: '12px',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top', width: '180px' }}>Key length:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{decryptDetails.keyLength}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Decryption method:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{decryptDetails.method}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Padding Method:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{decryptDetails.padding}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Cipher data:</td>
                      <td style={{ padding: '6px 0', wordBreak: 'break-all', lineHeight: '1.6' }}>{decryptDetails.cipherData}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Public modulus [n]:</td>
                      <td style={{ padding: '6px 0', wordBreak: 'break-all', lineHeight: '1.6' }}>{decryptDetails.modulus}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Public exponent [e]:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{decryptDetails.publicExp}</td>
                    </tr>
                    {decryptDetails.privateExp && (
                      <tr>
                        <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Private exponent [d]:</td>
                        <td style={{ padding: '6px 0', wordBreak: 'break-all', lineHeight: '1.6' }}>{decryptDetails.privateExp}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {/* 分隔线 */}
                <div style={{ 
                  margin: '16px 0', 
                  borderTop: '1px dashed #d9d9d9',
                  position: 'relative'
                }}>
                  <span style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    padding: '0 12px',
                    color: '#1677ff',
                    fontSize: '11px'
                  }}>
                    {t.rsa?.result || 'RESULT'}
                  </span>
                </div>
                
                {/* 解密结果 */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top', width: '180px' }}>Decoded data:</td>
                      <td style={{ 
                        wordBreak: 'break-all', 
                        lineHeight: '1.6',
                        color: '#52c41a', 
                        fontWeight: 600,
                        background: '#f6ffed',
                        padding: '8px 12px',
                        borderRadius: '4px'
                      }}>
                        {decryptResult}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 12px 6px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Decoded data length:</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{decryptDetails.resultLength} bytes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'sign',
      label: (
        <span><EditOutlined /> {t.rsa?.tabSign || 'Sign'}</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Data 输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>{t.rsa?.data || 'Data'}:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                [{signInputFormat === 'Hex' ? getByteLength(signData) : signData.length}]
              </Text>
            </div>
            <TextArea
              value={signData}
              onChange={e => setSignData(e.target.value)}
              placeholder={signInputFormat === 'ASCII' 
                ? (t.rsa?.dataPlaceholderAscii || 'Enter text data') 
                : (t.rsa?.dataPlaceholder || 'Enter hexadecimal data')}
              autoSize={{ minRows: 8, maxRows: 12 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Input data format */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.inputDataFormat || 'Input data format'}:
            </Text>
            <Radio.Group value={signInputFormat} onChange={e => setSignInputFormat(e.target.value)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Radio value="ASCII">ASCII</Radio>
                <Radio value="Hex">{t.rsa?.hexadecimal || 'Hexadecimal'}</Radio>
              </div>
            </Radio.Group>
          </div>

          {/* Hash Algorithm */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.hashAlgorithm || 'Hash Algorithm'}:
            </Text>
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
              {t.rsa?.sign || 'Sign'}
            </Button>
          </div>

          {signature && signDetails && (
            <div style={{ background: 'linear-gradient(135deg, #fafcff 0%, #fff 100%)', padding: 16, borderRadius: 8, border: '1px solid #e6f0ff', boxShadow: '0 2px 8px rgba(22, 119, 255, 0.05)' }}>
              {/* 标题行 */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '1px solid #e1e4e8'
              }}>
                <Text strong style={{ color: '#52c41a' }}>
                  RSA: Data signing operation finished
                </Text>
                <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(signature)}>
                  {t.common.copy}
                </Button>
              </div>
              
              {/* 签名详情 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap', width: '180px' }}>Key length:</td>
                    <td style={{ padding: '4px 0' }}>{signDetails.keyLength}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>String to sign:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>{signDetails.stringToSign}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>String to sign length:</td>
                    <td style={{ padding: '4px 0' }}>{signDetails.stringLength}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>Message digest type:</td>
                    <td style={{ padding: '4px 0' }}>{signDetails.digestType}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>Message digest length:</td>
                    <td style={{ padding: '4px 0' }}>{signDetails.digestLength}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>Public modulus [n]:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>{cleanHex(modulus).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>Public exponent [e]:</td>
                    <td style={{ padding: '4px 0' }}>{cleanHex(publicExponent).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>Private exponent [d]:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>{cleanHex(privateExponent).toUpperCase()}</td>
                  </tr>
                </tbody>
              </table>
              
              {/* 分隔线 */}
              <div style={{ borderTop: '1px dashed #d9d9d9', margin: '12px 0', position: 'relative' }}>
                <span style={{ 
                  position: 'absolute', 
                  top: '-10px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  background: '#fff',
                  padding: '0 12px',
                  color: '#1677ff',
                  fontSize: '11px'
                }}>
                  {t.rsa?.result || 'RESULT'}
                </span>
              </div>
              
              {/* 签名结果 */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap', width: '180px' }}>String to {signDetails.digestType} hash:</td>
                    <td style={{ padding: '4px 0', wordBreak: 'break-all' }}>{signDetails.hashValue}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap', verticalAlign: 'top' }}>Message Signature:</td>
                    <td style={{ 
                      padding: '8px 12px',
                      wordBreak: 'break-all',
                      background: '#f6ffed',
                      color: '#52c41a',
                      fontWeight: 600,
                      borderRadius: '4px'
                    }}>
                      {signature}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 12px 4px 0', color: '#666', whiteSpace: 'nowrap' }}>Msg. Signature length:</td>
                    <td style={{ padding: '4px 0' }}>{signature.length / 2}</td>
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
        <span><CheckCircleOutlined /> {t.rsa?.tabVerify || 'Verify'}</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Input type 选择 */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              Input type:
            </Text>
            <Radio.Group value={verifyInputType} onChange={e => setVerifyInputType(e.target.value)}>
              <Radio value="Data">Data (will be hashed)</Radio>
              <Radio value="Hash">Hash (direct comparison)</Radio>
            </Radio.Group>
          </div>

          {/* Data/Hash 输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>
                {verifyInputType === 'Hash' 
                  ? 'Hash to Verify'
                  : (t.rsa?.dataToVerify || 'Data to Verify')}:
              </Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                [{verifyInputType === 'Hash' 
                  ? getByteLength(verifyData)
                  : (verifyInputFormat === 'Hex' ? getByteLength(verifyData) : verifyData.length)}]
              </Text>
            </div>
            <TextArea
              value={verifyData}
              onChange={e => setVerifyData(e.target.value)}
              placeholder={verifyInputType === 'Hash'
                ? 'Enter hash value in hexadecimal (e.g. SHA-1: 40 hex chars)'
                : (verifyInputFormat === 'ASCII' 
                  ? (t.rsa?.dataPlaceholderAscii || 'Enter text data') 
                  : (t.rsa?.dataPlaceholder || 'Enter hexadecimal data'))}
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Input data format - 仅在 Data 模式下显示 */}
          {verifyInputType === 'Data' && (
            <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.rsa?.inputDataFormat || 'Input data format'}:
              </Text>
              <Radio.Group value={verifyInputFormat} onChange={e => setVerifyInputFormat(e.target.value)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Radio value="ASCII">ASCII</Radio>
                  <Radio value="Hex">{t.rsa?.hexadecimal || 'Hexadecimal'}</Radio>
                </div>
              </Radio.Group>
            </div>
          )}

          {/* Hash Algorithm */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.hashAlgorithm || 'Hash Algorithm'}:
            </Text>
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
            {verifyInputType === 'Hash' && (
              <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: '12px' }}>
                Select the algorithm used when signing to extract correct hash length
              </Text>
            )}
          </div>

          {/* Signature 输入 */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              {t.rsa?.signatureToVerify || 'Signature'} (Hex):
            </Text>
            <TextArea
              value={verifySignature}
              onChange={e => setVerifySignature(e.target.value)}
              placeholder={t.rsa?.signaturePlaceholder || 'Enter signature in hexadecimal'}
              autoSize={{ minRows: 3, maxRows: 6 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleVerify} size="large">
              {t.rsa?.verify || 'Verify'}
            </Button>
          </div>

          {verifyResult !== null && (
            <div style={{ 
              background: verifyResult ? '#f6ffed' : '#fff2f0', 
              padding: 16, 
              borderRadius: 8, 
              border: `1px solid ${verifyResult ? '#b7eb8f' : '#ffccc7'}`
            }}>
              <Text strong style={{ color: verifyResult ? '#52c41a' : '#ff4d4f' }}>
                {verifyResult 
                  ? (t.rsa?.signatureValid || '✓ Signature is valid')
                  : (t.rsa?.signatureInvalid || '✗ Signature is invalid')
                }
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'oaep',
      label: (
        <span>{t.rsa?.tabOAEP || 'OAEP'}</span>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Alert
            message="OAEP (Optimal Asymmetric Encryption Padding)"
            description={
              <div style={{ marginTop: 8, fontSize: '13px', lineHeight: '1.8' }}>
                <div>• OAEP is a padding scheme used with RSA encryption</div>
                <div>• More secure than PKCS#1 v1.5 padding</div>
                <div>• Prevents chosen-ciphertext attacks</div>
                <div>• Recommended for new applications</div>
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)', border: '1px solid #91caff' }}
          />

          {/* Data 输入 */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong>Data:</Text>
              <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                [{getByteLength(oaepData)}]
              </Text>
            </div>
            <TextArea
              value={oaepData}
              onChange={e => setOaepData(e.target.value)}
              placeholder={oaepMethod === 'Encode' 
                ? 'Enter data to encode (hexadecimal)'
                : 'Enter OAEP encoded data (hexadecimal)'}
              autoSize={{ minRows: 4, maxRows: 8 }}
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', fontSize: '13px' }}
            />
          </div>

          {/* Encoding Parameters */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Encoding Parameters:</Text>
            <Input
              value={oaepLabel}
              onChange={e => setOaepLabel(e.target.value)}
              placeholder="Optional label (empty by default)"
              style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
            />
          </div>

          {/* Method */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Method:</Text>
            <Radio.Group value={oaepMethod} onChange={e => setOaepMethod(e.target.value)}>
              <Radio value="Encode">Encode</Radio>
              <Radio value="Decode">Decode</Radio>
            </Radio.Group>
          </div>

          {/* Result Length */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Text strong>Result Length:</Text>
            <Select
              value={oaepResultLength}
              onChange={setOaepResultLength}
              style={{ width: 120 }}
              options={[
                { label: '1024', value: 1024 },
                { label: '2048', value: 2048 },
                { label: '3072', value: 3072 },
                { label: '4096', value: 4096 },
              ]}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>bits</Text>
          </div>

          {/* Hash Function */}
          <div style={{ background: 'linear-gradient(135deg, #f0f5ff 0%, #fff 100%)', padding: 12, borderRadius: 8, border: '1px solid #e6f0ff' }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Hash Function:</Text>
            <Radio.Group value={oaepHash} onChange={e => setOaepHash(e.target.value)}>
              <Radio value="SHA-1">SHA-1</Radio>
              <Radio value="SHA-224">SHA-224</Radio>
              <Radio value="SHA-256">SHA-256</Radio>
              <Radio value="SHA-384">SHA-384</Radio>
              <Radio value="SHA-512">SHA-512</Radio>
            </Radio.Group>
          </div>

          {/* 执行按钮 */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 4 }}>
            <Button 
              type="primary" 
              icon={oaepMethod === 'Encode' ? <LockOutlined /> : <UnlockOutlined />} 
              onClick={handleOaep}
              size="large"
            >
              {oaepMethod === 'Encode' ? 'Encode' : 'Decode'}
            </Button>
          </div>

          {/* 结果显示 */}
          {oaepResult && (
            <div style={{ 
              background: 'linear-gradient(135deg, #f6ffed 0%, #fff 100%)', 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid #b7eb8f',
              boxShadow: '0 2px 8px rgba(82, 196, 26, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: '#389e0d' }}>
                  {oaepMethod === 'Encode' ? '✓ Encoded Message (EM):' : '✓ Decoded Message:'}
                </Text>
                <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyToClipboard(oaepResult)}>
                  {t.common.copy}
                </Button>
              </div>
              <div style={{ 
                fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                fontSize: '13px',
                wordBreak: 'break-all',
                background: '#fff',
                padding: '12px',
                borderRadius: '4px',
                color: '#52c41a',
                fontWeight: 600,
                border: '1px solid #d9f7be'
              }}>
                {oaepResult}
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Length: {oaepResult.length / 2} bytes ({oaepResult.length * 4} bits)
                </Text>
              </div>
            </div>
          )}

          {/* 说明信息 - 可折叠 */}
          <details style={{ 
            border: '1px solid #e8e8e8', 
            borderRadius: 8, 
            padding: '12px 16px',
            background: 'linear-gradient(to bottom, #fafafa, #fff)'
          }}>
            <summary style={{ 
              cursor: 'pointer', 
              fontWeight: 500, 
              color: '#1677ff',
              fontSize: '14px',
              outline: 'none'
            }}>
              📖 OAEP Structure & Reference
            </summary>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #e8e8e8' }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: '#333', fontSize: '13px' }}>Structure:</Text>
                <div style={{ 
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace', 
                  fontSize: '12px', 
                  lineHeight: '1.6',
                  color: '#666',
                  marginTop: 4
                }}>
                  <div>EM = 0x00 || maskedSeed || maskedDB</div>
                  <div style={{ marginLeft: 16, marginTop: 4 }}>
                    • maskedDB = DB ⊕ MGF(seed)<br/>
                    • maskedSeed = seed ⊕ MGF(maskedDB)<br/>
                    • DB = lHash || PS || 0x01 || M
                  </div>
                </div>
              </div>
              <div>
                <Text strong style={{ color: '#333', fontSize: '13px' }}>Max Data Size (k = key bytes):</Text>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: 4,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '4px 16px'
                }}>
                  <span>SHA-1: k - 42 bytes</span>
                  <span>SHA-224: k - 58 bytes</span>
                  <span>SHA-256: k - 66 bytes</span>
                  <span>SHA-384: k - 98 bytes</span>
                  <span>SHA-512: k - 130 bytes</span>
                </div>
              </div>
            </div>
          </details>
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Title level={4} style={{ marginTop: 0, fontSize: '18px' }}>
          {t.rsa?.title || 'RSA Encryption/Decryption'}
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {t.rsa?.description || 'RSA asymmetric encryption, decryption, signing and verification'}
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

export default RSATool;

