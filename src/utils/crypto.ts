import CryptoJS from 'crypto-js';

/**
 * 十六进制字符串验证
 */
export const isValidHex = (str: string): boolean => {
  return /^[0-9A-F]+$/i.test(str.replace(/\s/g, ''));
};

/**
 * 清理输入字符串（移除空格并转大写）
 */
export const cleanHexInput = (input: string): string => {
  return input.replace(/\s/g, '').toUpperCase();
};

/**
 * DES 奇偶校验位调整
 * 将每个字节的最低位设置为奇校验位
 */
export const adjustDesKeyParity = (hexKey: string): string => {
  const bytes = hexKey.match(/.{2}/g) || [];
  return bytes.map(byte => {
    let b = parseInt(byte, 16);
    let bits = 0;
    for (let i = 1; i < 8; i++) {
      if (b & (1 << i)) bits++;
    }
    // 设置最低位以保证奇数个1
    if (bits % 2 === 0) {
      b |= 1;
    } else {
      b &= 0xFE;
    }
    return b.toString(16).toUpperCase().padStart(2, '0');
  }).join('');
};

/**
 * KCV 计算器
 */
export interface KCVOptions {
  algorithm: 'DES' | 'AES';
  adjustParity?: boolean;
}

export const calculateKCV = (keyHex: string, options: KCVOptions): string => {
  let processedKey = cleanHexInput(keyHex);
  
  // 如果是 DES 且需要调整奇偶校验
  if (options.algorithm === 'DES' && options.adjustParity) {
    processedKey = adjustDesKeyParity(processedKey);
  }

  const keyBytes = processedKey.length / 2;
  
  // 验证密钥长度
  if (options.algorithm === 'DES' && ![8, 16, 24].includes(keyBytes)) {
    throw new Error('DES key must be 8, 16, or 24 bytes');
  }
  if (options.algorithm === 'AES' && ![16, 24, 32].includes(keyBytes)) {
    throw new Error('AES key must be 16, 24, or 32 bytes');
  }

  const key = CryptoJS.enc.Hex.parse(processedKey);
  const zero = CryptoJS.enc.Hex.parse('0000000000000000');

  let encrypted;
  if (options.algorithm === 'AES') {
    encrypted = CryptoJS.AES.encrypt(zero, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });
  } else {
    encrypted = CryptoJS.TripleDES.encrypt(zero, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });
  }

  return encrypted.ciphertext.toString().toUpperCase().substring(0, 6);
};

/**
 * PIN Block 生成器
 */
export interface PinBlockOptions {
  format: 'ISO0' | 'ISO1';
  pin: string;
  pan: string;
}

/**
 * 处理 PAN：取最右侧 12 位（不包含最后一位校验位）
 */
export const processPAN = (pan: string): string => {
  const cleanPan = pan.replace(/\s/g, '');
  // 取最右侧 13 位，然后去掉最后一位（校验位），得到 12 位
  return cleanPan.slice(-13, -1);
};

export const generatePinBlock = (options: PinBlockOptions): string => {
  const { format, pin, pan } = options;
  
  if (format !== 'ISO0') {
    throw new Error('Only ISO Format 0 is currently supported');
  }

  // PIN 格式：长度（1 位十六进制）+ PIN + 填充 F
  const pinLength = pin.length.toString(16).toUpperCase();
  const pinPart = (pinLength + pin).padEnd(16, 'F');
  
  // PAN 处理：取 PAN 最右侧 12 位（不含校验位）
  const pan12 = processPAN(pan);
  const panPart = ('0000' + pan12).slice(-16);
  
  // XOR 运算
  let result = '';
  for (let i = 0; i < 16; i++) {
    const a = parseInt(pinPart[i], 16);
    const b = parseInt(panPart[i], 16);
    result += (a ^ b).toString(16).toUpperCase();
  }
  
  return result;
};

/**
 * TR-31 Key Block 解析器
 */
