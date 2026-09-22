import { createToolPage } from '../../components/common';
import SafeNetKeysTool from '../../components/keys/SafeNetKeysTool';

export default createToolPage(SafeNetKeysTool, {
  seoKey: 'safenetKeys',
  canonical: 'https://hsmkit.com/safenet-keys',
  toolName: 'SafeNet Keys Encryption/Decryption',
  toolCategory: 'SecurityApplication',
});
