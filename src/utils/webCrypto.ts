/**
 * Web Crypto API 封装
 * 为支持的算法提供硬件加速，不支持的算法回退到 crypto-js
 * 
 * 支持的算法：AES-CBC, AES-CTR, AES-GCM, SHA-1/256/384/512, RSA, ECDSA
 * 不支持（回退）：DES/3DES, MD5
 */

// Check if Web Crypto API is available
const crypto = globalThis.crypto;
const subtle = crypto?.subtle;

/**
 * Convert hex string to ArrayBuffer
 */
export const hexToArrayBuffer = (hex: string): ArrayBuffer => {
  const cleanHex = hex.replace(/\s/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes.buffer;
};

/**
 * Convert ArrayBuffer to hex string
 */
export const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

/**
 * Convert string to ArrayBuffer (UTF-8)
 */
export const stringToArrayBuffer = (str: string): ArrayBuffer => {
  return new TextEncoder().encode(str).buffer;
};

/**
 * Convert ArrayBuffer to string (UTF-8)
 */
export const arrayBufferToString = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

/**
 * Check if Web Crypto API is available
 */
export const isWebCryptoAvailable = (): boolean => {
  return !!(crypto && subtle);
};

/**
 * SHA Hash using Web Crypto API
 * Supports: SHA-1, SHA-256, SHA-384, SHA-512
 */
export const webCryptoHash = async (
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  data: ArrayBuffer | string
): Promise<string> => {
  if (!subtle) {
    throw new Error('Web Crypto API not available');
  }
  
  const dataBuffer = typeof data === 'string' ? stringToArrayBuffer(data) : data;
  const hashBuffer = await subtle.digest(algorithm, dataBuffer);
  return arrayBufferToHex(hashBuffer);
};

/**
 * AES Encryption using Web Crypto API
 * Supports: AES-CBC, AES-CTR, AES-GCM
 */
export const webCryptoAesEncrypt = async (
  mode: 'AES-CBC' | 'AES-CTR' | 'AES-GCM',
  keyHex: string,
  dataHex: string,
  ivHex: string
): Promise<string> => {
  if (!subtle) {
    throw new Error('Web Crypto API not available');
  }

  const keyBuffer = hexToArrayBuffer(keyHex);
  const dataBuffer = hexToArrayBuffer(dataHex);
  const ivBuffer = hexToArrayBuffer(ivHex);

  const cryptoKey = await subtle.importKey(
    'raw',
    keyBuffer,
    { name: mode },
    false,
    ['encrypt']
  );

  let algorithm: AesCbcParams | AesCtrParams | AesGcmParams;
  
  if (mode === 'AES-CBC') {
    algorithm = { name: 'AES-CBC', iv: ivBuffer };
  } else if (mode === 'AES-CTR') {
    algorithm = { name: 'AES-CTR', counter: ivBuffer, length: 64 };
  } else {
    algorithm = { name: 'AES-GCM', iv: ivBuffer };
  }

  const encryptedBuffer = await subtle.encrypt(algorithm, cryptoKey, dataBuffer);
  return arrayBufferToHex(encryptedBuffer);
};

/**
 * AES Decryption using Web Crypto API
 */
export const webCryptoAesDecrypt = async (
  mode: 'AES-CBC' | 'AES-CTR' | 'AES-GCM',
  keyHex: string,
  dataHex: string,
  ivHex: string
): Promise<string> => {
  if (!subtle) {
    throw new Error('Web Crypto API not available');
  }

  const keyBuffer = hexToArrayBuffer(keyHex);
  const dataBuffer = hexToArrayBuffer(dataHex);
  const ivBuffer = hexToArrayBuffer(ivHex);

  const cryptoKey = await subtle.importKey(
    'raw',
    keyBuffer,
    { name: mode },
    false,
    ['decrypt']
  );

  let algorithm: AesCbcParams | AesCtrParams | AesGcmParams;
  
  if (mode === 'AES-CBC') {
    algorithm = { name: 'AES-CBC', iv: ivBuffer };
  } else if (mode === 'AES-CTR') {
    algorithm = { name: 'AES-CTR', counter: ivBuffer, length: 64 };
  } else {
    algorithm = { name: 'AES-GCM', iv: ivBuffer };
  }

  const decryptedBuffer = await subtle.decrypt(algorithm, cryptoKey, dataBuffer);
  return arrayBufferToHex(decryptedBuffer);
};

/**
 * Generate random bytes using Web Crypto API
 * Much faster and more secure than Math.random()
 */
export const webCryptoRandomBytes = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return arrayBufferToHex(bytes.buffer);
};

/**
 * HMAC using Web Crypto API
 */
export const webCryptoHmac = async (
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512',
  keyHex: string,
  dataHex: string
): Promise<string> => {
  if (!subtle) {
    throw new Error('Web Crypto API not available');
  }

  const keyBuffer = hexToArrayBuffer(keyHex);
  const dataBuffer = hexToArrayBuffer(dataHex);

  const cryptoKey = await subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  const signatureBuffer = await subtle.sign('HMAC', cryptoKey, dataBuffer);
  return arrayBufferToHex(signatureBuffer);
};

/**
 * RSA Key Generation using Web Crypto API
 */
export const webCryptoGenerateRsaKeyPair = async (
  modulusLength: 1024 | 2048 | 4096 = 2048
): Promise<{ publicKey: string; privateKey: string }> => {
  if (!subtle) {
    throw new Error('Web Crypto API not available');
  }

  const keyPair = await subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );

  const publicKeyBuffer = await subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: arrayBufferToHex(publicKeyBuffer),
    privateKey: arrayBufferToHex(privateKeyBuffer),
  };
};

/**
 * ECDSA Key Generation using Web Crypto API
 */
export const webCryptoGenerateEcdsaKeyPair = async (
  curve: 'P-256' | 'P-384' | 'P-521' = 'P-256'
): Promise<{ publicKey: string; privateKey: string }> => {
  if (!subtle) {
    throw new Error('Web Crypto API not available');
  }

  const keyPair = await subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: curve,
    },
    true,
    ['sign', 'verify']
  );

  const publicKeyBuffer = await subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: arrayBufferToHex(publicKeyBuffer),
    privateKey: arrayBufferToHex(privateKeyBuffer),
  };
};

/**
 * Performance comparison: Run same operation with Web Crypto and measure time
 */
export const benchmarkHash = async (
  data: string,
  iterations: number = 1000
): Promise<{ webCrypto: number; available: boolean }> => {
  if (!subtle) {
    return { webCrypto: 0, available: false };
  }

  const dataBuffer = stringToArrayBuffer(data);
  
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await subtle.digest('SHA-256', dataBuffer);
  }
  const webCryptoTime = performance.now() - start;

  return {
    webCrypto: webCryptoTime,
    available: true,
  };
};
