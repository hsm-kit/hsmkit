import { createToolPage } from '../../components/common';
import { HMACTool } from '../../components/payment';

export default createToolPage(HMACTool, {
  seoKey: 'hmac',
  canonical: 'https://hsmkit.com/payments-mac-hmac',
  toolName: 'HMAC Calculator',
  toolCategory: 'Payment MAC',
});
