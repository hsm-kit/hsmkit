/**
 * Crypto Worker 封装
 * 将耗时的加密计算移到 Web Worker 后台线程
 * 避免阻塞主线程 UI
 */

import CryptoJS from 'crypto-js';

// Worker message types
export interface CryptoWorkerMessage {
  id: string;
  type: 'hash' | 'aes-encrypt' | 'aes-decrypt' | 'des-encrypt' | 'des-decrypt' | 'kcv';
  payload: Record<string, unknown>;
}

export interface CryptoWorkerResult {
  id: string;
  success: boolean;
  result?: string;
  error?: string;
}

// Worker code as string (will be converted to Blob URL)
const workerCode = `
importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js');

self.onmessage = function(e) {
  const { id, type, payload } = e.data;
  
  try {
    let result;
    
    switch (type) {
      case 'hash': {
        const { algorithm, data, inputType } = payload;
        let wordArray;
        
        if (inputType === 'hex') {
          wordArray = CryptoJS.enc.Hex.parse(data);
        } else {
          wordArray = CryptoJS.enc.Utf8.parse(data);
        }
        
        switch (algorithm) {
          case 'MD5':
            result = CryptoJS.MD5(wordArray).toString().toUpperCase();
            break;
          case 'SHA1':
            result = CryptoJS.SHA1(wordArray).toString().toUpperCase();
            break;
          case 'SHA256':
            result = CryptoJS.SHA256(wordArray).toString().toUpperCase();
            break;
          case 'SHA512':
            result = CryptoJS.SHA512(wordArray).toString().toUpperCase();
            break;
          case 'SHA3':
            result = CryptoJS.SHA3(wordArray).toString().toUpperCase();
            break;
          default:
            throw new Error('Unsupported algorithm: ' + algorithm);
        }
        break;
      }
      
      case 'aes-encrypt': {
        const { key, data, mode, iv, padding } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const dataWA = CryptoJS.enc.Hex.parse(data);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: CryptoJS.mode[mode] || CryptoJS.mode.ECB,
          padding: CryptoJS.pad[padding] || CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const encrypted = CryptoJS.AES.encrypt(dataWA, keyWA, config);
        result = encrypted.ciphertext.toString().toUpperCase();
        break;
      }
      
      case 'aes-decrypt': {
        const { key, data, mode, iv, padding } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: CryptoJS.mode[mode] || CryptoJS.mode.ECB,
          padding: CryptoJS.pad[padding] || CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Hex.parse(data)
        });
        
        const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWA, config);
        result = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
        break;
      }
      
      case 'des-encrypt': {
        const { key, data, mode, iv } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const dataWA = CryptoJS.enc.Hex.parse(data);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: CryptoJS.mode[mode] || CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const encrypted = CryptoJS.TripleDES.encrypt(dataWA, keyWA, config);
        result = encrypted.ciphertext.toString().toUpperCase();
        break;
      }
      
      case 'des-decrypt': {
        const { key, data, mode, iv } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        const ivWA = iv ? CryptoJS.enc.Hex.parse(iv) : undefined;
        
        const config = {
          mode: CryptoJS.mode[mode] || CryptoJS.mode.ECB,
          padding: CryptoJS.pad.NoPadding,
          iv: ivWA
        };
        
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Hex.parse(data)
        });
        
        const decrypted = CryptoJS.TripleDES.decrypt(cipherParams, keyWA, config);
        result = decrypted.toString(CryptoJS.enc.Hex).toUpperCase();
        break;
      }
      
      case 'kcv': {
        const { key, algorithm } = payload;
        const keyWA = CryptoJS.enc.Hex.parse(key);
        
        if (algorithm === 'AES') {
          const zero = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
          const encrypted = CryptoJS.AES.encrypt(zero, keyWA, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
          });
          result = encrypted.ciphertext.toString().toUpperCase().substring(0, 6);
        } else {
          const zero = CryptoJS.enc.Hex.parse('0000000000000000');
          const encrypted = CryptoJS.TripleDES.encrypt(zero, keyWA, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
          });
          result = encrypted.ciphertext.toString().toUpperCase().substring(0, 6);
        }
        break;
      }
      
      default:
        throw new Error('Unknown operation type: ' + type);
    }
    
    self.postMessage({ id, success: true, result });
  } catch (error) {
    self.postMessage({ id, success: false, error: error.message });
  }
};
`;

