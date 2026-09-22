import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const outputRoot = path.join(root, 'public/og/guides');
const categories = JSON.parse(await fs.readFile(path.join(root, 'src/data/guides/categories.json'), 'utf8'));
const categoryByName = new Map(categories.map(category => [category.category, category]));

const colors = {
  Keys: '#B7791F',
  Payment: '#1565C0',
  Cipher: '#218838',
  PKI: '#0F8A8D',
  Generic: '#6B46C1',
  Guides: '#1D4ED8',
};

const escapeXml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const charWidth = (character) => {
  if (/[\u2e80-\u9fff\uf900-\ufaff]/.test(character)) return 1;
  if (/[A-Z0-9]/.test(character)) return 0.72;
  if (/\s/.test(character)) return 0.32;
  if (/[^a-zA-Z0-9]/.test(character)) return 0.42;
  return 0.58;
};

function wrapTitle(title, maxUnits = 26, maxLines = 3) {
  const words = /[\u2e80-\u9fff]/.test(title) ? [...title] : title.split(/\s+/);
  const separator = /[\u2e80-\u9fff]/.test(title) ? '' : ' ';
  const lines = [];
  let line = '';
  let units = 0;
  let truncated = false;

  for (const word of words) {
    const token = line ? `${separator}${word}` : word;
    const tokenUnits = [...token].reduce((sum, character) => sum + charWidth(character), 0);
    if (line && units + tokenUnits > maxUnits) {
      if (/^[，。！？、；：,.!?:;)]/.test(word)) {
        line += word;
        continue;
      }
      lines.push(line);
      if (lines.length === maxLines) {
        truncated = true;
        line = '';
        break;
      }
      line = word;
      units = [...word].reduce((sum, character) => sum + charWidth(character), 0);
    } else {
      line += token;
      units += tokenUnits;
    }
  }

  if (line && lines.length < maxLines) lines.push(line);
  if (truncated && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[\s，,:：-]+$/, '')}…`;
  }
  return lines.slice(0, maxLines);
}

function createSvg({ title, category, language, description }) {
  const accent = colors[category] || colors.Guides;
  const lines = wrapTitle(title, 14);
  const titleSize = lines.length > 2 ? 54 : 62;
  const lineHeight = titleSize * 1.18;
  const titleMarkup = lines.map((line, index) => (
    `<tspan x="82" y="${246 + index * lineHeight}">${escapeXml(line)}</tspan>`
  )).join('');
  const categoryLabel = categoryByName.get(category)?.[language]?.title || (language === 'zh' ? 'HSM Kit 安全知识库' : 'HSM Kit Security Guides');
  const shortDescription = wrapTitle(description || '', /[\u2e80-\u9fff]/.test(description || '') ? 42 : 50, 1)[0] || '';

  return `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#F5F7FA"/>
    <rect x="0" y="0" width="1200" height="14" fill="${accent}"/>
    <rect x="1010" y="14" width="190" height="616" fill="${accent}" opacity="0.08"/>
    <path d="M1040 70h110v110h-110z" fill="${accent}" opacity="0.12"/>
    <path d="M1095 88l36 12v28c0 28-17 48-36 58-19-10-36-30-36-58v-28z" fill="none" stroke="${accent}" stroke-width="6"/>
    <circle cx="1095" cy="121" r="12" fill="none" stroke="${accent}" stroke-width="6"/>
    <path d="M1095 133v31m0-13h15" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>

    <g font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Noto Sans CJK SC', 'Microsoft YaHei', Arial, sans-serif">
      <rect x="82" y="60" width="58" height="58" rx="12" fill="${accent}"/>
      <path d="M111 72l18 6v14c0 14-9 24-18 29-9-5-18-15-18-29V78z" fill="none" stroke="#fff" stroke-width="3"/>
      <circle cx="111" cy="89" r="6" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M111 95v16m0-7h7" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <text x="155" y="99" font-size="30" font-weight="700" fill="#172033">HSM Kit</text>

      <rect x="82" y="150" width="${Math.max(190, categoryLabel.length * (language === 'zh' ? 24 : 14) + 38)}" height="42" rx="8" fill="${accent}" opacity="0.12"/>
      <text x="101" y="179" font-size="20" font-weight="650" fill="${accent}">${escapeXml(categoryLabel)}</text>

      <text font-size="${titleSize}" font-weight="760" fill="#172033" letter-spacing="0">${titleMarkup}</text>
      <text x="82" y="505" font-size="23" fill="#5A6578">${escapeXml(shortDescription)}</text>

      <line x1="82" y1="550" x2="1118" y2="550" stroke="#D8DEE8" stroke-width="2"/>
      <text x="82" y="592" font-size="22" font-weight="600" fill="#445064">hsmkit.com/guides</text>
      <text x="1118" y="592" text-anchor="end" font-size="20" fill="#6B7280">${language === 'zh' ? '中文' : 'ENGLISH'}</text>
    </g>
  </svg>`;
}

async function renderImage(outputPath, data) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(Buffer.from(createSvg(data)))
    .png({ compressionLevel: 9, palette: true })
    .toFile(outputPath);
}

await fs.rm(outputRoot, { recursive: true, force: true });
let generated = 0;

for (const language of ['en', 'zh']) {
  const articles = JSON.parse(await fs.readFile(path.join(root, `src/data/guides/${language}.json`), 'utf8'));
  const copy = language === 'zh'
    ? { title: 'HSM Kit 安全知识库', description: '密码学、支付安全、PKI 与 HSM 密钥管理技术指南' }
    : { title: 'HSM Kit Security Knowledge Base', description: 'Technical guides to cryptography, payment security, PKI, and HSM key management' };

  await renderImage(path.join(outputRoot, language, 'index.png'), {
    ...copy,
    category: 'Guides',
    language,
  });
  generated += 1;

  for (const category of categories) {
    await renderImage(path.join(outputRoot, language, `category-${category.slug}.png`), {
      title: category[language].title,
      description: category[language].description,
      category: category.category,
      language,
    });
    generated += 1;
  }

  for (const article of articles) {
    await renderImage(path.join(outputRoot, language, `${article.slug}.png`), {
      title: article.title,
      description: article.excerpt,
      category: article.category,
      language,
    });
    generated += 1;
  }
}

console.log(`Generated ${generated} guide OG images in ${path.relative(root, outputRoot)}.`);
