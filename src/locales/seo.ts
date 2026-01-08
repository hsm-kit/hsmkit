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

// Import SEO content from language files
import en from './en';
import zh from './zh';
import ja from './ja';
import ko from './ko';
import de from './de';
import fr from './fr';

// Build seoContent from language files
const seoContent: Record<string, Partial<PageSEO>> = {
  en: en.seo as unknown as Partial<PageSEO>,
  zh: zh.seo as unknown as Partial<PageSEO>,
  ja: ja.seo as unknown as Partial<PageSEO>,
  ko: ko.seo as unknown as Partial<PageSEO>,
  de: de.seo as unknown as Partial<PageSEO>,
  fr: fr.seo as unknown as Partial<PageSEO>,
};

export default seoContent;
