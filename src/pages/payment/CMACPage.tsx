import { createToolPage } from '../../components/common';
import { CMACTool } from '../../components/payment';

export default createToolPage(CMACTool, {
  seoKey: 'cmac',
  canonical: 'https://hsmkit.com/payments-mac-cmac',
  toolName: 'CMAC Calculator',
  toolCategory: 'FinanceApplication',
});
