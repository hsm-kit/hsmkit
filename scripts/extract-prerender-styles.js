import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve(process.cwd(), 'dist');
const assetsDirectory = path.join(dist, 'assets');
const stylePattern = /<style\b([^>]*)>([\s\S]*?)<\/style>/gi;
const antStyleAttributes = /\b(?:data-rc-order|data-css-hash|data-icon)(?:=|\s|>)/i;

const findHtmlFiles = async directory => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findHtmlFiles(entryPath);
    return entry.isFile() && entry.name.endsWith('.html') ? [entryPath] : [];
  }));
  return nested.flat();
};

await fs.mkdir(assetsDirectory, { recursive: true });
const htmlFiles = await findHtmlFiles(dist);
const writtenBundles = new Set();
let extractedPages = 0;
let removedBytes = 0;

for (const htmlPath of htmlFiles) {
  const html = await fs.readFile(htmlPath, 'utf8');
  const styles = [];
  const strippedHtml = html.replace(stylePattern, (tag, attributes, css) => {
    if (!antStyleAttributes.test(attributes)) return tag;
    const isThemeToken = /\bdata-token-hash(?:=|\s|>)/i.test(attributes);
    styles.push(isThemeToken ? `@layer prerender-theme {${css}}` : css);
    if (isThemeToken) {
      removedBytes += Buffer.byteLength(tag);
      return '';
    }
    const marker = `<style${attributes}></style>`;
    removedBytes += Buffer.byteLength(tag) - Buffer.byteLength(marker);
    return marker;
  });

  if (styles.length === 0) continue;

  const css = `${styles.join('\n')}\n`;
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 12);
  const filename = `prerender-antd-${hash}.css`;
  if (!writtenBundles.has(filename)) {
    await fs.writeFile(path.join(assetsDirectory, filename), css);
    writtenBundles.add(filename);
  }

  const stylesheet = `<link rel="stylesheet" href="/assets/${filename}" data-prerender-styles>`;
  await fs.writeFile(htmlPath, strippedHtml.replace('</head>', `${stylesheet}</head>`));
  extractedPages += 1;
}

console.log(`Extracted Ant Design styles from ${extractedPages} pages into ${writtenBundles.size} cached CSS bundles (${removedBytes} HTML bytes removed).`);