// Create worker instance
let worker: Worker | null = null;
const pendingRequests: Map<string, { resolve: (value: string) => void; reject: (error: Error) => void }> = new Map();
let requestId = 0;

/**
 * Initialize the crypto worker
 */
export const initCryptoWorker = (): Worker | null => {
  if (worker) return worker;
  
  if (typeof Worker === 'undefined') {
    console.warn('Web Workers not supported');
    return null;
  }
  
  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    worker = new Worker(url);
    
    worker.onmessage = (e: MessageEvent<CryptoWorkerResult>) => {
      const { id, success, result, error } = e.data;
      const pending = pendingRequests.get(id);
      
      if (pending) {
        if (success && result !== undefined) {
          pending.resolve(result);
        } else {
          pending.reject(new Error(error || 'Unknown error'));
        }
        pendingRequests.delete(id);
      }
    };
    
    worker.onerror = (e) => {
      console.error('Crypto worker error:', e);
    };
    
    return worker;
  } catch (e) {
    console.warn('Failed to create crypto worker:', e);
    return null;
  }
};

/**
 * Send message to worker and wait for result
 */
const sendToWorker = (type: string, payload: Record<string, unknown>): Promise<string> => {
  return new Promise((resolve, reject) => {
    const w = initCryptoWorker();
    
    if (!w) {
      reject(new Error('Worker not available'));
      return;
    }
    
    const id = `req_${++requestId}`;
    pendingRequests.set(id, { resolve, reject });
    
    w.postMessage({ id, type, payload });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Worker request timeout'));
      }
    }, 30000);
  });
};

/**
 * Calculate hash in worker (non-blocking)
 */
export const workerHash = (
  algorithm: 'MD5' | 'SHA1' | 'SHA256' | 'SHA512' | 'SHA3',
  data: string,
  inputType: 'hex' | 'text' = 'text'
): Promise<string> => {
  return sendToWorker('hash', { algorithm, data, inputType });
};

/**
 * AES encrypt in worker (non-blocking)
 */
export const workerAesEncrypt = (
  key: string,
  data: string,
  mode: string = 'ECB',
  iv?: string,
  padding: string = 'NoPadding'
): Promise<string> => {
  return sendToWorker('aes-encrypt', { key, data, mode, iv, padding });
};

/**
 * AES decrypt in worker (non-blocking)
 */
export const workerAesDecrypt = (
  key: string,
  data: string,
  mode: string = 'ECB',
  iv?: string,
  padding: string = 'NoPadding'
): Promise<string> => {
  return sendToWorker('aes-decrypt', { key, data, mode, iv, padding });
};

/**
 * DES/3DES encrypt in worker (non-blocking)
 */
export const workerDesEncrypt = (
  key: string,
  data: string,
  mode: string = 'ECB',
  iv?: string
): Promise<string> => {
  return sendToWorker('des-encrypt', { key, data, mode, iv });
};

/**
 * DES/3DES decrypt in worker (non-blocking)
 */
export const workerDesDecrypt = (
  key: string,
  data: string,
  mode: string = 'ECB',
  iv?: string
): Promise<string> => {
  return sendToWorker('des-decrypt', { key, data, mode, iv });
};

/**
 * Calculate KCV in worker (non-blocking)
 */
export const workerKcv = (
  key: string,
  algorithm: 'AES' | 'DES'
): Promise<string> => {
  return sendToWorker('kcv', { key, algorithm });
};

/**
 * Check if worker is available
 */
export const isWorkerAvailable = (): boolean => {
  return typeof Worker !== 'undefined';
};

/**
 * Terminate the worker
 */
export const terminateCryptoWorker = (): void => {
  if (worker) {
    worker.terminate();
    worker = null;
    pendingRequests.clear();
  }
};

// Export fallback using main thread (for comparison or when worker unavailable)
export { CryptoJS };
