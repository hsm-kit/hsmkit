import React, { useState } from 'react';
import { Card, Button, Segmented, message, Divider, Typography, Input, Select, Radio, Checkbox } from 'antd';
import { LockOutlined, UnlockOutlined, CopyOutlined } from '@ant-design/icons';
import { CollapsibleInfo } from '../common';
import { useLanguage } from '../../hooks/useLanguage';
import { useTheme } from '../../hooks/useTheme';
import CryptoJS from 'crypto-js';

const { Title, Text } = Typography;
const { TextArea } = Input;

type FPEAlgorithm = 'FF1' | 'FF3' | 'FF3-1';
type AESKeyLength = 'AES-128' | 'AES-192' | 'AES-256';
type InputType = 'ASCII' | 'Hex';

// AES Block cipher for FPE
const aesEncryptBlock = (key: CryptoJS.lib.WordArray, data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  return CryptoJS.AES.encrypt(data, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.NoPadding
  }).ciphertext;
};

// PRF function using AES-CBC-MAC
const prf = (key: CryptoJS.lib.WordArray, data: Uint8Array): Uint8Array => {
  // Pad to 16-byte boundary
  const paddedLength = Math.ceil(data.length / 16) * 16;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  
  let state = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
  
  for (let i = 0; i < paddedLength; i += 16) {
    const block = CryptoJS.lib.WordArray.create(
      Array.from(padded.slice(i, i + 16))
    );
    // XOR state with block
    const xored = CryptoJS.lib.WordArray.create(
      state.words.map((w, idx) => w ^ (block.words[idx] || 0)),
      16
    );
    state = aesEncryptBlock(key, xored);
  }
  
  const result = new Uint8Array(16);
  const hexStr = state.toString();
  for (let i = 0; i < 16; i++) {
    result[i] = parseInt(hexStr.substr(i * 2, 2), 16);
  }
  return result;
};

// Convert number to numeral string with given radix
const numToStr = (num: bigint, radix: number, length: number): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  let n = num;
  while (n > 0n || result.length < length) {
    result = chars[Number(n % BigInt(radix))] + result;
    n = n / BigInt(radix);
  }
  return result.slice(-length);
};

// Convert numeral string to number
const strToNum = (str: string, radix: number): bigint => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = 0n;
  for (let i = 0; i < str.length; i++) {
    const charIndex = chars.indexOf(str[i]);
    if (charIndex === -1 || charIndex >= radix) {
      throw new Error(`Invalid character '${str[i]}' for radix ${radix}`);
    }
    result = result * BigInt(radix) + BigInt(charIndex);
  }
  return result;
};

