import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import articlesEn from './guides/en.json';
import articlesZh from './guides/zh.json';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('RSS discovery feeds', () => {
  it.each([
    ['en', 'public/guides/feed.xml', articlesEn, 'https://hsmkit.com/guides/'],
    ['zh', 'public/zh/guides/feed.xml', articlesZh, 'https://hsmkit.com/zh/guides/'],
  ] as const)('publishes every %s guide as a canonical item', (_language, file, articles, prefix) => {
    const xml = read(file);
    expect(xml.match(/<item>/g)).toHaveLength(articles.length);
    expect(new Set([...xml.matchAll(/<guid isPermaLink="true">([^<]+)<\/guid>/g)].map(match => match[1])).size)
      .toBe(articles.length);
    articles.forEach(article => {
      expect(xml).toContain(`<link>${prefix}${article.slug}/</link>`);
    });
  });

  it('advertises feeds from both HTML entries', () => {
    for (const file of ['index.html', 'guides.html']) {
      const html = read(file);
      expect(html).toContain('type="application/rss+xml"');
      expect(html).toContain('data-guide-feed');
    }
  });
});
