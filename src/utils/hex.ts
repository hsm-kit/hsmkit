import CryptoJS from 'crypto-js';

/**
 * 清理十六进制输入 - 移除空白字符并转大写
 */
export const cleanHex = (hex: string): string => {
  return hex.replace(/[\s\n\r]/g, '').toUpperCase();
};

/**
 * 验证十六进制字符串（不要求偶数长度）
 */
export const isValidHexChars = (hex: string): boolean => {
  return /^[0-9A-Fa-f]*$/.test(hex);
};

/**
 * 验证十六进制字符串（要求偶数长度）
 */
export const isValidHex = (hex: string): boolean => {
  return /^[0-9A-Fa-f]*$/.test(hex) && hex.length % 2 === 0;
};

/**
 * 验证清理后的十六进制
 */
export const isValidCleanHex = (input: string): boolean => {
  return isValidHex(cleanHex(input));
};

/**
 * 十六进制转 WordArray
 */
export const hexToWordArray = (hex: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Hex.parse(cleanHex(hex));
};

/**
 * ASCII 转 WordArray
 */
export const asciiToWordArray = (ascii: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf8.parse(ascii);
};

/**
 * 获取 CryptoJS 加密模式
 */
export const getCryptoMode = (mode: string): typeof CryptoJS.mode.ECB => {
  switch (mode) {
    case 'ECB': return CryptoJS.mode.ECB;
    case 'CBC': return CryptoJS.mode.CBC;
    case 'CFB': return CryptoJS.mode.CFB;
    case 'OFB': return CryptoJS.mode.OFB;
    case 'CTR': return CryptoJS.mode.CTR;
    default: return CryptoJS.mode.ECB;
  }
};

/**
 * 获取 CryptoJS 填充方式
 */
export const getCryptoPadding = (padding: string): typeof CryptoJS.pad.NoPadding => {
  switch (padding) {
    case 'NoPadding': return CryptoJS.pad.NoPadding;
    case 'Pkcs7': return CryptoJS.pad.Pkcs7;
    case 'ZeroPadding': return CryptoJS.pad.ZeroPadding;
    case 'AnsiX923': return CryptoJS.pad.AnsiX923;
    case 'Iso10126': return CryptoJS.pad.Iso10126;
    case 'Iso97971': return CryptoJS.pad.Iso97971;
    default: return CryptoJS.pad.NoPadding;
  }
};

/**
 * 获取长度指示器颜色
 */
export const getLengthColor = (
  actual: number, 
  expected: number | number[], 
  disabled: boolean = false
): string => {
  if (disabled) return '#999';
  if (actual === 0) return '#999';
  if (Array.isArray(expected)) {
    return expected.includes(actual) ? '#52c41a' : '#ff4d4f';
  }
  return actual === expected ? '#52c41a' : '#ff4d4f';
};