// FF1 Algorithm implementation
const ff1Encrypt = (
  key: Uint8Array,
  tweak: Uint8Array,
  plaintext: string,
  radix: number
): string => {
  const n = plaintext.length;
  const u = Math.floor(n / 2);
  const v = n - u;
  
  let A = plaintext.slice(0, u);
  let B = plaintext.slice(u);
  
  const b = Math.ceil(Math.ceil(v * Math.log2(radix)) / 8);
  const d = 4 * Math.ceil(b / 4) + 4;
  
  // P construction
  const P = new Uint8Array(16);
  P[0] = 1; // vers
  P[1] = 2; // method
  P[2] = 1; // addition
  P[3] = radix >> 8;
  P[4] = radix & 0xff;
  P[5] = 10; // rounds
  P[6] = (u >> 8) & 0xff;
  P[7] = u & 0xff;
  P[8] = (n >> 24) & 0xff;
  P[9] = (n >> 16) & 0xff;
  P[10] = (n >> 8) & 0xff;
  P[11] = n & 0xff;
  P[12] = (tweak.length >> 24) & 0xff;
  P[13] = (tweak.length >> 16) & 0xff;
  P[14] = (tweak.length >> 8) & 0xff;
  P[15] = tweak.length & 0xff;
  
  const keyWA = CryptoJS.lib.WordArray.create(Array.from(key) as unknown as number[]);
  
  for (let i = 0; i < 10; i++) {
    // Q construction
    const qLen = Math.ceil((tweak.length + 1 + b + 1) / 16) * 16;
    const Q = new Uint8Array(qLen);
    Q.set(tweak);
    Q[tweak.length] = i;
    
    // NUMradix(B)
    const numB = strToNum(B, radix);
    const numBBytes = new Uint8Array(b);
    let temp = numB;
    for (let j = b - 1; j >= 0; j--) {
      numBBytes[j] = Number(temp & 0xffn);
      temp = temp >> 8n;
    }
    Q.set(numBBytes, qLen - b);
    
    // R = PRF(K, P || Q)
    const PQ = new Uint8Array(P.length + Q.length);
    PQ.set(P);
    PQ.set(Q, P.length);
    const R = prf(keyWA, PQ);
    
    // S = R || CIPH(K, R ⊕ [1]16) || ... || CIPH(K, R ⊕ [⌈d/16⌉−1]16)
    const S = new Uint8Array(Math.ceil(d / 16) * 16);
    S.set(R);
    for (let j = 1; j < Math.ceil(d / 16); j++) {
      const rXorJ = new Uint8Array(16);
      rXorJ.set(R);
      rXorJ[15] ^= j;
      const cipher = prf(keyWA, rXorJ);
      S.set(cipher, j * 16);
    }
    
    // y = NUM(S[0..d-1])
    let y = 0n;
    for (let j = 0; j < d; j++) {
      y = (y << 8n) | BigInt(S[j]);
    }
    
    // c = (NUMradix(A) + y) mod radix^m
    const m = (i % 2 === 0) ? u : v;
    const numA = strToNum(A, radix);
    const radixPowM = BigInt(radix) ** BigInt(m);
    const c = (numA + y) % radixPowM;
    
    // C = STRm/radix(c)
    const C = numToStr(c, radix, m);
    
    A = B;
    B = C;
  }
  
  return A + B;
};

// FF1 Decryption
const ff1Decrypt = (
  key: Uint8Array,
  tweak: Uint8Array,
  ciphertext: string,
  radix: number
): string => {
  const n = ciphertext.length;
  const u = Math.floor(n / 2);
  const v = n - u;
  
  let A = ciphertext.slice(0, u);
  let B = ciphertext.slice(u);
  
  const b = Math.ceil(Math.ceil(v * Math.log2(radix)) / 8);
  const d = 4 * Math.ceil(b / 4) + 4;
  
  // P construction
  const P = new Uint8Array(16);
  P[0] = 1;
  P[1] = 2;
  P[2] = 1;
  P[3] = radix >> 8;
  P[4] = radix & 0xff;
  P[5] = 10;
  P[6] = (u >> 8) & 0xff;
  P[7] = u & 0xff;
  P[8] = (n >> 24) & 0xff;
  P[9] = (n >> 16) & 0xff;
  P[10] = (n >> 8) & 0xff;
  P[11] = n & 0xff;
  P[12] = (tweak.length >> 24) & 0xff;
  P[13] = (tweak.length >> 16) & 0xff;
  P[14] = (tweak.length >> 8) & 0xff;
  P[15] = tweak.length & 0xff;
  
  const keyWA = CryptoJS.lib.WordArray.create(Array.from(key) as unknown as number[]);
  
  for (let i = 9; i >= 0; i--) {
    const qLen = Math.ceil((tweak.length + 1 + b + 1) / 16) * 16;
    const Q = new Uint8Array(qLen);
    Q.set(tweak);
    Q[tweak.length] = i;
    
    const numA = strToNum(A, radix);
    const numABytes = new Uint8Array(b);
    let temp = numA;
    for (let j = b - 1; j >= 0; j--) {
      numABytes[j] = Number(temp & 0xffn);
      temp = temp >> 8n;
    }
    Q.set(numABytes, qLen - b);
    
    const PQ = new Uint8Array(P.length + Q.length);
    PQ.set(P);
    PQ.set(Q, P.length);
    const R = prf(keyWA, PQ);
    
    const S = new Uint8Array(Math.ceil(d / 16) * 16);
    S.set(R);
    for (let j = 1; j < Math.ceil(d / 16); j++) {
      const rXorJ = new Uint8Array(16);
      rXorJ.set(R);
      rXorJ[15] ^= j;
      const cipher = prf(keyWA, rXorJ);
      S.set(cipher, j * 16);
    }
    
    let y = 0n;
    for (let j = 0; j < d; j++) {
      y = (y << 8n) | BigInt(S[j]);
    }
    
    const m = (i % 2 === 0) ? u : v;
    const numB = strToNum(B, radix);
    const radixPowM = BigInt(radix) ** BigInt(m);
    let c = (numB - y) % radixPowM;
    if (c < 0n) c += radixPowM;
    
    const C = numToStr(c, radix, m);
    
    B = A;
    A = C;
  }
  
  return A + B;
};

