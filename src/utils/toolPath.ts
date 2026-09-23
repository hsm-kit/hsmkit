import type { Language } from '../locales';
import { normalizePublicPath, normalizeRoutePath } from './publicUrl';
import localizedTools from '../data/localized-tools.json';

export const localizedToolPaths: Record<string, string> = Object.fromEntries(
  localizedTools.map(tool => [tool.englishPath, tool.chinesePath]),
);

const englishByChinesePath = new Map<string, string>(
  Object.entries(localizedToolPaths).map(([english, chinese]) => [chinese, english]),
);

export const getEnglishToolPath = (path: string): string => {
  const routePath = normalizeRoutePath(path);
  return englishByChinesePath.get(routePath) || routePath;
};

export const getLocalizedToolPath = (path: string, language: Language): string => {
  const englishPath = getEnglishToolPath(path);
  const localizedPath = language === 'zh'
    ? localizedToolPaths[englishPath] || englishPath
    : englishPath;
  return normalizePublicPath(localizedPath);
};

export const getToolRouteLanguage = (path: string): 'en' | 'zh' | undefined => {
  const routePath = normalizeRoutePath(path);
  if (englishByChinesePath.has(routePath)) return 'zh';
  if (routePath in localizedToolPaths) return 'en';
  return undefined;
};

export const getToolAlternates = (path: string) => {
  const englishPath = getEnglishToolPath(path);
  const chinesePath = localizedToolPaths[englishPath];
  if (!chinesePath) return undefined;
  return [
    { lang: 'en', href: `https://hsmkit.com${normalizePublicPath(englishPath)}` },
    { lang: 'zh', href: `https://hsmkit.com${normalizePublicPath(chinesePath)}` },
    { lang: 'x-default', href: `https://hsmkit.com${normalizePublicPath(englishPath)}` },
  ];
};