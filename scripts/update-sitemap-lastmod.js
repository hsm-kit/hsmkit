/**
 * 同步 sitemap.xml 的 <lastmod>。
 * 默认从知识库 metadata 写入真实更新时间；传入 --date 时全量覆盖。
 *
 * 用法：
 * - node scripts/update-sitemap-lastmod.js
 * - node scripts/update-sitemap-lastmod.js --date 2026-01-15
 * - node scripts/update-sitemap-lastmod.js --file public/sitemap.xml
 */

import fs from 'node:fs/promises';
import path from 'node:path';

function getArgValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main() {
  const fileArg = getArgValue('--file');
  const dateArg = getArgValue('--date');

  const sitemapPath = path.resolve(process.cwd(), fileArg ?? 'public/sitemap.xml');
  const xml = await fs.readFile(sitemapPath, 'utf8');
  const guideMetadata = await Promise.all(
    ['en', 'zh'].map(async (language) => ({
      language,
      articles: JSON.parse(await fs.readFile(path.resolve(process.cwd(), `src/data/guides/${language}.json`), 'utf8')),
    }))
  );
  const categories = JSON.parse(
    await fs.readFile(path.resolve(process.cwd(), 'src/data/guides/categories.json'), 'utf8')
  );

  const guideLastModified = new Map();
  const categoryEntries = [];
  for (const { language, articles } of guideMetadata) {
    const baseUrl = language === 'en' ? 'https://hsmkit.com/guides' : `https://hsmkit.com/${language}/guides`;
    const latest = articles.reduce((max, article) => article.lastModified > max ? article.lastModified : max, '');
    guideLastModified.set(baseUrl, latest);
    articles.forEach((article) => guideLastModified.set(`${baseUrl}/${article.slug}`, article.lastModified));
    categories.forEach((category) => {
      const categoryUrl = `${baseUrl}/${category.slug}`;
      const categoryLastModified = articles
        .filter((article) => article.category === category.category)
        .reduce((max, article) => article.lastModified > max ? article.lastModified : max, '');
      guideLastModified.set(categoryUrl, categoryLastModified);
      categoryEntries.push({ language, url: categoryUrl, slug: category.slug, lastModified: categoryLastModified });
    });
  }

  const existingUrls = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]));
  const missingCategoryBlocks = categoryEntries
    .filter(entry => !existingUrls.has(entry.url))
    .map(entry => {
      const enUrl = `https://hsmkit.com/guides/${entry.slug}`;
      const zhUrl = `https://hsmkit.com/zh/guides/${entry.slug}`;
      return `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}" />
    <xhtml:link rel="alternate" hreflang="zh" href="${zhUrl}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}" />
  </url>`;
    })
    .join('\n');
  const sitemapWithCategories = missingCategoryBlocks
    ? xml.replace('</urlset>', `\n${missingCategoryBlocks}\n</urlset>`)
    : xml;

  const matches = [...sitemapWithCategories.matchAll(/<lastmod>[^<]*<\/lastmod>/g)];
  if (matches.length === 0) {
    throw new Error(`No <lastmod>...</lastmod> found in ${sitemapPath}`);
  }

  let updatedCount = 0;
  const updated = sitemapWithCategories.replace(/<url>[\s\S]*?<\/url>/g, (urlBlock) => {
    const url = urlBlock.match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmodDate = dateArg ?? guideLastModified.get(url);
    if (!lastmodDate) return urlBlock;
    updatedCount += 1;
    return urlBlock.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${lastmodDate}</lastmod>`);
  });
  await fs.writeFile(sitemapPath, updated, 'utf8');

  const relative = path.relative(process.cwd(), sitemapPath) || sitemapPath;
  const mode = dateArg ? `to ${dateArg}` : 'from guide metadata';
  console.log(`✓ Updated ${updatedCount} <lastmod> entries in ${relative} ${mode}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
