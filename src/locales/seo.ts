/**
 * SEO Content for all pages in multiple languages
 * This helps search engines understand page content and improves rankings
 * 
 * SEO content is now integrated into each language file (en.ts, zh.ts, etc.)
 * This file re-exports them for backward compatibility with page components
 */

export interface SEOContent {
  title: string;
  description: string;
  keywords: string;
  faqTitle: string;
  usageTitle: string;
  faqs: Array<{ question: string; answer: string }>;
  usage: string[];
}

export interface PageSEO {
  home: SEOContent;
  asn1: SEOContent;
  as2805: SEOContent;
  aes: SEOContent;
  des: SEOContent;
  rsa: SEOContent;
  ecc: SEOContent;
  fpe: SEOContent;
  keyGenerator: SEOContent;
  keyshare: SEOContent;
  futurexKeys: SEOContent;
  atallaKeys: SEOContent;
  safenetKeys: SEOContent;
  thalesKeys: SEOContent;
  thalesKeyBlock: SEOContent;
  tr31: SEOContent;
  kcv: SEOContent;
  pinBlock: SEOContent;
  pinBlockGeneral: SEOContent;
  pinBlockAes: SEOContent;
  pinOffset: SEOContent;
  pinPvv: SEOContent;
  bitmap: SEOContent;
  cvv: SEOContent;
  amexCsc: SEOContent;
  mastercardCvc3: SEOContent;
  dukpt: SEOContent;
  dukptAes: SEOContent;
  iso9797Mac: SEOContent;
  ansiMac: SEOContent;
  as2805Mac: SEOContent;
  tdesCbcMac: SEOContent;
  hmac: SEOContent;
  cmac: SEOContent;
  retailMac: SEOContent;
  visaCertificates: SEOContent;
  zka: SEOContent;
  // Generic tools
  hash: SEOContent;
  encoding: SEOContent;
  bcd: SEOContent;
  checkDigits: SEOContent;
  base64: SEOContent;
  base94: SEOContent;
  messageParser: SEOContent;
  rsaDer: SEOContent;
  uuid: SEOContent;
  // PKI tools
  sslCert: SEOContent;
}

// Import only English (default) and build seoContent dynamically from translations cache
import en from './en';
import { getCachedTranslations, type Language } from './index';

// Build seoContent dynamically - only return languages that are already loaded
const buildSeoContent = (): Record<string, Partial<PageSEO>> => {
  const result: Record<string, Partial<PageSEO>> = {
    en: en.seo as unknown as Partial<PageSEO>,
  };
  
  // Add other languages only if they're already cached (loaded)
  const langs: Language[] = ['zh', 'ja', 'ko', 'de', 'fr'];
  for (const lang of langs) {
    const cached = getCachedTranslations(lang);
    if (cached?.seo) {
      result[lang] = cached.seo as unknown as Partial<PageSEO>;
    }
  }
  
  return result;
};

// Use Proxy to build seoContent lazily and keep it updated as languages load
const seoContent = new Proxy({} as Record<string, Partial<PageSEO>>, {
  get(_target, prop: string) {
    // Rebuild on each access to pick up newly loaded languages
    const current = buildSeoContent();
    return current[prop];
  },
  ownKeys() {
    return Object.keys(buildSeoContent());
  },
  getOwnPropertyDescriptor(_target, prop) {
    const current = buildSeoContent();
    if (prop in current) {
      return {
        enumerable: true,
        configurable: true,
      };
    }
    return undefined;
  },
});

export default seoContent;