// FF3-1 Algorithm implementation
const ff3Encrypt = (
  key: Uint8Array,
  tweak: Uint8Array,
  plaintext: string,
  radix: number
): string => {
  const n = plaintext.length;
  const u = Math.ceil(n / 2);
  const v = n - u;
  
  // Reverse key for FF3
  const revKey = new Uint8Array(key.length);
  for (let i = 0; i < key.length; i++) {
    revKey[i] = key[key.length - 1 - i];
  }
  
  let A = plaintext.slice(0, u);
  let B = plaintext.slice(u);
  
  const TL = tweak.slice(0, 4);
  const TR = tweak.slice(4, 8);
  
  const keyWA = CryptoJS.lib.WordArray.create(Array.from(revKey) as unknown as number[]);
  
  for (let i = 0; i < 8; i++) {
    const m = (i % 2 === 0) ? u : v;
    const W = (i % 2 === 0) ? TR : TL;
    
    // P = W ⊕ [i]4 || NUMradix(REV(B))
    const P = new Uint8Array(16);
    P[0] = W[0] ^ (i >> 24);
    P[1] = W[1] ^ (i >> 16);
    P[2] = W[2] ^ (i >> 8);
    P[3] = W[3] ^ i;
    
    const revB = B.split('').reverse().join('');
    const numB = strToNum(revB, radix);
    const numBBytes = new Uint8Array(12);
    let temp = numB;
    for (let j = 11; j >= 0; j--) {
      numBBytes[j] = Number(temp & 0xffn);
      temp = temp >> 8n;
    }
    P.set(numBBytes, 4);
    
    // S = REV(CIPH(REV(K), REV(P)))
    const revP = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      revP[j] = P[15 - j];
    }
    
    const cipherWA = aesEncryptBlock(keyWA, CryptoJS.lib.WordArray.create(Array.from(revP) as unknown as number[]));
    const cipherHex = cipherWA.toString();
    const cipher = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      cipher[j] = parseInt(cipherHex.substr(j * 2, 2), 16);
    }
    
    const S = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      S[j] = cipher[15 - j];
    }
    
    // y = NUM(S)
    let y = 0n;
    for (let j = 0; j < 16; j++) {
      y = (y << 8n) | BigInt(S[j]);
    }
    
    // c = (NUMradix(REV(A)) + y) mod radix^m
    const revA = A.split('').reverse().join('');
    const numA = strToNum(revA, radix);
    const radixPowM = BigInt(radix) ** BigInt(m);
    const c = (numA + y) % radixPowM;
    
    // C = REV(STRm/radix(c))
    const C = numToStr(c, radix, m).split('').reverse().join('');
    
    A = B;
    B = C;
  }
  
  return A + B;
};

