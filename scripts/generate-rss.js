import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteUrl = 'https://hsmkit.com';

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const formatRssDate = value => new Date(`${value}T12:00:00Z`).toUTCString();

for (const language of ['en', 'zh']) {
  const articles = JSON.parse(await fs.readFile(path.join(root, `src/data/guides/${language}.json`), 'utf8'))
    .sort((left, right) => right.publishDate.localeCompare(left.publishDate));
  const prefix = language === 'zh' ? '/zh/guides/' : '/guides/';
  const feedPath = `${prefix}feed.xml`;
  const title = language === 'zh' ? 'HSM Kit 安全知识库' : 'HSM Kit Security Knowledge Base';
  const description = language === 'zh'
    ? '密码学、HSM 密钥管理、支付安全、PKI 与数据编码技术指南。'
    : 'Technical guides to cryptography, HSM key management, payment security, PKI, and data encoding.';
  const items = articles.map(article => {
    const url = `${siteUrl}${prefix}${article.slug}/`;
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(article.excerpt)}</description>
      <category>${escapeXml(article.category)}</category>
      <pubDate>${formatRssDate(article.publishDate)}</pubDate>
    </item>`;
  }).join('\n');
  const latestModified = articles.reduce((latest, article) => article.lastModified > latest ? article.lastModified : latest, '');
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${siteUrl}${prefix}</link>
    <description>${escapeXml(description)}</description>
    <language>${language === 'zh' ? 'zh-CN' : 'en'}</language>
    <lastBuildDate>${formatRssDate(latestModified)}</lastBuildDate>
    <atom:link href="${siteUrl}${feedPath}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  const outputPath = path.join(root, 'public', feedPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, rss);
  console.log(`Generated ${feedPath} with ${articles.length} items.`);
}