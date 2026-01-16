import type { Language } from '../locales';

/**
 * Generate the correct path for guides pages based on language
 * - English: /guides or /guides/:slug
 * - Other languages: /:lang/guides or /:lang/guides/:slug
 */
export const getGuidesPath = (language: Language, slug?: string): string => {
  const basePath = language === 'en' ? '/guides' : `/${language}/guides`;
  return slug ? `${basePath}/${slug}` : basePath;
};

/**
 * Parse language from URL path for guides pages
 * Returns the language code if present, otherwise 'en'
 */
export const parseGuidesLanguage = (pathname: string): Language | null => {
  const langMatch = pathname.match(/^\/(zh|ja|ko|de|fr)\/guides/);
  if (langMatch) {
    return langMatch[1] as Language;
  }
  if (pathname.startsWith('/guides')) {
    return 'en';
  }
  return null;
};

/**
 * Check if current path is a guides page
 */
export const isGuidesPage = (pathname: string): boolean => {
  return pathname.startsWith('/guides') || /^\/(zh|ja|ko|de|fr)\/guides/.test(pathname);
};

/**
 * Extract slug from guides pathname, if any
 */
export const getGuidesSlug = (pathname: string): string | null => {
  const parts = pathname.split('/').filter(Boolean);
  // /guides or /guides/:slug
  if (parts[0] === 'guides') return parts[1] || null;
  // /:lang/guides or /:lang/guides/:slug
  if (parts.length >= 2 && ['zh', 'ja', 'ko', 'de', 'fr'].includes(parts[0]) && parts[1] === 'guides') {
    return parts[2] || null;
  }
  return null;
};
