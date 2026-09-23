import { describe, expect, it } from 'vitest';
import {
  CryptoToolsError,
  bytesToHex,
  decodeBase64,
  decodeBase64Bytes,
  encodeBase64,
  encodeBase64Bytes,
  generateIso0PinBlock,
  hexToBytes,
  luhnCalculateCheckDigit,
  luhnValidate,
  normalizeHex,
  xorHex,
} from './index.js';

describe('@hsmkit/crypto-tools', () => {
  it('normalizes and converts hexadecimal bytes', () => {
    expect(normalizeHex('aa bb 01')).toBe('AABB01');
    expect(hexToBytes('00 ff 10')).toEqual(Uint8Array.from([0, 255, 16]));
    expect(bytesToHex([0, 255, 16])).toBe('00FF10');
  });

  it('rejects malformed hexadecimal values and bytes', () => {
    expect(() => normalizeHex('ABC')).toThrow(CryptoToolsError);
    expect(() => normalizeHex('ZZ')).toThrow('Hex input');
    expect(() => bytesToHex([256])).toThrow('Every byte');
  });

  it('combines two or more equal-length key components', () => {
    expect(xorHex('FF00FF00', '00FF00FF')).toBe('FFFFFFFF');
    expect(xorHex('FF000000', '00FF0000', '0000FF00')).toBe('FFFFFF00');
  });

  it('rejects invalid XOR component sets', () => {
    expect(() => xorHex('AABB')).toThrow('At least two');
    expect(() => xorHex('AABB', 'AABBCC')).toThrow('same byte length');
  });

  it('calculates and validates Luhn check digits', () => {
    expect(luhnCalculateCheckDigit('7992739871')).toBe('3');
    expect(luhnValidate('79927398713')).toBe(true);
    expect(luhnValidate('79927398714')).toBe(false);
    expect(luhnValidate('not-a-number')).toBe(false);
  });

  it('generates an ISO 9564-1 format 0 PIN block', () => {
    expect(generateIso0PinBlock('1234', '4111111111111111')).toBe('041225EEEEEEEEEE');
  });

  it('rejects unsafe PIN block inputs', () => {
    expect(() => generateIso0PinBlock('123', '4111111111111111')).toThrow('PIN length');
    expect(() => generateIso0PinBlock('1234', '123456789012')).toThrow('PAN length');
    expect(() => generateIso0PinBlock('12A4', '4111111111111111')).toThrow('digits only');
  });

  it('encodes and decodes UTF-8 Base64', () => {
    expect(encodeBase64('HSM Kit ✓')).toBe('SFNNIEtpdCDinJM=');
    expect(decodeBase64('SFNNIEtpdCDinJM=')).toBe('HSM Kit ✓');
    expect(encodeBase64('')).toBe('');
    expect(decodeBase64('')).toBe('');
  });

  it('encodes and decodes arbitrary Base64 bytes', () => {
    const bytes = Uint8Array.from([0, 1, 2, 253, 254, 255]);
    expect(encodeBase64Bytes(bytes)).toBe('AAEC/f7/');
    expect(decodeBase64Bytes('AAEC/f7/')).toEqual(bytes);
  });

  it('rejects malformed Base64 input', () => {
    expect(() => decodeBase64Bytes('abc')).toThrow('malformed');
    expect(() => decodeBase64Bytes('####')).toThrow('malformed');
    expect(() => decodeBase64Bytes('AB==')).toThrow(CryptoToolsError);
    expect(() => decodeBase64Bytes('AAB=')).toThrow(CryptoToolsError);
    expect(() => decodeBase64('/w==')).toThrowError(expect.objectContaining({ code: 'INVALID_UTF8' }));
  });
});
