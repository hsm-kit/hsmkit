import { normalizePublicPath } from '../utils/publicUrl';

export interface ToolDirectoryEntry {
  seoKey: string;
  path: string;
}

const toolDirectoryEntries: ToolDirectoryEntry[] = [
  { seoKey: 'aes', path: '/aes-encryption' },
  { seoKey: 'des', path: '/des-encryption' },
  { seoKey: 'rsa', path: '/rsa-encryption' },
  { seoKey: 'ecc', path: '/ecc-encryption' },
  { seoKey: 'fpe', path: '/fpe-encryption' },
  { seoKey: 'asn1', path: '/asn1-parser' },
  { seoKey: 'sslCert', path: '/ssl-certificates' },
  { seoKey: 'hash', path: '/hashes' },
  { seoKey: 'encoding', path: '/character-encoding' },
  { seoKey: 'bcd', path: '/bcd' },
  { seoKey: 'checkDigits', path: '/check-digits' },
  { seoKey: 'base64', path: '/base64' },
  { seoKey: 'base94', path: '/base94' },
  { seoKey: 'messageParser', path: '/message-parser' },
  { seoKey: 'rsaDer', path: '/rsa-der-public-key' },
  { seoKey: 'uuid', path: '/uuid' },
  { seoKey: 'keyGenerator', path: '/keys-dea' },
  { seoKey: 'keyshare', path: '/keyshare-generator' },
  { seoKey: 'futurexKeys', path: '/futurex-keys' },
  { seoKey: 'atallaKeys', path: '/atalla-keys' },
  { seoKey: 'safenetKeys', path: '/safenet-keys' },
  { seoKey: 'thalesKeys', path: '/thales-keys' },
  { seoKey: 'thalesKeyBlock', path: '/thales-key-block' },
  { seoKey: 'tr31', path: '/tr31-key-block' },
  { seoKey: 'as2805', path: '/payments-as2805' },
  { seoKey: 'bitmap', path: '/payments-bitmap' },
  { seoKey: 'cvv', path: '/payments-card-validation-cvvs' },
  { seoKey: 'amexCsc', path: '/payments-card-validation-amex-cscs' },
  { seoKey: 'mastercardCvc3', path: '/payments-card-validation-mastercard-cvc3' },
  { seoKey: 'dukpt', path: '/payments-dukpt-iso9797' },
  { seoKey: 'dukptAes', path: '/payments-dukpt-aes' },
  { seoKey: 'iso9797Mac', path: '/payments-mac-iso9797-1' },
  { seoKey: 'ansiMac', path: '/payments-mac-ansix9' },
  { seoKey: 'as2805Mac', path: '/payments-mac-as2805' },
  { seoKey: 'tdesCbcMac', path: '/payments-mac-tdes-cbc-mac' },
  { seoKey: 'hmac', path: '/payments-mac-hmac' },
  { seoKey: 'cmac', path: '/payments-mac-cmac' },
  { seoKey: 'retailMac', path: '/payments-mac-retail' },
  { seoKey: 'pinBlockGeneral', path: '/payments-pin-blocks-general' },
  { seoKey: 'pinBlockAes', path: '/payments-pin-blocks-aes' },
  { seoKey: 'pinOffset', path: '/payments-pin-offset' },
  { seoKey: 'pinPvv', path: '/payments-pin-pvv' },
  { seoKey: 'visaCertificates', path: '/payments-visa-certificates' },
  { seoKey: 'zka', path: '/payments-zka' },
];

export const toolDirectory = toolDirectoryEntries.map(tool => ({
  ...tool,
  path: normalizePublicPath(tool.path),
}));

const workflowGroups = [
  ['aes', 'des', 'rsa', 'ecc', 'fpe'],
  ['base64', 'base94', 'encoding', 'bcd', 'hash', 'uuid', 'checkDigits'],
  ['asn1', 'rsaDer', 'sslCert', 'rsa', 'hash'],
  ['keyGenerator', 'keyshare', 'tr31', 'thalesKeyBlock', 'futurexKeys', 'atallaKeys', 'safenetKeys', 'thalesKeys'],
  ['pinBlockGeneral', 'pinBlockAes', 'dukpt', 'dukptAes', 'pinOffset', 'pinPvv', 'tr31'],
  ['iso9797Mac', 'ansiMac', 'as2805Mac', 'tdesCbcMac', 'hmac', 'cmac', 'retailMac'],
  ['cvv', 'amexCsc', 'mastercardCvc3', 'visaCertificates', 'checkDigits'],
  ['as2805', 'bitmap', 'messageParser', 'zka', 'iso9797Mac', 'pinBlockGeneral'],
] as const;

const recommendations: Record<string, string[]> = {
  aes: ['base64', 'hash', 'keyGenerator'],
  asn1: ['rsaDer', 'sslCert', 'rsa'],
  base64: ['base94', 'encoding', 'hash'],
  bitmap: ['messageParser', 'iso9797Mac', 'pinBlockGeneral'],
  dukpt: ['pinBlockGeneral', 'tr31', 'keyGenerator'],
  dukptAes: ['pinBlockAes', 'tr31', 'keyGenerator'],
  keyGenerator: ['keyshare', 'tr31', 'thalesKeyBlock'],
  messageParser: ['bitmap', 'pinBlockGeneral', 'iso9797Mac'],
  pinBlockAes: ['dukptAes', 'tr31', 'keyGenerator'],
  pinBlockGeneral: ['dukpt', 'pinBlockAes', 'tr31'],
  rsaDer: ['asn1', 'sslCert', 'rsa'],
  sslCert: ['asn1', 'rsaDer', 'rsa'],
  tr31: ['keyGenerator', 'keyshare', 'thalesKeyBlock'],
};

const bySeoKey = new Map(toolDirectory.map(tool => [tool.seoKey, tool]));
const byPath = new Map(toolDirectory.map(tool => [tool.path, tool]));

export const getToolByPath = (path: string): ToolDirectoryEntry | undefined => byPath.get(normalizePublicPath(path));

export const getRelatedTools = (seoKey: string, limit = 3): ToolDirectoryEntry[] => {
  const relatedKeys = recommendations[seoKey] || workflowGroups
    .filter(group => group.includes(seoKey as never))
    .flatMap(group => [...group]);

  return [...new Set(relatedKeys)]
    .filter(key => key !== seoKey)
    .map(key => bySeoKey.get(key))
    .filter((tool): tool is ToolDirectoryEntry => Boolean(tool))
    .slice(0, limit);
};
