/**
 * 预渲染配置文件
 * 定义所有需要预渲染的路由
 */

// 所有需要预渲染的路由
export const routes = [
  // Home
  '/',
  
  // PKI Tools
  '/asn1-parser',
  '/ssl-certificates',
  
  // Generic Tools
  '/hashes',
  '/character-encoding',
  '/bcd',
  '/check-digits',
  '/base64',
  '/base94',
  '/message-parser',
  '/rsa-der-public-key',
  '/uuid',
  
  // Cipher Tools
  '/aes-encryption',
  '/des-encryption',
  '/rsa-encryption',
  '/ecc-encryption',
  '/fpe-encryption',
  
  // Key Management
  '/keys-dea',
  '/futurex-keys',
  '/tr31-key-block',
  '/keyshare-generator',
  '/atalla-keys',
  '/safenet-keys',
  '/thales-keys',
  '/thales-key-block',
  
  // Payment Tools
  '/payments-as2805',
  '/payments-bitmap',
  '/payments-card-validation-cvvs',
  '/payments-card-validation-amex-cscs',
  '/payments-card-validation-mastercard-cvc3',
  '/payments-dukpt-iso9797',
  '/payments-dukpt-aes',
  '/payments-mac-iso9797-1',
  '/payments-mac-ansix9',
  '/payments-mac-as2805',
  '/payments-mac-tdes-cbc-mac',
  '/payments-mac-hmac',
  '/payments-mac-cmac',
  '/payments-mac-retail',
  '/payments-pin-blocks-general',
  '/payments-pin-blocks-aes',
  '/payments-pin-offset',
  '/payments-pin-pvv',
  '/payments-visa-certificates',
  '/payments-zka',
  
  // Legal Pages
  '/privacy-policy',
  '/terms-of-service',
  '/disclaimer',
  
  // Guides / Knowledge Base - English (default)
  '/guides',
  '/guides/understanding-key-splitting-kcv',
  '/guides/what-is-tr31-key-block',
  '/guides/pin-block-formats-iso9564',
  '/guides/dukpt-key-derivation-tutorial',
  '/guides/cvv-cvc-calculation-methods',
  
  // Guides / Knowledge Base - Chinese
  '/zh/guides',
  '/zh/guides/understanding-key-splitting-kcv',
  '/zh/guides/what-is-tr31-key-block',
  '/zh/guides/pin-block-formats-iso9564',
  '/zh/guides/dukpt-key-derivation-tutorial',
  '/zh/guides/cvv-cvc-calculation-methods',
  
  // Guides / Knowledge Base - Japanese
  '/ja/guides',
  '/ja/guides/understanding-key-splitting-kcv',
  '/ja/guides/what-is-tr31-key-block',
  '/ja/guides/pin-block-formats-iso9564',
  '/ja/guides/dukpt-key-derivation-tutorial',
  '/ja/guides/cvv-cvc-calculation-methods',
  
  // Guides / Knowledge Base - Korean
  '/ko/guides',
  '/ko/guides/understanding-key-splitting-kcv',
  '/ko/guides/what-is-tr31-key-block',
  '/ko/guides/pin-block-formats-iso9564',
  '/ko/guides/dukpt-key-derivation-tutorial',
  '/ko/guides/cvv-cvc-calculation-methods',
  
  // Guides / Knowledge Base - German
  '/de/guides',
  '/de/guides/understanding-key-splitting-kcv',
  '/de/guides/what-is-tr31-key-block',
  '/de/guides/pin-block-formats-iso9564',
  '/de/guides/dukpt-key-derivation-tutorial',
  '/de/guides/cvv-cvc-calculation-methods',
  
  // Guides / Knowledge Base - French
  '/fr/guides',
  '/fr/guides/understanding-key-splitting-kcv',
  '/fr/guides/what-is-tr31-key-block',
  '/fr/guides/pin-block-formats-iso9564',
  '/fr/guides/dukpt-key-derivation-tutorial',
  '/fr/guides/cvv-cvc-calculation-methods',
];
