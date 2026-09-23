const SITE_ORIGIN = 'https://hsmkit.com';

const isFilePath = (pathname: string): boolean => /\/[^/]+\.[a-z0-9]+$/i.test(pathname);

export const normalizePublicPath = (pathname: string): string => {
  if (!pathname || pathname === '/' || isFilePath(pathname)) return pathname || '/';
  return `${pathname.replace(/\/+$/, '')}/`;
};

export const normalizeRoutePath = (pathname: string): string => {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '');
};

export const normalizeSiteUrl = (value: string): string => {
  try {
    const url = new URL(value, SITE_ORIGIN);
    if (url.origin !== SITE_ORIGIN) return value;
    url.pathname = normalizePublicPath(url.pathname);
    return value.startsWith('/') ? `${url.pathname}${url.search}${url.hash}` : url.toString();
  } catch {
    return value;
  }
};