// FF3-1 Decryption
const ff3Decrypt = (
  key: Uint8Array,
  tweak: Uint8Array,
  ciphertext: string,
  radix: number
): string => {
  const n = ciphertext.length;
  const u = Math.ceil(n / 2);
  const v = n - u;
  
  const revKey = new Uint8Array(key.length);
  for (let i = 0; i < key.length; i++) {
    revKey[i] = key[key.length - 1 - i];
  }
  
  let A = ciphertext.slice(0, u);
  let B = ciphertext.slice(u);
  
  const TL = tweak.slice(0, 4);
  const TR = tweak.slice(4, 8);
  
  const keyWA = CryptoJS.lib.WordArray.create(Array.from(revKey) as unknown as number[]);
  
  for (let i = 7; i >= 0; i--) {
    const m = (i % 2 === 0) ? u : v;
    const W = (i % 2 === 0) ? TR : TL;
    
    const P = new Uint8Array(16);
    P[0] = W[0] ^ (i >> 24);
    P[1] = W[1] ^ (i >> 16);
    P[2] = W[2] ^ (i >> 8);
    P[3] = W[3] ^ i;
    
    const revA = A.split('').reverse().join('');
    const numA = strToNum(revA, radix);
    const numABytes = new Uint8Array(12);
    let temp = numA;
    for (let j = 11; j >= 0; j--) {
      numABytes[j] = Number(temp & 0xffn);
      temp = temp >> 8n;
    }
    P.set(numABytes, 4);
    
    const revP = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      revP[j] = P[15 - j];
    }
    
    const cipherWA = aesEncryptBlock(keyWA, CryptoJS.lib.WordArray.create(Array.from(revP) as unknown as number[]));
    const cipherHex = cipherWA.toString();
    const cipher = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      cipher[j] = parseInt(cipherHex.substr(j * 2, 2), 16);
    }
    
    const S = new Uint8Array(16);
    for (let j = 0; j < 16; j++) {
      S[j] = cipher[15 - j];
    }
    
    let y = 0n;
    for (let j = 0; j < 16; j++) {
      y = (y << 8n) | BigInt(S[j]);
    }
    
    const revB = B.split('').reverse().join('');
    const numB = strToNum(revB, radix);
    const radixPowM = BigInt(radix) ** BigInt(m);
    let c = (numB - y) % radixPowM;
    if (c < 0n) c += radixPowM;
    
    const C = numToStr(c, radix, m).split('').reverse().join('');
    
    B = A;
    A = C;
  }
  
  return A + B;
};

