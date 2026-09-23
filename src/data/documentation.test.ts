import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import articlesEn from './guides/en.json';
import articlesZh from './guides/zh.json';
import categories from './guides/categories.json';
import { toolDirectory } from './toolRelations';
import localizedTools from './localized-tools.json';

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

const localizedArticleCountText: Record<string, string> = {
  'README.md': `${articlesEn.length} English + ${articlesZh.length} Chinese`,
  'README.zh-CN.md': `英语与中文各提供 ${articlesEn.length}`,
  'README.ja.md': `英語${articlesEn.length}記事・中国語${articlesZh.length}記事`,
  'README.ko.md': `영어 ${articlesEn.length}편과 중국어 ${articlesZh.length}편`,
  'README.de.md': `${articlesEn.length} englische und ${articlesZh.length} chinesische`,
  'README.fr.md': `${articlesEn.length} articles anglais et ${articlesZh.length} articles chinois`,
};

const sitemapUrls = new Set(
  [...read('public/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]),
);

describe('open-source documentation', () => {
  it('keeps localized README counts aligned with source metadata', () => {
    expect(toolDirectory).toHaveLength(44);
    expect(articlesEn).toHaveLength(articlesZh.length);

    Object.entries(localizedArticleCountText).forEach(([file, articleText]) => {
      const content = read(file);
      expect(content, file).toContain('44');
      expect(content, file).toContain(articleText);
    });
  });

  it('publishes every tool, guide index, category, and article in the sitemap', () => {
    toolDirectory.forEach(tool => {
      expect(sitemapUrls).toContain(`https://hsmkit.com${tool.path}`);
    });
    localizedTools.forEach(tool => {
      expect(sitemapUrls).toContain(`https://hsmkit.com${tool.chinesePath}/`);
    });
    ['/about/', '/editorial-policy/', '/authors/editorial-team/'].forEach(route => {
      expect(sitemapUrls).toContain(`https://hsmkit.com${route}`);
    });

    for (const language of ['en', 'zh'] as const) {
      const prefix = language === 'en' ? '/guides/' : '/zh/guides/';
      const articles = language === 'en' ? articlesEn : articlesZh;
      expect(sitemapUrls).toContain(`https://hsmkit.com${prefix}`);
      categories.forEach(category => {
        expect(sitemapUrls).toContain(`https://hsmkit.com${prefix}${category.slug}/`);
      });
      articles.forEach(article => {
        expect(sitemapUrls).toContain(`https://hsmkit.com${prefix}${article.slug}/`);
      });
    }

    const expectedUrlCount = 1 + toolDirectory.length + 3 + 3 + localizedTools.length
      + 2 + categories.length * 2 + articlesEn.length + articlesZh.length;
    expect(sitemapUrls).toHaveLength(expectedUrlCount);
  });
});
