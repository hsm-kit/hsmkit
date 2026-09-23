import { describe, expect, it } from 'vitest';
import {
  calculateLuhnCheckDigit,
  combineHexComponents,
  createIso0PinBlock,
  decodeTextBase64,
  encodeTextBase64,
  validateLuhn,
} from './tools.js';

describe('@hsmkit/mcp-server tool handlers', () => {
  it('returns results with HSM Kit documentation URLs', () => {
    expect(calculateLuhnCheckDigit('7992739871')).toMatchObject({
      result: '3',
      documentationUrl: 'https://hsmkit.com/check-digits/',
    });
    expect(validateLuhn('79927398713').result).toBe(true);
  });

  it('combines key components with an explicit safety warning', () => {
    const result = combineHexComponents(['FF00FF00', '00FF00FF']);
    expect(result.result).toBe('FFFFFFFF');
    expect(result.warning).toContain('production keys');
  });

  it('generates synthetic PIN blocks with an explicit safety warning', () => {
    const result = createIso0PinBlock('1234', '4111111111111111');
    expect(result.result).toBe('041225EEEEEEEEEE');
    expect(result.warning).toContain('real PIN');
  });

  it('encodes and decodes Base64 text', () => {
    expect(encodeTextBase64('HSM Kit').result).toBe('SFNNIEtpdA==');
    expect(decodeTextBase64('SFNNIEtpdA==').result).toBe('HSM Kit');
  });
});
