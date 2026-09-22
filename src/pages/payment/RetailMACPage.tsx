import { createToolPage } from '../../components/common';
import { RetailMACTool } from '../../components/payment';

export default createToolPage(RetailMACTool, {
  seoKey: 'retailMac',
  canonical: 'https://hsmkit.com/payments-mac-retail',
  toolName: 'Retail MAC Calculator',
  toolCategory: 'FinanceApplication',
});
