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
];
