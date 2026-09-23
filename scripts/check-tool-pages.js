import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const routeConfig = await fs.readFile(path.join(root, 'src/routeConfig.ts'), 'utf8');
const routeSection = routeConfig.slice(0, routeConfig.indexOf('] as const;'));
const toolPaths = [...routeSection.matchAll(/\{ key: '[^']+', path: '([^']+)' \}/g)]
  .map(([, routePath]) => routePath)
  .filter((routePath) => routePath !== '/' && routePath !== '/guides');

const blockedPatterns = [
  /Temporarily unavailable/i,
  /暂时不可用/,
  /Something went wrong/i,
  /Content not available/i,
];

const failures = [];
const hasExtractedStyles = html => /<link\b[^>]*\bdata-prerender-styles\b[^>]*>/i.test(html);
const hasNonEmptyAntStyles = html => [...html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi)]
  .some(([, attributes, css]) => /\b(?:data-rc-order|data-css-hash|data-icon)(?:=|\s|>)/i.test(attributes) && css.trim());
const layeredThemeStyles = new Map();
const hasLayeredThemeStyles = async html => {
  const href = html.match(/<link\b(?=[^>]*\bdata-prerender-styles\b)[^>]*\bhref="([^"]+)"[^>]*>/i)?.[1];
  if (!href) return false;
  if (!layeredThemeStyles.has(href)) {
    const css = await fs.readFile(path.join(root, 'dist', href.replace(/^\//, '')), 'utf8');
    layeredThemeStyles.set(href, css.includes('@layer prerender-theme'));
  }
  return layeredThemeStyles.get(href);
};

for (const routePath of toolPaths) {
  const htmlPath = path.join(root, 'dist', routePath.slice(1), 'index.html');
  let html;
  try {
    html = await fs.readFile(htmlPath, 'utf8');
  } catch {
    failures.push(`${routePath}: missing prerendered HTML`);
    continue;
  }

  if (blockedPatterns.some((pattern) => pattern.test(html))) {
    failures.push(`${routePath}: blocked or error state rendered`);
  }
  if (!/<(?:input|textarea|button)\b|role="(?:textbox|button|combobox|radio|checkbox)"/i.test(html)) {
    failures.push(`${routePath}: no interactive tool controls rendered`);
  }
  const robotsTags = html.match(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi) || [];
  if (robotsTags.some((tag) => /\bnoindex\b/i.test(tag))) {
    failures.push(`${routePath}: unexpectedly marked noindex`);
  }
  const canonical = `https://hsmkit.com${routePath}/`;
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
    failures.push(`${routePath}: canonical URL is not the final trailing-slash URL`);
  }
  if (!hasExtractedStyles(html) || hasNonEmptyAntStyles(html) || !await hasLayeredThemeStyles(html)) {
    failures.push(`${routePath}: Ant Design prerender styles were not extracted`);
  }

  const sectionOrder = [
    ['usage', html.indexOf('tool-page-usage')],
    ['related guides', html.indexOf('tool-page-related')],
    ['FAQ', html.indexOf('tool-page-faq')],
    ['share', html.indexOf('tool-page-share')],
  ].filter(([, index]) => index !== -1);
  if (sectionOrder.some(([, index], position) => position > 0 && sectionOrder[position - 1][1] > index)) {
    failures.push(`${routePath}: supporting sections are out of order (${sectionOrder.map(([name]) => name).join(' -> ')})`);
  }
}

if (failures.length > 0) {
  console.error(`Tool page smoke check failed (${failures.length}/${toolPaths.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Tool page smoke check passed: ${toolPaths.length}/${toolPaths.length} pages rendered.`);
}

const guideFailures = [];
const guideLanguages = [
  { language: 'en', metadata: 'en.json', routePrefix: '/guides' },
  { language: 'zh', metadata: 'zh.json', routePrefix: '/zh/guides' },
];
const categories = JSON.parse(await fs.readFile(path.join(root, 'src/data/guides/categories.json'), 'utf8'));
const mainHtml = await fs.readFile(path.join(root, 'dist/index.html'), 'utf8');
const mainEntry = mainHtml.match(/<script\b[^>]*\bsrc="([^"]*\/assets\/main-[^"]+\.js)"/)?.[1];
const usesStaticGuideDelivery = html => /<script\b[^>]*\bsrc="\/guides-static\.js\?v=[a-f0-9]{12}"[^>]*>/i.test(html)
  && !/<script\b[^>]*\btype="module"/i.test(html);
const hasFinalGuideUrls = html => /<link\b[^>]*\brel="canonical"[^>]*\bhref="https:\/\/hsmkit\.com\/(?:zh\/)?guides(?:\/[a-z0-9-]+)?\/"/i.test(html)
  && !/<link\b[^>]*\b(?:rel="canonical"|hreflang="[^"]+")[^>]*\bhref="https:\/\/hsmkit\.com\/(?:zh\/)?guides(?:\/[a-z0-9-]+)?"(?=[ >])/i.test(html);
let checkedOgImages = 0;
let checkedArticles = 0;
let checkedCategories = 0;
let checkedIndexes = 0;

const findRedirectingGuideLinks = (html, language) => {
  const hrefs = [...html.matchAll(/href="(\/(?:zh\/)?guides(?:\/[a-z0-9-]+)?)"/gi)].map(match => match[1]);
  return hrefs.filter(href => !href.endsWith('/') || (language === 'zh' && href.startsWith('/guides/')));
};

for (const { language, metadata, routePrefix } of guideLanguages) {
  const articles = JSON.parse(await fs.readFile(path.join(root, 'src/data/guides', metadata), 'utf8'));
  const listHtml = await fs.readFile(path.join(root, 'dist', routePrefix.slice(1), 'index.html'), 'utf8');
  checkedIndexes += 1;
  if (!listHtml.includes('"@type":"CollectionPage"') || !listHtml.includes('"@type":"ItemList"')) {
    guideFailures.push(`${routePrefix}: missing CollectionPage or ItemList schema`);
  }
  if (!usesStaticGuideDelivery(listHtml)) {
    guideFailures.push(`${routePrefix}: static guide delivery is not configured`);
  }
  if (!hasFinalGuideUrls(listHtml)) guideFailures.push(`${routePrefix}: canonical or hreflang URL redirects`);
  if (findRedirectingGuideLinks(listHtml, language).length > 0) guideFailures.push(`${routePrefix}: internal guide link redirects or changes language`);
  const listOgPath = path.join(root, 'dist/og/guides', language, 'index.png');
  const listOgMetadata = await sharp(listOgPath).metadata();
  checkedOgImages += 1;
  if (listOgMetadata.width !== 1200 || listOgMetadata.height !== 630) {
    guideFailures.push(`${routePrefix}: invalid OG image dimensions`);
  }

  for (const category of categories) {
    checkedCategories += 1;
    const routePath = `${routePrefix}/${category.slug}`;
    let html;
    try {
      html = await fs.readFile(path.join(root, 'dist', routePath.slice(1), 'index.html'), 'utf8');
    } catch {
      guideFailures.push(`${routePath}: missing category HTML`);
      continue;
    }
    if (!html.includes('"@type":"CollectionPage"') || !html.includes('"@type":"ItemList"')) {
      guideFailures.push(`${routePath}: missing category CollectionPage schema`);
    }
    if (!usesStaticGuideDelivery(html)) {
      guideFailures.push(`${routePath}: category does not use static delivery`);
    }
    if (!hasFinalGuideUrls(html)) guideFailures.push(`${routePath}: canonical or hreflang URL redirects`);
    if (findRedirectingGuideLinks(html, language).length > 0) guideFailures.push(`${routePath}: internal guide link redirects or changes language`);
    const ogFile = `category-${category.slug}.png`;
    if (!html.includes(`/og/guides/${language}/${ogFile}`)) {
      guideFailures.push(`${routePath}: incorrect category OG image`);
    }
    const metadata = await sharp(path.join(root, 'dist/og/guides', language, ogFile)).metadata();
    checkedOgImages += 1;
    if (metadata.width !== 1200 || metadata.height !== 630) {
      guideFailures.push(`${routePath}: invalid category OG image dimensions`);
    }
  }

  for (const article of articles) {
    checkedArticles += 1;
    const routePath = `${routePrefix}/${article.slug}`;
    const htmlPath = path.join(root, 'dist', routePath.slice(1), 'index.html');
    let html;
    try {
      html = await fs.readFile(htmlPath, 'utf8');
    } catch {
      guideFailures.push(`${routePath}: missing prerendered HTML`);
      continue;
    }
    if (!html.includes('guides-read-next-title') || html.includes('📖')) {
      guideFailures.push(`${routePath}: invalid Read Next heading structure`);
    }
    if (!html.includes('property="og:type" content="article"') || !html.includes('"@type":"Article"')) {
      guideFailures.push(`${routePath}: missing article social or structured metadata`);
    }
    if (!html.includes('HSM Kit Editorial Team') || !html.includes('HSM Kit Security Review Team') || !html.includes('"reviewedBy"') || !html.includes('"citation"')) {
      guideFailures.push(`${routePath}: missing authorship, review, or citation metadata`);
    }
    const ogFile = `${article.slug}.png`;
    if (!html.includes(`/og/guides/${language}/${ogFile}`)) {
      guideFailures.push(`${routePath}: incorrect article OG image`);
    }
    const metadata = await sharp(path.join(root, 'dist/og/guides', language, ogFile)).metadata();
    checkedOgImages += 1;
    if (metadata.width !== 1200 || metadata.height !== 630) {
      guideFailures.push(`${routePath}: invalid article OG image dimensions`);
    }
    const expectedLang = language === 'zh' ? 'zh-CN' : 'en';
    if (!html.includes(`<html lang="${expectedLang}"`)) {
      guideFailures.push(`${routePath}: incorrect html lang`);
    }
    if (!usesStaticGuideDelivery(html)) {
      guideFailures.push(`${routePath}: article does not use static delivery`);
    }
    const markdownPath = path.join(path.dirname(htmlPath), 'index.md');
    try {
      const markdown = await fs.readFile(markdownPath, 'utf8');
      if (!markdown.startsWith(`# ${article.title}\n`) || !html.includes(`type="text/markdown" href="${routePath}/index.md"`)) {
        guideFailures.push(`${routePath}: invalid Markdown representation or alternate link`);
      }
    } catch {
      guideFailures.push(`${routePath}: missing Markdown representation`);
    }
    if (!hasExtractedStyles(html) || hasNonEmptyAntStyles(html) || !await hasLayeredThemeStyles(html)) {
      guideFailures.push(`${routePath}: Ant Design prerender styles were not extracted`);
    }
    if (!hasFinalGuideUrls(html)) guideFailures.push(`${routePath}: canonical or hreflang URL redirects`);
    if (findRedirectingGuideLinks(html, language).length > 0) guideFailures.push(`${routePath}: internal guide link redirects or changes language`);
  }
}

if (!mainEntry) {
  guideFailures.push('main application entry is missing');
}

const discoveryFiles = [
  ['llms.txt', /^# HSM Kit/m],
  ['ai/tools.json', /"tools"\s*:/],
  ['404.html', /noindex, nofollow/],
  ['55bc76b3ce475067e11cca8d69e2edd4.txt', /55bc76b3ce475067e11cca8d69e2edd4/],
];
for (const [file, pattern] of discoveryFiles) {
  try {
    const content = await fs.readFile(path.join(root, 'dist', file), 'utf8');
    if (!pattern.test(content)) guideFailures.push(`${file}: invalid discovery artifact`);
  } catch {
    guideFailures.push(`${file}: missing discovery artifact`);
  }
}

if (guideFailures.length > 0) {
  console.error(`Guide page smoke check failed (${guideFailures.length} issues):`);
  guideFailures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Guide page smoke check passed: ${checkedArticles}/${checkedArticles} articles, ${checkedCategories}/${checkedCategories} categories, ${checkedIndexes}/${checkedIndexes} indexes, and ${checkedOgImages}/${checkedOgImages} OG images.`);
}