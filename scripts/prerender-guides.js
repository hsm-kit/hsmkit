import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import puppeteer from 'puppeteer';

const root = process.cwd();
const dist = path.join(root, 'dist');
const categories = JSON.parse(await fs.readFile(path.join(root, 'src/data/guides/categories.json'), 'utf8'));
const guideRoutes = [];

for (const language of ['en', 'zh']) {
  const prefix = language === 'en' ? '/guides' : '/zh/guides';
  const articles = JSON.parse(await fs.readFile(path.join(root, `src/data/guides/${language}.json`), 'utf8'));
  guideRoutes.push(prefix);
  categories.forEach(category => guideRoutes.push(`${prefix}/${category.slug}`));
  articles.forEach(article => guideRoutes.push(`${prefix}/${article.slug}`));
}

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8',
};

const guideTemplate = (await fs.readFile(path.join(dist, 'guides.html'), 'utf8'))
  .replace('</head>', '<meta name="guide-prerender-template" content="guides"></head>');
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
    if (/^\/(?:zh\/)?guides(?:\/|$)/.test(pathname)) {
      response.writeHead(200, { 'Content-Type': contentTypes['.html'] });
      response.end(guideTemplate);
      return;
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    const filePath = path.resolve(dist, relativePath);
    if (!filePath.startsWith(`${path.resolve(dist)}${path.sep}`) && filePath !== path.resolve(dist, 'index.html')) {
      response.writeHead(403).end();
      return;
    }
    const body = await fs.readFile(filePath);
    response.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Unable to start guide prerender server');

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-service-worker', '--disable-cache'],
});
let completed = 0;

try {
  const workers = Array.from({ length: 3 }, async () => {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setBypassServiceWorker(true);
    while (true) {
      const route = guideRoutes[completed++];
      if (!route) break;
      await page.goto(`http://127.0.0.1:${address.port}${route}`, { waitUntil: 'networkidle0', timeout: 60000 });
      await page.waitForSelector('main h1', { timeout: 30000 });
      const entryState = await page.evaluate(() => ({
        correct: Boolean(document.querySelector('.guides-language-switcher select'))
          && !document.querySelector('.ant-menu-horizontal'),
        title: document.title,
        scripts: [...document.scripts].map(script => script.src).filter(Boolean),
        hasMainMenu: Boolean(document.querySelector('.ant-menu-horizontal')),
        hasGuidesSwitcher: Boolean(document.querySelector('.guides-language-switcher select')),
        templateMarker: document.querySelector('meta[name="guide-prerender-template"]')?.getAttribute('content'),
        rootChild: document.getElementById('root')?.firstElementChild?.outerHTML.slice(0, 500),
        header: document.querySelector('header')?.outerHTML.slice(0, 1000),
      }));
      if (!entryState.correct) {
        throw new Error(`${route}: incorrect application entry rendered ${JSON.stringify(entryState)}`);
      }
      if (/\/guides\/(?!keys$|payment$|cipher$|pki$|generic$)[^/]+$/.test(route)) {
        await page.waitForSelector('.article-content', { timeout: 30000 });
      }

      let html = await page.content();
      html = html
        .replace(/<link\b(?=[^>]*\brel=["']modulepreload["'])[^>]*>/gi, '')
        .replace(/<script\b(?=[^>]*\btype=["']module["'])[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<script[^>]*>window\.__PRERENDER_INJECTED[^<]*<\/script>/g, '')
        .replace(/<meta name="guide-prerender-template" content="guides">/g, '')
        .replace('</body>', '<script src="/guides-static.js" defer></script></body>');

      const outputPath = path.join(dist, route.replace(/^\//, ''), 'index.html');
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html);
    }
    await page.close();
  });
  await Promise.all(workers);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

await fs.rm(path.join(dist, 'guides.html'), { force: true });

console.log(`Prerendered ${guideRoutes.length} guide routes from guides.html.`);