export interface TR31ParseResult {
  version: string;
  length: number;
  keyUsage: string;
  algorithm: string;
  mode: string;
  keyVersion: string;
  exportability: string;
  header: string;
  raw: string;
  optionalBlocks?: string;
}

export const parseTR31KeyBlock = (keyBlock: string): TR31ParseResult => {
  const clean = cleanHexInput(keyBlock);

  if (clean.length < 16) {
    throw new Error('TR-31 key block too short (minimum 16 characters)');
  }

  // 验证长度是否为偶数（十六进制字节对齐）
  if (clean.length % 2 !== 0) {
    throw new Error('TR-31 key block length must be even');
  }

  const version = clean[0];
  const lengthStr = clean.substring(1, 5);
  const length = parseInt(lengthStr, 10);
  
  // 验证长度字段是否为有效数字
  if (isNaN(length)) {
    throw new Error('Invalid length field in TR-31 header');
  }

  const keyUsage = clean.substring(5, 7);
  const algorithm = clean[7];
  const mode = clean[8];
  const keyVersion = clean.substring(9, 11);
  const exportability = clean[11];
  
  // 可选块从位置 12 开始到位置 16（不含）
  const optionalBlocks = clean.substring(12, 16);

  // 映射表
  const keyUsageMap: Record<string, string> = {
    'B0': 'BDK - Base Derivation Key',
    'D0': 'Data Encryption',
    'D1': 'Asymmetric Data',
    'K0': 'KEK - Key Encryption',
    'K1': 'TR-31 KBPK',
    'M0': 'MAC Generation',
    'M1': 'ISO 16609 MAC',
    'P0': 'PIN Encryption',
    'V0': 'PIN Verification (KPV)',
    'V1': 'CVV/CSC Verification',
    'S0': 'Signature Key'
  };

  const algorithmMap: Record<string, string> = {
    'D': 'DES',
    'T': '3DES',
    'A': 'AES',
    'R': 'RSA',
    'E': 'ECC'
  };

  const versionMap: Record<string, string> = {
    'A': 'Version A',
    'B': 'Version B (Baseline)',
    'C': 'Version C',
    'D': 'Version D'
  };

  return {
    version: versionMap[version] || `Unknown (${version})`,
    length,
    keyUsage: keyUsageMap[keyUsage] || keyUsage,
    algorithm: algorithmMap[algorithm] || algorithm,
    mode: mode === 'B' ? 'CBC' : mode === 'E' ? 'ECB' : mode,
    keyVersion,
    exportability,
    header: clean.substring(0, 16),
    raw: clean,
    optionalBlocks
  };
};

/**
 * TR-31 Header 验证
 */
export const validateTR31Header = (keyBlock: string): { valid: boolean; error?: string } => {
  const clean = keyBlock.replace(/\s/g, '').toUpperCase();
  
  if (clean.length === 0) {
    return { valid: true }; // 空输入不显示错误
  }
  
  if (clean.length < 16) {
    return { valid: false, error: 'Minimum 16 characters required' };
  }
  
  if (clean.length % 2 !== 0) {
    return { valid: false, error: 'Length must be even' };
  }
  
  // 验证版本字符
  const version = clean[0];
  if (!['A', 'B', 'C', 'D'].includes(version)) {
    return { valid: false, error: 'Invalid version (must be A, B, C, or D)' };
  }
  
  // 验证长度字段是否为数字
  const lengthStr = clean.substring(1, 5);
  if (!/^\d{4}$/.test(lengthStr)) {
    return { valid: false, error: 'Invalid length field (positions 1-4 must be digits)' };
  }
  
  return { valid: true };
};

/**
 * 密钥分量合成（XOR）
 */
