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

// Create worker instance using Vite's bundled worker
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
    worker = new Worker(new URL('./crypto.worker.ts', import.meta.url), { type: 'module' });
    
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
