import { useState, useCallback } from 'react';
import { cleanHex, isValidHex } from '../utils/hex';

export interface SymmetricCipherConfig {
  /** 算法名称 */
  algorithm: string;
  /** 默认 IV（十六进制） */
  defaultIv?: string;
  /** 块大小（字节） */
  blockSize: number;
  /** 获取期望的密钥长度（字节数） */
  getExpectedKeyLength: (algorithm: string) => number;
  /** 获取有效的密钥长度列表 */
  getValidKeyLengths?: (algorithm: string) => number[];
  /** 翻译函数 */
  t?: {
    errorKeyHexRequired?: string;
    errorKeyLengthSingle?: string;
    errorKeyLengthMultiple?: string;
    errorDataRequired?: string;
    errorDataHexRequired?: string;
    errorDataBlockSize?: string;
    errorIvHexRequired?: string;
    errorIvBlockSize?: string;
  };
}

export interface SymmetricCipherState {
  key: string;
  data: string;
  iv: string;
  result: string;
  error: string;
  isProcessing: boolean;
  lastOperation: 'encrypt' | 'decrypt' | null;
}

export interface SymmetricCipherActions {
  setKey: (key: string) => void;
  setData: (data: string) => void;
  setIv: (iv: string) => void;
  setResult: (result: string) => void;
  setError: (error: string) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setLastOperation: (operation: 'encrypt' | 'decrypt' | null) => void;
  clearResult: () => void;
  clearError: () => void;
}

export interface SymmetricCipherUtils {
  /** 获取当前 Key 的实际字节数 */
  getActualKeyLength: () => number;
  /** 获取当前 Data 的实际字节数（仅 Hex 模式） */
  getActualDataLength: (inputType: 'ASCII' | 'Hex') => number;
  /** 获取当前 IV 的实际字节数 */
  getActualIvLength: () => number;
  /** 验证密钥 */
  validateKey: (algorithm: string) => boolean;
  /** 验证数据 */
  validateData: (inputType: 'ASCII' | 'Hex') => boolean;
  /** 验证 IV */
  validateIv: (needsIv: boolean) => boolean;
  /** 验证所有输入 */
  validateInputs: (algorithm: string, inputType: 'ASCII' | 'Hex', needsIv: boolean) => boolean;
  /** 获取长度指示器颜色 */
  getLengthColor: (current: number, expected: number | number[], disabled?: boolean) => string;
}

export function useSymmetricCipherForm(config: SymmetricCipherConfig) {
  const { defaultIv = '', blockSize, getExpectedKeyLength, getValidKeyLengths, t } = config;

  // 状态
  const [key, setKey] = useState('');
  const [data, setData] = useState('');
  const [iv, setIv] = useState(defaultIv);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOperation, setLastOperation] = useState<'encrypt' | 'decrypt' | null>(null);

  // 清除结果
  const clearResult = useCallback(() => {
    setResult('');
    setLastOperation(null);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // 获取当前 Key 的实际字节数
  const getActualKeyLength = useCallback((): number => {
    const clean = cleanHex(key);
    return isValidHex(clean) ? clean.length / 2 : 0;
  }, [key]);

  // 获取当前 Data 的实际字节数（仅 Hex 模式）
  const getActualDataLength = useCallback((inputType: 'ASCII' | 'Hex'): number => {
    if (inputType !== 'Hex') return 0;
    const clean = cleanHex(data);
    return isValidHex(clean) ? clean.length / 2 : 0;
  }, [data]);

  // 获取当前 IV 的实际字节数
  const getActualIvLength = useCallback((): number => {
    const clean = cleanHex(iv);
    return isValidHex(clean) ? clean.length / 2 : 0;
  }, [iv]);

  // 验证密钥
  const validateKey = useCallback((algorithm: string): boolean => {
    const cleanKey = cleanHex(key);
    if (!isValidHex(cleanKey)) {
      setError(t?.errorKeyHexRequired || 'Key must be valid hexadecimal');
      return false;
    }

    const expectedKeyLen = getExpectedKeyLength(algorithm);
    const validLengths = getValidKeyLengths ? getValidKeyLengths(algorithm) : [expectedKeyLen];
    const keyLen = cleanKey.length / 2;

    if (!validLengths.includes(keyLen)) {
      if (validLengths.length === 1) {
        setError((t?.errorKeyLengthSingle || 'Key length must be {length} bytes').replace('{length}', String(validLengths[0])));
      } else {
        setError((t?.errorKeyLengthMultiple || 'Key length must be {lengths} bytes').replace('{lengths}', validLengths.join(' or ')));
      }
      return false;
    }

    return true;
  }, [key, getExpectedKeyLength, getValidKeyLengths, t]);

  // 验证数据
  const validateData = useCallback((inputType: 'ASCII' | 'Hex'): boolean => {
    if (!data.trim()) {
      setError(t?.errorDataRequired || 'Data is required');
      return false;
    }

    if (inputType === 'Hex') {
      const cleanData = cleanHex(data);
      if (!isValidHex(cleanData)) {
        setError(t?.errorDataHexRequired || 'Data must be valid hexadecimal');
        return false;
      }
      // 检查数据长度是否是块大小的倍数
      if (cleanData.length / 2 % blockSize !== 0) {
        const msg = (t?.errorDataBlockSize || 'Data length must be multiple of {blockSize} bytes (current: {current} bytes)')
          .replace('{blockSize}', String(blockSize))
          .replace('{current}', String(cleanData.length / 2));
        setError(msg);
        return false;
      }
    }

    return true;
  }, [data, blockSize, t]);

  // 验证 IV
  const validateIv = useCallback((needsIv: boolean): boolean => {
    if (!needsIv) return true;

    const cleanIv = cleanHex(iv);
    if (!isValidHex(cleanIv)) {
      setError(t?.errorIvHexRequired || 'IV must be valid hexadecimal');
      return false;
    }
    if (cleanIv.length / 2 !== blockSize) {
      setError((t?.errorIvBlockSize || 'IV length must be {blockSize} bytes').replace('{blockSize}', String(blockSize)));
      return false;
    }

    return true;
  }, [iv, blockSize, t]);

  // 验证所有输入
  const validateInputs = useCallback((algorithm: string, inputType: 'ASCII' | 'Hex', needsIv: boolean): boolean => {
    setError('');
    return validateKey(algorithm) && validateData(inputType) && validateIv(needsIv);
  }, [validateKey, validateData, validateIv]);

  // 获取长度指示器颜色
  const getLengthColor = useCallback((current: number, expected: number | number[], disabled = false): string => {
    if (disabled) return '#8c8c8c';
    if (current === 0) return '#8c8c8c';
    
    const expectedArray = Array.isArray(expected) ? expected : [expected];
    if (expectedArray.includes(current)) return '#52c41a';
    return '#ff4d4f';
  }, []);

  const state: SymmetricCipherState = {
    key,
    data,
    iv,
    result,
    error,
    isProcessing,
    lastOperation,
  };

  const actions: SymmetricCipherActions = {
    setKey,
    setData,
    setIv,
    setResult,
    setError,
    setIsProcessing,
    setLastOperation,
    clearResult,
    clearError,
  };

  const utils: SymmetricCipherUtils = {
    getActualKeyLength,
    getActualDataLength,
    getActualIvLength,
    validateKey,
    validateData,
    validateIv,
    validateInputs,
    getLengthColor,
  };

  return { state, actions, utils };
}

export default useSymmetricCipherForm;
