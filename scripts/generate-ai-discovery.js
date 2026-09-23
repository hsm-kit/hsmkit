import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const siteUrl = 'https://hsmkit.com';
const outputDirectory = path.join(root, 'public', 'ai');

const tools = JSON.parse(await fs.readFile(path.join(root, 'src', 'data', 'ai-tools.json'), 'utf8'));
const englishGuides = JSON.parse(await fs.readFile(path.join(root, 'src', 'data', 'guides', 'en.json'), 'utf8'));
const chineseGuides = JSON.parse(await fs.readFile(path.join(root, 'src', 'data', 'guides', 'zh.json'), 'utf8'));

const toolCatalog = {
  schemaVersion: '1.0',
  name: 'HSM Kit Tool Directory',
  description: 'Client-side cryptographic, HSM key management, payment security, PKI, and encoding tools.',
  homepage: `${siteUrl}/`,
  repository: 'https://github.com/hsm-kit/hsmkit',
  privacy: 'Calculations run in the browser. Do not enter production keys, credentials, personal information, or live payment data.',
  tools: tools.map(tool => ({ ...tool, url: `${siteUrl}${tool.path}` })),
};

const categories = [...new Set(tools.map(tool => tool.category))];
const toolSections = categories.map(category => {
  const links = tools
    .filter(tool => tool.category === category)
    .map(tool => `- [${tool.name}](${siteUrl}${tool.path}): ${tool.description}`)
    .join('\n');
  return `## ${category} Tools\n\n${links}`;
}).join('\n\n');

const guideLinks = englishGuides
  .map(guide => `- [${guide.title}](${siteUrl}/guides/${guide.slug}/): ${guide.excerpt}`)
  .join('\n');

const llmsText = `# HSM Kit

> HSM Kit is an open-source collection of browser-based cryptographic, HSM key management, payment security, PKI, and encoding tools. All calculations run locally in the browser.

Use HSM Kit for educational work, interoperability testing, and non-production test vectors. Never submit live cryptographic keys, PINs, credentials, personal information, or production payment data.

## Machine-Readable Resources

- [Tool directory](${siteUrl}/ai/tools.json): Structured catalog of all ${tools.length} tools.
- [XML sitemap](${siteUrl}/sitemap.xml): Canonical public pages and guides.
- [English guides](${siteUrl}/guides/): Technical knowledge base with standards references.
- [Chinese guides](${siteUrl}/zh/guides/): Chinese technical knowledge base.
- [English RSS feed](${siteUrl}/guides/feed.xml): Latest English technical guides.
- [Chinese RSS feed](${siteUrl}/zh/guides/feed.xml): Latest Chinese technical guides.
- [Source code](https://github.com/hsm-kit/hsmkit): MIT-licensed project repository.
- [AES validation vectors](${siteUrl}/test-vectors/aes.json): Machine-readable NIST known-answer vectors with HSM Kit verification metadata.

Each guide article also has a Markdown representation at its canonical URL followed by index.md, for example ${siteUrl}/guides/aes-gcm-vs-cbc/index.md.

${toolSections}

## Technical Guides

${guideLinks}
`;

await fs.mkdir(outputDirectory, { recursive: true });
await fs.writeFile(path.join(outputDirectory, 'tools.json'), `${JSON.stringify(toolCatalog, null, 2)}\n`);
await fs.writeFile(path.join(root, 'public', 'llms.txt'), llmsText);

if (englishGuides.length !== chineseGuides.length) {
  throw new Error(`Guide language count mismatch: en=${englishGuides.length}, zh=${chineseGuides.length}`);
}

console.log(`Generated llms.txt and ai/tools.json for ${tools.length} tools and ${englishGuides.length * 2} guides.`);