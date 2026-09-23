const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export class CryptoToolsError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CryptoToolsError';
    this.code = code;
  }
}

const assertDigits = (value: string, label: string): void => {
  if (!/^\d+$/.test(value)) {
    throw new CryptoToolsError('INVALID_DIGITS', `${label} must contain digits only.`);
  }
};

export const normalizeHex = (input: string): string => {
  const value = input.replace(/\s+/g, '').toUpperCase();
  if (value.length === 0 || !/^[0-9A-F]+$/.test(value) || value.length % 2 !== 0) {
    throw new CryptoToolsError('INVALID_HEX', 'Hex input must contain a non-empty even number of hexadecimal characters.');
  }
  return value;
};

export const hexToBytes = (input: string): Uint8Array => {
  const hex = normalizeHex(input);
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

export const bytesToHex = (bytes: ArrayLike<number>): string =>
  Array.from(bytes, byte => {
    if (!Number.isInteger(byte) || byte < 0 || byte > 255) {
      throw new CryptoToolsError('INVALID_BYTE', 'Every byte must be an integer from 0 to 255.');
    }
    return byte.toString(16).padStart(2, '0');
  }).join('').toUpperCase();

export const xorHex = (...inputs: string[]): string => {
  if (inputs.length < 2) {
    throw new CryptoToolsError('TOO_FEW_COMPONENTS', 'At least two hexadecimal values are required.');
  }
  const values = inputs.map(hexToBytes);
  const length = values[0]!.length;
  if (values.some(value => value.length !== length)) {
    throw new CryptoToolsError('LENGTH_MISMATCH', 'All hexadecimal values must have the same byte length.');
  }
  const result = new Uint8Array(length);
  for (const value of values) {
    value.forEach((byte, index) => { result[index] = (result[index] ?? 0) ^ byte; });
  }
  return bytesToHex(result);
};

export const luhnCalculateCheckDigit = (payload: string): string => {
  assertDigits(payload, 'Luhn payload');
  let sum = 0;
  let doubleDigit = true;
  for (let index = payload.length - 1; index >= 0; index -= 1) {
    let digit = Number(payload[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return String((10 - (sum % 10)) % 10);
};

export const luhnValidate = (value: string): boolean => {
  if (!/^\d{2,}$/.test(value)) return false;
  return luhnCalculateCheckDigit(value.slice(0, -1)) === value.at(-1);
};

export const generateIso0PinBlock = (pin: string, pan: string): string => {
  assertDigits(pin, 'PIN');
  assertDigits(pan, 'PAN');
  if (pin.length < 4 || pin.length > 12) {
    throw new CryptoToolsError('INVALID_PIN_LENGTH', 'PIN length must be from 4 to 12 digits.');
  }
  if (pan.length < 13 || pan.length > 19) {
    throw new CryptoToolsError('INVALID_PAN_LENGTH', 'PAN length must be from 13 to 19 digits.');
  }
  const pinField = `0${pin.length.toString(16).toUpperCase()}${pin}${'F'.repeat(14 - pin.length)}`;
  const panField = `0000${pan.slice(-13, -1)}`;
  return xorHex(pinField, panField);
};

export const encodeBase64Bytes = (bytes: Uint8Array): string => {
  let output = '';
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index]!;
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const block = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
    output += BASE64_ALPHABET[(block >>> 18) & 63];
    output += BASE64_ALPHABET[(block >>> 12) & 63];
    output += second === undefined ? '=' : BASE64_ALPHABET[(block >>> 6) & 63];
    output += third === undefined ? '=' : BASE64_ALPHABET[block & 63];
  }
  return output;
};

export const decodeBase64Bytes = (input: string): Uint8Array => {
  const value = input.replace(/\s+/g, '');
  if (value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new CryptoToolsError('INVALID_BASE64', 'Base64 input is malformed.');
  }
  if (value.length === 0) return new Uint8Array();
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0;
  const output = new Uint8Array((value.length / 4) * 3 - padding);
  let outputIndex = 0;
  for (let index = 0; index < value.length; index += 4) {
    const indexes = value.slice(index, index + 4).split('').map(character => character === '=' ? 0 : BASE64_ALPHABET.indexOf(character));
    if (indexes.some(item => item < 0)) throw new CryptoToolsError('INVALID_BASE64', 'Base64 input is malformed.');
    if ((padding === 2 && index === value.length - 4 && (indexes[1]! & 15) !== 0)
      || (padding === 1 && index === value.length - 4 && (indexes[2]! & 3) !== 0)) {
      throw new CryptoToolsError('INVALID_BASE64', 'Base64 input is malformed.');
    }
    const block = (indexes[0]! << 18) | (indexes[1]! << 12) | (indexes[2]! << 6) | indexes[3]!;
    if (outputIndex < output.length) output[outputIndex++] = (block >>> 16) & 255;
    if (outputIndex < output.length) output[outputIndex++] = (block >>> 8) & 255;
    if (outputIndex < output.length) output[outputIndex++] = block & 255;
  }
  return output;
};

export const encodeBase64 = (text: string): string => encodeBase64Bytes(new TextEncoder().encode(text));
export const decodeBase64 = (input: string): string => {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(decodeBase64Bytes(input));
  } catch (error) {
    if (error instanceof CryptoToolsError) throw error;
    throw new CryptoToolsError('INVALID_UTF8', 'Decoded Base64 bytes are not valid UTF-8 text.');
  }
};
