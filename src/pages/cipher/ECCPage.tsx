import { createToolPage } from '../../components/common';
import { ECCTool } from '../../components/cipher';

export default createToolPage(ECCTool, {
  seoKey: 'ecc',
  canonical: 'https://hsmkit.com/ecc-encryption',
  toolName: 'ECC/ECDSA Digital Signature Tool',
  toolCategory: 'SecurityApplication',
});
