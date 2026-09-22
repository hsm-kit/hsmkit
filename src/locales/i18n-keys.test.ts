/**
 * i18n 键完整性校验
 * 以 en 为基准，检查其他语言是否存在缺失或多余的翻译键。
 * 运行 `npm test` 即可发现漏译。
 */
import { describe, it, expect } from 'vitest';
import en from './en';
import zh from './zh';
import ja from './ja';
import ko from './ko';
import de from './de';
import fr from './fr';

const locales: Record<string, unknown> = { zh, ja, ko, de, fr };

/** 递归收集对象的所有叶子键路径（如 'common.copy'） */
function collectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return [prefix];
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    collectKeys(value, prefix ? `${prefix}.${key}` : key)
  );
}

const enKeys = new Set(collectKeys(en));

describe('i18n key completeness', () => {
  it('en baseline has keys', () => {
    expect(enKeys.size).toBeGreaterThan(0);
  });

  for (const [lang, translations] of Object.entries(locales)) {
    describe(lang, () => {
      const langKeys = new Set(collectKeys(translations));

      it(`has no missing keys (present in en, absent in ${lang})`, () => {
        const missing = [...enKeys].filter(k => !langKeys.has(k));
        expect(missing, `${lang} 缺失 ${missing.length} 个键`).toEqual([]);
      });

      it(`has no extra keys (present in ${lang}, absent in en)`, () => {
        const extra = [...langKeys].filter(k => !enKeys.has(k));
        expect(extra, `${lang} 多出 ${extra.length} 个键`).toEqual([]);
      });
    });
  }
});
