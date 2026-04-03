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
  '/guides/hsm-key-management-overview',
  '/guides/des-3des-legacy-encryption',
  '/guides/aes-encryption-explained',
  '/guides/rsa-encryption-guide',
  '/guides/ecc-digital-signatures-explained',
  '/guides/hash-functions-guide',
  '/guides/asn1-certificates-explained',
  '/guides/mac-algorithms-payment-security',
  '/guides/pin-block-formats-iso9564',
  '/guides/dukpt-key-derivation-tutorial',
  '/guides/cvv-cvc-calculation-methods',
  '/guides/iso8583-payment-messages',
  '/guides/base64-encoding-guide',
  
  // Guides / Knowledge Base - Chinese (has translated content)
  '/zh/guides',
  '/zh/guides/understanding-key-splitting-kcv',
  '/zh/guides/what-is-tr31-key-block',
  '/zh/guides/hsm-key-management-overview',
  '/zh/guides/des-3des-legacy-encryption',
  '/zh/guides/aes-encryption-explained',
  '/zh/guides/rsa-encryption-guide',
  '/zh/guides/ecc-digital-signatures-explained',
  '/zh/guides/hash-functions-guide',
  '/zh/guides/asn1-certificates-explained',
  '/zh/guides/mac-algorithms-payment-security',
  '/zh/guides/pin-block-formats-iso9564',
  '/zh/guides/dukpt-key-derivation-tutorial',
  '/zh/guides/cvv-cvc-calculation-methods',
  '/zh/guides/iso8583-payment-messages',
  '/zh/guides/base64-encoding-guide',
];
