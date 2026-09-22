import { createToolPage } from '../../components/common';
import { TDESCBCMACTool } from '../../components/payment';

export default createToolPage(TDESCBCMACTool, {
  seoKey: 'tdesCbcMac',
  canonical: 'https://hsmkit.com/payments-mac-tdes-cbc-mac',
  toolName: 'TDES CBC-MAC Calculator',
  toolCategory: 'PaymentSecurity',
});