const FPETool: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [algorithm, setAlgorithm] = useState<FPEAlgorithm>('FF1');
  const [keyLength, setKeyLength] = useState<AESKeyLength>('AES-128');
  const [inputType, setInputType] = useState<InputType>('Hex');
  const [radix, setRadix] = useState<number>(10);
  const [key, setKey] = useState('');
  const [data, setData] = useState('');
  const [tweak, setTweak] = useState('');
  const [useTweak, setUseTweak] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | null>(null);

  // 清理十六进制输入
  const cleanHex = (hex: string): string => {
    return hex.replace(/[\s\n\r]/g, '').toUpperCase();
  };

  // 验证十六进制
  const isValidHex = (hex: string): boolean => {
    return /^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0;
  };

  // 获取期望的密钥长度（字节数）
  const getExpectedKeyLength = (): number => {
    switch (keyLength) {
      case 'AES-128': return 16;
      case 'AES-192': return 24;
      case 'AES-256': return 32;
      default: return 16;
    }
  };

  // 获取期望的 Tweak 长度（字节数）
  const getExpectedTweakLength = (): number => {
    switch (algorithm) {
      case 'FF1':
        return 0; // FF1 tweak can be any length
      case 'FF3':
      case 'FF3-1':
        return 8; // FF3/FF3-1 uses 8-byte (56-bit effective) tweak
      default:
        return 8;
    }
  };

  // 获取当前 Key 的实际字节数
  const getActualKeyLength = (): number => {
    const clean = cleanHex(key);
    return isValidHex(clean) ? clean.length / 2 : 0;
  };

  // 获取当前 Tweak 的实际字节数
  const getActualTweakLength = (): number => {
    const clean = cleanHex(tweak);
    return isValidHex(clean) ? clean.length / 2 : 0;
  };

  // 获取长度指示器的颜色
  const getLengthColor = (actual: number, expected: number, disabled: boolean = false): string => {
    if (disabled) return '#999';
    if (actual === 0) return '#999';
    if (expected === 0) return '#52c41a'; // 任意长度都可以
    if (actual === expected) return '#52c41a';
    return '#ff4d4f';
  };

  // Hex 字符串转 Uint8Array
  const hexToBytes = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  };

  // 验证数据是否符合指定的基数
  const validateDataForRadix = (text: string, radix: number): boolean => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (const char of text) {
      const idx = chars.indexOf(char);
      if (idx === -1 || idx >= radix) {
        return false;
      }
    }
    return true;
  };

  // 验证输入
  const validateInputs = (): boolean => {
    setError('');

    // 验证密钥
    const cleanKey = cleanHex(key);
    if (!isValidHex(cleanKey)) {
      setError(t.fpe?.errorInvalidKeyHex || 'Key must be valid hexadecimal');
      return false;
    }

    const expectedKeyLen = getExpectedKeyLength();
    if (cleanKey.length / 2 !== expectedKeyLen) {
      setError((t.fpe?.errorKeyLength || 'Key length must be {length} bytes for {algorithm}')
        .replace('{length}', expectedKeyLen.toString())
        .replace('{algorithm}', keyLength));
      return false;
    }

    // 验证数据
    if (!data.trim()) {
      setError(t.fpe?.errorDataRequired || 'Data is required');
      return false;
    }

    // 验证数据长度（FPE要求最少2个字符）
    if (data.length < 2) {
      setError(t.fpe?.errorDataTooShort || 'Data must be at least 2 characters');
      return false;
    }

    // 验证数据是否符合基数
    if (!validateDataForRadix(data, radix)) {
      setError((t.fpe?.errorInvalidDataForRadix || 'Data contains invalid characters for radix {radix}')
        .replace('{radix}', radix.toString()));
      return false;
    }

    // 验证 Tweak
    if (useTweak) {
      const cleanTweak = cleanHex(tweak);
      if (!isValidHex(cleanTweak)) {
        setError(t.fpe?.errorInvalidTweakHex || 'Tweak must be valid hexadecimal');
        return false;
      }

      const expectedTweakLen = getExpectedTweakLength();
      if (expectedTweakLen > 0 && cleanTweak.length / 2 !== expectedTweakLen) {
        setError((t.fpe?.errorTweakLength || 'Tweak length must be {length} bytes for {algorithm}')
          .replace('{length}', expectedTweakLen.toString())
          .replace('{algorithm}', algorithm));
        return false;
      }
    }

    return true;
  };

  // 加密
  const handleEncrypt = () => {
    setResult('');
    setLastOperation(null);
    if (!validateInputs()) return;

    try {
      const cleanKey = cleanHex(key);
      const keyBytes = hexToBytes(cleanKey);
      const tweakBytes = useTweak ? hexToBytes(cleanHex(tweak)) : new Uint8Array(algorithm === 'FF3' || algorithm === 'FF3-1' ? 8 : 0);

      let encrypted: string;

      switch (algorithm) {
        case 'FF1':
          encrypted = ff1Encrypt(keyBytes, tweakBytes, data, radix);
          break;
        case 'FF3':
        case 'FF3-1':
          encrypted = ff3Encrypt(keyBytes, tweakBytes, data, radix);
          break;
        default:
          encrypted = ff1Encrypt(keyBytes, tweakBytes, data, radix);
      }

      setResult(encrypted);
      setLastOperation('encrypt');
    } catch (err) {
      setError((t.fpe?.errorEncryption || 'Encryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 解密
  const handleDecrypt = () => {
    setResult('');
    setLastOperation(null);
    if (!validateInputs()) return;

    try {
      const cleanKey = cleanHex(key);
      const keyBytes = hexToBytes(cleanKey);
      const tweakBytes = useTweak ? hexToBytes(cleanHex(tweak)) : new Uint8Array(algorithm === 'FF3' || algorithm === 'FF3-1' ? 8 : 0);

      let decrypted: string;

      switch (algorithm) {
        case 'FF1':
          decrypted = ff1Decrypt(keyBytes, tweakBytes, data, radix);
          break;
        case 'FF3':
        case 'FF3-1':
          decrypted = ff3Decrypt(keyBytes, tweakBytes, data, radix);
          break;
        default:
          decrypted = ff1Decrypt(keyBytes, tweakBytes, data, radix);
      }

      setResult(decrypted);
      setLastOperation('decrypt');
    } catch (err) {
      setError((t.fpe?.errorDecryption || 'Decryption failed') + ': ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // 复制结果
  const copyResult = () => {
    navigator.clipboard.writeText(result);
    message.success(t.common.copied);
  };


  return (
    <div style={{ animation: 'fadeIn 0.5s', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        <Card  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0, fontSize: '18px' }}>
            {t.fpe?.title || 'Format-Preserving Encryption'}
          </Title>
            <CollapsibleInfo title={t.fpe?.fpeInfo || 'FPE Information'}>
              <div>• {t.fpe?.formatPreserving || 'Format-Preserving: Output has the same format and length as input'}</div>
              <div>• {t.fpe?.radixInfo || `Current radix: ${radix} (valid characters: 0-${radix <= 10 ? radix - 1 : '9, A-' + String.fromCharCode(54 + radix)})`}</div>
              <div>• {t.fpe?.tweakInfo || (algorithm === 'FF1' ? 'FF1: Tweak can be any length' : 'FF3/FF3-1: Tweak must be 8 bytes (56-bit effective)')}</div>
              <div>• {t.fpe?.minLength || 'Minimum data length: 2 characters'}</div>
            </CollapsibleInfo>
          </div>
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {t.fpe?.description || 'Encrypt data while preserving its format and length (NIST SP 800-38G)'}
          </Text>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            {/* 算法选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.fpe?.algorithm || 'Algorithm'}:
              </Text>
              <Segmented
                value={algorithm}
                onChange={(value) => setAlgorithm(value as FPEAlgorithm)}
                options={[
                  { label: 'FPE - FF1', value: 'FF1' },
                  { label: 'FPE - FF3', value: 'FF3' },
                  { label: 'FPE - FF3-1', value: 'FF3-1' },
                ]}
                block
              />
            </div>

            {/* Radix 选择 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.fpe?.radix || 'Radix'}:
                </Text>
                <Select
                  value={radix}
                  onChange={setRadix}
                  style={{ width: '100%' }}
                  options={[
                    { label: '2 (Binary)', value: 2 },
                    { label: '8 (Octal)', value: 8 },
                    { label: '10 (Decimal)', value: 10 },
                    { label: '16 (Hexadecimal)', value: 16 },
                    { label: '26 (Lowercase Letters)', value: 26 },
                    { label: '36 (Alphanumeric)', value: 36 },
                    { label: '62 (Case-sensitive Alphanumeric)', value: 62 },
                  ]}
                />
              </div>

              {/* 加密类型选择 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {t.fpe?.encryptionType || 'Encryption Type'}:
                </Text>
                <Select
                  value={keyLength}
                  onChange={setKeyLength}
                  style={{ width: '100%' }}
                  options={[
                    { label: 'AES-128', value: 'AES-128' },
                    { label: 'AES-192', value: 'AES-192' },
                    { label: 'AES-256', value: 'AES-256' },
                  ]}
                />
              </div>
            </div>

            {/* 输入类型选择 */}
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.fpe?.keyInput || 'Key Input'}:
              </Text>
              <Radio.Group
                value={inputType}
                onChange={(e) => setInputType(e.target.value)}
                style={{ marginBottom: 8 }}
              >
                <Radio value="ASCII">ASCII</Radio>
                <Radio value="Hex">{t.cipher?.hexadecimal || 'Hexadecimal'}</Radio>
              </Radio.Group>
            </div>

            {/* Key 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.cipher?.key || 'Key'}:</Text>
                <Text style={{
                  fontSize: '12px',
                  color: getLengthColor(getActualKeyLength(), getExpectedKeyLength()),
                  fontWeight: getActualKeyLength() > 0 ? 600 : 400
                }}>
                  [{getActualKeyLength() || getExpectedKeyLength()}]
                </Text>
              </div>
              <Input
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder={`${getExpectedKeyLength() * 2} ${t.cipher?.hexChars || 'hex characters'}`}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Data 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong>{t.cipher?.data || 'Data'}:</Text>
                <Text style={{
                  fontSize: '12px',
                  color: data.length >= 2 ? '#52c41a' : (data.length > 0 ? '#ff4d4f' : '#999'),
                  fontWeight: data.length > 0 ? 600 : 400
                }}>
                  [{data.length}]
                </Text>
              </div>
              <TextArea
                value={data}
                onChange={e => setData(e.target.value)}
                placeholder={t.fpe?.dataPlaceholder || `Enter data with radix-${radix} characters (e.g., 0123456789 for decimal)`}
                autoSize={{ minRows: 3, maxRows: 8 }}
                style={{ fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace' }}
              />
            </div>

            {/* Tweak 输入 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text strong style={{ color: useTweak ? undefined : '#999' }}>Tweak:</Text>
                <Text style={{
                  fontSize: '12px',
                  color: getLengthColor(getActualTweakLength(), getExpectedTweakLength(), !useTweak),
                  fontWeight: useTweak && getActualTweakLength() > 0 ? 600 : 400
                }}>
                  [{useTweak ? (getActualTweakLength() || getExpectedTweakLength()) : getExpectedTweakLength()}]
                </Text>
              </div>
              <TextArea
                value={tweak}
                onChange={e => setTweak(e.target.value)}
                placeholder={algorithm === 'FF1'
                  ? (t.fpe?.tweakPlaceholderFF1 || 'Enter tweak in hexadecimal (any length)')
                  : (t.fpe?.tweakPlaceholderFF3 || '16 hex characters (8 bytes)')}
                autoSize={{ minRows: 2, maxRows: 4 }}
                disabled={!useTweak}
                style={{
                  fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
                  backgroundColor: useTweak ? undefined : '#f5f5f5'
                }}
              />
            </div>

            {/* Use Tweak 复选框 */}
            <div>
              <Checkbox
                checked={useTweak}
                onChange={e => setUseTweak(e.target.checked)}
              >
                {t.fpe?.useTweak || 'Use Tweak?'}
              </Checkbox>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 12, paddingLeft: 4 }}>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={handleEncrypt}
                size="large"
              >
                {t.cipher?.encrypt || 'Encrypt'}
              </Button>
              <Button
                type="default"
                icon={<UnlockOutlined />}
                onClick={handleDecrypt}
                size="large"
              >
                {t.cipher?.decrypt || 'Decrypt'}
              </Button>
            </div>
          </div>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Card  style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Text type="danger">{error}</Text>
          </Card>
        )}

        {/* 结果显示 */}
        {result && (
          <Card
            title={
              <span style={{ color: isDark ? '#52c41a' : '#389e0d', fontWeight: 600 }}>
                {lastOperation === 'encrypt' ? <LockOutlined /> : <UnlockOutlined />}
                {' '}
                {lastOperation === 'encrypt'
                  ? (t.cipher?.encryptResult || 'Encrypted Result')
                  : (t.cipher?.decryptResult || 'Decrypted Result')}
              </span>
            }
            
            style={{ 
              background: isDark 
                ? 'linear-gradient(135deg, #162312 0%, #1a2e1a 100%)'
                : 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
              border: isDark ? '1px solid #274916' : '2px solid #95de64',
              boxShadow: isDark 
                ? '0 4px 16px rgba(82, 196, 26, 0.15)' 
                : '0 4px 16px rgba(82, 196, 26, 0.2)',
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
            <div style={{
              background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
              padding: '16px',
              borderRadius: '8px',
              border: isDark ? '1px solid #3c5a24' : '1px solid #b7eb8f',
              wordBreak: 'break-all',
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              fontSize: '14px',
              lineHeight: '1.6',
              color: isDark ? '#95de64' : '#237804',
              fontWeight: 600
            }}>
              {result}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: '12px', color: isDark ? '#a6a6a6' : undefined }}>
                {t.fpe?.resultLength || 'Length'}: {result.length} {t.fpe?.characters || 'characters'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', color: isDark ? '#a6a6a6' : undefined }}>
                {t.fpe?.radix || 'Radix'}: {radix}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px', color: isDark ? '#a6a6a6' : undefined }}>
                {t.fpe?.algorithm || 'Algorithm'}: {algorithm}
              </Text>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FPETool;

