import { describe, expect, it } from 'vitest';
import { normalizePublicPath, normalizeRoutePath, normalizeSiteUrl } from './publicUrl';

describe('public URL normalization', () => {
  it('uses trailing slashes for public document paths', () => {
    expect(normalizePublicPath('/aes-encryption')).toBe('/aes-encryption/');
    expect(normalizePublicPath('/guides/aes-gcm-vs-cbc/')).toBe('/guides/aes-gcm-vs-cbc/');
    expect(normalizePublicPath('/llms.txt')).toBe('/llms.txt');
    expect(normalizePublicPath('/')).toBe('/');
  });

  it('normalizes route lookup paths without changing the root', () => {
    expect(normalizeRoutePath('/aes-encryption/')).toBe('/aes-encryption');
    expect(normalizeRoutePath('/')).toBe('/');
  });

  it('only changes HSM Kit URLs', () => {
    expect(normalizeSiteUrl('https://hsmkit.com/base64')).toBe('https://hsmkit.com/base64/');
    expect(normalizeSiteUrl('/base64?mode=decode')).toBe('/base64/?mode=decode');
    expect(normalizeSiteUrl('https://example.com/base64')).toBe('https://example.com/base64');
  });
});