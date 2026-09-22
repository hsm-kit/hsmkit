import { describe, expect, it } from 'vitest';
import articlesEn from './en.json';
import articlesZh from './zh.json';
import { GUIDE_REFERENCE_SLUGS, getGuideReferences } from './authority';

describe('guide authority metadata', () => {
  it('covers every English and Chinese guide with explicit references', () => {
    const expectedSlugs = articlesEn.map(article => article.slug).sort();
    expect(articlesZh.map(article => article.slug).sort()).toEqual(expectedSlugs);
    expect([...GUIDE_REFERENCE_SLUGS].sort()).toEqual(expectedSlugs);
    expectedSlugs.forEach(slug => expect(getGuideReferences(slug).length).toBeGreaterThan(0));
  });
});