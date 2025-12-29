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
  aes: SEOContent;
  des: SEOContent;
  rsa: SEOContent;
  ecc: SEOContent;
  fpe: SEOContent;
  keyGenerator: SEOContent;
  tr31: SEOContent;
  kcv: SEOContent;
  pinBlock: SEOContent;
}

// Import SEO content from language files
import en from './en';
import zh from './zh';
import ja from './ja';
import ko from './ko';
import de from './de';
import fr from './fr';

// Build seoContent from language files
const seoContent: Record<string, PageSEO> = {
  en: en.seo,
  zh: zh.seo,
  ja: ja.seo,
  ko: ko.seo,
  de: de.seo,
  fr: fr.seo,
};

export default seoContent;
