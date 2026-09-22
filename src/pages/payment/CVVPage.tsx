import { createToolPage } from '../../components/common';
import { CVVTool } from '../../components/payment';

export default createToolPage(CVVTool, {
  seoKey: 'cvv',
  canonical: 'https://hsmkit.com/payments-card-validation-cvvs',
  toolName: 'CVV/CVC Calculator and Validator',
  toolCategory: 'FinanceApplication',
});
