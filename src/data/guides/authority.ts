export interface GuideContributor {
  name: string;
  role: string;
  url: string;
}

export interface GuideReference {
  title: string;
  publisher: string;
  url: string;
}

export const GUIDE_AUTHOR: GuideContributor = {
  name: 'HSM Kit Editorial Team',
  role: 'Technical writing and examples',
  url: 'https://hsmkit.com/guides',
};

export const GUIDE_REVIEWER: GuideContributor = {
  name: 'HSM Kit Security Review Team',
  role: 'Standards and security review',
  url: 'https://hsmkit.com/guides',
};

const references = {
  nistKeyManagement: { title: 'NIST SP 800-57 Part 1 Rev. 5 — Recommendation for Key Management', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final' },
  fips140: { title: 'FIPS 140-3 — Security Requirements for Cryptographic Modules', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/fips/140-3/final' },
  pciPin: { title: 'PCI PIN Security Requirements', publisher: 'PCI Security Standards Council', url: 'https://www.pcisecuritystandards.org/document_library/' },
  ansiX9: { title: 'ASC X9 Financial Industry Standards Catalogue', publisher: 'ASC X9', url: 'https://x9.org/standards/' },
  fips197: { title: 'FIPS 197 — Advanced Encryption Standard (AES)', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/fips/197/final' },
  sp80038a: { title: 'NIST SP 800-38A — Block Cipher Modes of Operation', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/sp/800/38/a/final' },
  sp80038b: { title: 'NIST SP 800-38B — CMAC Mode for Authentication', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/sp/800/38/b/upd1/final' },
  sp80038g: { title: 'NIST SP 800-38G Rev. 1 — Format-Preserving Encryption', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/sp/800/38/g/r1/final' },
  sp80067: { title: 'NIST SP 800-67 Rev. 2 — Triple Data Encryption Algorithm', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/sp/800/67/r2/final' },
  sp800131: { title: 'NIST SP 800-131A Rev. 2 — Transitioning Cryptographic Algorithms', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/sp/800/131/a/r2/final' },
  rfc8017: { title: 'RFC 8017 — PKCS #1: RSA Cryptography Specifications', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc8017' },
  fips186: { title: 'FIPS 186-5 — Digital Signature Standard', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/fips/186-5/final' },
  sp800186: { title: 'NIST SP 800-186 — Recommendations for Discrete Logarithm Cryptography', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/sp/800/186/final' },
  fips180: { title: 'FIPS 180-4 — Secure Hash Standard', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/fips/180-4/upd1/final' },
  fips202: { title: 'FIPS 202 — SHA-3 Standard', publisher: 'NIST', url: 'https://csrc.nist.gov/pubs/fips/202/final' },
  x690: { title: 'ITU-T X.690 — ASN.1 Encoding Rules', publisher: 'ITU-T', url: 'https://www.itu.int/rec/T-REC-X.690/' },
  rfc5280: { title: 'RFC 5280 — Internet X.509 Public Key Infrastructure', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc5280' },
  rfc8446: { title: 'RFC 8446 — The Transport Layer Security (TLS) Protocol Version 1.3', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc8446' },
  rfc4648: { title: 'RFC 4648 — Base-N Encodings', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc4648' },
  rfc9562: { title: 'RFC 9562 — Universally Unique IDentifiers (UUIDs)', publisher: 'IETF', url: 'https://www.rfc-editor.org/rfc/rfc9562' },
  unicode: { title: 'The Unicode Standard — Latest Version', publisher: 'Unicode Consortium', url: 'https://www.unicode.org/versions/latest/' },
  iso9797: { title: 'ISO/IEC 9797-1 — Message Authentication Codes', publisher: 'ISO', url: 'https://www.iso.org/search.html?q=ISO%2FIEC%209797-1' },
  iso9564: { title: 'ISO 9564-1 — PIN Management and Security', publisher: 'ISO', url: 'https://www.iso.org/search.html?q=ISO%209564-1' },
  iso8583: { title: 'ISO 8583-1 — Financial Transaction Card Messages', publisher: 'ISO', url: 'https://www.iso.org/search.html?q=ISO%208583-1' },
  iso7812: { title: 'ISO/IEC 7812-1 — Identification Cards and Numbering System', publisher: 'ISO', url: 'https://www.iso.org/search.html?q=ISO%2FIEC%207812-1' },
  emv: { title: 'EMV Integrated Circuit Card Specifications', publisher: 'EMVCo', url: 'https://www.emvco.com/emv-technologies/contact-chip/' },
  visaChip: { title: 'Visa Chip Technology and Specifications', publisher: 'Visa', url: 'https://developer.visa.com/pages/visa-chip-specification' },
  standardsAustralia: { title: 'AS 2805 Electronic Funds Transfer Standards', publisher: 'Standards Australia', url: 'https://store.standards.org.au/search?q=AS%202805' },
  germanBanking: { title: 'Technical Standards of the German Banking Industry', publisher: 'Die Deutsche Kreditwirtschaft', url: 'https://die-dk.de/zahlungsverkehr/' },
  futurex: { title: 'Futurex Resources and Product Documentation', publisher: 'Futurex', url: 'https://www.futurex.com/resources/' },
  atalla: { title: 'Atalla Payment HSM Product Information', publisher: 'Utimaco', url: 'https://utimaco.com/products/payment-hsm' },
  thales: { title: 'payShield Payment HSM Documentation', publisher: 'Thales', url: 'https://cpl.thalesgroup.com/encryption/hardware-security-modules/payment-hsms' },
  safenet: { title: 'Payment HSM Product Documentation', publisher: 'Thales', url: 'https://cpl.thalesgroup.com/encryption/hardware-security-modules/payment-hsms' },
} satisfies Record<string, GuideReference>;

type ReferenceKey = keyof typeof references;

const referenceMap: Record<string, ReferenceKey[]> = {
  'understanding-key-splitting-kcv': ['nistKeyManagement', 'pciPin'],
  'what-is-tr31-key-block': ['ansiX9', 'pciPin'],
  'hsm-key-management-overview': ['fips140', 'nistKeyManagement'],
  'des-3des-legacy-encryption': ['sp80067', 'sp800131'],
  'aes-encryption-explained': ['fips197', 'sp80038a'],
  'rsa-encryption-guide': ['rfc8017', 'sp800131'],
  'ecc-digital-signatures-explained': ['fips186', 'sp800186'],
  'hash-functions-guide': ['fips180', 'fips202'],
  'asn1-certificates-explained': ['x690', 'rfc5280'],
  'mac-algorithms-payment-security': ['iso9797', 'sp80038b'],
  'pin-block-formats-iso9564': ['iso9564', 'pciPin'],
  'dukpt-key-derivation-tutorial': ['ansiX9', 'pciPin'],
  'cvv-cvc-calculation-methods': ['pciPin', 'emv'],
  'iso8583-payment-messages': ['iso8583', 'emv'],
  'base64-encoding-guide': ['rfc4648'],
  'fpe-format-preserving-encryption': ['sp80038g', 'fips197'],
  'character-encoding-ascii-ebcdic': ['unicode'],
  'bcd-binary-coded-decimal-explained': ['iso8583'],
  'check-digits-luhn-mod10': ['iso7812'],
  'base94-encoding-guide': ['unicode'],
  'rsa-der-public-key-decoding': ['x690', 'rfc8017'],
  'ssl-tls-certificate-guide': ['rfc8446', 'rfc5280'],
  'uuid-generation-guide': ['rfc9562'],
  'futurex-hsm-key-management': ['futurex', 'nistKeyManagement'],
  'atalla-akh-key-block-format': ['atalla', 'pciPin'],
  'safenet-key-management-guide': ['safenet', 'nistKeyManagement'],
  'thales-lmk-key-encryption': ['thales', 'pciPin'],
  'thales-key-block-format-guide': ['thales', 'ansiX9'],
  'message-parser-iso8583-guide': ['iso8583'],
  'as2805-australian-payment-standard': ['standardsAustralia', 'iso8583'],
  'amex-csc-card-security-code': ['emv', 'pciPin'],
  'mastercard-dynamic-cvc3-guide': ['emv', 'pciPin'],
  'dukpt-aes-key-derivation': ['ansiX9', 'fips197'],
  'pin-block-aes-format4-guide': ['iso9564', 'fips197'],
  'pin-offset-ibm3624-guide': ['pciPin', 'nistKeyManagement'],
  'pin-pvv-visa-verification': ['pciPin', 'visaChip'],
  'zka-german-banking-standard': ['germanBanking', 'iso9797'],
  'visa-certificate-validation-guide': ['visaChip', 'emv'],
};

export const GUIDE_REFERENCE_SLUGS = Object.keys(referenceMap);

export const getGuideReferences = (slug: string): GuideReference[] =>
  (referenceMap[slug] || ['nistKeyManagement']).map((key) => references[key]);

export const getGuideLastReviewed = (lastModified: string): string => lastModified;
