import fs from 'node:fs/promises';
import path from 'node:path';

const site = 'https://hsmkit.com';
const token = process.env.BAIDU_PUSH_TOKEN?.trim();
const dryRun = process.argv.includes('--dry-run');
const submitAll = process.argv.includes('--all');
const explicitUrls = process.argv.slice(2).filter(value => value.startsWith('https://'));

const sitemap = await fs.readFile(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const defaultUrls = submitAll ? sitemapUrls : sitemapUrls.filter(url => new URL(url).pathname.startsWith('/zh/'));
const urlList = [...new Set(explicitUrls.length > 0 ? explicitUrls : defaultUrls)];

if (urlList.length === 0) throw new Error('No URLs found for Baidu submission.');
if (urlList.length > 2_000) throw new Error('Baidu accepts at most 2,000 URLs per request.');
if (urlList.some(url => new URL(url).origin !== site)) {
  throw new Error(`All URLs must use ${site}.`);
}

if (dryRun) {
  console.log(`Validated ${urlList.length} URL(s) for Baidu${submitAll ? ' (all canonical URLs)' : ' (Chinese URLs)'}.`);
} else {
  if (!token) throw new Error('BAIDU_PUSH_TOKEN is required. Add it as a GitHub Actions secret or environment variable.');
  const endpoint = `http://data.zz.baidu.com/urls?site=${encodeURIComponent(site)}&token=${encodeURIComponent(token)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    body: urlList.join('\n'),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`Baidu returned ${response.status}: ${body}`);
  const result = JSON.parse(body);
  if (result.error) throw new Error(`Baidu returned ${result.error}: ${result.message}`);
  console.log(`Submitted ${result.success ?? 0} URL(s) to Baidu; remaining daily quota: ${result.remain ?? 'unknown'}.`);
  if (result.not_same_site?.length) console.warn(`Rejected as another site: ${result.not_same_site.join(', ')}`);
  if (result.not_valid?.length) console.warn(`Rejected as invalid: ${result.not_valid.join(', ')}`);
}