import fs from 'node:fs/promises';
import puppeteer from 'puppeteer';

const baseUrl = process.env.GUIDES_AUDIT_URL || 'http://127.0.0.1:4174';
const languages = ['en', 'zh'];
const articles = [];

for (const language of languages) {
  const metadata = JSON.parse(await fs.readFile(`src/data/guides/${language}.json`, 'utf8'));
  metadata.forEach(article => articles.push({ language, slug: article.slug }));
}

const cases = articles.flatMap(article => [
  { ...article, theme: 'light', width: 1280, height: 900, viewport: 'desktop' },
  { ...article, theme: 'dark', width: 1280, height: 900, viewport: 'desktop' },
  { ...article, theme: 'dark', width: 390, height: 844, viewport: 'mobile' },
]);

const textSelectors = [
  '.article-content p',
  '.article-content li',
  '.article-content th',
  '.article-content td',
  '.article-content pre code',
  '.article-content code:not(pre code)',
  '.article-content a',
  '.guide-references h3',
  '.guide-references a',
  '.article-pagination a > div > div:last-child',
  '.guides-read-next h5',
  '.guides-read-next .ant-typography-secondary',
];

const scrollSelectors = [
  '.guide-detail-hero',
  '.guide-tool-cta',
  '.article-content table',
  '.article-content pre',
  '.guide-references',
  '.article-pagination',
  '.guides-read-next',
  'footer',
];

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-service-worker', '--disable-cache'],
});

let nextCase = 0;
const results = [];

const runWorker = async () => {
  const page = await browser.newPage();
  await page.setBypassServiceWorker(true);
  await page.setCacheEnabled(false);
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });

  while (nextCase < cases.length) {
    const testCase = cases[nextCase++];
    const route = `${testCase.language === 'zh' ? '/zh' : ''}/guides/${testCase.slug}`;
    try {
      await page.setViewport({ width: testCase.width, height: testCase.height });
      await page.evaluate(theme => localStorage.setItem('hsmkit-theme', theme), testCase.theme);
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForSelector('.article-content', { timeout: 10000 });
      const result = await page.evaluate(({ textSelectors, scrollSelectors }) => {
        const parseColor = value => {
          const match = value.match(/rgba?\(([^)]+)\)/);
          if (!match) return null;
          const values = match[1].split(',').map(item => Number.parseFloat(item));
          return { r: values[0], g: values[1], b: values[2], a: values[3] ?? 1 };
        };
        const luminance = color => {
          const channels = [color.r, color.g, color.b].map(channel => {
            const normalized = channel / 255;
            return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
        };
        const contrast = (foreground, background) => {
          const foregroundLuminance = luminance(foreground);
          const backgroundLuminance = luminance(background);
          return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
            / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
        };
        const composite = (foreground, background) => ({
          r: foreground.r * foreground.a + background.r * (1 - foreground.a),
          g: foreground.g * foreground.a + background.g * (1 - foreground.a),
          b: foreground.b * foreground.a + background.b * (1 - foreground.a),
          a: 1,
        });
        const isVisible = element => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.display !== 'none'
            && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0;
        };
        const findBackground = element => {
          const ancestors = [];
          for (let current = element; current; current = current.parentElement) ancestors.push(current);
          let background = { r: 255, g: 255, b: 255, a: 1 };
          ancestors.reverse().forEach(ancestor => {
            const color = parseColor(getComputedStyle(ancestor).backgroundColor);
            if (color && color.a > 0) background = composite(color, background);
          });
          return background;
        };

        for (const selector of scrollSelectors) {
          document.querySelectorAll(selector).forEach(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
        }
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });

        const lowContrast = [];
        for (const selector of textSelectors) {
          document.querySelectorAll(selector).forEach(element => {
            if (!isVisible(element)) return;
            const foreground = parseColor(getComputedStyle(element).color);
            if (!foreground) return;
            const background = findBackground(element);
            const ratio = contrast(composite(foreground, background), background);
            if (ratio < 4.5) {
              lowContrast.push({
                selector,
                text: (element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
                ratio: Number(ratio.toFixed(2)),
              });
            }
          });
        }

        const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        const footer = document.querySelector('footer');
        return {
          lowContrast,
          overflow: scrollWidth > window.innerWidth + 1,
          bottomReached: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
          footerPresent: Boolean(footer),
          pageHeight: document.documentElement.scrollHeight,
        };
      }, { textSelectors, scrollSelectors });
      results.push({ ...testCase, route, ...result });
    } catch (error) {
      results.push({ ...testCase, route, error: error instanceof Error ? error.message : String(error) });
    }
  }
  await page.close();
};

try {
  await Promise.all(Array.from({ length: 8 }, runWorker));
} finally {
  await browser.close();
}

const lowContrast = results.flatMap(result => (
  result.lowContrast || []
).map(issue => ({ route: result.route, theme: result.theme, viewport: result.viewport, ...issue })));
const overflows = results.filter(result => result.overflow);
const bottomFailures = results.filter(result => !result.bottomReached || !result.footerPresent);
const errors = results.filter(result => result.error);

const summary = {
  casesTotal: cases.length,
  casesCompleted: results.length,
  lowContrastCount: lowContrast.length,
  overflowCount: overflows.length,
  bottomFailureCount: bottomFailures.length,
  errorCount: errors.length,
  lowestContrast: lowContrast.sort((left, right) => left.ratio - right.ratio).slice(0, 20),
  overflows: overflows.slice(0, 20).map(result => ({ route: result.route, theme: result.theme, viewport: result.viewport })),
  bottomFailures: bottomFailures.slice(0, 20).map(result => ({ route: result.route, theme: result.theme, viewport: result.viewport })),
  errors: errors.slice(0, 20).map(result => ({ route: result.route, theme: result.theme, viewport: result.viewport, error: result.error })),
};

console.log(JSON.stringify(summary, null, 2));
if (lowContrast.length || overflows.length || bottomFailures.length || errors.length || results.length !== cases.length) {
  process.exitCode = 1;
}
