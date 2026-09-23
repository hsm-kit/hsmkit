import fs from 'node:fs/promises';
import path from 'node:path';

const host = 'hsmkit.com';
const key = '55bc76b3ce475067e11cca8d69e2edd4';
const keyLocation = `https://${host}/${key}.txt`;
const dryRun = process.argv.includes('--dry-run');
const explicitUrls = process.argv.slice(2).filter(value => value.startsWith('https://'));

const sitemap = await fs.readFile(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const urlList = [...new Set(explicitUrls.length > 0 ? explicitUrls : sitemapUrls)];

if (urlList.length === 0) throw new Error('No URLs found for IndexNow submission.');
if (urlList.length > 10_000) throw new Error('IndexNow accepts at most 10,000 URLs per request.');
if (urlList.some(url => new URL(url).hostname !== host)) throw new Error(`All URLs must use ${host}.`);

if (dryRun) {
  console.log(`Validated ${urlList.length} URL(s) for IndexNow. Key: ${keyLocation}`);
} else {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });

  if (![200, 202].includes(response.status)) {
    throw new Error(`IndexNow returned ${response.status}: ${await response.text()}`);
  }

  console.log(`Submitted ${urlList.length} URL(s) to IndexNow (${response.status}).`);
}