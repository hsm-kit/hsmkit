/**
 * SEO Content for all pages in multiple languages
 * Re-exports SEO data from i18next resource bundles for backward compatibility
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
  hash: SEOContent;
  encoding: SEOContent;
  bcd: SEOContent;
  checkDigits: SEOContent;
  base64: SEOContent;
  base94: SEOContent;
  messageParser: SEOContent;
  rsaDer: SEOContent;
  uuid: SEOContent;
  sslCert: SEOContent;
}

import i18n from '../i18n';

const NS = 'translation';

const seoContent = new Proxy({} as Record<string, Partial<PageSEO>>, {
  get(_target, prop: string) {
    const bundle = i18n.getResourceBundle(prop, NS) as Record<string, unknown> | undefined;
    return bundle?.seo as Partial<PageSEO> | undefined;
  },
  has(_target, prop: string) {
    return i18n.hasResourceBundle(prop, NS);
  },
});

export default seoContent;
