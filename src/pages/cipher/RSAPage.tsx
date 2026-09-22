import { createToolPage } from '../../components/common';
import { RSATool } from '../../components/cipher';

export default createToolPage(RSATool, {
  seoKey: 'rsa',
  canonical: 'https://hsmkit.com/rsa-encryption',
  toolName: 'RSA Encryption & Key Generator',
  toolCategory: 'SecurityApplication',
});
