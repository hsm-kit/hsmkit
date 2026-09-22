import { createToolPage } from '../../components/common';
import { CipherTool } from '../../components/cipher';

export default createToolPage(CipherTool, {
  seoKey: 'aes',
  canonical: 'https://hsmkit.com/aes-encryption',
  toolName: 'AES Encryption/Decryption Tool',
  toolCategory: 'SecurityApplication',
});