export const combineKeyComponents = (components: string[]): string => {
  if (components.length < 2) {
    throw new Error('At least 2 components required');
  }

  // 清理并验证所有分量
  const cleanedComponents = components.map(comp => cleanHexInput(comp));
  
  // 验证所有分量是否为有效十六进制
  for (let i = 0; i < cleanedComponents.length; i++) {
    if (!isValidHex(cleanedComponents[i])) {
      throw new Error(`Component ${i + 1} is not valid hexadecimal`);
    }
  }

  // 验证所有分量长度是否相同
  const firstLength = cleanedComponents[0].length;
  for (let i = 1; i < cleanedComponents.length; i++) {
    if (cleanedComponents[i].length !== firstLength) {
      throw new Error('All components must have the same length');
    }
  }

  // XOR 所有分量
  let result = cleanedComponents[0];
  for (let i = 1; i < cleanedComponents.length; i++) {
    let xorResult = '';
    for (let j = 0; j < result.length; j += 2) {
      const byte1 = parseInt(result.substr(j, 2), 16);
      const byte2 = parseInt(cleanedComponents[i].substr(j, 2), 16);
      xorResult += (byte1 ^ byte2).toString(16).toUpperCase().padStart(2, '0');
    }
    result = xorResult;
  }

  return result;
};

/**
 * 调整密钥奇偶校验（偶校验）
 */
export const adjustDesKeyParityEven = (hexKey: string): string => {
  const bytes = hexKey.match(/.{2}/g) || [];
  return bytes.map(byte => {
    let b = parseInt(byte, 16);
    let bits = 0;
    for (let i = 1; i < 8; i++) {
      if (b & (1 << i)) bits++;
    }
    // 设置最低位以保证偶数个1
    if (bits % 2 === 1) {
      b |= 1;
    } else {
      b &= 0xFE;
    }
    return b.toString(16).toUpperCase().padStart(2, '0');
  }).join('');
};

/**
 * 检查密钥奇偶校验是否正确（奇校验）
 */
export const checkDesKeyParityOdd = (hexKey: string): boolean => {
  const bytes = hexKey.match(/.{2}/g) || [];
  return bytes.every(byte => {
    let b = parseInt(byte, 16);
    let bits = 0;
    for (let i = 0; i < 8; i++) {
      if (b & (1 << i)) bits++;
    }
    return bits % 2 === 1; // 奇数个1
  });
};

/**
 * 检查密钥奇偶校验是否正确（偶校验）
 */
export const checkDesKeyParityEven = (hexKey: string): boolean => {
  const bytes = hexKey.match(/.{2}/g) || [];
  return bytes.every(byte => {
    let b = parseInt(byte, 16);
    let bits = 0;
    for (let i = 0; i < 8; i++) {
      if (b & (1 << i)) bits++;
    }
    return bits % 2 === 0; // 偶数个1
  });
};

/**
 * 密钥验证结果
 */
export interface KeyValidationResult {
  valid: boolean;
  keyType: string;
  keyLength: number;
  parityValid?: boolean;
  parityType?: 'odd' | 'even' | 'none';
  errors: string[];
}

/**
 * 验证密钥
 */
export const validateKey = (hexKey: string): KeyValidationResult => {
  const clean = cleanHexInput(hexKey);
  const errors: string[] = [];
  
  if (!isValidHex(clean)) {
    return {
      valid: false,
      keyType: 'Unknown',
      keyLength: 0,
      errors: ['Invalid hexadecimal characters']
    };
  }

  const keyBytes = clean.length / 2;
  let keyType = 'Unknown';
  let parityValid: boolean | undefined;
  let parityType: 'odd' | 'even' | 'none' | undefined;

  // 判断密钥类型
  if ([8, 16, 24].includes(keyBytes)) {
    keyType = keyBytes === 8 ? 'DES' : '3DES';
    parityType = 'odd';
    parityValid = checkDesKeyParityOdd(clean);
    if (!parityValid) {
      errors.push('Parity check failed (expected odd parity)');
    }
  } else if ([16, 24, 32].includes(keyBytes)) {
    keyType = 'AES';
    parityType = 'none';
    parityValid = undefined;
  } else {
    keyType = 'Unknown';
    errors.push(`Invalid key length: ${keyBytes} bytes`);
  }

  return {
    valid: errors.length === 0,
    keyType,
    keyLength: keyBytes,
    parityValid,
    parityType,
    errors
  };
};

