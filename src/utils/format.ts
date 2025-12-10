/**
 * 格式化十六进制字符串为分组显示
 * @param hex 十六进制字符串
 * @param groupSize 每组字符数，默认 4
 */
export const formatHexDisplay = (hex: string, groupSize: number = 4): string => {
  const regex = new RegExp(`.{1,${groupSize}}`, 'g');
  return hex.match(regex)?.join(' ') || hex;
};

/**
 * 格式化 PAN 为分组显示（每 4 位一组）
 */
export const formatPAN = (pan: string): string => {
  return formatHexDisplay(pan, 4);
};

/**
 * 验证并格式化输入的数字
 */
export const sanitizeDigits = (input: string): string => {
  return input.replace(/\D/g, '');
};

/**
 * 验证并格式化十六进制输入
 */
export const sanitizeHex = (input: string): string => {
  return input.replace(/[^0-9A-Fa-f\s]/g, '').toUpperCase();
};

