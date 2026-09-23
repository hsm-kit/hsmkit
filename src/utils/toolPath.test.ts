import { describe, expect, it } from 'vitest';
import { getEnglishToolPath, getLocalizedToolPath, getToolAlternates, getToolRouteLanguage } from './toolPath';

describe('localized tool paths', () => {
  it('maps supported English and Chinese routes in both directions', () => {
    expect(getLocalizedToolPath('/aes-encryption/', 'zh')).toBe('/zh/aes-encryption/');
    expect(getLocalizedToolPath('/zh/aes-encryption/', 'en')).toBe('/aes-encryption/');
    expect(getEnglishToolPath('/zh/payments-bitmap/')).toBe('/payments-bitmap');
  });

  it('leaves unsupported tools on their shared route', () => {
    expect(getLocalizedToolPath('/des-encryption/', 'zh')).toBe('/des-encryption/');
    expect(getToolRouteLanguage('/des-encryption/')).toBeUndefined();
  });

  it('builds reciprocal canonical alternates', () => {
    expect(getToolRouteLanguage('/zh/base64/')).toBe('zh');
    expect(getToolAlternates('/zh/base64/')).toEqual([
      { lang: 'en', href: 'https://hsmkit.com/base64/' },
      { lang: 'zh', href: 'https://hsmkit.com/zh/base64/' },
      { lang: 'x-default', href: 'https://hsmkit.com/base64/' },
    ]);
  });
});