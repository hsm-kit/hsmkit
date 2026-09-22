import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import puppeteer from 'puppeteer';

const root = process.cwd();
const dist = path.join(root, 'dist');
const categories = JSON.parse(await fs.readFile(path.join(root, 'src/data/guides/categories.json'), 'utf8'));
const guideRoutes = [];
const categorySlugs = new Set(categories.map(category => category.slug));
const concurrency = Number.parseInt(process.env.GUIDE_PRERENDER_CONCURRENCY || '1', 10);
const maxAttempts = Number.parseInt(process.env.GUIDE_PRERENDER_ATTEMPTS || '3', 10);
const navigationTimeout = Number.parseInt(process.env.GUIDE_PRERENDER_TIMEOUT || '30000', 10);

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
      response.writeHead(200, {
        'Content-Type': contentTypes['.html'],
        'Cache-Control': 'no-store',
      });
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

const getRouteType = route => {
  const segments = route.split('/').filter(Boolean);
  const slug = segments.at(-1);
  if (slug === 'guides') return 'index';
  return categorySlugs.has(slug) ? 'category' : 'article';
};

const renderRoute = async (page, route) => {
  const routeType = getRouteType(route);
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await page.goto(`http://127.0.0.1:${address.port}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: navigationTimeout,
      });
      await page.waitForFunction(({ type }) => {
        const main = document.querySelector('main');
        const heading = main?.querySelector('h1');
        if (!main || !heading || document.querySelector('.ant-skeleton')) return false;
        if (type === 'article') {
          const article = main.querySelector('.article-content');
          return Boolean(article && article.textContent && article.textContent.trim().length > 200
            && main.querySelector('.guide-references'));
        }
        if (type === 'category') return main.querySelectorAll('.ant-card').length > 0;
        return main.querySelectorAll('[data-guide-card]').length > 0;
      }, { timeout: navigationTimeout }, { type: routeType });

      const entryState = await page.evaluate(() => ({
        correct: Boolean(document.querySelector('.guides-language-switcher select'))
          && !document.querySelector('.ant-menu-horizontal'),
        title: document.title,
        scripts: [...document.scripts].map(script => script.src).filter(Boolean),
        hasMainMenu: Boolean(document.querySelector('.ant-menu-horizontal')),
        hasGuidesSwitcher: Boolean(document.querySelector('.guides-language-switcher select')),
        templateMarker: document.querySelector('meta[name="guide-prerender-template"]')?.getAttribute('content'),
      }));
      if (!entryState.correct) {
        throw new Error(`incorrect application entry rendered ${JSON.stringify(entryState)}`);
      }

      await page.evaluate(() => new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }));
      return;
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        console.warn(`Retrying ${route} after attempt ${attempt}/${maxAttempts}: ${error instanceof Error ? error.message : error}`);
        await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => undefined);
      }
    }
  }

  throw new Error(`${route}: failed after ${maxAttempts} attempts: ${lastError instanceof Error ? lastError.message : lastError}`);
};

try {
  const warmupPage = await browser.newPage();
  await warmupPage.setBypassServiceWorker(true);
  await warmupPage.setCacheEnabled(false);
  await warmupPage.goto(`http://127.0.0.1:${address.port}/guides`, {
    waitUntil: 'domcontentloaded',
    timeout: navigationTimeout,
  });
  await warmupPage.waitForSelector('.guides-language-switcher select', { timeout: navigationTimeout });
  await warmupPage.close();

  const workers = Array.from({ length: concurrency }, async () => {
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setBypassServiceWorker(true);
    try {
      while (true) {
        const route = guideRoutes[completed++];
        if (!route) break;
        await renderRoute(page, route);

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
    } finally {
      await page.close();
    }
  });
  await Promise.all(workers);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

await fs.rm(path.join(dist, 'guides.html'), { force: true });

console.log(`Prerendered ${guideRoutes.length} guide routes from guides.html.`);
