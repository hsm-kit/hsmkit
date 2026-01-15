/**
 * 更新 sitemap.xml 的 <lastmod> 为指定日期（默认：当天本地日期）。
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

function formatLocalDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  const fileArg = getArgValue('--file');
  const dateArg = getArgValue('--date');

  const sitemapPath = path.resolve(process.cwd(), fileArg ?? 'public/sitemap.xml');
  const lastmodDate = dateArg ?? formatLocalDate(new Date());

  const xml = await fs.readFile(sitemapPath, 'utf8');

  const matches = [...xml.matchAll(/<lastmod>[^<]*<\/lastmod>/g)];
  if (matches.length === 0) {
    throw new Error(`No <lastmod>...</lastmod> found in ${sitemapPath}`);
  }

  const updated = xml.replaceAll(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${lastmodDate}</lastmod>`);
  await fs.writeFile(sitemapPath, updated, 'utf8');

  const relative = path.relative(process.cwd(), sitemapPath) || sitemapPath;
  console.log(`✓ Updated ${matches.length} <lastmod> entries in ${relative} to ${lastmodDate}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
